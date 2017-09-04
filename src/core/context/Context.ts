/// <reference path="../declarations/Inject.ts"/>

import context from "./Context";
import IConstructor from "../interfaces/IConstructor"
import IMessage from "../message/IMessage"
import Message from "../message/Message"
import ICommandConstructor from "../command/ICommandConstructor"
import Command from "../command/Command"
import IMediator from "../mediator/IMediator"

/**
 * @author Raykid
 * @email initial_r@qq.com
 * @create date 2017-08-31
 * @modify date 2017-09-01
 * 
 * Olympus核心上下文模块，负责实现框架内消息转发、对象注入等核心功能
*/

// 修复Array.findIndex会被遍历到的问题
if(Array.prototype.hasOwnProperty("findIndex"))
{
    var desc:PropertyDescriptor = Object.getOwnPropertyDescriptor(Array.prototype, "findIndex");
    if(desc.enumerable)
    {
        desc.enumerable = false;
        Object.defineProperty(Array.prototype, "findIndex", desc);
    }
}

// 下面是为了装饰器功能做的
window["Inject"] = function(cls:IConstructor):PropertyDecorator
{
    return function(prototype:any, propertyKey:string):PropertyDescriptor
    {
        return {
            get: ()=>context.getInject(cls)
        };
    };
};
window["Injectable"] = function(cls:IInjectableParams|IConstructor):ClassDecorator|void
{
    var params:IInjectableParams = cls as IInjectableParams;
    if(params.type instanceof Function)
    {
        // 需要转换注册类型，需要返回一个ClassDecorator
        return function(realCls:IConstructor):void
        {
            context.mapInject(realCls, params.type);
        } as ClassDecorator;
    }
    else
    {
        // 不需要转换注册类型，直接注册
        context.mapInject(cls as IConstructor);
    }
};

/**
 * 上下文模块内部使用的记录转发数据的接口
 * 
 * @interface IContextMessageData
 */
interface IContextMessageData
{
    handler:(msg:IMessage)=>void;
    thisArg:any;
}

/**
 * 核心上下文对象，负责内核消息消息转发、对象注入等核心功能的实现
 * 
 * @export
 * @class Context
 */
export class Context
{
    private static _instance:Context;
    
    public constructor()
    {
        // 进行单例判断
        if(Context._instance) throw new Error("已生成过Context实例，不允许多次生成");
        // 赋值单例
        Context._instance = this;
    }
    
    /*********************** 内核消息语法糖处理逻辑 ***********************/

    private _messageHandlerDict:{[msg:string]:{target:any, name:string}} = {};

    private handleMessageSugars(msg:IMessage, target:any):void
    {
        // 调用以Message类型为前缀，以_handler为后缀的方法
        var name:string = msg.getType() + "_handler";
        if(target[name] instanceof Function) target[name](msg);
    }

    /*********************** 下面是内核消息系统 ***********************/

    private _listenerDict:{[type:string]:IContextMessageData[]} = {};

    private handleMessages(msg:IMessage):void
    {
        var listeners:IContextMessageData[] = this._listenerDict[msg.getType()];
        if(listeners)
        {
            for(var i:number = 0, len:number = listeners.length; i < len; i++)
            {
                var temp:IContextMessageData = listeners[i];
                try {
                    // 调用处理函数
                    temp.handler.call(temp.thisArg, msg);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }

    /**
     * 派发内核消息
     * 
     * @param {IMessage} msg 内核消息实例
     * @memberof Context
     */
    public dispatch(msg:IMessage):void;
    /**
     * 派发内核消息，消息会转变为ContextMessage类型对象
     * 
     * @param {string} type 消息类型
     * @param {...any[]} params 消息参数列表
     * @memberof Context
     */
    public dispatch(type:string, ...params:any[]):void;
    /** dispatch方法实现 */
    public dispatch(typeOrMsg:string|IMessage, ...params:any[]):void
    {
        // 统一事件对象
        var msg:IMessage = typeOrMsg as IMessage;
        if(typeof typeOrMsg == "string")
        {
            msg = new Message(typeOrMsg);
            (msg as Message).params = params;
        }
        // 触发依赖注入对象操作
        this.handleInjects(msg);
        // 触发中介者相关操作
        this.handleMediators(msg);
        // 触发命令
        this.handleCommands(msg);
        // 触发用listen形式监听的消息
        this.handleMessages(msg);
    }

    /**
     * 监听内核消息
     * 
     * @param {string} type 消息类型
     * @param {(msg:IContextMessage)=>void} handler 消息处理函数
     * @param {*} [thisArg] 消息this指向
     * @memberof Context
     */
    public listen(type:string, handler:(msg:IMessage)=>void, thisArg?:any):void
    {
        var listeners:IContextMessageData[] = this._listenerDict[type];
        if(!listeners) this._listenerDict[type] = listeners = [];
        // 检查存在性
        for(var i:number = 0, len:number = listeners.length; i < len; i++)
        {
            var temp:IContextMessageData = listeners[i];
            // 如果已经存在监听则直接返回
            if(temp.handler == handler && temp.thisArg == thisArg) return;
        }
        // 添加监听
        listeners.push({handler: handler, thisArg: thisArg});
    }

    /**
     * 移除内核消息监听
     * 
     * @param {string} type 消息类型
     * @param {(msg:IContextMessage)=>void} handler 消息处理函数
     * @param {*} [thisArg] 消息this指向
     * @memberof Context
     */
    public unlisten(type:string, handler:(msg:IMessage)=>void, thisArg?:any):void
    {
        var listeners:IContextMessageData[] = this._listenerDict[type];
        // 检查存在性
        if(listeners)
        {
            for(var i:number = 0, len:number = listeners.length; i < len; i++)
            {
                var temp:IContextMessageData = listeners[i];
                // 如果已经存在监听则直接返回
                if(temp.handler == handler && temp.thisArg == thisArg)
                {
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    }
    
    /*********************** 下面是依赖注入系统 ***********************/

    private _injectDict:{[key:string]:any} = {};

    private handleInjects(msg:IMessage):void
    {
        for(var key in this._injectDict)
        {
            var inject:any = this._injectDict[key];
            // 执行语法糖
            this.handleMessageSugars(msg, inject);
        }
    }

    /**
     * 添加一个类型注入，会立即生成一个实例并注入到框架内核中
     * 
     * @param {IConstructor} target 要注入的类型（注意不是实例）
     * @param {IConstructor} [type] 如果提供该参数，则使用该类型代替注入类型的key，否则使用注入类型自身作为key
     * @memberof Context
     */
    public mapInject(target:IConstructor, type?:IConstructor):void
    {
        var key:string = (type || target).toString();
        var value:any = new target();
        this._injectDict[key] = value;
    }

    /**
     * 移除类型注入
     * 
     * @param {IConstructor} target 要移除注入的类型
     * @memberof Context
     */
    public unmapInject(target:IConstructor):void
    {
        var key:string = target.toString();
        delete this._injectDict[key];
    }

    /**
     * 获取注入的对象实例
     * 
     * @param {(IConstructor)} type 注入对象的类型
     * @returns {*} 注入的对象实例
     * @memberof Context
     */
    public getInject(type:IConstructor):any
    {
        return this._injectDict[type.toString()];
    }

    /*********************** 下面是内核命令系统 ***********************/

    private _commandDict:{[type:string]:(ICommandConstructor)[]} = {};

    private handleCommands(msg:IMessage):void
    {
        var commands:(ICommandConstructor)[] = this._commandDict[msg.getType()];
        if(!commands) return;
        for(var i:number = 0, len:number = commands.length; i < len; i++)
        {
            var cls:ICommandConstructor = commands[i];
            try {
                // 执行命令
                var cmd:Command = new cls(msg);
                cmd.exec();
            } catch(error) {
                console.error(error);
            }
        }
    }

    /**
     * 注册命令到特定消息类型上，当这个类型的消息派发到框架内核时会触发Command运行
     * 
     * @param {string} type 要注册的消息类型
     * @param {(ICommandConstructor)} cmd 命令处理器，可以是方法形式，也可以使类形式
     * @memberof Context
     */
    public mapCommand(type:string, cmd:ICommandConstructor):void
    {
        var commands:(ICommandConstructor)[] = this._commandDict[type];
        if(!commands) this._commandDict[type] = commands = [];
        if(commands.indexOf(cmd) < 0) commands.push(cmd);
    }

    /**
     * 注销命令
     * 
     * @param {string} type 要注销的消息类型
     * @param {(ICommandConstructor)} cmd 命令处理器
     * @returns {void} 
     * @memberof Context
     */
    public unmapCommand(type:string, cmd:ICommandConstructor):void
    {
        var commands:(ICommandConstructor)[] = this._commandDict[type];
        if(!commands) return;
        var index:number = commands.indexOf(cmd);
        if(index < 0) return;
        commands.splice(index, 1);
    }
    
    /*********************** 下面是界面中介者系统 ***********************/

    private _mediatorList:IMediator[] = [];

    private handleMediators(msg:IMessage):void
    {
        for(var i:number = 0, len:number = this._mediatorList.length; i < len; i++)
        {
            var mediator:IMediator = this._mediatorList[i];
            // 执行语法糖
            this.handleMessageSugars(msg, mediator);
        }
    }

    /**
     * 注册界面中介者
     * 
     * @param {IMediator} mediator 要注册的界面中介者实例
     * @memberof Context
     */
    public mapMediator(mediator:IMediator):void
    {
        if(this._mediatorList.indexOf(mediator) < 0)
            this._mediatorList.push(mediator);
    }

    /**
     * 注销界面中介者
     * 
     * @param {IMediator} mediator 要注销的界面中介者实例
     * @memberof Context
     */
    public unmapMediator(mediator:IMediator):void
    {
        var index:number = this._mediatorList.indexOf(mediator);
        if(index >= 0) this._mediatorList.splice(index, 1);
    }
}

/** 导出Context实例 */
export default new Context();