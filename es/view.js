//import { PIXI } from "https://taisukef.github.io/pixijs/es/pixi.v5.3.9.min.js";
import { PIXI } from "https://taisukef.github.io/pixijs/es/pixi.v5.3.9.min.js";
import { Vector } from "./vector.js";
import { colorToNumber, colorToStyle } from "./color.js";
import { letterSize } from "./letter.js";
import { getGridFilter } from "./filters.js";
import { filter as filter_crt } from "https://taisukef.github.io/filters/es/filter-crt.js";
import { filter as filter_advancedbloom } from "https://taisukef.github.io/filters/es/filter-advanced-bloom.js";
PIXI.filters.CRTFilter = filter_crt;
PIXI.filters.AdvancedBloomFilter = filter_advancedbloom;
export const size = new Vector();
export let canvas;
let canvasSize = new Vector();
let context;
let graphics;
const graphicsScale = 5;
let background = document.createElement("img");
let captureCanvas;
let captureContext;
let capturedCanvasScale = 1;
let viewBackground = "black";
export let currentColor;
let savedCurrentColor;
let isFilling = false;
export let theme;
let crtFilter;
export function init(_size, _bodyBackground, _viewBackground, isCapturing, _theme) {
    size.set(_size);
    theme = _theme;
    viewBackground = _viewBackground;
    const bodyCss = `
-webkit-touch-callout: none;
-webkit-tap-highlight-color: ${_bodyBackground};
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
background: ${_bodyBackground};
color: #888;
`;
    const canvasCss = `
position: absolute;
left: 50%;
top: 50%;
transform: translate(-50%, -50%);
`;
    const crispCss = `
image-rendering: -moz-crisp-edges;
image-rendering: -webkit-optimize-contrast;
image-rendering: -o-crisp-edges;
image-rendering: pixelated;
`;
    document.body.style.cssText = bodyCss;
    canvasSize.set(size);
    if (theme.isUsingPixi) {
        canvasSize.mul(graphicsScale);
        const app = new PIXI.Application({
            width: canvasSize.x,
            height: canvasSize.y,
        });
        canvas = app.view;
        graphics = new PIXI.Graphics();
        graphics.scale.x = graphics.scale.y = graphicsScale;
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        app.stage.addChild(graphics);
        graphics.filters = [];
        if (theme.name === "crt") {
            graphics.filters.push((crtFilter = new PIXI.filters.CRTFilter({
                vignettingAlpha: 0.7,
            })));
        }
        if (theme.name === "pixel") {
            graphics.filters.push(getGridFilter(canvasSize.x, canvasSize.y));
        }
        if (theme.name === "pixel" || theme.name === "shapeDark") {
            const bloomFilter = new PIXI.filters.AdvancedBloomFilter({
                threshold: 0.1,
                bloomScale: theme.name === "pixel" ? 1.5 : 1,
                brightness: theme.name === "pixel" ? 1.5 : 1,
                blur: 8,
            });
            graphics.filters.push(bloomFilter);
        }
        graphics.lineStyle(0);
        canvas.style.cssText = canvasCss;
    }
    else {
        canvas = document.createElement("canvas");
        canvas.width = canvasSize.x;
        canvas.height = canvasSize.y;
        context = canvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        canvas.style.cssText = canvasCss + crispCss;
    }
    document.body.appendChild(canvas);
    const cs = 95;
    const cw = canvasSize.x >= canvasSize.y ? cs : (cs / canvasSize.y) * canvasSize.x;
    const ch = canvasSize.y >= canvasSize.x ? cs : (cs / canvasSize.x) * canvasSize.y;
    canvas.style.width = `${cw}vmin`;
    canvas.style.height = `${ch}vmin`;
    if (isCapturing) {
        captureCanvas = document.createElement("canvas");
        if (canvasSize.x <= canvasSize.y * 2) {
            captureCanvas.width = canvasSize.y * 2;
            captureCanvas.height = canvasSize.y;
        }
        else {
            captureCanvas.width = canvasSize.x;
            captureCanvas.height = canvasSize.x / 2;
        }
        if (captureCanvas.width > 400) {
            capturedCanvasScale = 400 / captureCanvas.width;
            captureCanvas.width = 400;
            captureCanvas.height *= capturedCanvasScale;
        }
        captureContext = captureCanvas.getContext("2d");
        captureContext.fillStyle = _bodyBackground;
        gcc.setOptions({
            scale: Math.round(400 / captureCanvas.width),
            capturingFps: 60,
        });
    }
}
export function clear() {
    if (theme.isUsingPixi) {
        graphics.clear();
        isFilling = false;
        beginFillColor(colorToNumber(viewBackground, theme.isDarkColor ? 0.15 : 1));
        graphics.drawRect(0, 0, size.x, size.y);
        endFill();
        isFilling = false;
        return;
    }
    context.fillStyle = colorToStyle(viewBackground, theme.isDarkColor ? 0.15 : 1);
    context.fillRect(0, 0, size.x, size.y);
    context.fillStyle = colorToStyle(currentColor);
}
export function setColor(colorName) {
    if (colorName === currentColor) {
        if (theme.isUsingPixi && !isFilling) {
            beginFillColor(colorToNumber(currentColor));
        }
        return;
    }
    currentColor = colorName;
    if (theme.isUsingPixi) {
        if (isFilling) {
            graphics.endFill();
        }
        beginFillColor(colorToNumber(currentColor));
        return;
    }
    context.fillStyle = colorToStyle(colorName);
}
function beginFillColor(color) {
    endFill();
    graphics.beginFill(color);
    isFilling = true;
}
export function endFill() {
    if (isFilling) {
        graphics.endFill();
        isFilling = false;
    }
}
export function saveCurrentColor() {
    savedCurrentColor = currentColor;
}
export function loadCurrentColor() {
    setColor(savedCurrentColor);
}
export function fillRect(x, y, width, height) {
    if (theme.isUsingPixi) {
        if (theme.name === "shape" || theme.name === "shapeDark") {
            graphics.drawRoundedRect(x, y, width, height, 2);
        }
        else {
            graphics.drawRect(x, y, width, height);
        }
        return;
    }
    context.fillRect(x, y, width, height);
}
export function drawLine(x1, y1, x2, y2, thickness) {
    const cn = colorToNumber(currentColor);
    beginFillColor(cn);
    graphics.drawCircle(x1, y1, thickness * 0.5);
    graphics.drawCircle(x2, y2, thickness * 0.5);
    endFill();
    graphics.lineStyle(thickness, cn);
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
    graphics.lineStyle(0);
}
export function drawLetterImage(li, x, y, width, height) {
    if (theme.isUsingPixi) {
        endFill();
        graphics.beginTextureFill({
            texture: li.texture,
            matrix: new PIXI.Matrix().translate(x, y),
        });
        graphics.drawRect(x, y, width == null ? letterSize : width, height == null ? letterSize : height);
        beginFillColor(colorToNumber(currentColor));
        return;
    }
    if (width == null) {
        context.drawImage(li.image, x, y);
    }
    else {
        context.drawImage(li.image, x, y, width, height);
    }
}
export function updateCrtFilter() {
    crtFilter.time += 0.2;
}
export function saveAsBackground() {
    background.src = canvas.toDataURL();
}
export function drawBackground() {
    context.drawImage(background, 0, 0);
}
export function capture() {
    captureContext.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
    if (capturedCanvasScale === 1) {
        captureContext.drawImage(canvas, (captureCanvas.width - canvas.width) / 2, (captureCanvas.height - canvas.height) / 2);
    }
    else {
        const w = canvas.width * capturedCanvasScale;
        const h = canvas.height * capturedCanvasScale;
        captureContext.drawImage(canvas, (captureCanvas.width - w) / 2, (captureCanvas.height - h) / 2, w, h);
    }
    gcc.capture(captureCanvas);
}
