var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "../../core/injector/Injector", "../../core/Core", "../bridge/BridgeManager"], function (require, exports, Injector_1, Core_1, BridgeManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-10-25
     * @modify date 2017-10-25
     *
     * 遮罩管理器
    */
    var MaskManager = /** @class */ (function () {
        function MaskManager() {
            this._entityDict = {};
            this._loadingMaskDict = {};
        }
        MaskManager.prototype.getLoadingMaskCount = function () {
            var count = 0;
            for (var key in this._loadingMaskDict) {
                var temp = this._loadingMaskDict[key];
                if (temp > 0)
                    count += temp;
            }
            return count;
        };
        MaskManager.prototype.plusLoadingMaskCount = function (key) {
            var count = this._loadingMaskDict[key] || 0;
            if (count < 0)
                count = 0;
            this._loadingMaskDict[key] = ++count;
            return count;
        };
        MaskManager.prototype.minusLoadingMaskCount = function (key) {
            var count = this._loadingMaskDict[key] || 0;
            count--;
            if (count < 0)
                count = 0;
            this._loadingMaskDict[key] = count;
            if (count == 0)
                delete this._loadingMaskDict[key];
            return count;
        };
        /**
         * 初始化MaskUtil
         * @param type 所属表现层桥
         * @param entity 遮罩实体
         */
        MaskManager.prototype.registerMask = function (type, entity) {
            this._entityDict[type] = entity;
        };
        /**
         * 显示遮罩
         */
        MaskManager.prototype.showMask = function (alpha) {
            var type = BridgeManager_1.bridgeManager.currentBridge.type;
            var entity = this._entityDict[type];
            if (entity != null) {
                // 调用回调
                entity.maskData.onShowMask && entity.maskData.onShowMask();
                // 显示遮罩
                entity.showMask(alpha);
            }
        };
        /**
         * 隐藏遮罩
         */
        MaskManager.prototype.hideMask = function () {
            var type = BridgeManager_1.bridgeManager.currentBridge.type;
            var entity = this._entityDict[type];
            if (entity != null) {
                // 隐藏遮罩
                entity.hideMask();
                // 调用回调
                entity.maskData.onHideMask && entity.maskData.onHideMask();
            }
        };
        /**当前是否在显示遮罩*/
        MaskManager.prototype.isShowingMask = function () {
            var type = BridgeManager_1.bridgeManager.currentBridge.type;
            var entity = this._entityDict[type];
            if (entity != null)
                return entity.isShowingMask();
            return false;
        };
        /**
         * 显示加载图
         */
        MaskManager.prototype.showLoading = function (alpha, key) {
            if (key === void 0) { key = null; }
            // 若当前你没有loading则显示loading
            if (this.getLoadingMaskCount() == 0) {
                var type = BridgeManager_1.bridgeManager.currentBridge.type;
                var entity = this._entityDict[type];
                if (entity != null) {
                    // 调用回调
                    entity.maskData.onShowLoading && entity.maskData.onShowLoading(entity.loadingSkin);
                    // 显示遮罩
                    entity.showLoading(alpha);
                }
            }
            // 增计数
            this.plusLoadingMaskCount(key);
        };
        /**
         * 隐藏加载图
         */
        MaskManager.prototype.hideLoading = function (key) {
            if (key === void 0) { key = null; }
            // 减计数
            this.minusLoadingMaskCount(key);
            if (this.getLoadingMaskCount() == 0) {
                // 移除loading
                var type = BridgeManager_1.bridgeManager.currentBridge.type;
                var entity = this._entityDict[type];
                if (entity != null) {
                    // 隐藏遮罩
                    entity.hideLoading();
                    // 调用回调
                    entity.maskData.onHideLoading && entity.maskData.onHideLoading(entity.loadingSkin);
                }
            }
        };
        /**当前是否在显示loading*/
        MaskManager.prototype.isShowingLoading = function () {
            var type = BridgeManager_1.bridgeManager.currentBridge.type;
            var entity = this._entityDict[type];
            if (entity != null)
                return entity.isShowingLoading();
            return false;
        };
        /** 显示模态窗口遮罩 */
        MaskManager.prototype.showModalMask = function (popup, alpha) {
            var type = BridgeManager_1.bridgeManager.currentBridge.type;
            var entity = this._entityDict[type];
            if (entity != null) {
                // 调用回调
                entity.maskData.onShowModalMask && entity.maskData.onShowModalMask(popup);
                // 显示遮罩
                entity.showModalMask(popup, alpha);
            }
        };
        /** 隐藏模态窗口遮罩 */
        MaskManager.prototype.hideModalMask = function (popup) {
            var type = BridgeManager_1.bridgeManager.currentBridge.type;
            var entity = this._entityDict[type];
            if (entity != null) {
                // 隐藏遮罩
                entity.hideModalMask(popup);
                // 调用回调
                entity.maskData.onHideModalMask && entity.maskData.onHideModalMask(popup);
            }
        };
        /** 当前是否在显示模态窗口遮罩 */
        MaskManager.prototype.isShowingModalMask = function (popup) {
            var type = BridgeManager_1.bridgeManager.currentBridge.type;
            var entity = this._entityDict[type];
            if (entity != null)
                return entity.isShowingModalMask(popup);
            return false;
        };
        MaskManager = __decorate([
            Injector_1.Injectable
        ], MaskManager);
        return MaskManager;
    }());
    exports.default = MaskManager;
    /** 再额外导出一个单例 */
    exports.maskManager = Core_1.core.getInject(MaskManager);
});
//# sourceMappingURL=MaskManager.js.map