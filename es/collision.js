import { entries } from "./util.js";
export let hitBoxes;
export let tmpHitBoxes;
export function clear() {
    hitBoxes = [];
    tmpHitBoxes = [];
}
export function concatTmpHitBoxes() {
    hitBoxes = hitBoxes.concat(tmpHitBoxes);
    tmpHitBoxes = [];
}
export function checkHitBoxes(box) {
    let collision = {
        isColliding: { rect: {}, text: {}, char: {} },
    };
    hitBoxes.forEach((r) => {
        if (testCollision(box, r)) {
            collision = Object.assign(Object.assign(Object.assign({}, collision), createShorthand(r.collision.isColliding.rect)), { isColliding: {
                    rect: Object.assign(Object.assign({}, collision.isColliding.rect), r.collision.isColliding.rect),
                    text: Object.assign(Object.assign({}, collision.isColliding.text), r.collision.isColliding.text),
                    char: Object.assign(Object.assign({}, collision.isColliding.char), r.collision.isColliding.char),
                } });
        }
    });
    return collision;
}
function testCollision(r1, r2) {
    const ox = r2.pos.x - r1.pos.x;
    const oy = r2.pos.y - r1.pos.y;
    return -r2.size.x < ox && ox < r1.size.x && -r2.size.y < oy && oy < r1.size.y;
}
export function createShorthand(rects) {
    if (rects == null) {
        return {};
    }
    const colorReplaces = {
        transparent: "tr",
        white: "wh",
        red: "rd",
        green: "gr",
        yellow: "yl",
        blue: "bl",
        purple: "pr",
        cyan: "cy",
        black: "lc",
    };
    let shorthandRects = {};
    entries(rects).forEach(([k, v]) => {
        const sh = colorReplaces[k];
        if (v && sh != null) {
            shorthandRects[sh] = true;
        }
    });
    return shorthandRects;
}
