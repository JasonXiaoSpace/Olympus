declare module "utils/ObjectUtil" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-11
     * @modify date 2017-09-11
     *
     * 对象工具集
    */
    /**
     * populate properties
     * @param target        目标obj
     * @param sources       来源obj
     */
    export function extendObject(target: any, ...sources: any[]): any;
    /**
     * 复制对象
     * @param target 要复制的对象
     * @param deep 是否深表复制，默认浅表复制
     * @returns {any} 复制后的对象
     */
    export function cloneObject(target: any, deep?: boolean): any;
    /**
     * 生成一个随机ID
     */
    export function getGUID(): string;
    /**
     * 生成自增id（从0开始）
     * @param type
     */
    export function getAutoIncId(type: string): string;
    /**
     * 判断对象是否为null或者空对象
     * @param obj 要判断的对象
     * @returns {boolean} 是否为null或者空对象
     */
    export function isEmpty(obj: any): boolean;
    /**
     * 移除data中包含的空引用或未定义
     * @param data 要被移除空引用或未定义的对象
     */
    export function trimData(data: any): any;
    /**
     * 让child类继承自parent类
     * @param child 子类
     * @param parent 父类
     */
    export var extendsClass: (child: any, parent: any) => void;
    /**
     * 获取一个对象的对象哈希字符串
     *
     * @export
     * @param {*} target 任意对象，可以是基础类型或null
     * @returns {string} 哈希值
     */
    export function getObjectHash(target: any): string;
    /**
     * 获取多个对象的哈希字符串，会对每个对象调用getObjectHash生成单个哈希值，并用|连接
     *
     * @export
     * @param {...any[]} targets 希望获取哈希值的对象列表
     * @returns {string} 多个对象共同作用下的哈希值
     */
    export function getObjectHashs(...targets: any[]): string;
}
declare module "utils/Dictionary" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-15
     * @modify date 2017-09-15
     *
     * 字典，支持key为任意类型的对象
    */
    export default class Dictionary<K, V> {
        private _entity;
        /**
         * 获取字典内的元素数量
         *
         * @readonly
         * @type {number}
         * @memberof Dictionary
         */
        readonly size: number;
        /**
         * 设置一个键值对
         *
         * @param {K} key 键
         * @param {V} value 值
         * @memberof Dictionary
         */
        set(key: K, value: V): void;
        /**
         * 获取一个值
         *
         * @param {K} key 键
         * @returns {V} 值
         * @memberof Dictionary
         */
        get(key: K): V;
        /**
         * 删除一个键值对
         *
         * @param {K} key 键
         * @memberof Dictionary
         */
        delete(key: K): void;
    }
}
declare module "core/message/IMessage" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-01
     * @modify date 2017-09-01
     *
     * 框架内核消息接口
    */
    export default interface IMessage {
        /**
         * 获取消息类型
         *
         * @readonly
         * @type {string}
         * @memberof IMessage
         */
        readonly type: string;
    }
}
declare module "core/message/Message" {
    import IMessage from "core/message/IMessage";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-18
     * @modify date 2017-09-18
     *
     * 消息基类
    */
    export default abstract class Message implements IMessage {
        private _type;
        /**
         * 获取消息类型字符串
         *
         * @readonly
         * @type {string}
         * @memberof Message
         */
        readonly type: string;
        constructor(type: string);
    }
}
declare module "core/message/CommonMessage" {
    import Message from "core/message/Message";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-01
     * @modify date 2017-09-01
     *
     * 框架内核通用消息
    */
    export default class CommonMessage extends Message {
        /**
         * 消息参数列表
         *
         * @type {any[]}
         * @memberof Message
         */
        params: any[];
        /**
         * Creates an instance of Message.
         * @param {string} type 消息类型
         * @param {...any[]} params 可能的消息参数列表
         * @memberof Message
         */
        constructor(type: string, ...params: any[]);
    }
}
declare module "core/message/CoreMessage" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-13
     * @modify date 2017-09-13
     *
     * 核心事件类型
    */
    export default class CoreMessage {
        /**
         * 任何消息派发到框架后都会派发这个消息
         *
         * @static
         * @type {string}
         * @memberof CoreMessage
         */
        static MESSAGE_DISPATCHED: string;
    }
}
declare module "core/command/Command" {
    import IMessage from "core/message/IMessage";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-01
     * @modify date 2017-09-01
     *
     * 内核命令类，内核命令在注册了消息后可以在消息派发时被执行
    */
    export default abstract class Command {
        /**
         * 触发该Command运行的Message实例
         *
         * @type {IMessage}
         * @memberof Command
         */
        msg: IMessage;
        constructor(msg: IMessage);
        /**
         * 派发内核消息
         *
         * @param {IMessage} msg 内核消息实例
         * @memberof Core
         */
        dispatch(msg: IMessage): void;
        /**
         * 派发内核消息，消息会转变为Message类型对象
         *
         * @param {string} type 消息类型
         * @param {...any[]} params 消息参数列表
         * @memberof Core
         */
        dispatch(type: string, ...params: any[]): void;
        /**
         * 子类必须实现该方法
         *
         * @abstract
         * @memberof Command
         */
        abstract exec(): void;
    }
}
declare module "core/command/ICommandConstructor" {
    import IMessage from "core/message/IMessage";
    import Command from "core/command/Command";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-01
     * @modify date 2017-09-01
     *
     * 内核命令接口
    */
    export default interface ICommandConstructor {
        new (msg: IMessage): Command;
    }
}
declare module "core/interfaces/IDispatcher" {
    import IMessage from "core/message/IMessage";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-14
     * @modify date 2017-09-14
     *
     * 具有派发系统消息的便捷接口
    */
    export default interface IDispatcher {
        /**
         * 派发内核消息
         *
         * @param {IMessage} msg 内核消息实例
         * @memberof Core
         */
        dispatch(msg: IMessage): void;
        /**
         * 派发内核消息，消息会转变为Message类型对象
         *
         * @param {string} type 消息类型
         * @param {...any[]} params 消息参数列表
         * @memberof Core
         */
        dispatch(type: string, ...params: any[]): void;
    }
}
/**
 * @author Raykid
 * @email initial_r@qq.com
 * @create date 2017-09-18
 * @modify date 2017-09-18
 *
 * 这个文件是给全局设置一个IConstructor接口而设计的
*/
interface IConstructor extends Function {
    new (...args: any[]): any;
}
declare module "core/interfaces/IConstructor" {
    export default IConstructor;
}
declare module "utils/ConstructUtil" {
    import IConstructor from "core/interfaces/IConstructor";
    /**
     * 包装一个类型，监听类型的实例化操作
     *
     * @export
     * @param {IConstructor} cls 要监听构造的类型构造器
     * @returns {IConstructor} 新的构造函数
     */
    export function wrapConstruct(cls: IConstructor): IConstructor;
    /**
     * 监听类型的实例化
     *
     * @export
     * @param {IConstructor} cls 要监听实例化的类
     * @param {(instance?:any)=>void} handler 处理函数
     */
    export function listenConstruct(cls: IConstructor, handler: (instance?: any) => void): void;
    /**
     * 移除实例化监听
     *
     * @export
     * @param {IConstructor} cls 要移除监听实例化的类
     * @param {(instance?:any)=>void} handler 处理函数
     */
    export function unlistenConstruct(cls: IConstructor, handler: (instance?: any) => void): void;
    /**
     * 监听类型销毁（如果能够销毁的话，需要类型具有dispose方法），该监听不需要移除
     *
     * @export
     * @param {IConstructor} cls 要监听销毁的类
     * @param {(instance?:any)=>void} handler 处理函数
     */
    export function listenDispose(cls: IConstructor, handler: (instance?: any) => void): void;
}
declare module "core/injector/Injector" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-19
     * @modify date 2017-09-19
     *
     * Core模组的装饰器注入模块
    */
    /** 生成类型实例并注入，可以进行类型转换注入（既注入类型可以和注册类型不一致，采用@Injectable({type: AnotherClass})的形式即可） */
    export function Injectable(cls: IConstructor): void;
    export function Injectable(name: string): ClassDecorator;
    export function Injectable(params: {
        type: IConstructor;
    }): ClassDecorator;
    /** 赋值注入的实例 */
    export function Inject(cls: IConstructor | string): PropertyDecorator;
    /** 处理内核消息 */
    export function MessageHandler(type: string): MethodDecorator;
}
declare module "core/Core" {
    import IMessage from "core/message/IMessage";
    import ICommandConstructor from "core/command/ICommandConstructor";
    import IDispatcher from "core/interfaces/IDispatcher";
    export interface IInjectableParams {
        type: IConstructor | string;
    }
    /**
     * 核心上下文对象，负责内核消息消息转发、对象注入等核心功能的实现
     *
     * @export
     * @class Core
     */
    export default class Core implements IDispatcher {
        private static _instance;
        constructor();
        /*********************** 下面是内核消息系统 ***********************/
        private _listenerDict;
        private handleMessages(msg);
        private doDispatch(msg);
        /**
         * 派发内核消息
         *
         * @param {IMessage} msg 内核消息实例
         * @memberof Core
         */
        dispatch(msg: IMessage): void;
        /**
         * 派发内核消息，消息会转变为Message类型对象
         *
         * @param {string} type 消息类型
         * @param {...any[]} params 消息参数列表
         * @memberof Core
         */
        dispatch(type: string, ...params: any[]): void;
        /**
         * 监听内核消息
         *
         * @param {string} type 消息类型
         * @param {Function} handler 消息处理函数
         * @param {*} [thisArg] 消息this指向
         * @memberof Core
         */
        listen(type: string, handler: Function, thisArg?: any): void;
        /**
         * 移除内核消息监听
         *
         * @param {string} type 消息类型
         * @param {Function} handler 消息处理函数
         * @param {*} [thisArg] 消息this指向
         * @memberof Core
         */
        unlisten(type: string, handler: Function, thisArg?: any): void;
        /*********************** 下面是依赖注入系统 ***********************/
        private _injectDict;
        /**
         * 添加一个类型注入，会立即生成一个实例并注入到框架内核中
         *
         * @param {IConstructor} target 要注入的类型（注意不是实例）
         * @param {IConstructor|string} [type] 如果提供该参数，则使用该类型代替注入类型的key，否则使用注入类型自身作为key
         * @memberof Core
         */
        mapInject(target: IConstructor, type?: IConstructor | string): void;
        /**
         * 注入一个对象实例
         *
         * @param {*} value 要注入的对象实例
         * @param {IConstructor|string} [type] 如果提供该参数，则使用该类型代替注入类型的key，否则使用注入实例的构造函数作为key
         * @memberof Core
         */
        mapInjectValue(value: any, type?: IConstructor | string): void;
        /**
         * 移除类型注入
         *
         * @param {IConstructor|string} target 要移除注入的类型
         * @memberof Core
         */
        unmapInject(target: IConstructor | string): void;
        /**
         * 获取注入的对象实例
         *
         * @param {IConstructor|string} type 注入对象的类型
         * @returns {*} 注入的对象实例
         * @memberof Core
         */
        getInject(type: IConstructor | string): any;
        /*********************** 下面是内核命令系统 ***********************/
        private _commandDict;
        private handleCommands(msg);
        /**
         * 注册命令到特定消息类型上，当这个类型的消息派发到框架内核时会触发Command运行
         *
         * @param {string} type 要注册的消息类型
         * @param {(ICommandConstructor)} cmd 命令处理器，可以是方法形式，也可以使类形式
         * @memberof Core
         */
        mapCommand(type: string, cmd: ICommandConstructor): void;
        /**
         * 注销命令
         *
         * @param {string} type 要注销的消息类型
         * @param {(ICommandConstructor)} cmd 命令处理器
         * @returns {void}
         * @memberof Core
         */
        unmapCommand(type: string, cmd: ICommandConstructor): void;
    }
    /** 再额外导出一个单例 */
    export const core: Core;
}
declare module "engine/bridge/IBridge" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-08-31
     * @modify date 2017-08-31
     *
     * 这是表现层桥接口，不同渲染引擎的表现层都需要实现该接口以接入Olympus框架
    */
    export default interface IBridge {
        /**
         * 获取表现层类型名称
         *
         * @readonly
         * @type {string}
         * @memberof IBridge
         */
        readonly type: string;
        /**
         * 获取表现层HTML包装器，可以对其样式进行自定义调整
         *
         * @readonly
         * @type {HTMLElement}
         * @memberof IBridge
         */
        readonly htmlWrapper: HTMLElement;
        /**
         * 获取根显示节点
         *
         * @readonly
         * @type {HTMLElement}
         * @memberof IBridge
         */
        readonly root: any;
        /**
         * 获取背景容器
         *
         * @readonly
         * @type {HTMLElement}
         * @memberof IBridge
         */
        readonly bgLayer: any;
        /**
         * 获取场景容器
         *
         * @readonly
         * @type {HTMLElement}
         * @memberof IBridge
         */
        readonly sceneLayer: any;
        /**
         * 获取弹窗容器
         *
         * @readonly
         * @type {HTMLElement}
         * @memberof IBridge
         */
        readonly panelLayer: any;
        /**
         * 获取顶级容器
         *
         * @readonly
         * @type {HTMLElement}
         * @memberof IBridge
         */
        readonly topLayer: any;
        /**
         * 判断传入的skin是否是属于该表现层桥的
         *
         * @param {*} skin 皮肤实例
         * @return {boolean} 是否数据该表现层桥
         * @memberof IBridge
         */
        isMySkin(skin: any): boolean;
        /**
         * 添加显示
         *
         * @param {*} parent 要添加到的父容器
         * @param {*} target 被添加的显示对象
         * @return {*} 返回被添加的显示对象
         * @memberof IBridge
         */
        addChild(parent: any, target: any): any;
        /**
         * 按索引添加显示
         *
         * @param {*} parent 要添加到的父容器
         * @param {*} target 被添加的显示对象
         * @param {number} index 要添加到的父级索引
         * @return {*} 返回被添加的显示对象
         * @memberof IBridge
         */
        addChildAt(parent: any, target: any, index: number): any;
        /**
         * 移除显示对象
         *
         * @param {*} parent 父容器
         * @param {*} target 被移除的显示对象
         * @return {*} 返回被移除的显示对象
         * @memberof IBridge
         */
        removeChild(parent: any, target: any): any;
        /**
         * 按索引移除显示
         *
         * @param {*} parent 父容器
         * @param {number} index 索引
         * @return {*} 返回被移除的显示对象
         * @memberof IBridge
         */
        removeChildAt(parent: any, index: number): any;
        /**
         * 移除所有显示对象
         *
         * @param {*} parent 父容器
         * @memberof IBridge
         */
        removeChildren(parent: any): void;
        /**
         * 获取父容器
         *
         * @param {*} target 指定显示对象
         * @return {*} 父容器
         * @memberof IBridge
         */
        getParent(target: any): any;
        /**
         * 获取指定索引处的显示对象
         *
         * @param {*} parent 父容器
         * @param {number} index 指定父级索引
         * @return {*} 索引处的显示对象
         * @memberof IBridge
         */
        getChildAt(parent: any, index: number): any;
        /**
         * 获取显示索引
         *
         * @param {*} parent 父容器
         * @param {*} target 子显示对象
         * @return {number} target在parent中的索引
         * @memberof IBridge
         */
        getChildIndex(parent: any, target: any): number;
        /**
         * 通过名称获取显示对象
         *
         * @param {*} parent 父容器
         * @param {string} name 对象名称
         * @return {*} 显示对象
         * @memberof IBridge
         */
        getChildByName(parent: any, name: string): any;
        /**
         * 获取子显示对象数量
         *
         * @param {*} parent 父容器
         * @return {number} 子显示对象数量
         * @memberof IBridge
         */
        getChildCount(parent: any): number;
        /**
         * 加载资源
         *
         * @param {string[]} assets 资源列表
         * @param {(err?:Error)=>void} handler 回调函数
         * @memberof IBridge
         */
        loadAssets(assets: string[], handler: (err?: Error) => void): void;
        /**
         * 监听事件，从这个方法监听的事件会在中介者销毁时被自动移除监听
         *
         * @param {*} target 事件目标对象
         * @param {string} type 事件类型
         * @param {Function} handler 事件处理函数
         * @param {*} [thisArg] this指向对象
         * @memberof IBridge
         */
        mapListener(target: any, type: string, handler: Function, thisArg?: any): void;
        /**
         * 注销监听事件
         *
         * @param {*} target 事件目标对象
         * @param {string} type 事件类型
         * @param {Function} handler 事件处理函数
         * @param {*} [thisArg] this指向对象
         * @memberof IBridge
         */
        unmapListener(target: any, type: string, handler: Function, thisArg?: any): void;
        /**
         * 初始化表现层桥，可以没有该方法，没有该方法则表示该表现层无需初始化
         *
         * @param {()=>void} complete 初始化完毕后的回调
         * @memberof IBridge
         */
        init?(complete: (bridge: IBridge) => void): void;
    }
}
declare module "engine/bridge/BridgeMessage" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 表现层消息
    */
    export default class BridgeMessage {
        /**
         * 初始化表现层实例前的消息
         *
         * @static
         * @type {string}
         * @memberof ViewMessage
         */
        static BRIDGE_BEFORE_INIT: string;
        /**
         * 初始化表现层实例后的消息
         *
         * @static
         * @type {string}
         * @memberof ViewMessage
         */
        static BRIDGE_AFTER_INIT: string;
        /**
         * 所有表现层实例都初始化完毕的消息
         *
         * @static
         * @type {string}
         * @memberof ViewMessage
         */
        static BRIDGE_ALL_INIT: string;
    }
}
declare module "engine/bridge/BridgeManager" {
    import IBridge from "engine/bridge/IBridge";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 用来管理所有表现层对象
    */
    export default class BridgeManager {
        private _bridgeDict;
        /**
         * 获取表现层桥实例
         *
         * @param {string} type 表现层类型
         * @returns {IBridge} 表现层桥实例
         * @memberof BridgeManager
         */
        getBridge(type: string): IBridge;
        /**
         * 通过给出一个显示对象皮肤实例来获取合适的表现层桥实例
         *
         * @param {*} skin 皮肤实例
         * @returns {IBridge|null} 皮肤所属表现层桥实例
         * @memberof BridgeManager
         */
        getBridgeBySkin(skin: any): IBridge | null;
        /**
         * 注册一个表现层桥实例到框架中
         *
         * @param {...IBridge[]} bridges 要注册的所有表现层桥
         * @memberof BridgeManager
         */
        registerBridge(...bridges: IBridge[]): void;
        private testAllInit();
    }
    /** 再额外导出一个单例 */
    export const bridgeManager: BridgeManager;
}
declare module "engine/net/DataType" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-11
     * @modify date 2017-09-11
     *
     * 请求或返回数据结构体
    */
    export default abstract class DataType {
        private __rawData;
        /**
         * 解析后端返回的JSON对象，生成结构体
         *
         * @param {any} data 后端返回的JSON对象
         * @returns {DataType} 结构体对象
         * @memberof DataType
         */
        parse(data: any): DataType;
        /**
         * 解析逻辑，需要子类实现
         *
         * @protected
         * @abstract
         * @param {*} data JSON对象
         * @memberof DataType
         */
        protected abstract doParse(data: any): void;
        /**
         * 打包数据成为一个Object，需要子类实现
         *
         * @returns {*} 打包后的数据
         * @memberof DataType
         */
        abstract pack(): any;
    }
}
declare module "engine/net/IRequestPolicy" {
    import RequestData from "engine/net/RequestData";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-11
     * @modify date 2017-09-11
     *
     * 请求策略，根据使用的策略不同，请求的行为也会有所不同，例如使用HTTP或者Socket
    */
    export default interface IRequestPolicy {
        /**
         * 发送请求逻辑
         *
         * @param {RequestData} request 请求
         * @memberof IRequestPolicy
         */
        sendRequest(request: RequestData): void;
    }
}
declare module "engine/net/RequestData" {
    import IMessage from "core/message/IMessage";
    import IRequestPolicy from "engine/net/IRequestPolicy";
    import { IResponseDataConstructor } from "engine/net/ResponseData";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-11
     * @modify date 2017-09-11
     *
     * 通讯发送消息基类
    */
    export interface IRequestParams {
        /**
         * 消息名
         *
         * @type {string}
         * @memberof IRequestParams
         */
        type: string;
        /**
         * 消息数据
         *
         * @type {*}
         * @memberof IRequestParams
         */
        data: any;
        /**
         * 协议类型
         *
         * @type {string}
         * @memberof IRequestParams
         */
        protocol: string;
        /**
         * 返回类型，如果消息没有返回类型或不确定是否有返回类型，则此处可以不定义（如Socket消息）
         *
         * @type {IResponseDataConstructor}
         * @memberof IRequestParams
         */
        response?: IResponseDataConstructor;
        /**
         * 其他可能需要的参数
         *
         * @type {*}
         * @memberof IRequestParams
         */
        [key: string]: any;
    }
    export default abstract class RequestData implements IMessage {
        /**
         * 用户参数，可以保存任意参数到Message中，该参数中的数据不会被发送
         *
         * @type {*}
         * @memberof RequestData
         */
        __userData: any;
        /**
         * 请求参数，可以运行时修改
         *
         * @type {IRequestParams}
         * @memberof RequestData
         */
        abstract __params: IRequestParams;
        /**
         * 消息发送接收策略
         *
         * @type {IRequestPolicy}
         * @memberof RequestData
         */
        abstract __policy: IRequestPolicy;
        /**
         * 获取请求消息类型字符串
         *
         * @readonly
         * @type {string}
         * @memberof RequestData
         */
        readonly type: string;
    }
    /** 导出公共消息参数对象 */
    export var commonData: any;
}
declare module "engine/net/ResponseData" {
    import MessageType from "engine/net/DataType";
    import RequestData from "engine/net/RequestData";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-11
     * @modify date 2017-09-11
     *
     * 通讯返回消息基类
    */
    export interface IResponseParams {
        type: string;
        protocol: string;
        method: null | "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH" | "MOVE" | "COPY" | "LINK" | "UNLINK" | "WRAPPED" | "Extension-mothed";
        data: any;
        request?: RequestData;
        error?: Error;
    }
    export default abstract class ResponseData extends MessageType {
        /**
         * 返回参数
         *
         * @abstract
         * @type {IResponseParams}
         * @memberof ResponseType
         */
        abstract __params: IResponseParams;
    }
    export interface IResponseDataConstructor {
        new (): ResponseData;
        getType(): string;
    }
}
declare module "engine/net/NetMessage" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-11
     * @modify date 2017-09-11
     *
     * 通讯相关的消息
    */
    export default class NetMessage {
        /**
         * 发送网络请求消息
         *
         * @static
         * @type {string}
         * @memberof NetMessage
         */
        static NET_REQUEST: string;
        /**
         * 接受网络返回消息
         *
         * @static
         * @type {string}
         * @memberof NetMessage
         */
        static NET_RESPONSE: string;
        /**
         * 网络请求错误消息
         *
         * @static
         * @type {string}
         * @memberof NetMessage
         */
        static NET_ERROR: string;
    }
}
declare module "engine/net/NetManager" {
    import RequestData from "engine/net/RequestData";
    import ResponseData, { IResponseDataConstructor } from "engine/net/ResponseData";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-12
     * @modify date 2017-09-12
     *
     * 网络管理器
    */
    export interface ResponseHandler {
        (response: ResponseData, request?: RequestData): void;
    }
    export default class NetManager {
        constructor();
        private onMsgDispatched(msg);
        private _responseDict;
        /**
         * 注册一个返回结构体
         *
         * @param {string} type 返回类型
         * @param {IResponseDataConstructor} cls 返回结构体构造器
         * @memberof NetManager
         */
        registerResponse(cls: IResponseDataConstructor): void;
        private _responseListeners;
        /**
         * 添加一个通讯返回监听
         *
         * @param {(IResponseDataConstructor|string)} clsOrType 要监听的返回结构构造器或者类型字符串
         * @param {ResponseHandler} handler 回调函数
         * @param {*} [thisArg] this指向
         * @param {boolean} [once=false] 是否一次性监听
         * @memberof NetManager
         */
        listenResponse(clsOrType: IResponseDataConstructor | string, handler: ResponseHandler, thisArg?: any, once?: boolean): void;
        /**
         * 移除一个通讯返回监听
         *
         * @param {(IResponseDataConstructor|string)} clsOrType 要移除监听的返回结构构造器或者类型字符串
         * @param {ResponseHandler} handler 回调函数
         * @param {*} [thisArg] this指向
         * @param {boolean} [once=false] 是否一次性监听
         * @memberof NetManager
         */
        unlistenResponse(clsOrType: IResponseDataConstructor | string, handler: ResponseHandler, thisArg?: any, once?: boolean): void;
        /**
         * 发送多条请求，并且等待返回结果（如果有的话），调用回调
         *
         * @param {RequestData[]} [requests 要发送的请求列表
         * @param {(responses?:ResponseData[])=>void} [handler] 收到返回结果后的回调函数
         * @param {*} [thisArg] this指向
         * @memberof NetManager
         */
        sendMultiRequests(requests?: RequestData[], handler?: (responses?: ResponseData[]) => void, thisArg?: any): void;
        /** 这里导出不希望用户使用的方法，供框架内使用 */
        __onResponse(type: string, result: any, request?: RequestData): void | never;
        __onError(err: Error, request?: RequestData): void;
    }
    /** 再额外导出一个单例 */
    export const netManager: NetManager;
}
declare module "core/interfaces/IDisposable" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-01
     * @modify date 2017-09-01
     *
     * 可回收接口
    */
    export default interface IDisposable {
        /** 是否已经被销毁 */
        readonly disposed: boolean;
        /** 销毁 */
        dispose(): void;
    }
}
declare module "engine/bridge/IHasBridge" {
    import IBridge from "engine/bridge/IBridge";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-08
     * @modify date 2017-09-08
     *
     * 标识拥有表现层桥的接口
    */
    export default interface IHasMediatorBridge {
        /**
         * 表现层桥
         */
        bridge: IBridge;
    }
}
declare module "engine/mediator/IMediator" {
    import IHasBridge from "engine/bridge/IHasBridge";
    import IDisposable from "core/interfaces/IDisposable";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-04
     * @modify date 2017-09-04
     *
     * 界面中介者接口
    */
    export default interface IMediator extends IHasBridge, IDisposable {
        /**
         * 获取中介者是否已被销毁
         *
         * @returns {boolean} 是否已被销毁
         * @memberof IMediator
         */
        readonly disposed: boolean;
        /**
         * 皮肤
         *
         * @readonly
         * @type {*}
         * @memberof IMediator
         */
        skin: any;
        /**
         * 列出中介者所需的资源数组，可重写
         *
         * @returns {string[]} 资源数组，请根据该Mediator所操作的渲染模组的需求给出资源地址或组名
         * @memberof IMediator
         */
        listAssets(): string[];
        /**
         * 加载从listAssets中获取到的所有资源，完毕后调用回调函数
         *
         * @param {(err?:Error)=>void} handler 完毕后的回调函数，有错误则给出err，没有则不给
         * @memberof IMediator
         */
        loadAssets(handler: (err?: Error) => void): void;
        /**
         * 监听事件，从这个方法监听的事件会在中介者销毁时被自动移除监听
         *
         * @param {*} target 事件目标对象
         * @param {string} type 事件类型
         * @param {Function} handler 事件处理函数
         * @param {*} [thisArg] this指向对象
         * @memberof IMediator
         */
        mapListener(target: any, type: string, handler: Function, thisArg?: any): void;
        /**
         * 注销监听事件
         *
         * @param {*} target 事件目标对象
         * @param {string} type 事件类型
         * @param {Function} handler 事件处理函数
         * @param {*} [thisArg] this指向对象
         * @memberof IMediator
         */
        unmapListener(target: any, type: string, handler: Function, thisArg?: any): void;
        /**
         * 注销所有注册在当前中介者上的事件监听
         *
         * @memberof IMediator
         */
        unmapAllListeners(): void;
    }
}
declare module "engine/module/IModuleConstructor" {
    import IModule from "engine/module/IModule";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-14
     * @modify date 2017-09-14
     *
     * 模块构造器接口
    */
    export default interface IModuleConstructor {
        new (): IModule;
    }
}
declare module "engine/module/IModule" {
    import IDisposable from "core/interfaces/IDisposable";
    import IMediator from "engine/mediator/IMediator";
    import RequestData from "engine/net/RequestData";
    import ResponseData from "engine/net/ResponseData";
    import IModuleConstructor from "engine/module/IModuleConstructor";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 业务模块接口
    */
    export default interface IModule extends IDisposable {
        /** 列出模块所需CSS资源URL */
        listStyleFiles(): string[];
        /** 列出模块所需JS资源URL */
        listJsFiles(): string[];
        /** 列出模块初始化请求 */
        listInitRequests(): RequestData[];
        /** 将中介者托管给模块 */
        delegateMediator(mediator: IMediator): void;
        /** 反托管中介者 */
        undelegateMediator(mediator: IMediator): void;
        /** 获取所有已托管的中介者 */
        getDelegatedMediators(): IMediator[];
        /** 当获取到所有消息返回后调用 */
        onGetResponses(responses: ResponseData[]): void;
        /** 打开模块时调用 */
        onOpen(data?: any): void;
        /** 关闭模块时调用 */
        onClose(data?: any): void;
        /** 模块切换到前台时调用（open之后或者其他模块被关闭时） */
        onActivate(from: IModuleConstructor | undefined, data?: any): void;
        /** 模块切换到后台是调用（close之后或者其他模块打开时） */
        onDeactivate(to: IModuleConstructor | undefined, data?: any): void;
    }
}
declare module "engine/injector/Injector" {
    import { IResponseDataConstructor } from "engine/net/ResponseData";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-19
     * @modify date 2017-09-19
     *
     * 负责注入的模块
    */
    /** 定义数据模型，支持实例注入，并且自身也会被注入 */
    export function ModelClass(cls: IConstructor): any;
    /** 定义界面中介者，支持实例注入，并可根据所赋显示对象自动调整所使用的表现层桥 */
    export function MediatorClass(cls: IConstructor): any;
    /** 定义模块，支持实例注入 */
    export function ModuleClass(cls: IConstructor): any;
    /** 处理通讯消息返回 */
    export function ResponseHandler(clsOrType: IResponseDataConstructor | string): MethodDecorator;
    /** 在Module内托管Mediator */
    export function DelegateMediator(prototype: any, propertyKey: string): any;
}
declare module "Injector" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-19
     * @modify date 2017-09-19
     *
     * 统一的Injector输出口，所有框架内的装饰器注入方法都可以从这个模块找到
    */
    /** 导出core模组的注入方法 */
    export * from "core/injector/Injector";
    /** 导出engine模组的注入方法 */
    export * from "engine/injector/Injector";
}
declare module "engine/platform/IPlatform" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-21
     * @modify date 2017-09-21
     *
     * 平台接口
    */
    export default interface IPlatform {
        /**
         * 刷新当前页面
         *
         * @memberof IPlatform
         */
        reload(): void;
    }
}
declare module "engine/platform/WebPlatform" {
    import IPlatform from "engine/platform/IPlatform";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-21
     * @modify date 2017-09-21
     *
     * 网页平台接口实现类，也是平台接口的默认类
    */
    export default class WebPlatform implements IPlatform {
        reload(): void;
    }
}
declare module "engine/platform/PlatformManager" {
    import IPlatform from "engine/platform/IPlatform";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-21
     * @modify date 2017-09-21
     *
     * 平台接口管理器，通过桥接模式统一不同平台的不同接口，从而实现对框架其他模块透明化
    */
    export default class PlatformManager implements IPlatform {
        /**
         * 平台接口实现对象，默认是普通网页平台，也可以根据需要定制
         *
         * @type {IPlatform}
         * @memberof PlatformManager
         */
        platform: IPlatform;
        /**
         * 刷新当前页面
         *
         * @memberof PlatformManager
         */
        reload(): void;
    }
    /** 再额外导出一个单例 */
    export const platformManager: PlatformManager;
}
declare module "engine/system/System" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 用来记录程序运行时间，并且提供延迟回调或频率回调功能
    */
    export default class System {
        private _nextFrameList;
        private _timer;
        /**
         * 获取从程序运行到当前所经过的毫秒数
         *
         * @returns {number} 毫秒数
         * @memberof System
         */
        getTimer(): number;
        constructor();
        private tick();
        /**
         * 在下一帧执行某个方法
         *
         * @param {Function} handler 希望在下一帧执行的某个方法
         * @param {*} [thisArg] this指向
         * @param {...any[]} args 方法参数列表
         * @returns {ICancelable} 可取消的句柄
         * @memberof System
         */
        nextFrame(handler: Function, thisArg?: any, ...args: any[]): ICancelable;
        /**
         * 设置延迟回调
         *
         * @param {number} duration 延迟毫秒值
         * @param {Function} handler 回调函数
         * @param {*} [thisArg] this指向
         * @param {...any[]} args 要传递的参数
         * @returns {ICancelable} 可取消的句柄
         * @memberof System
         */
        setTimeout(duration: number, handler: Function, thisArg?: any, ...args: any[]): ICancelable;
        /**
         * 设置延时间隔
         *
         * @param {number} duration 延迟毫秒值
         * @param {Function} handler 回调函数
         * @param {*} [thisArg] this指向
         * @param {...any[]} args 要传递的参数
         * @returns {ICancelable} 可取消的句柄
         * @memberof System
         */
        setInterval(duration: number, handler: Function, thisArg?: any, ...args: any[]): ICancelable;
    }
    export interface ICancelable {
        cancel(): void;
    }
    /** 再额外导出一个单例 */
    export const system: System;
}
declare module "engine/model/Model" {
    import IMessage from "core/message/IMessage";
    import IDispatcher from "core/interfaces/IDispatcher";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-14
     * @modify date 2017-09-14
     *
     * Model的基类，也可以不继承该基类，因为Model是很随意的东西
    */
    export default abstract class Model implements IDispatcher {
        /**
         * 派发内核消息
         *
         * @param {IMessage} msg 内核消息实例
         * @memberof Core
         */
        dispatch(msg: IMessage): void;
        /**
         * 派发内核消息，消息会转变为Message类型对象
         *
         * @param {string} type 消息类型
         * @param {...any[]} params 消息参数列表
         * @memberof Core
         */
        dispatch(type: string, ...params: any[]): void;
    }
}
declare module "engine/mediator/Mediator" {
    import IDispatcher from "core/interfaces/IDispatcher";
    import IMessage from "core/message/IMessage";
    import IMediator from "engine/mediator/IMediator";
    import IBridge from "engine/bridge/IBridge";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-04
     * @modify date 2017-09-04
     *
     * 组件界面中介者基类
    */
    export default class Mediator implements IMediator, IDispatcher {
        /**
         * 表现层桥
         *
         * @type {IBridge}
         * @memberof Mediator
         */
        bridge: IBridge;
        /**
         * 皮肤
         *
         * @type {*}
         * @memberof Mediator
         */
        skin: any;
        private _disposed;
        /**
         * 获取中介者是否已被销毁
         *
         * @readonly
         * @type {boolean}
         * @memberof Mediator
         */
        readonly disposed: boolean;
        constructor(skin?: any);
        /**
         * 列出中介者所需的资源数组，可重写
         *
         * @returns {string[]} 资源数组，请根据该Mediator所操作的渲染模组的需求给出资源地址或组名
         * @memberof Mediator
         */
        listAssets(): string[];
        /**
         * 加载从listAssets中获取到的所有资源，完毕后调用回调函数
         *
         * @param {(err?:Error)=>void} handler 完毕后的回调函数，有错误则给出err，没有则不给
         * @memberof Mediator
         */
        loadAssets(handler: (err?: Error) => void): void;
        private _listeners;
        /**
         * 监听事件，从这个方法监听的事件会在中介者销毁时被自动移除监听
         *
         * @param {*} target 事件目标对象
         * @param {string} type 事件类型
         * @param {Function} handler 事件处理函数
         * @param {*} [thisArg] this指向对象
         * @memberof Mediator
         */
        mapListener(target: any, type: string, handler: Function, thisArg?: any): void;
        /**
         * 注销监听事件
         *
         * @param {*} target 事件目标对象
         * @param {string} type 事件类型
         * @param {Function} handler 事件处理函数
         * @param {*} [thisArg] this指向对象
         * @memberof Mediator
         */
        unmapListener(target: any, type: string, handler: Function, thisArg?: any): void;
        /**
         * 注销所有注册在当前中介者上的事件监听
         *
         * @memberof Mediator
         */
        unmapAllListeners(): void;
        /**
         * 派发内核消息
         *
         * @param {IMessage} msg 内核消息实例
         * @memberof Core
         */
        dispatch(msg: IMessage): void;
        /**
         * 派发内核消息，消息会转变为Message类型对象
         *
         * @param {string} type 消息类型
         * @param {...any[]} params 消息参数列表
         * @memberof Core
         */
        dispatch(type: string, ...params: any[]): void;
        /**
         * 销毁中介者
         *
         * @memberof Mediator
         */
        dispose(): void;
    }
}
declare module "engine/panel/IPanelPolicy" {
    import IPanel from "engine/panel/IPanel";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 弹窗动画策略，负责将弹窗动画与弹窗实体解耦
    */
    export default interface IPanelPolicy {
        /**
         * 显示时调用
         * @param panel 弹出框对象
         * @param callback 完成回调，必须调用
         * @param from 动画起始点
         */
        pop(panel: IPanel, callback: () => void, from?: {
            x: number;
            y: number;
        }): void;
        /**
         * 关闭时调用
         * @param panel 弹出框对象
         * @param callback 完成回调，必须调用
         * @param to 动画完结点
         */
        drop(panel: IPanel, callback: () => void, to?: {
            x: number;
            y: number;
        }): void;
    }
}
declare module "engine/panel/IPanel" {
    import IDisposable from "core/interfaces/IDisposable";
    import IHasBridge from "engine/bridge/IHasBridge";
    import IPanelPolicy from "engine/panel/IPanelPolicy";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 弹窗接口
    */
    export default interface IPanel extends IHasBridge, IDisposable {
        /** 实际显示对象 */
        skin: any;
        /** 弹出策略 */
        policy: IPanelPolicy;
        /** 弹出当前弹窗（等同于调用PanelManager.pop方法） */
        pop(data?: any, isModel?: boolean, from?: {
            x: number;
            y: number;
        }): IPanel;
        /** 关闭当前弹窗（等同于调用PanelManager.drop方法） */
        drop(data?: any, to?: {
            x: number;
            y: number;
        }): IPanel;
        /** 在弹出前调用的方法 */
        onBeforePop(data?: any, isModel?: boolean, from?: {
            x: number;
            y: number;
        }): void;
        /** 在弹出后调用的方法 */
        onAfterPop(data?: any, isModel?: boolean, from?: {
            x: number;
            y: number;
        }): void;
        /** 在关闭前调用的方法 */
        onBeforeDrop(data?: any, to?: {
            x: number;
            y: number;
        }): void;
        /** 在关闭后调用的方法 */
        onAfterDrop(data?: any, to?: {
            x: number;
            y: number;
        }): void;
    }
}
declare module "engine/panel/NonePanelPolicy" {
    import IPanel from "engine/panel/IPanel";
    import IPanelPolicy from "engine/panel/IPanelPolicy";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 无任何动画的弹出策略，可应用于任何显示层实现
    */
    export class NonePanelPolicy implements IPanelPolicy {
        pop(panel: IPanel, callback: () => void, from?: {
            x: number;
            y: number;
        }): void;
        drop(panel: IPanel, callback: () => void, from?: {
            x: number;
            y: number;
        }): void;
    }
    const _default: NonePanelPolicy;
    export default _default;
}
declare module "engine/panel/PanelMessage" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 弹窗相关的消息
    */
    export default class PanelMessage {
        /**
         * 打开弹窗前的消息
         *
         * @static
         * @type {string}
         * @memberof PanelMessage
         */
        static PANEL_BEFORE_POP: string;
        /**
         * 打开弹窗后的消息
         *
         * @static
         * @type {string}
         * @memberof PanelMessage
         */
        static PANEL_AFTER_POP: string;
        /**
         * 关闭弹窗前的消息
         *
         * @static
         * @type {string}
         * @memberof PanelMessage
         */
        static PANEL_BEFORE_DROP: string;
        /**
         * 关闭弹窗后的消息
         *
         * @static
         * @type {string}
         * @memberof PanelMessage
         */
        static PANEL_AFTER_DROP: string;
    }
}
declare module "engine/panel/IPromptPanel" {
    import IPanel from "engine/panel/IPanel";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-21
     * @modify date 2017-09-21
     *
     * 通用弹窗的各种接口
    */
    export enum ButtonType {
        normal = 0,
        important = 1,
    }
    export interface IPromptParams {
        msg: string;
        style?: any;
        title?: string;
        handlers?: IPromptHandler[];
    }
    export interface IPromptHandler {
        /** 与按钮绑定的数据 */
        data: any;
        /** 按钮上显示的文本，不传递则默认使用data的字符串值 */
        text?: string;
        /** 回调函数，当前按钮被点击时调用，参数为data对象 */
        handler?: (data?: any) => void;
        /** 按钮类型，默认为normal */
        buttonType?: ButtonType;
    }
    export default interface IPromptPanel extends IPanel {
        /**
         * 更新通用提示窗显示
         * @param params 弹窗数据
         */
        update(params: IPromptParams): void;
    }
}
declare module "engine/scene/IScenePolicy" {
    import IScene from "engine/scene/IScene";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-08
     * @modify date 2017-09-08
     *
     * 场景动画策略，负责将场景动画与场景实体解耦
    */
    export default interface IScenePolicy {
        /**
         * 准备切换场景时调度
         * @param from 切出的场景
         * @param to 切入的场景
         */
        prepareSwitch(from: IScene, to: IScene): void;
        /**
         * 切换场景时调度
         * @param from 切出的场景
         * @param to 切入的场景
         * @param callback 切换完毕的回调方法
         */
        switch(from: IScene, to: IScene, callback: () => void): void;
        /**
         * 准备Push场景时调度，如果没有定义该方法则套用PrepareSwitch
         * @param from 切出的场景
         * @param to 切入的场景
         */
        preparePush?(from: IScene, to: IScene): void;
        /**
         * Push场景时调度，如果没有定义该方法则套用switch
         * @param from 切出的场景
         * @param to 切入的场景
         * @param callback 切换完毕的回调方法
         */
        push?(from: IScene, to: IScene, callback: () => void): void;
        /**
         * 准备Pop场景时调度，如果没有定义该方法则套用PrepareSwitch
         * @param from 切出的场景
         * @param to 切入的场景
         */
        preparePop?(from: IScene, to: IScene): void;
        /**
         * Pop场景时调度，如果没有定义该方法则套用switch
         * @param from 切出的场景
         * @param to 切入的场景
         * @param callback 切换完毕的回调方法
         */
        pop?(from: IScene, to: IScene, callback: () => void): void;
    }
}
declare module "engine/scene/IScene" {
    import IDisposable from "core/interfaces/IDisposable";
    import IHasBridge from "engine/bridge/IHasBridge";
    import IScenePolicy from "engine/scene/IScenePolicy";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-08
     * @modify date 2017-09-08
     *
     * 场景接口
    */
    export default interface IScene extends IHasBridge, IDisposable {
        /** 显示对象 */
        skin: any;
        /** 切换策略 */
        policy: IScenePolicy;
        /** 切入当前场景（相当于调用SceneManager.switch方法） */
        switch(data?: any): IScene;
        /** 推入当前场景（相当于调用SceneManager.push方法） */
        push(data?: any): IScene;
        /** 弹出当前场景（相当于调用SceneManager.pop方法） */
        pop(data?: any): IScene;
        /**
         * 切入场景开始前调用
         * @param fromScene 从哪个场景切入
         * @param data 切场景时可能的参数
         */
        onBeforeIn(fromScene: IScene, data?: any): void;
        /**
         * 切入场景开始后调用
         * @param fromScene 从哪个场景切入
         * @param data 切场景时可能的参数
         */
        onAfterIn(fromScene: IScene, data?: any): void;
        /**
         * 切出场景开始前调用
         * @param toScene 要切入到哪个场景
         * @param data 切场景时可能的参数
         */
        onBeforeOut(toScene: IScene, data?: any): void;
        /**
         * 切出场景开始后调用
         * @param toScene 要切入到哪个场景
         * @param data 切场景时可能的参数
         */
        onAfterOut(toScene: IScene, data?: any): void;
    }
}
declare module "engine/scene/NoneScenePolicy" {
    import IScene from "engine/scene/IScene";
    import IScenePolicy from "engine/scene/IScenePolicy";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-08
     * @modify date 2017-09-08
     *
     * 无任何动画的场景策略，可应用于任何显示层实现
    */
    export class NoneScenePolicy implements IScenePolicy {
        /**
         * 准备切换场景时调度
         * @param from 切出的场景
         * @param to 切入的场景
         */
        prepareSwitch(from: IScene, to: IScene): void;
        /**
         * 切换场景时调度
         * @param from 切出的场景
         * @param to 切入的场景
         * @param callback 切换完毕的回调方法
         */
        switch(from: IScene, to: IScene, callback: () => void): void;
    }
    const _default: NoneScenePolicy;
    export default _default;
}
declare module "engine/scene/SceneMessage" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-08
     * @modify date 2017-09-08
     *
     * 场景相关的消息
    */
    export default class SceneMessage {
        /**
         * 切换场景前的消息
         *
         * @static
         * @type {string}
         * @memberof SceneMessage
         */
        static SCENE_BEFORE_CHANGE: string;
        /**
         * 切换场景后的消息
         *
         * @static
         * @type {string}
         * @memberof SceneMessage
         */
        static SCENE_AFTER_CHANGE: string;
    }
}
declare module "utils/SyncUtil" {
    /**
     * 判断是否正在进行操作
     *
     * @export
     * @param {string} name 队列名
     * @returns {boolean} 队列是否正在操作
     */
    export function isOperating(name: string): boolean;
    /**
     * 开始同步操作，所有传递了相同name的操作会被以队列方式顺序执行
     *
     * @export
     * @param name 一个队列的名字
     * @param {Function} fn 要执行的方法
     * @param {*} [thisArg] 方法this对象
     * @param {...any[]} [args] 方法参数
     */
    export function wait(name: string, fn: Function, thisArg?: any, ...args: any[]): void;
    /**
     * 完成一步操作并唤醒后续操作
     *
     * @export
     * @param {string} name 队列名字
     * @returns {void}
     */
    export function notify(name: string): void;
}
declare module "engine/scene/SceneManager" {
    import IScene from "engine/scene/IScene";
    export default class SceneManager {
        private _sceneStack;
        /**
         * 获取当前场景
         *
         * @readonly
         * @type {IScene}
         * @memberof SceneManager
         */
        readonly currentScene: IScene;
        /**
         * 获取活动场景个数
         *
         * @readonly
         * @type {number}
         * @memberof SceneManager
         */
        readonly activeCount: number;
        /**
         * 切换场景，替换当前场景，当前场景会被销毁
         *
         * @param {IScene} scene 要切换到的场景
         * @param {*} [data] 要携带给下一个场景的数据
         * @returns {IScene} 场景本体
         * @memberof SceneManager
         */
        switch(scene: IScene, data?: any): IScene;
        /**
         * 推入场景，当前场景不会销毁，而是进入场景栈保存，以后可以通过popScene重新展现
         *
         * @param {IScene} scene 要推入的场景
         * @param {*} [data] 要携带给下一个场景的数据
         * @returns {IScene} 场景本体
         * @memberof SceneManager
         */
        push(scene: IScene, data?: any): IScene;
        /**
         * 弹出场景，当前场景会被销毁，当前位于栈顶的场景会重新显示
         *
         * @param {IScene} scene 要切换出的场景，如果传入的场景不是当前场景则仅移除指定场景，不会进行切换操作
         * @param {*} [data] 要携带给下一个场景的数据
         * @returns {IScene} 场景本体
         * @memberof SceneManager
         */
        pop(scene: IScene, data?: any): IScene;
        private doPop(scene, data);
        private doChange(from, to, data, policy, type, complete);
    }
    /** 再额外导出一个单例 */
    export const sceneManager: SceneManager;
}
declare module "engine/panel/PanelManager" {
    import IConstructor from "core/interfaces/IConstructor";
    import IPanel from "engine/panel/IPanel";
    import { IPromptParams, IPromptHandler } from "engine/panel/IPromptPanel";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 弹窗管理器，包含弹出弹窗、关闭弹窗、弹窗管理等功能
    */
    export default class PanelManager {
        private _panels;
        /**
         * 获取当前显示的弹窗数组（副本）
         *
         * @param {IConstructor} [cls] 弹窗类型，如果传递该参数则只返回该类型的已打开弹窗，否则将返回所有已打开的弹窗
         * @returns {IPanel[]} 已打开弹窗数组
         * @memberof PanelManager
         */
        getOpened(cls?: IConstructor): IPanel[];
        /**
         * 打开一个弹窗
         *
         * @param {IPanel} panel 要打开的弹窗
         * @param {*} [data] 数据
         * @param {boolean} [isModel=true] 是否模态弹出
         * @param {{x:number, y:number}} [from] 弹出起点位置
         * @returns {IPanel} 返回弹窗对象
         * @memberof PanelManager
         */
        open(panel: IPanel, data?: any, isModel?: boolean, from?: {
            x: number;
            y: number;
        }): IPanel;
        /**
         * 关闭一个弹窗
         *
         * @param {IPanel} panel 要关闭的弹窗
         * @param {*} [data] 数据
         * @param {{x:number, y:number}} [to] 关闭终点位置
         * @returns {IPanel} 返回弹窗对象
         * @memberof PanelManager
         */
        close(panel: IPanel, data?: any, to?: {
            x: number;
            y: number;
        }): IPanel;
        /************************ 下面是通用弹窗的逻辑 ************************/
        private _promptDict;
        /**
         * 显示提示窗口
         *
         * @param {string} msg 要显示的文本
         * @param {...IPromptHandler[]} handlers 按钮回调数组
         * @returns {IPanel} 返回被显示的弹窗
         * @memberof PanelManager
         */
        prompt(msg: string, ...handlers: IPromptHandler[]): IPanel;
        /**
         * 显示提示窗口
         *
         * @param {IPromptParams} params 弹窗数据
         * @returns {IPanel} 返回被显示的弹窗
         * @memberof PanelManager
         */
        prompt(params: IPromptParams): IPanel;
        /**
         * 显示警告窗口（只有一个确定按钮）
         *
         * @param {(string|IPromptParams)} msgOrParams 要显示的文本，或者弹窗数据
         * @param {()=>void} [okHandler] 确定按钮点击回调
         * @returns {IPanel} 返回被显示的弹窗
         * @memberof PanelManager
         */
        alert(msgOrParams: string | IPromptParams, okHandler?: () => void): IPanel;
        /**
         * 显示确认窗口（有一个确定按钮和一个取消按钮）
         *
         * @param {(string|IPromptParams)} msgOrParams 要显示的文本，或者弹窗数据
         * @param {()=>void} [okHandler] 确定按钮点击回调
         * @param {()=>void} [cancelHandler] 取消按钮点击回调
         * @returns {IPanel} 返回被显示的弹窗
         * @memberof PanelManager
         */
        confirm(msgOrParams: string | IPromptParams, okHandler?: () => void, cancelHandler?: () => void): IPanel;
    }
    /** 再额外导出一个单例 */
    export const panelManager: PanelManager;
}
declare module "engine/panel/PanelMediator" {
    import Mediator from "engine/mediator/Mediator";
    import IPanel from "engine/panel/IPanel";
    import IPanelPolicy from "engine/panel/IPanelPolicy";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * 实现了IPanel接口的弹窗中介者基类
    */
    export default class PanelMediator extends Mediator implements IPanel {
        /**
         * 弹出策略
         *
         * @type {IPanelPolicy}
         * @memberof PanelMediator
         */
        policy: IPanelPolicy;
        constructor(skin?: any, policy?: IPanelPolicy);
        /**
         * 弹出当前弹窗（等同于调用PanelManager.open方法）
         *
         * @param {*} [data] 数据
         * @param {boolean} [isModel] 是否模态弹出（后方UI无法交互）
         * @param {{x:number, y:number}} [from] 弹出点坐标
         * @returns {IPanel} 弹窗本体
         * @memberof PanelMediator
         */
        pop(data?: any, isModel?: boolean, from?: {
            x: number;
            y: number;
        }): IPanel;
        /**
         * 关闭当前弹窗（等同于调用PanelManager.close方法）
         *
         * @param {*} [data] 数据
         * @param {{x:number, y:number}} [to] 关闭点坐标
         * @returns {IPanel} 弹窗本体
         * @memberof PanelMediator
         */
        drop(data?: any, to?: {
            x: number;
            y: number;
        }): IPanel;
        /** 在弹出前调用的方法 */
        onBeforePop(data?: any, isModel?: boolean, from?: {
            x: number;
            y: number;
        }): void;
        /** 在弹出后调用的方法 */
        onAfterPop(data?: any, isModel?: boolean, from?: {
            x: number;
            y: number;
        }): void;
        /** 在关闭前调用的方法 */
        onBeforeDrop(data?: any, to?: {
            x: number;
            y: number;
        }): void;
        /** 在关闭后调用的方法 */
        onAfterDrop(data?: any, to?: {
            x: number;
            y: number;
        }): void;
    }
}
declare module "engine/scene/SceneMediator" {
    import Mediator from "engine/mediator/Mediator";
    import IScene from "engine/scene/IScene";
    import IScenePolicy from "engine/scene/IScenePolicy";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-08
     * @modify date 2017-09-08
     *
     * 实现了IScene接口的场景中介者基类
    */
    export default class SceneMediator extends Mediator implements IScene {
        /**
         * 切换策略
         *
         * @type {IScenePolicy}
         * @memberof SceneMediator
         */
        policy: IScenePolicy;
        constructor(skin?: any, policy?: IScenePolicy);
        /**
         * 切入当前场景（相当于调用SceneManager.switch方法）
         *
         * @param {*} [data] 数据
         * @returns {IScene} 场景本体
         * @memberof SceneMediator
         */
        switch(data?: any): IScene;
        /**
         * 推入当前场景（相当于调用SceneManager.push方法）
         *
         * @param {*} [data] 数据
         * @returns {IScene} 场景本体
         * @memberof SceneMediator
         */
        push(data?: any): IScene;
        /**
         * 弹出当前场景（相当于调用SceneManager.pop方法）
         *
         * @param {*} [data] 数据
         * @returns {IScene} 场景本体
         * @memberof SceneMediator
         */
        pop(data?: any): IScene;
        /**
         * 切入场景开始前调用
         * @param fromScene 从哪个场景切入
         * @param data 切场景时可能的参数
         */
        onBeforeIn(fromScene: IScene, data?: any): void;
        /**
         * 切入场景开始后调用
         * @param fromScene 从哪个场景切入
         * @param data 切场景时可能的参数
         */
        onAfterIn(fromScene: IScene, data?: any): void;
        /**
         * 切出场景开始前调用
         * @param toScene 要切入到哪个场景
         * @param data 切场景时可能的参数
         */
        onBeforeOut(toScene: IScene, data?: any): void;
        /**
         * 切出场景开始后调用
         * @param toScene 要切入到哪个场景
         * @param data 切场景时可能的参数
         */
        onAfterOut(toScene: IScene, data?: any): void;
    }
}
declare module "engine/module/ModuleMessage" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-18
     * @modify date 2017-09-18
     *
     * 模块消息
    */
    export default class ModuleMessage {
        /**
         * 切换模块消息
         *
         * @static
         * @type {string}
         * @memberof ModuleMessage
         */
        static MODULE_CHANGE: string;
        /**
         * 加载模块失败消息
         *
         * @static
         * @type {string}
         * @memberof ModuleMessage
         */
        static MODULE_LOAD_ASSETS_ERROR: string;
    }
}
declare module "engine/module/ModuleManager" {
    import IModuleConstructor from "engine/module/IModuleConstructor";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-14
     * @modify date 2017-09-15
     *
     * 模块管理器，管理模块相关的所有操作。模块具有唯一性，同一时间不可以打开两个相同模块，如果打开则会退回到先前的模块处
    */
    export default class ModuleManager {
        private _moduleStack;
        /**
         * 获取当前模块
         *
         * @readonly
         * @type {IModuleConstructor}
         * @memberof ModuleManager
         */
        readonly currentModule: IModuleConstructor | undefined;
        /**
         * 获取活动模块数量
         *
         * @readonly
         * @type {number}
         * @memberof ModuleManager
         */
        readonly activeCount: number;
        private getIndex(cls);
        private getAfter(cls);
        private getCurrent();
        /**
         * 获取模块是否开启中
         *
         * @param {IModuleConstructor} cls 要判断的模块类型
         * @returns {boolean} 是否开启
         * @memberof ModuleManager
         */
        isOpened(cls: IModuleConstructor): boolean;
        /**
         * 打开模块
         *
         * @param {IModuleConstructor} cls 模块类型
         * @param {*} [data] 参数
         * @param {boolean} [replace=false] 是否替换当前模块
         * @memberof ModuleManager
         */
        open(cls: IModuleConstructor, data?: any, replace?: boolean): void;
        /**
         * 关闭模块，只有关闭的是当前模块时才会触发onDeactivate和onActivate，否则只会触发onClose
         *
         * @param {IModuleConstructor} cls 模块类型
         * @param {*} [data] 参数
         * @memberof ModuleManager
         */
        close(cls: IModuleConstructor, data?: any): void;
    }
    /** 再额外导出一个单例 */
    export const moduleManager: ModuleManager;
}
declare module "engine/module/Module" {
    import IDispatcher from "core/interfaces/IDispatcher";
    import IMessage from "core/message/IMessage";
    import RequestData from "engine/net/RequestData";
    import ResponseData from "engine/net/ResponseData";
    import IMediator from "engine/mediator/IMediator";
    import IModule from "engine/module/IModule";
    import IModuleConstructor from "engine/module/IModuleConstructor";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-14
     * @modify date 2017-09-14
     *
     * 模块基类
    */
    export default abstract class Module implements IModule, IDispatcher {
        private _disposed;
        /**
         * 获取是否已被销毁
         *
         * @readonly
         * @type {boolean}
         * @memberof Module
         */
        readonly disposed: boolean;
        /**
         * 列出模块所需CSS资源URL，可以重写
         *
         * @returns {string[]} CSS资源列表
         * @memberof Module
         */
        listStyleFiles(): string[];
        /**
         * 列出模块所需JS资源URL，可以重写
         *
         * @returns {string[]} js资源列表
         * @memberof Module
         */
        listJsFiles(): string[];
        /**
         * 列出模块初始化请求，可以重写
         *
         * @returns {RequestData[]} 模块的初始化请求列表
         * @memberof Module
         */
        listInitRequests(): RequestData[];
        private _mediators;
        /**
         * 托管中介者
         *
         * @param {IMediator} mediator 中介者
         * @memberof Module
         */
        delegateMediator(mediator: IMediator): void;
        /**
         * 取消托管中介者
         *
         * @param {IMediator} mediator 中介者
         * @memberof Module
         */
        undelegateMediator(mediator: IMediator): void;
        /**
         * 获取所有已托管的中介者
         *
         * @returns {IMediator[]} 已托管的中介者
         * @memberof Module
         */
        getDelegatedMediators(): IMediator[];
        /**
         * 当获取到所有消息返回（如果有的话）后调用，建议使用@Handler处理消息返回，可以重写
         *
         * @param {ResponseData[]} responses 收到的所有返回体（如果请求有返回的话）
         * @memberof Module
         */
        onGetResponses(responses: ResponseData[]): void;
        /**
         * 打开模块时调用，可以重写
         *
         * @param {*} [data] 传递给模块的数据
         * @memberof Module
         */
        onOpen(data?: any): void;
        /**
         * 关闭模块时调用，可以重写
         *
         * @param {*} [data] 传递给模块的数据
         * @memberof Module
         */
        onClose(data?: any): void;
        /**
         * 模块切换到前台时调用（open之后或者其他模块被关闭时），可以重写
         *
         * @param {IModuleConstructor|undefined} from 从哪个模块切换过来
         * @param {*} [data] 传递给模块的数据
         * @memberof Module
         */
        onActivate(from: IModuleConstructor | undefined, data?: any): void;
        /**
         * 模块切换到后台是调用（close之后或者其他模块打开时），可以重写
         *
         * @param {IModuleConstructor|undefined} to 要切换到哪个模块
         * @param {*} [data] 传递给模块的数据
         * @memberof Module
         */
        onDeactivate(to: IModuleConstructor | undefined, data?: any): void;
        /**
         * 派发内核消息
         *
         * @param {IMessage} msg 内核消息实例
         * @memberof Core
         */
        dispatch(msg: IMessage): void;
        /**
         * 派发内核消息，消息会转变为Message类型对象
         *
         * @param {string} type 消息类型
         * @param {...any[]} params 消息参数列表
         * @memberof Core
         */
        dispatch(type: string, ...params: any[]): void;
        /**
         * 销毁模块，可以重写
         *
         * @memberof Module
         */
        dispose(): void;
    }
}
declare module "utils/URLUtil" {
    /**
     * 规整url
     * @param url
     */
    export function trimURL(url: string): string;
    /**
     * 检查URL是否是绝对路径（具有协议头）
     * @param url 要判断的URL
     * @returns {any} 是否是绝对路径
     */
    export function isAbsolutePath(url: string): boolean;
    /**
     * 如果url有protocol，使其与当前域名的protocol统一，否则会跨域
     * @param url 要统一protocol的url
     */
    export function validateProtocol(url: string): string;
    /**
     * 替换url中的host
     * @param url       url
     * @param host      要替换的host
     * @param forced    是否强制替换（默认false）
     */
    export function wrapHost(url: string, host: string, forced?: boolean): string;
    /**
     * 将相对于当前页面的相对路径包装成绝对路径
     * @param relativePath 相对于当前页面的相对路径
     * @param host 传递该参数会用该host替换当前host
     */
    export function wrapAbsolutePath(relativePath: string, host?: string): string;
    /**
     * 获取URL的host+pathname部分，即问号(?)以前的部分
     *
     */
    export function getHostAndPathname(url: string): string;
    /**
     * 获取URL路径（文件名前的部分）
     * @param url 要分析的URL
     */
    export function getPath(url: string): string;
    /**
     * 获取URL的文件名
     * @param url 要分析的URL
     */
    export function getName(url: string): string;
    /**
     * 解析URL
     * @param url 要被解析的URL字符串
     * @returns {any} 解析后的URLLocation结构体
     */
    export function parseUrl(url: string): URLLocation;
    /**
     * 解析url查询参数
     * @TODO 添加对jquery编码方式的支持
     * @param url url
     */
    export function getQueryParams(url: string): {
        [key: string]: string;
    };
    /**
     * 将参数连接到指定URL后面
     * @param url url
     * @param params 一个map，包含要连接的参数
     * @return string 连接后的URL地址
     */
    export function joinQueryParams(url: string, params: Object): string;
    /**
     * 将参数链接到URL的hash后面
     * @param url 如果传入的url没有注明hash模块，则不会进行操作
     * @param params 一个map，包含要连接的参数
     */
    export function joinHashParams(url: string, params: Object): string;
    export interface URLLocation {
        href: string;
        origin: string;
        protocol: string;
        host: string;
        hostname: string;
        port: string;
        pathname: string;
        search: string;
        hash: string;
    }
}
declare module "engine/env/Environment" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-21
     * @modify date 2017-09-21
     *
     * 环境参数
    */
    export default class Environment {
        private _env;
        /**
         * 获取当前环境字符串
         *
         * @readonly
         * @type {string}
         * @memberof Environment
         */
        readonly env: string;
        private _hostsDict;
        /**
         * 获取当前环境下某索引处的消息域名
         *
         * @param {number} [index=0] 域名字典索引，默认是0
         * @returns {string} 域名字符串，如果取不到则使用当前域名
         * @memberof Environment
         */
        getHost(index?: number): string;
        private _cdnsDict;
        private _curCDNIndex;
        /**
         * 获取当前使用的CDN域名
         *
         * @readonly
         * @type {string}
         * @memberof Environment
         */
        readonly curCDNHost: string;
        /**
         * 切换下一个CDN
         *
         * @returns {boolean} 是否已经到达CDN列表的终点，回到了起点
         * @memberof Environment
         */
        nextCDN(): boolean;
        /**
         * 初始化Environment对象，因为该对象保存的数据基本来自项目初始参数，所以必须有initialize方法
         *
         * @param {string} [env] 当前所属环境字符串
         * @param {{[env:string]:string[]}} [hostsDict] host数组字典
         * @param {{[env:string]:string[]}} [cdnsDict] cdn数组字典
         * @memberof Environment
         */
        initialize(env?: string, hostsDict?: {
            [env: string]: string[];
        }, cdnsDict?: {
            [env: string]: string[];
        }): void;
        /**
         * 让url的域名变成消息域名
         *
         * @param {string} url 要转变的url
         * @param {number} [index=0] host索引，默认0
         * @returns {string} 转变后的url
         * @memberof Environment
         */
        toHostURL(url: string, index?: number): string;
        /**
         * 让url的域名变成CDN域名
         *
         * @param {string} url 要转变的url
         * @returns {string} 转变后的url
         * @memberof Environment
         */
        toCDNHostURL(url: string): string;
    }
    /** 再额外导出一个单例 */
    export const environment: Environment;
}
declare module "engine/env/Explorer" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-05
     * @modify date 2017-09-05
     *
     * Explorer类记录浏览器相关数据
    */
    /**
     * 浏览器类型枚举
     *
     * @enum {number}
     */
    export enum ExplorerType {
        IE = 0,
        EDGE = 1,
        OPERA = 2,
        FIREFOX = 3,
        SAFARI = 4,
        CHROME = 5,
        OTHERS = 6,
    }
    export default class Explorer {
        private _type;
        /**
         * 获取浏览器类型枚举值
         *
         * @readonly
         * @type {ExplorerType}
         * @memberof Explorer
         */
        readonly type: ExplorerType;
        private _typeStr;
        /**
         * 获取浏览器类型字符串
         *
         * @readonly
         * @type {string}
         * @memberof Explorer
         */
        readonly typeStr: string;
        private _version;
        /**
         * 获取浏览器版本
         *
         * @readonly
         * @type {string}
         * @memberof Explorer
         */
        readonly version: string;
        private _bigVersion;
        /**
         * 获取浏览器大版本
         *
         * @readonly
         * @type {string}
         * @memberof Explorer
         */
        readonly bigVersion: string;
        constructor();
    }
    /** 再额外导出一个单例 */
    export const explorer: Explorer;
}
declare module "engine/env/WindowExternal" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-05
     * @modify date 2017-09-05
     *
     * External类为window.external参数字典包装类
    */
    export default class WindowExternal {
        private _params;
        constructor();
        /**
         * 获取window.external中的参数
         *
         * @param {string} key 参数名
         * @returns {*} 参数值
         * @memberof External
         */
        getParam(key: string): any;
    }
    /** 再额外导出一个单例 */
    export const windowExternal: WindowExternal;
}
declare module "engine/env/Hash" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * Hash类是地址路由（网页哈希）管理器，规定哈希格式为：#[模块名]?[参数名]=[参数值]&[参数名]=[参数值]&...
    */
    export default class Hash {
        private _hash;
        /**
         * 获取原始的哈希字符串
         *
         * @readonly
         * @type {string}
         * @memberof Hash
         */
        readonly hash: string;
        private _moduleName;
        /**
         * 获取模块名
         *
         * @readonly
         * @type {string}
         * @memberof Hash
         */
        readonly moduleName: string;
        private _params;
        /**
         * 获取传递给模块的参数
         *
         * @readonly
         * @type {{[key:string]:string}}
         * @memberof Hash
         */
        readonly params: {
            [key: string]: string;
        };
        private _direct;
        /**
         * 获取是否直接跳转模块
         *
         * @readonly
         * @type {boolean}
         * @memberof Hash
         */
        readonly direct: boolean;
        private _keepHash;
        /**
         * 获取是否保持哈希值
         *
         * @readonly
         * @type {boolean}
         * @memberof Hash
         */
        readonly keepHash: boolean;
        constructor();
        /**
         * 获取指定哈希参数
         *
         * @param {string} key 参数名
         * @returns {string} 参数值
         * @memberof Hash
         */
        getParam(key: string): string;
    }
    /** 再额外导出一个单例 */
    export const hash: Hash;
}
declare module "engine/env/Query" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-05
     * @modify date 2017-09-05
     *
     * Query类记录通过GET参数传递给框架的参数字典
    */
    export default class Query {
        private _params;
        constructor();
        /**
         * 获取GET参数
         *
         * @param {string} key 参数key
         * @returns {string} 参数值
         * @memberof Query
         */
        getParam(key: string): string;
    }
    /** 再额外导出一个单例 */
    export const query: Query;
}
declare module "engine/version/Version" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-21
     * @modify date 2017-09-21
     *
     * 管理文件哈希版本号
    */
    export default class Version {
        private _hashDict;
        /**
         * 初始化哈希版本工具
         *
         * @param {()=>void} handler 回调
         * @memberof Version
         */
        initialize(handler: () => void): void;
        /**
         * 获取文件哈希值，如果没有文件哈希值则返回null
         *
         * @param {string} url 文件的URL
         * @returns {string} 文件的哈希值，或者null
         * @memberof Version
         */
        getHash(url: string): string;
        /**
         * 将url转换为哈希版本url
         *
         * @param {string} url 原始url
         * @returns {string} 哈希版本url
         * @memberof Version
         */
        wrapHashUrl(url: string): string;
        /**
         * 添加-r_XXX形式版本号
         *
         * @param {string} url
         * @param {string} version 版本号，以数字和小写字母组成
         * @returns {string} 加版本号后的url，如果没有查到版本号则返回原始url
         * @memberof Version
         */
        joinVersion(url: string, version: string): string;
        /**
         * 移除-r_XXX形式版本号
         *
         * @param {string} url url
         * @returns {string} 移除版本号后的url
         * @memberof Version
         */
        removeVersion(url: string): string;
    }
    /** 再额外导出一个单例 */
    export const version: Version;
}
declare module "engine/net/HTTPMethod" {
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-12
     * @modify date 2017-09-12
     *
     * 定义HTTP发送接收方式目前支持的method值的枚举
    */
    type HTTPMethod = "GET" | "POST";
    export default HTTPMethod;
}
declare module "engine/net/policies/HTTPRequestPolicy" {
    import IRequestPolicy from "engine/net/IRequestPolicy";
    import RequestData, { IRequestParams } from "engine/net/RequestData";
    import HTTPMethod from "engine/net/HTTPMethod";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-11
     * @modify date 2017-09-11
     *
     * HTTP请求策略
    */
    export interface IHTTPRequestParams extends IRequestParams {
        /**
         * 消息域名
         *
         * @type {string}
         * @memberof HTTPRequestPolicy
         */
        host: string;
        /**
         * 消息地址
         *
         * @type {string}
         * @memberof HTTPRequestPolicy
         */
        path: string;
        /**
         * HTTP方法类型，默认是GET
         *
         * @type {HTTPMethod}
         * @memberof HTTPRequestPolicy
         */
        method?: HTTPMethod;
        /**
         * 失败重试次数，默认重试2次
         *
         * @type {number}
         * @memberof HTTPRequestPolicy
         */
        retryTimes?: number;
        /**
         * 超时时间，毫秒，默认10000，即10秒
         *
         * @type {number}
         * @memberof HTTPRequestPolicy
         */
        timeout?: number;
    }
    export default class HTTPRequestPolicy implements IRequestPolicy {
        /**
         * 发送请求逻辑
         *
         * @param {IHTTPRequestParams} params HTTP请求数据
         * @memberof HTTPRequestPolicy
         */
        sendRequest(request: RequestData): void;
    }
    /** 再额外导出一个实例 */
    export const httpRequestPolicy: HTTPRequestPolicy;
}
declare module "engine/Engine" {
    import IModuleConstructor from "engine/module/IModuleConstructor";
    import IBridge from "engine/bridge/IBridge";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-06
     * @modify date 2017-09-06
     *
     * Engine模组是开发框架的引擎部分，包括业务模块系统、应用程序启动和初始化、弹窗和场景管理器等与项目开发相关的逻辑都在这个模组中
     * 这个模组的逻辑都高度集成在子模组中了，因此也只是收集相关子模组
    */
    export default class Engine {
        private _firstModule;
        private _loadElement;
        /**
         *
         *
         * @param {IModuleConstructor} firstModule 首个模块
         * @param {(Element|string)} loadElement 程序启动前的Loading DOM节点，当首个模块显示出来后会移除该DOM节点
         * @memberof Engine
         */
        /**
         * 初始化Engine
         *
         * @param {IInitParams} params 初始化参数
         * @memberof Engine
         */
        initialize(params: IInitParams): void;
        private onAllBridgesInit();
        private onModuleChange(from);
    }
    /** 再额外导出一个单例 */
    export const engine: Engine;
    export interface IInitParams {
        /**
         * 表现层桥数组，所有可能用到的表现层桥都要在此实例化并传入
         *
         * @type {IBridge[]}
         * @memberof OlympusInitParams
         */
        bridges: IBridge[];
        /**
         * 首模块类型，框架初始化完毕后进入的模块
         *
         * @type {IModuleConstructor}
         * @memberof OlympusInitParams
         */
        firstModule: IModuleConstructor;
        /**
         * 会在首个模块被显示出来后从页面中移除
         *
         * @type {(Element|string)}
         * @memberof OlympusInitParams
         */
        loadElement?: Element | string;
        /**
         * 环境字符串，默认为"dev"
         *
         * @type {string}
         * @memberof IInitParams
         */
        env?: string;
        /**
         * 消息域名字典数组，首个字典会被当做默认字典，没传递则会用当前域名代替
         *
         * @type {{[env:string]:string[]}}
         * @memberof IInitParams
         */
        hostsDict?: {
            [env: string]: string[];
        };
        /**
         * CDN域名列表，若没有提供则使用host代替
         *
         * @type {{[env:string]:string[]}}
         * @memberof IInitParams
         */
        cdnsDict?: {
            [env: string]: string[];
        };
    }
}
declare module "Olympus" {
    import { IInitParams } from "engine/Engine";
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-09-18
     * @modify date 2017-09-18
     *
     * Olympus框架便捷启动与框架外观模块
    */
    export default class Olympus {
        /**
         * 启动Olympus框架
         *
         * @static
         * @param {IInitParams} params 启动参数
         * @memberof Olympus
         */
        static startup(params: IInitParams): void;
    }
}
