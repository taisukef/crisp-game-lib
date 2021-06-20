import * as view from "./view.js";
import { clamp } from "./util.js";
import { Vector } from "./vector.js";
import { hitBoxes, tmpHitBoxes, checkHitBoxes, concatTmpHitBoxes, createShorthand, } from "./collision.js";
export function rect(x, y, width, height) {
    return drawRect(false, x, y, width, height);
}
export function box(x, y, width, height) {
    return drawRect(true, x, y, width, height);
}
export function bar(x, y, length, thickness, rotate = 0.5, centerPosRatio = 0.5) {
    if (typeof x !== "number") {
        centerPosRatio = rotate;
        rotate = thickness;
        thickness = length;
        length = y;
        y = x.y;
        x = x.x;
    }
    const l = new Vector(length).rotate(rotate);
    const p = new Vector(x - l.x * centerPosRatio, y - l.y * centerPosRatio);
    return drawLine(p, l, thickness);
}
export function line(x1, y1, x2 = 3, y2 = 3, thickness = 3) {
    const p = new Vector();
    const p2 = new Vector();
    if (typeof x1 === "number") {
        if (typeof y1 === "number") {
            if (typeof x2 === "number") {
                p.set(x1, y1);
                p2.set(x2, y2);
            }
            else {
                p.set(x1, y1);
                p2.set(x2);
                thickness = y2;
            }
        }
        else {
            throw "invalid params";
        }
    }
    else {
        if (typeof y1 === "number") {
            if (typeof x2 === "number") {
                p.set(x1);
                p2.set(y1, x2);
                thickness = y2;
            }
            else {
                throw "invalid params";
            }
        }
        else {
            if (typeof x2 === "number") {
                p.set(x1);
                p2.set(y1);
                thickness = x2;
            }
            else {
                throw "invalid params";
            }
        }
    }
    return drawLine(p, p2.sub(p), thickness);
}
export function arc(centerX, centerY, radius, thickness, angleFrom, angleTo) {
    let centerPos = new Vector();
    if (typeof centerX === "number") {
        centerPos.set(centerX, centerY);
    }
    else {
        centerPos.set(centerX);
        angleTo = angleFrom;
        angleFrom = thickness;
        thickness = radius;
        radius = centerY;
    }
    if (thickness == null) {
        thickness = 3;
    }
    if (angleFrom == null) {
        angleFrom = 0;
    }
    if (angleTo == null) {
        angleTo = Math.PI * 2;
    }
    let af;
    let ao;
    if (angleFrom > angleTo) {
        af = angleTo;
        ao = angleFrom - angleTo;
    }
    else {
        af = angleFrom;
        ao = angleTo - angleFrom;
    }
    ao = clamp(ao, 0, Math.PI * 2);
    if (ao < 0.01) {
        return;
    }
    const lc = clamp(Math.ceil(ao * Math.sqrt(radius * 0.25)), 1, 36);
    const ai = ao / lc;
    let a = af;
    let p1 = new Vector(radius).rotate(a).add(centerPos);
    let p2 = new Vector();
    let o = new Vector();
    let collision = { isColliding: { rect: {}, text: {}, char: {} } };
    for (let i = 0; i < lc; i++) {
        a += ai;
        p2.set(radius).rotate(a).add(centerPos);
        o.set(p2).sub(p1);
        const c = drawLine(p1, o, thickness, true);
        collision = Object.assign(Object.assign(Object.assign({}, collision), createShorthand(c.isColliding.rect)), { isColliding: {
                rect: Object.assign(Object.assign({}, collision.isColliding.rect), c.isColliding.rect),
                text: Object.assign(Object.assign({}, collision.isColliding.text), c.isColliding.text),
                char: Object.assign(Object.assign({}, collision.isColliding.char), c.isColliding.char),
            } });
        p1.set(p2);
    }
    concatTmpHitBoxes();
    return collision;
}
function drawRect(isAlignCenter, x, y, width, height) {
    if (typeof x === "number") {
        if (typeof y === "number") {
            if (typeof width === "number") {
                if (height == null) {
                    return addRect(isAlignCenter, x, y, width, width);
                }
                else {
                    return addRect(isAlignCenter, x, y, width, height);
                }
            }
            else {
                return addRect(isAlignCenter, x, y, width.x, width.y);
            }
        }
        else {
            throw "invalid params";
        }
    }
    else {
        if (typeof y === "number") {
            if (width == null) {
                return addRect(isAlignCenter, x.x, x.y, y, y);
            }
            else if (typeof width === "number") {
                return addRect(isAlignCenter, x.x, x.y, y, width);
            }
            else {
                throw "invalid params";
            }
        }
        else {
            return addRect(isAlignCenter, x.x, x.y, y.x, y.y);
        }
    }
}
function drawLine(p, l, thickness, isAddingToTmp = false) {
    let isDrawing = true;
    if (view.theme.name === "shape" || view.theme.name === "shapeDark") {
        view.drawLine(p.x, p.y, p.x + l.x, p.y + l.y, thickness);
    }
    const t = Math.floor(clamp(thickness, 3, 10));
    const lx = Math.abs(l.x);
    const ly = Math.abs(l.y);
    const rn = clamp(Math.ceil(lx > ly ? lx / t : ly / t) + 1, 3, 99);
    l.div(rn - 1);
    let collision = { isColliding: { rect: {}, text: {}, char: {} } };
    for (let i = 0; i < rn; i++) {
        const c = addRect(true, p.x, p.y, thickness, thickness, true, isDrawing);
        collision = Object.assign(Object.assign(Object.assign({}, collision), createShorthand(c.isColliding.rect)), { isColliding: {
                rect: Object.assign(Object.assign({}, collision.isColliding.rect), c.isColliding.rect),
                text: Object.assign(Object.assign({}, collision.isColliding.text), c.isColliding.text),
                char: Object.assign(Object.assign({}, collision.isColliding.char), c.isColliding.char),
            } });
        p.add(l);
    }
    if (!isAddingToTmp) {
        concatTmpHitBoxes();
    }
    return collision;
}
function addRect(isAlignCenter, x, y, width, height, isAddingToTmp = false, isDrawing = true) {
    let pos = isAlignCenter
        ? { x: Math.floor(x - width / 2), y: Math.floor(y - height / 2) }
        : { x: Math.floor(x), y: Math.floor(y) };
    const size = { x: Math.trunc(width), y: Math.trunc(height) };
    if (size.x === 0 || size.y === 0) {
        return {
            isColliding: { rect: {}, text: {}, char: {} },
        };
    }
    if (size.x < 0) {
        pos.x += size.x;
        size.x *= -1;
    }
    if (size.y < 0) {
        pos.y += size.y;
        size.y *= -1;
    }
    const box = { pos, size, collision: { isColliding: { rect: {} } } };
    box.collision.isColliding.rect[view.currentColor] = true;
    const collision = checkHitBoxes(box);
    if (view.currentColor !== "transparent") {
        (isAddingToTmp ? tmpHitBoxes : hitBoxes).push(box);
        if (isDrawing) {
            view.fillRect(pos.x, pos.y, size.x, size.y);
        }
    }
    return collision;
}
