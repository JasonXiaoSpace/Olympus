define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @author Raykid
     * @email initial_r@qq.com
     * @create date 2017-10-30
     * @modify date 2017-10-30
     *
     * 音频消息
    */
    var AudioMessage = /** @class */ (function () {
        function AudioMessage() {
        }
        /**
         * 音频播放开始事件
         *
         * @static
         * @type {string}
         * @memberof AudioMessage
         */
        AudioMessage.AUDIO_PLAY_STARTED = "audioPlayStarted";
        /**
         * 音频播放停止事件
         *
         * @static
         * @type {string}
         * @memberof AudioMessage
         */
        AudioMessage.AUDIO_PLAY_STOPPED = "audioPlayStopped";
        /**
         * 音频播放完毕事件
         *
         * @static
         * @type {string}
         * @memberof AudioMessage
         */
        AudioMessage.AUDIO_PLAY_ENDED = "audioPlayEnded";
        /**
         * 音频播放进度事件
         *
         * @static
         * @type {string}
         * @memberof AudioMessage
         */
        AudioMessage.AUDIO_PLAY_PROGRESS = "audioPlayProgress";
        return AudioMessage;
    }());
    exports.default = AudioMessage;
});
//# sourceMappingURL=AudioMessage.js.map