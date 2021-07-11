import * as view from "./view.js";
import * as letter from "./letter.js";
//import * as color from "./color";
import * as color from "./color.js";
import { input } from "./main.js";
import * as sss from "https://taisukef.github.io/sounds-some-sounds/sss.js";
let lastFrameTime = 0;
let _init;
let _update;
const defaultOptions = {
    viewSize: { x: 126, y: 126 },
    bodyBackground: "#111",
    viewBackground: "black",
    isUsingVirtualPad: true,
    isFourWaysStick: false,
    isCapturing: false,
    theme: { name: "simple", isUsingPixi: false, isDarkColor: false },
};
let options;
let textCacheEnableTicks = 10;
export function init(__init, __update, _options) {
    _init = __init;
    _update = __update;
    options = Object.assign(Object.assign({}, defaultOptions), _options);
    console.log(options, _options)
    color.init(options.theme.isDarkColor);
    view.init(options.viewSize, options.bodyBackground, options.viewBackground, options.isCapturing, options.theme);
    input.init();
    letter.init();
    _init();
    update();
}
function update() {
    requestAnimationFrame(update);
    const now = window.performance.now();
    const timeSinceLast = now - lastFrameTime;
    if (!options.highFps && timeSinceLast < 1000 / 60 - 5) {
        return;
    }
    lastFrameTime = now;
    //const dt = 1 / Math.round((1000 / 60) / timeSinceLast);
    const dt = 1 / ((1000 / 60) / timeSinceLast);
    if (dt == Infinity) {
        return;
    }
    sss.update();
    input.update();
    _update(dt);
    if (options.isCapturing) {
        view.capture();
    }
    textCacheEnableTicks--;
    if (textCacheEnableTicks === 0) {
        letter.enableCache();
    }
}
