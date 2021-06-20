//import * as PIXI from "pixi.js";
import { PIXI } from "https://taisukef.github.io/pixijs/es/pixi.v5.3.9.min.js";
import { textPatterns } from "./textPattern.js";
import { fillRect, drawLetterImage, setColor, currentColor, saveCurrentColor, loadCurrentColor, theme, } from "./view.js";
import { colorChars, colors, colorToStyle } from "./color.js";
import { Vector } from "./vector.js";
import { hitBoxes, checkHitBoxes } from "./collision.js";
import { wrap } from "./util.js";
export function text(str, x, y, options) {
    return letters(false, str, x, y, options);
}
export function char(str, x, y, options) {
    return letters(true, str, x, y, options);
}
export function letters(isCharacter, str, x, y, options) {
    if (typeof x === "number") {
        if (typeof y === "number") {
            return print(str, x - letterSize / 2, y - letterSize / 2, Object.assign({ isCharacter, isCheckingCollision: true, color: currentColor }, options));
        }
        else {
            throw "invalid params";
        }
    }
    else {
        return print(str, x.x - letterSize / 2, x.y - letterSize / 2, Object.assign({ isCharacter, isCheckingCollision: true, color: currentColor }, y));
    }
}
const dotCount = 6;
const dotSize = 1;
export const letterSize = dotCount * dotSize;
let textImages;
let characterImages;
let cachedImages;
let isCacheEnabled = false;
let letterCanvas;
let letterContext;
export const defaultOptions = {
    color: "black",
    backgroundColor: "transparent",
    rotation: 0,
    mirror: { x: 1, y: 1 },
    scale: { x: 1, y: 1 },
    isCharacter: false,
    isCheckingCollision: false,
};
export function init() {
    letterCanvas = document.createElement("canvas");
    letterCanvas.width = letterCanvas.height = letterSize;
    letterContext = letterCanvas.getContext("2d");
    textImages = textPatterns.map((lp, i) => {
        return Object.assign(Object.assign({}, createLetterImages(lp)), { hitBox: getHitBox(String.fromCharCode(0x21 + i), false) });
    });
    characterImages = textPatterns.map((lp, i) => {
        return Object.assign(Object.assign({}, createLetterImages(lp)), { hitBox: getHitBox(String.fromCharCode(0x21 + i), true) });
    });
    cachedImages = {};
}
export function defineCharacters(pattern, startLetter) {
    const index = startLetter.charCodeAt(0) - 0x21;
    pattern.forEach((lp, i) => {
        characterImages[index + i] = Object.assign(Object.assign({}, createLetterImages(lp)), { hitBox: getHitBox(String.fromCharCode(0x21 + index + i), true) });
    });
}
export function enableCache() {
    isCacheEnabled = true;
}
export function print(_str, x, y, _options = {}) {
    const options = mergeDefaultOptions(_options);
    const bx = Math.floor(x);
    let str = _str;
    let px = bx;
    let py = Math.floor(y);
    let collision = { isColliding: { rect: {}, text: {}, char: {} } };
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === "\n") {
            px = bx;
            py += letterSize * options.scale.y;
            continue;
        }
        const charCollision = printChar(c, px, py, options);
        if (options.isCheckingCollision) {
            collision = {
                isColliding: {
                    rect: Object.assign(Object.assign({}, collision.isColliding.rect), charCollision.isColliding.rect),
                    text: Object.assign(Object.assign({}, collision.isColliding.text), charCollision.isColliding.text),
                    char: Object.assign(Object.assign({}, collision.isColliding.char), charCollision.isColliding.char),
                },
            };
        }
        px += letterSize * options.scale.x;
    }
    return collision;
}
export function printChar(c, x, y, _options) {
    const cca = c.charCodeAt(0);
    if (cca < 0x20 || cca > 0x7e) {
        return { isColliding: { rect: {}, text: {}, char: {} } };
    }
    const options = mergeDefaultOptions(_options);
    if (options.backgroundColor !== "transparent") {
        saveCurrentColor();
        setColor(options.backgroundColor);
        fillRect(x, y, letterSize * options.scale.x, letterSize * options.scale.y);
        loadCurrentColor();
    }
    if (cca <= 0x20) {
        return { isColliding: { rect: {}, text: {}, char: {} } };
    }
    const cc = cca - 0x21;
    const li = options.isCharacter ? characterImages[cc] : textImages[cc];
    const rotation = wrap(options.rotation, 0, 4);
    if (options.color === "black" &&
        rotation === 0 &&
        options.mirror.x === 1 &&
        options.mirror.y === 1) {
        return drawAndTestLetterImage(li, x, y, options.scale, options.isCheckingCollision, true);
    }
    const cacheIndex = JSON.stringify({ c, options });
    const ci = cachedImages[cacheIndex];
    if (ci != null) {
        return drawAndTestLetterImage(ci, x, y, options.scale, options.isCheckingCollision, options.color !== "transparent");
    }
    letterContext.clearRect(0, 0, letterSize, letterSize);
    if (rotation === 0 && options.mirror.x === 1 && options.mirror.y === 1) {
        letterContext.drawImage(li.image, 0, 0);
    }
    else {
        letterContext.save();
        letterContext.translate(letterSize / 2, letterSize / 2);
        letterContext.rotate((Math.PI / 2) * rotation);
        if (options.mirror.x === -1 || options.mirror.y === -1) {
            letterContext.scale(options.mirror.x, options.mirror.y);
        }
        letterContext.drawImage(li.image, -letterSize / 2, -letterSize / 2);
        letterContext.restore();
    }
    if (options.color !== "black") {
        letterContext.globalCompositeOperation = "source-in";
        letterContext.fillStyle = colorToStyle(options.color === "transparent" ? "black" : options.color);
        letterContext.fillRect(0, 0, letterSize, letterSize);
        letterContext.globalCompositeOperation = "source-over";
    }
    const hitBox = getHitBox(c, options.isCharacter);
    let texture;
    if (isCacheEnabled || theme.isUsingPixi) {
        const cachedImage = document.createElement("img");
        cachedImage.src = letterCanvas.toDataURL();
        if (theme.isUsingPixi) {
            texture = PIXI.Texture.from(cachedImage);
        }
        if (isCacheEnabled) {
            cachedImages[cacheIndex] = {
                image: cachedImage,
                texture,
                hitBox,
            };
        }
    }
    return drawAndTestLetterImage({ image: letterCanvas, texture, hitBox }, x, y, options.scale, options.isCheckingCollision, options.color !== "transparent");
}
function drawAndTestLetterImage(li, x, y, scale, isCheckCollision, isDrawing) {
    if (isDrawing) {
        if (scale.x === 1 && scale.y === 1) {
            drawLetterImage(li, x, y);
        }
        else {
            drawLetterImage(li, x, y, letterSize * scale.x, letterSize * scale.y);
        }
    }
    if (!isCheckCollision) {
        return;
    }
    const hitBox = {
        pos: { x: x + li.hitBox.pos.x, y: y + li.hitBox.pos.y },
        size: { x: li.hitBox.size.x * scale.x, y: li.hitBox.size.y * scale.y },
        collision: li.hitBox.collision,
    };
    const collision = checkHitBoxes(hitBox);
    if (isDrawing) {
        hitBoxes.push(hitBox);
    }
    return collision;
}
function createLetterImages(pattern, isSkippingFirstAndLastLine = true) {
    letterContext.clearRect(0, 0, letterSize, letterSize);
    let p = pattern.split("\n");
    if (isSkippingFirstAndLastLine) {
        p = p.slice(1, p.length - 1);
    }
    let pw = 0;
    p.forEach((l) => {
        pw = Math.max(l.length, pw);
    });
    const xPadding = Math.max(Math.ceil((dotCount - pw) / 2), 0);
    const ph = p.length;
    const yPadding = Math.max(Math.ceil((dotCount - ph) / 2), 0);
    p.forEach((l, y) => {
        if (y + yPadding >= dotCount) {
            return;
        }
        for (let x = 0; x < dotCount - xPadding; x++) {
            const c = l.charAt(x);
            let ci = colorChars.indexOf(c);
            if (c !== "" && ci >= 1) {
                letterContext.fillStyle = colorToStyle(colors[ci]);
                letterContext.fillRect((x + xPadding) * dotSize, (y + yPadding) * dotSize, dotSize, dotSize);
            }
        }
    });
    const image = document.createElement("img");
    image.src = letterCanvas.toDataURL();
    if (theme.isUsingPixi) {
        return { image, texture: PIXI.Texture.from(image) };
    }
    return { image };
}
function getHitBox(c, isCharacter) {
    const b = {
        pos: new Vector(letterSize, letterSize),
        size: new Vector(),
        collision: { isColliding: { char: {}, text: {} } },
    };
    if (isCharacter) {
        b.collision.isColliding.char[c] = true;
    }
    else {
        b.collision.isColliding.text[c] = true;
    }
    const d = letterContext.getImageData(0, 0, letterSize, letterSize).data;
    let i = 0;
    for (let y = 0; y < letterSize; y++) {
        for (let x = 0; x < letterSize; x++) {
            if (d[i + 3] > 0) {
                if (x < b.pos.x) {
                    b.pos.x = x;
                }
                if (y < b.pos.y) {
                    b.pos.y = y;
                }
            }
            i += 4;
        }
    }
    i = 0;
    for (let y = 0; y < letterSize; y++) {
        for (let x = 0; x < letterSize; x++) {
            if (d[i + 3] > 0) {
                if (x > b.pos.x + b.size.x - 1) {
                    b.size.x = x - b.pos.x + 1;
                }
                if (y > b.pos.y + b.size.y - 1) {
                    b.size.y = y - b.pos.y + 1;
                }
            }
            i += 4;
        }
    }
    return b;
}
function mergeDefaultOptions(_options) {
    let options = Object.assign(Object.assign({}, defaultOptions), _options);
    if (_options.scale != null) {
        options.scale = Object.assign(Object.assign({}, defaultOptions.scale), _options.scale);
    }
    if (_options.mirror != null) {
        options.mirror = Object.assign(Object.assign({}, defaultOptions.mirror), _options.mirror);
    }
    return options;
}
