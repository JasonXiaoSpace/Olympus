/// <reference path="../../core/global/IConstructor.ts"/>

/**
 * @author Raykid
 * @email initial_r@qq.com
 * @create date 2017-09-06
 * @modify date 2017-09-06
 * 
 * 这个文件的存在是为了让装饰器功能可以正常使用，装饰器要求方法必须从window上可访问，因此不能定义在模块里
*/

/**
 * 标识当前类型是个Model，Model具有装饰器注入功能，且自身也会被注入(Injectable功能)
 * 
 * @param {IConstructor} cls 要注入的Model类
 * @returns {*} 替换的构造函数
 */
declare function model(cls:IConstructor):any;

/**
 * 标识当前类型是个Mediator，Mediator具有装饰器注入功能，但自身不会被注入
 * 
 * @param {IConstructor} cls 要注入的Mediator类
 * @returns {*} 替换的构造函数
 */
declare function mediator(cls:IConstructor):any;

/**
 * 标识当前类型是个Module，Module与Mediator类似，具有装饰器注入功能，但自身不会被注入
 * 
 * @param {IConstructor} cls 要注入的Module类
 * @returns {*} 替换的构造函数
 */
declare function module(cls:IConstructor):any;