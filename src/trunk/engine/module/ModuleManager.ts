import { core } from "../../core/Core";
import { Injectable } from "../../core/injector/Injector"
import { wrapConstruct } from "../../utils/ConstructUtil";
import RequestData from "../net/RequestData";
import ResponseData from "../net/ResponseData";
import { netManager } from "../net/NetManager";
import IModule from "./IModule";
import IModuleConstructor from "./IModuleConstructor";
import ModuleMessage from "./ModuleMessage"
import IMediator from "../mediator/IMediator";

/**
 * @author Raykid
 * @email initial_r@qq.com
 * @create date 2017-09-14
 * @modify date 2017-09-15
 * 
 * 模块管理器，管理模块相关的所有操作。模块具有唯一性，同一时间不可以打开两个相同模块，如果打开则会退回到先前的模块处
*/
@Injectable
export default class ModuleManager
{
    private _moduleDict:{[name:string]:IModuleConstructor} = {};
    private _moduleStack:[IModuleConstructor, IModule][] = [];

    private _openCache:[IModuleConstructor, any, boolean][] = [];
    private _opening:boolean = false;
    /**
     * 获取是否有模块正在打开中
     * 
     * @readonly
     * @type {boolean}
     * @memberof ModuleManager
     */
    public get opening():boolean
    {
        return this._opening;
    }
    
    /**
     * 获取当前模块
     * 
     * @readonly
     * @type {IModuleConstructor}
     * @memberof ModuleManager
     */ 
    public get currentModule():IModuleConstructor|undefined
    {
        var curData:[IModuleConstructor, IModule] = this.getCurrent();
        return (curData && curData[0]);
    }

    /**
     * 获取活动模块数量
     * 
     * @readonly
     * @type {number}
     * @memberof ModuleManager
     */ 
    public get activeCount():number
    {
        return this._moduleStack.length;
    }

    private getIndex(cls:IModuleConstructor):number
    {
        for(var i:number = 0, len:number = this._moduleStack.length; i < len; i++)
        {
            if(this._moduleStack[i][0] == cls) return i;
        }
        return -1;
    }

    private getAfter(cls:IModuleConstructor):[IModuleConstructor, IModule][]|null
    {
        var result:[IModuleConstructor, IModule][] = [];
        for(var module of this._moduleStack)
        {
            if(module[0] == cls) return result;
            result.push(module);
        }
        return null;
    }
    
    private getCurrent():[IModuleConstructor, IModule]|undefined
    {
        return this._moduleStack[0];
    }

    public registerModule(cls:IModuleConstructor):void
    {
        this._moduleDict[cls["name"]] = cls;
    }

    /**
     * 获取模块是否开启中
     * 
     * @param {IModuleConstructor} cls 要判断的模块类型
     * @returns {boolean} 是否开启
     * @memberof ModuleManager
     */
    public isOpened(cls:IModuleConstructor):boolean
    {
        return (this._moduleStack.filter(temp=>temp[0]==cls).length > 0);
    }

    /**
     * 打开模块
     * 
     * @param {IModuleConstructor|string} clsOrName 模块类型或名称
     * @param {*} [data] 参数
     * @param {boolean} [replace=false] 是否替换当前模块
     * @memberof ModuleManager
     */
    public open(clsOrName:IModuleConstructor|string, data?:any, replace:boolean=false):void
    {
        // 如果是字符串则获取引用
        var cls:IModuleConstructor = (typeof clsOrName == "string" ? this._moduleDict[clsOrName] : clsOrName) ;
        // 非空判断
        if(!cls) return;
        // 判断是否正在打开模块
        if(this._opening)
        {
            this._openCache.push([cls, data, replace]);
            return;
        }
        this._opening = true;
        var after:[IModuleConstructor, IModule][] = this.getAfter(cls);
        if(!after)
        {
            // 尚未打开过，正常开启模块
            var target:IModule = new cls();
            // 赋值打开参数
            target.data = data;
            // 加载所有已托管中介者的资源
            var mediators:IMediator[] = target.getDelegatedMediators().concat();
            var loadMediatorAssets:(err?:Error)=>void = (err?:Error)=>{
                if(err)
                {
                    // 停止加载，调用模块加载失败接口
                    target.onLoadAssets(err);
                }
                else if(mediators.length > 0)
                {
                    mediators.shift().loadAssets(loadMediatorAssets);
                }
                else
                {
                    // 调用onLoadAssets接口
                    target.onLoadAssets();
                    // 发送所有模块消息
                    var requests:RequestData[] = target.listInitRequests();
                    netManager.sendMultiRequests(requests, function(responses:ResponseData[]):void
                    {
                        var from:[IModuleConstructor, IModule] = this.getCurrent();
                        var fromModule:IModule = from && from[1];
                        // 调用onGetResponses接口
                        target.onGetResponses(responses);
                        // 调用onOpen接口
                        target.onOpen(data);
                        // 调用onDeactivate接口
                        fromModule && fromModule.onDeactivate(cls, data);
                        // 插入模块
                        this._moduleStack.unshift([cls, target]);
                        // 调用onActivate接口
                        target.onActivate(from && from[0], data);
                        // 如果replace是true，则关掉上一个模块
                        if(replace) this.close(from && from[0], data);
                        // 派发消息
                        core.dispatch(ModuleMessage.MODULE_CHANGE, from && from[0], cls);
                        // 如果有缓存的模块需要打开则打开之
                        this._opening = false;
                        if(this._openCache.length > 0)
                            this.open.apply(this, this._openCache.shift());
                    }, this);
                }
            };
            loadMediatorAssets();
        }
        else if(after.length > 0)
        {
            // 已经打开且不是当前模块，先关闭当前模块到目标模块之间的所有模块
            for(var i :number = 1, len:number = after.length; i < len; i++)
            {
                this.close(after[i][0], data);
            }
            // 最后关闭当前模块，以实现从当前模块直接跳回到目标模块
            this.close(after[0][0], data);
        }
    }

    /**
     * 关闭模块，只有关闭的是当前模块时才会触发onDeactivate和onActivate，否则只会触发onClose
     * 
     * @param {IModuleConstructor|string} clsOrName 模块类型或名称
     * @param {*} [data] 参数
     * @memberof ModuleManager
     */
    public close(clsOrName:IModuleConstructor|string, data?:any):void
    {
        // 如果是字符串则获取引用
        var cls:IModuleConstructor = (typeof clsOrName == "string" ? this._moduleDict[clsOrName] : clsOrName) ;
        // 非空判断
        if(!cls) return;
        // 数量判断，不足一个模块时不关闭
        if(this.activeCount <= 1) return;
        // 存在性判断
        var index:number = this.getIndex(cls);
        if(index < 0) return;
        // 取到目标模块
        var target:IModule = this._moduleStack[index][1];
        // 如果是当前模块，则需要调用onDeactivate和onActivate接口，否则不用
        if(index == 0)
        {
            var to:[IModuleConstructor, IModule] = this._moduleStack[1];
            var toModule:IModule = to && to[1];
            // 调用onDeactivate接口
            target.onDeactivate(to && to[0], data);
            // 移除当前模块
            this._moduleStack.shift();
            // 调用onClose接口
            target.onClose(data);
            // 调用onActivate接口
            toModule && toModule.onActivate(cls, data);
            // 派发消息
            core.dispatch(ModuleMessage.MODULE_CHANGE, cls, to && to[0]);
        }
        else
        {
            // 移除模块
            this._moduleStack.splice(index, 1);
            // 调用onClose接口
            target.onClose(data);
        }
    }
}
/** 再额外导出一个单例 */
export const moduleManager:ModuleManager = core.getInject(ModuleManager);