import Module from "../../src/trunk/engine/module/Module";
import ResponseData from "../../src/trunk/engine/net/ResponseData";
import { moduleManager } from "../../src/trunk/engine/module/ModuleManager";
import SceneMediator from "../../src/trunk/engine/scene/SceneMediator";
import { EgretMediatorClass } from "../../src/branches/egret/injector/Injector";
import { ModuleClass, DelegateMediator, ModuleMessageHandler, BindMessage, BindModuleMessage } from "../../src/trunk/engine/injector/Injector";
import { MessageHandler } from "../../src/trunk/core/injector/Injector";

/**
 * @author Raykid
 * @email initial_r@qq.com
 * @create date 2017-09-18
 * @modify date 2017-09-18
 * 
 * 测试第二个模块
*/

@EgretMediatorClass("Fuck2Skin")
class SecondMediator extends SceneMediator
{
    @BindModuleMessage("FuckMsg", {label: "onMsg($arguments[0])"})
    public btn:eui.Button;

    public listAssets():string[]
    {
        return ["preload"];
    }

    public onOpen():void
    {
        this.mapListener(this.btn, egret.TouchEvent.TOUCH_TAP, ()=>{
            // moduleManager.close(SecondModule);

            this.dispatchModule("FuckMsg", "Shit!!!");
        });
        this.viewModel = {
            onMsg: msg=>{
                // 表达式里使用函数可以在函数里执行复杂逻辑，并且具有代码提示
                console.log(msg);
                return msg + " - 1";
            }
        };
        // 测试系统消息
        this.dispatch("fuck", 123);
        // 测试模块消息
        this.dispatchModule("fuck", 123);
    }
}

@ModuleClass
export default class SecondModule extends Module
{
    @DelegateMediator
    private _mediator:SecondMediator;
    
    @MessageHandler("fuck")
    @ModuleMessageHandler("fuck")
    private onFuck(a):void
    {
        console.log("message at SecondModule: " + a);
    }
}