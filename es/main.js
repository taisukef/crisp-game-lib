import * as loop from "./loop.js";
import * as view from "./view.js";
import { Terminal } from "./terminal.js";
import * as input from "./input.js";
import * as keyboard from "./keyboard.js";
import * as pointer from "./pointer.js";
import { Vector } from "./vector.js";
import { Random } from "./random.js";
import * as collision from "./collision.js";
import { defineCharacters, print, letterSize } from "./letter.js";
import * as _particle from "./particle.js";
import { times, remove } from "./util.js";
import { get as getButton, update as updateButton, draw as drawButton, } from "./button.js";
import * as replay from "./replay.js";
import * as sss from "https://taisukef.github.io/sounds-some-sounds/sss.js";
export { clamp, wrap, range, times, remove, addWithCharCode } from "./util.js";
export { rect, box, bar, line, arc } from "./rect.js";
export { text, char } from "./letter.js";
export { input, keyboard, pointer };
export { getButton, updateButton };
export const PI = Math.PI;
export const abs = Math.abs;
export const sin = Math.sin;
export const cos = Math.cos;
export const atan2 = Math.atan2;
export const sqrt = Math.sqrt;
export const pow = Math.pow;
export const floor = Math.floor;
export const round = Math.round;
export const ceil = Math.ceil;
export let ticks = 0;
export let difficulty;
export let score = 0;
export let time;
export function rnd(lowOrHigh = 1, high) {
    return random.get(lowOrHigh, high);
}
export function rndi(lowOrHigh = 2, high) {
    return random.getInt(lowOrHigh, high);
}
export function rnds(lowOrHigh = 1, high) {
    return random.get(lowOrHigh, high) * random.getPlusOrMinus();
}
export function end(_gameOverText = "GAME OVER") {
    gameOverText = _gameOverText;
    if (isShowingTime) {
        time = undefined;
    }
    initGameOver();
}
export function complete(completeText = "COMPLETE") {
    gameOverText = completeText;
    initGameOver();
}
export function addScore(value, x, y) {
    if (isReplaying) {
        return;
    }
    score += value;
    if (x == null) {
        return;
    }
    const str = `${value >= 1 ? "+" : ""}${Math.floor(value)}`;
    let pos = new Vector();
    if (typeof x === "number") {
        pos.set(x, y);
    }
    else {
        pos.set(x);
    }
    pos.x -= (str.length * letterSize) / 2;
    pos.y -= letterSize / 2;
    scoreBoards.push({
        str,
        pos,
        vy: -2,
        ticks: 30,
    });
}
export function color(colorName) {
    view.setColor(colorName);
}
export function particle(x, y, count, speed, angle, angleWidth) {
    let pos = new Vector();
    if (typeof x === "number") {
        pos.set(x, y);
        _particle.add(pos, count, speed, angle, angleWidth);
    }
    else {
        pos.set(x);
        _particle.add(pos, y, count, speed, angle);
    }
}
export function vec(x, y) {
    return new Vector(x, y);
}
export function play(type) {
    if (!isWaitingRewind && !isRewinding) {
        sss.play(soundEffectTypeToString[type]);
    }
}
export function frameState(frameState) {
    if (isWaitingRewind) {
        const rs = replay.getLastFrameState(random);
        const bs = rs.baseState;
        score = bs.score;
        ticks = bs.ticks;
        return cloneDeep(rs.gameState);
    }
    else if (isRewinding) {
        const rs = replay.rewind(random);
        const bs = rs.baseState;
        score = bs.score;
        ticks = bs.ticks;
        return rs.gameState;
    }
    else if (isReplaying) {
        const rs = replay.getFrameStateForReplay();
        return rs.gameState;
    }
    else if (state === "inGame") {
        const baseState = { score, ticks };
        replay.recordFrameState(frameState, baseState, random);
    }
    return frameState;
}
export function rewind() {
    if (isRewinding) {
        return;
    }
    if (!isReplaying && isRewindEnabled) {
        initRewind();
    }
    else {
        end();
    }
}
const soundEffectTypeToString = {
    coin: "c",
    laser: "l",
    explosion: "e",
    powerUp: "p",
    hit: "h",
    jump: "j",
    select: "s",
    lucky: "u",
};
const defaultOptions = {
    isPlayingBgm: false,
    isSpeedingUpSound: false,
    isCapturing: false,
    isShowingScore: true,
    isShowingTime: false,
    isReplayEnabled: false,
    isRewindEnabled: false,
    isDrawingParticleFront: false,
    isDrawingScoreFront: false,
    isMinifying: false,
    viewSize: { x: 100, y: 100 },
    seed: 0,
    theme: "simple",
};
const seedRandom = new Random();
const random = new Random();
const soundSpeedingUpInterval = 300;
let state;
let updateFunc = {
    title: updateTitle,
    inGame: updateInGame,
    gameOver: updateGameOver,
    rewind: updateRewind,
};
let terminal;
let hiScore = 0;
let fastestTime;
let isNoTitle = true;
let seed = 0;
let loopOptions;
let isPlayingBgm;
let isSpeedingUpSound;
let isShowingScore;
let isShowingTime;
let isReplayEnabled;
let isRewindEnabled;
let isDrawingParticleFront;
let isDrawingScoreFront;
let terminalSize;
let scoreBoards;
let isReplaying = false;
let isWaitingRewind = false;
let isRewinding = false;
let rewindButton;
let giveUpButton;
let gameOverText;
let gameScriptFile;
export function onLoad() {
    let opts;
    if (typeof options !== "undefined" && options != null) {
        opts = Object.assign(Object.assign({}, defaultOptions), options);
    }
    else {
        opts = defaultOptions;
    }
    const theme = {
        name: opts.theme,
        isUsingPixi: false,
        isDarkColor: false,
    };
    if (opts.theme !== "simple" && opts.theme !== "dark") {
        theme.isUsingPixi = true;
    }
    if (opts.theme === "pixel" ||
        opts.theme === "shapeDark" ||
        opts.theme === "crt" ||
        opts.theme === "dark") {
        theme.isDarkColor = true;
    }
    loopOptions = {
        viewSize: { x: 100, y: 100 },
        bodyBackground: theme.isDarkColor ? "#101010" : "#e0e0e0",
        viewBackground: theme.isDarkColor ? "blue" : "white",
        theme,
        highFps: opts.highFps,
    };
    seed = opts.seed;
    loopOptions.isCapturing = opts.isCapturing;
    loopOptions.viewSize = opts.viewSize;
    isPlayingBgm = opts.isPlayingBgm;
    isSpeedingUpSound = opts.isSpeedingUpSound;
    isShowingScore = opts.isShowingScore && !opts.isShowingTime;
    isShowingTime = opts.isShowingTime;
    isReplayEnabled = opts.isReplayEnabled;
    isRewindEnabled = opts.isRewindEnabled;
    isDrawingParticleFront = opts.isDrawingParticleFront;
    isDrawingScoreFront = opts.isDrawingScoreFront;
    if (opts.isMinifying) {
        showMinifiedScript();
    }
    loop.init(init, _update, loopOptions);
}
function init() {
    if (typeof description !== "undefined" &&
        description != null &&
        description.trim().length > 0) {
        isNoTitle = false;
        seed += getHash(description);
    }
    if (typeof title !== "undefined" &&
        title != null &&
        title.trim().length > 0) {
        isNoTitle = false;
        document.title = title;
        seed += getHash(title);
    }
    if (typeof characters !== "undefined" && characters != null) {
        defineCharacters(characters, "a");
    }
    sss.init(seed);
    const sz = loopOptions.viewSize;
    terminalSize = { x: Math.floor(sz.x / 6), y: Math.floor(sz.y / 6) };
    terminal = new Terminal(terminalSize);
    view.setColor("black");
    if (isNoTitle) {
        initInGame();
        ticks = 0;
    }
    else {
        initTitle();
    }
}
function _update(dt) {
    df = difficulty = ticks / 3600 + 1;
    tc = ticks;
    const prevScore = score;
    const prevTime = time;
    sc = score;
    const prevSc = sc;
    inp = {
        p: input.pos,
        ip: input.isPressed,
        ijp: input.isJustPressed,
        ijr: input.isJustReleased,
    };
    collision.clear();
    if (ticks < 0) {
        ticks = 0;
    }
    updateFunc[state](dt);
    if (view.theme.isUsingPixi) {
        view.endFill();
        if (view.theme.name === "crt") {
            view.updateCrtFilter();
        }
    }
    //ticks++;
    ticks += dt;
    if (isReplaying) {
        score = prevScore;
        time = prevTime;
    }
    else if (sc !== prevSc) {
        score = sc;
    }
}
function initInGame() {
    state = "inGame";
    ticks = -1;
    _particle.init();
    const s = Math.floor(score);
    if (s > hiScore) {
        hiScore = s;
    }
    if (isShowingTime && time != null) {
        if (fastestTime == null || fastestTime > time) {
            fastestTime = time;
        }
    }
    score = 0;
    time = 0;
    scoreBoards = [];
    if (isPlayingBgm) {
        sss.playBgm();
    }
    const randomSeed = seedRandom.getInt(999999999);
    random.setSeed(randomSeed);
    if (isReplayEnabled || isRewindEnabled) {
        replay.initRecord(randomSeed);
        replay.initFrameStates();
        isReplaying = false;
    }
}
function updateInGame(dt) {
    terminal.clear();
    view.clear();
    if (!isDrawingParticleFront) {
        _particle.update();
    }
    if (!isDrawingScoreFront) {
        updateScoreBoards();
    }
    if (isReplayEnabled || isRewindEnabled) {
        replay.recordInput({
            pos: vec(input.pos),
            isPressed: input.isPressed,
            isJustPressed: input.isJustPressed,
            isJustReleased: input.isJustReleased,
        });
    }
    update(dt);
    if (isDrawingParticleFront) {
        _particle.update();
    }
    if (isDrawingScoreFront) {
        updateScoreBoards();
    }
    drawScoreOrTime();
    terminal.draw();
    if (isShowingTime && time != null) {
        time++;
    }
    if (isSpeedingUpSound && ticks % soundSpeedingUpInterval === 0) {
        ///sss.playInterval = 0.5 / sqrt(difficulty);
        sss.setPlayInterval(0.5 / sqrt(difficulty));
    }
}
function initTitle() {
    state = "title";
    ticks = -1;
    _particle.init();
    terminal.clear();
    view.clear();
    if (replay.isRecorded()) {
        replay.initReplay(random);
        isReplaying = true;
    }
}
function updateTitle(dt) {
    if (input.isJustPressed) {
        initInGame();
        return;
    }
    view.clear();
    if (isReplayEnabled && replay.isRecorded()) {
        replay.replayInput();
        inp = {
            p: input.pos,
            ip: input.isPressed,
            ijp: input.isJustPressed,
            ijr: input.isJustReleased,
        };
        if (!isDrawingParticleFront) {
            _particle.update();
        }
        update(dt);
        if (isDrawingParticleFront) {
            _particle.update();
        }
        if (isSpeedingUpSound && ticks % soundSpeedingUpInterval === 0) {
            //sss.playInterval = 0.5 / sqrt(difficulty);
            sss.setPlayInterval(0.5 / sqrt(difficulty));
        }
    }
    if (ticks === 0) {
        drawScoreOrTime();
        if (typeof title !== "undefined" && title != null) {
            terminal.print(title, Math.floor(terminalSize.x - title.length) / 2, Math.ceil(terminalSize.y * 0.2));
        }
    }
    if (ticks === 30 || ticks == 40) {
        if (typeof description !== "undefined" && description != null) {
            let maxLineLength = 0;
            description.split("\n").forEach((l) => {
                if (l.length > maxLineLength) {
                    maxLineLength = l.length;
                }
            });
            const x = Math.floor((terminalSize.x - maxLineLength) / 2);
            description.split("\n").forEach((l, i) => {
                terminal.print(l, x, Math.floor(terminalSize.y / 2) + i);
            });
        }
    }
    terminal.draw();
}
function initGameOver() {
    state = "gameOver";
    if (!isReplaying) {
        input.clearJustPressed();
    }
    ticks = -1;
    drawGameOver();
    if (isPlayingBgm) {
        sss.stopBgm();
    }
}
function updateGameOver() {
    if ((isReplaying || ticks > 20) && input.isJustPressed) {
        initInGame();
    }
    else if (ticks === (isReplayEnabled ? 120 : 300) && !isNoTitle) {
        initTitle();
    }
}
function drawGameOver() {
    if (isReplaying) {
        return;
    }
    terminal.print(gameOverText, Math.floor((terminalSize.x - gameOverText.length) / 2), Math.floor(terminalSize.y / 2));
    terminal.draw();
}
function initRewind() {
    state = "rewind";
    isWaitingRewind = true;
    rewindButton = getButton({
        pos: { x: 61, y: 11 },
        size: { x: 36, y: 7 },
        text: "Rewind",
    });
    giveUpButton = getButton({
        pos: { x: 61, y: 81 },
        size: { x: 36, y: 7 },
        text: "GiveUp",
    });
    if (isPlayingBgm) {
        sss.stopBgm();
    }
    if (view.theme.isUsingPixi) {
        drawButton(rewindButton);
        drawButton(giveUpButton);
    }
}
function updateRewind(dt) {
    terminal.clear();
    view.clear();
    update(dt);
    drawScoreOrTime();
    replay.restoreInput();
    if (isRewinding) {
        drawButton(rewindButton);
        if (replay.isFrameStateEmpty() || !input.isPressed) {
            stopRewind();
        }
    }
    else {
        updateButton(rewindButton);
        updateButton(giveUpButton);
        if (rewindButton.isPressed) {
            isRewinding = true;
            isWaitingRewind = false;
        }
    }
    if (giveUpButton.isPressed) {
        isWaitingRewind = isRewinding = false;
        end();
    }
    else {
        terminal.draw();
    }
    if (isShowingTime && time != null) {
        time++;
    }
}
function stopRewind() {
    isRewinding = false;
    state = "inGame";
    _particle.init();
    if (isPlayingBgm) {
        sss.playBgm();
    }
}
function drawScoreOrTime() {
    if (isShowingScore) {
        terminal.print(`${Math.floor(score)}`, 0, 0);
        const hs = `HI ${hiScore}`;
        terminal.print(hs, terminalSize.x - hs.length, 0);
    }
    if (isShowingTime) {
        drawTime(time, 0, 0);
        drawTime(fastestTime, 9, 0);
    }
}
function drawTime(time, x, y) {
    if (time == null) {
        return;
    }
    let t = Math.floor((time * 100) / 50);
    if (t >= 10 * 60 * 100) {
        t = 10 * 60 * 100 - 1;
    }
    const ts = getPaddedNumber(Math.floor(t / 6000), 1) +
        "'" +
        getPaddedNumber(Math.floor((t % 6000) / 100), 2) +
        '"' +
        getPaddedNumber(Math.floor(t % 100), 2);
    terminal.print(ts, x, y);
}
function getPaddedNumber(v, digit) {
    return ("0000" + v).slice(-digit);
}
function updateScoreBoards() {
    view.saveCurrentColor();
    view.setColor("black");
    scoreBoards = scoreBoards.filter((sb) => {
        print(sb.str, sb.pos.x, sb.pos.y);
        sb.pos.y += sb.vy;
        sb.vy *= 0.9;
        sb.ticks--;
        return sb.ticks > 0;
    });
    view.loadCurrentColor();
}
function getHash(v) {
    let hash = 0;
    for (let i = 0; i < v.length; i++) {
        const chr = v.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
}
export function addGameScript() {
    let gameName = window.location.search.substring(1);
    gameName = gameName.replace(/\W/g, "");
    if (gameName.length === 0) {
        return;
    }
    const script = document.createElement("script");
    gameScriptFile = `${gameName}/main.js`;
    script.setAttribute("src", gameScriptFile);
    document.head.appendChild(script);
}
function showMinifiedScript() {
    fetch(gameScriptFile)
        .then((res) => res.text())
        .then((t) => {
        const minifiedScript = Terser.minify(t + "update();", {
            toplevel: true,
        }).code;
        const functionStartString = "function(){";
        const fi = minifiedScript.indexOf(functionStartString);
        const optionsString = "options={";
        const oi = minifiedScript.indexOf(optionsString);
        let minifiedUpdateScript = minifiedScript;
        if (fi >= 0) {
            minifiedUpdateScript = minifiedScript.substring(minifiedScript.indexOf(functionStartString) +
                functionStartString.length, minifiedScript.length - 4);
        }
        else if (oi >= 0) {
            let bc = 1;
            let ui;
            for (let i = oi + optionsString.length; i < minifiedScript.length; i++) {
                const c = minifiedScript.charAt(i);
                if (c === "{") {
                    bc++;
                }
                else if (c === "}") {
                    bc--;
                    if (bc === 0) {
                        ui = i + 2;
                        break;
                    }
                }
            }
            if (bc === 0) {
                minifiedUpdateScript = minifiedScript.substring(ui);
            }
        }
        minifyReplaces.forEach(([o, r]) => {
            minifiedUpdateScript = minifiedUpdateScript.split(o).join(r);
        });
        console.log(minifiedUpdateScript);
        console.log(`${minifiedUpdateScript.length} letters`);
    });
}
export let inp;
export let clr = color;
export let ply = play;
export let tms = times;
export let rmv = remove;
export let tc;
export let df;
export let sc;
export const tr = "transparent";
export const wh = "white";
export const rd = "red";
export const gr = "green";
export const yl = "yellow";
export const bl = "blue";
export const pr = "purple";
export const cy = "cyan";
export const lc = "black";
export const cn = "coin";
export const ls = "laser";
export const ex = "explosion";
export const pw = "powerUp";
export const ht = "hit";
export const jm = "jump";
export const sl = "select";
export const uc = "lucky";
export let minifyReplaces = [
    ["===", "=="],
    ["!==", "!="],
    ["input.pos", "inp.p"],
    ["input.isPressed", "inp.ip"],
    ["input.isJustPressed", "inp.ijp"],
    ["input.isJustReleased", "inp.ijr"],
    ["color(", "clr("],
    ["play(", "ply("],
    ["times(", "tms("],
    ["remove(", "rmv("],
    ["ticks", "tc"],
    ["difficulty", "df"],
    ["score", "sc"],
    [".isColliding.rect.transparent", ".tr"],
    [".isColliding.rect.white", ".wh"],
    [".isColliding.rect.red", ".rd"],
    [".isColliding.rect.green", ".gr"],
    [".isColliding.rect.yellow", ".yl"],
    [".isColliding.rect.blue", ".bl"],
    [".isColliding.rect.purple", ".pr"],
    [".isColliding.rect.cyan", ".cy"],
    [".isColliding.rect.black", ".lc"],
    ['"transparent"', "tr"],
    ['"white"', "wh"],
    ['"red"', "rd"],
    ['"green"', "gr"],
    ['"yellow"', "yl"],
    ['"blue"', "bl"],
    ['"purple"', "pr"],
    ['"cyan"', "cy"],
    ['"black"', "lc"],
    ['"coin"', "cn"],
    ['"laser"', "ls"],
    ['"explosion"', "ex"],
    ['"powerUp"', "pw"],
    ['"hit"', "ht"],
    ['"jump"', "jm"],
    ['"select"', "sl"],
    ['"lucky"', "uc"],
];
