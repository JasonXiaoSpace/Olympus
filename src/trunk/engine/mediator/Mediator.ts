import { core } from "../../core/Core";
import IDispatcher from "../../core/interfaces/IDispatcher";
import IMessage from "../../core/message/IMessage";
import IMediator from "./IMediator";
import IBridge from "../bridge/IBridge";

/**
 * @author Raykid
 * @email initial_r@qq.com
 * @create date 2017-09-04
 * @modify date 2017-09-04
 * 
 * 组件界面中介者基类
*/
export default class Mediator implements IMediator, IDispatcher
{
    /**
     * 表现层桥
     * 
     * @type {IBridge}
     * @memberof Mediator
     */
    public bridge:IBridge;

    /**
     * 皮肤
     * 
     * @type {*}
     * @memberof Mediator
     */
    public skin:any;
    
    private _disposed:boolean = false;
    /**
     * 获取中介者是否已被销毁
     * 
     * @readonly
     * @type {boolean}
     * @memberof Mediator
     */
    public get disposed():boolean
    {
        return this._disposed;
    }

    public constructor(skin?:any)
    {
        if(skin) this.skin = skin;
    }

    /**
     * 列出中介者所需的资源数组，可重写
     * 
     * @returns {string[]} 资源数组，请根据该Mediator所操作的渲染模组的需求给出资源地址或组名
     * @memberof Mediator
     */
    public listAssets():string[]
    {
        return null;
    }

    /**
     * 加载从listAssets中获取到的所有资源，完毕后调用回调函数
     * 
     * @param {(err?:Error)=>void} handler 完毕后的回调函数，有错误则给出err，没有则不给
     * @memberof Mediator
     */
    public loadAssets(handler:(err?:Error)=>void):void
    {
        this.bridge.loadAssets(this.listAssets(), handler);
    }

    private _listeners:ListenerData[] = [];
    /**
     * 监听事件，从这个方法监听的事件会在中介者销毁时被自动移除监听
     * 
     * @param {*} target 事件目标对象
     * @param {string} type 事件类型
     * @param {Function} handler 事件处理函数
     * @param {*} [thisArg] this指向对象
     * @memberof Mediator
     */
    public mapListener(target:any, type:string, handler:Function, thisArg?:any):void
    {
        for(var i:number = 0, len:number = this._listeners.length; i < len; i++)
        {
            var data:ListenerData = this._listeners[i];
            if(data.target == target && data.type == type && data.handler == handler && data.thisArg == thisArg)
            {
                // 已经存在一样的监听，不再监听
                return;
            }
        }
        // 记录监听
        this._listeners.push({target: target, type: type, handler: handler, thisArg: thisArg});
        // 调用桥接口
        this.bridge.mapListener(target, type, handler, thisArg);
    }
    
    /**
     * 注销监听事件
     * 
     * @param {*} target 事件目标对象
     * @param {string} type 事件类型
     * @param {Function} handler 事件处理函数
     * @param {*} [thisArg] this指向对象
     * @memberof Mediator
     */
    public unmapListener(target:any, type:string, handler:Function, thisArg?:any):void
    {
        for(var i:number = 0, len:number = this._listeners.length; i < len; i++)
        {
            var data:ListenerData = this._listeners[i];
            if(data.target == target && data.type == type && data.handler == handler && data.thisArg == thisArg)
            {
                // 调用桥接口
                this.bridge.unmapListener(target, type, handler, thisArg);
                // 移除记录
                this._listeners.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 注销所有注册在当前中介者上的事件监听
     * 
     * @memberof Mediator
     */
    public unmapAllListeners():void
    {
        for(var i:number = 0, len:number = this._listeners.length; i < len; i++)
        {
            var data:ListenerData = this._listeners.pop();
            // 调用桥接口
            this.bridge.unmapListener(data.target, data.type, data.handler, data.thisArg);
        }
    }

    /**
     * 派发内核消息
     * 
     * @param {IMessage} msg 内核消息实例
     * @memberof Core
     */
    public dispatch(msg:IMessage):void;
    /**
     * 派发内核消息，消息会转变为Message类型对象
     * 
     * @param {string} type 消息类型
     * @param {...any[]} params 消息参数列表
     * @memberof Core
     */
    public dispatch(type:string, ...params:any[]):void;
    public dispatch(typeOrMsg:any, ...params:any[]):void
    {
        core.dispatch(typeOrMsg, ...params);
    }

    /**
     * 销毁中介者
     * 
     * @memberof Mediator
     */
    public dispose():void
    {
        if(!this._disposed)
        {
            // 移除显示
            if(this.skin && this.bridge)
            {
                var parent:any = this.bridge.getParent(this.skin);
                if(parent) this.bridge.removeChild(parent, this.skin);
            }
            // 注销事件监听
            this.unmapAllListeners();
            // 移除表现层桥
            this.bridge = null;
            // 移除皮肤
            this.skin = null;
            // 设置已被销毁
            this._disposed = true;
        }
    }
}

interface ListenerData
{
    target:any;
    type:string;
    handler:Function;
    thisArg?:any;
}