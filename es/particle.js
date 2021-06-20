import { Random } from "./random.js";
import { Vector } from "./vector.js";
import { fillRect, setColor, currentColor, saveCurrentColor, loadCurrentColor, } from "./view.js";
import { clamp } from "./util.js";
let particles;
const random = new Random();
export function init() {
    particles = [];
}
export function add(pos, count = 16, speed = 1, angle = 0, angleWidth = Math.PI * 2) {
    if (count < 1) {
        if (random.get() > count) {
            return;
        }
        count = 1;
    }
    for (let i = 0; i < count; i++) {
        const a = angle + random.get(angleWidth) - angleWidth / 2;
        const p = {
            pos: new Vector(pos),
            vel: new Vector(speed * random.get(0.5, 1), 0).rotate(a),
            color: currentColor,
            ticks: clamp(random.get(10, 20) * Math.sqrt(Math.abs(speed)), 10, 60),
        };
        particles.push(p);
    }
}
export function update() {
    saveCurrentColor();
    particles = particles.filter((p) => {
        p.ticks--;
        if (p.ticks < 0) {
            return false;
        }
        p.pos.add(p.vel);
        p.vel.mul(0.98);
        setColor(p.color);
        fillRect(Math.floor(p.pos.x), Math.floor(p.pos.y), 1, 1);
        return true;
    });
    loadCurrentColor();
}
