import * as keyboard from "./keyboard.js";
import * as pointer from "./pointer.js";
import * as view from "./view.js";
import { Vector } from "./vector.js";
import * as sss from "https://taisukef.github.io/sounds-some-sounds/sss.js";
//declare const sss;
export let pos = new Vector();
export let isPressed = false;
export let isJustPressed = false;
export let isJustReleased = false;
export function init() {
    keyboard.init({
        onKeyDown: sss.playEmpty,
    });
    pointer.init(view.canvas, view.size, {
        onPointerDownOrUp: sss.playEmpty,
        anchor: new Vector(0.5, 0.5),
    });
}
export function update() {
    keyboard.update();
    pointer.update();
    pos = pointer.pos;
    isPressed = keyboard.isPressed || pointer.isPressed;
    isJustPressed = keyboard.isJustPressed || pointer.isJustPressed;
    isJustReleased = keyboard.isJustReleased || pointer.isJustReleased;
}
export function clearJustPressed() {
    keyboard.clearJustPressed();
    pointer.clearJustPressed();
}
export function set(state) {
    pos.set(state.pos);
    isPressed = state.isPressed;
    isJustPressed = state.isJustPressed;
    isJustReleased = state.isJustReleased;
}
