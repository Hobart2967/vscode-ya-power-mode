(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const audio_host_service_1 = __webpack_require__(2);
const ac = new AudioContext({ sampleRate: 44100 });
const cachedAudio = new Map();
function cacheAudio(sound, soundData) {
    const audioBuffer = ac.createBuffer(soundData.numberOfChannels, soundData.length, soundData.sampleRate);
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
        const f32a = new Float32Array(audioBuffer.length);
        audioBuffer.copyToChannel(f32a, ch);
    }
    for (let ch = 0; ch < soundData.numberOfChannels; ch++) {
        const f32a = new Float32Array(soundData.length);
        for (let i = 0; i < f32a.length; i++) {
            f32a[i] = soundData.waveData.samples[ch][i];
        }
        audioBuffer.copyToChannel(f32a, ch, soundData.waveData.start);
    }
    cachedAudio.set(sound, {
        buffer: audioBuffer,
        file: soundData
    });
}
function showPlayer(sound) {
    try {
        const cachedAudioFile = cachedAudio.get(sound);
        // set player ui
        const player = new audio_host_service_1.AudioHostService(ac, cachedAudioFile.buffer, cachedAudioFile.file.duration);
        player.play();
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}
(() => {
    const vscode = acquireVsCodeApi();
    console.log('Booting power mode...');
    window.addEventListener('message', async (e) => {
        const { command, soundData, isTrusted, sound } = e.data;
        switch (command) {
            case 'play':
                console.log(new Date(Date.now()).toISOString(), 'Play event received!');
                showPlayer(sound);
                break;
            case 'cacheAudio':
                console.log(new Date(Date.now()).toISOString(), 'cacheAudio event received!');
                if (!soundData || !sound) {
                    console.error('No sound name or sounddata received');
                }
                cacheAudio(sound, soundData);
                break;
        }
    });
})();


/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AudioHostService = void 0;
class AudioHostService {
    constructor(audioContext, audioBuffer, duration) {
        this._duration = duration;
        this._audioContext = audioContext;
        this._audioBuffer = audioBuffer;
    }
    play() {
        console.log('Play event received!');
        // create audio source node (you cannot call start more than once)
        this._source = this._audioContext.createBufferSource();
        this._source.buffer = this._audioBuffer;
        this._source.connect(this._audioContext.destination);
        this._source.addEventListener('ended', () => this.stop());
        this._source.start(this._audioContext.currentTime, 0);
    }
    stop() {
        this._source?.stop();
        this._source = undefined;
    }
}
exports.AudioHostService = AudioHostService;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(1);

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=browser.js.map