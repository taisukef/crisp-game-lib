import * as input from "./input.js";
import { vec } from "./main.js";
let record;
let inputIndex;
let frameStates;
let storedInput;
export function initRecord(randomSeed) {
    record = {
        randomSeed,
        inputs: [],
    };
}
export function recordInput(input) {
    record.inputs.push(input);
}
export function isRecorded() {
    return record != null;
}
export function initReplay(random) {
    inputIndex = 0;
    random.setSeed(record.randomSeed);
}
export function replayInput() {
    if (inputIndex >= record.inputs.length) {
        return;
    }
    input.set(record.inputs[inputIndex]);
    inputIndex++;
}
export function initFrameStates() {
    frameStates = [];
}
export function recordFrameState(state, baseState, random) {
    frameStates.push({
        randomState: random.getState(),
        gameState: cloneDeep(state),
        baseState: cloneDeep(baseState),
    });
}
export function rewind(random) {
    const fs = frameStates.pop();
    const rs = fs.randomState;
    random.setSeed(rs.w, rs.x, rs.y, rs.z, 0);
    storedInput = {
        pos: vec(input.pos),
        isPressed: input.isPressed,
        isJustPressed: input.isJustPressed,
        isJustReleased: input.isJustReleased,
    };
    input.set(record.inputs.pop());
    return fs;
}
export function getLastFrameState(random) {
    const fs = frameStates[frameStates.length - 1];
    const rs = fs.randomState;
    random.setSeed(rs.w, rs.x, rs.y, rs.z, 0);
    storedInput = {
        pos: vec(input.pos),
        isPressed: input.isPressed,
        isJustPressed: input.isJustPressed,
        isJustReleased: input.isJustReleased,
    };
    input.set(record.inputs[record.inputs.length - 1]);
    return fs;
}
export function restoreInput() {
    input.set(storedInput);
}
export function isFrameStateEmpty() {
    return frameStates.length === 0;
}
export function getFrameStateForReplay() {
    const i = inputIndex - 1;
    if (i >= record.inputs.length) {
        return;
    }
    return frameStates[i];
}
