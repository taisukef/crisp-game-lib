import { vec, color } from "./main.js";
import * as input from "./input.js";
import { rect } from "./rect.js";
import { text } from "./letter.js";
export function get({ pos, size, text, isToggle = false, onClick = () => { }, }) {
    return {
        pos,
        size,
        text,
        isToggle,
        onClick,
        isPressed: false,
        isSelected: false,
        isHovered: false,
        toggleGroup: [],
    };
}
export function update(button) {
    const o = vec(input.pos).sub(button.pos);
    button.isHovered = o.isInRect(0, 0, button.size.x, button.size.y);
    if (input.isJustPressed && button.isHovered) {
        button.isPressed = true;
    }
    if (button.isPressed && !button.isHovered) {
        button.isPressed = false;
    }
    if (button.isPressed && input.isJustReleased) {
        button.onClick();
        button.isPressed = false;
        if (button.isToggle) {
            if (button.toggleGroup.length === 0) {
                button.isSelected = !button.isSelected;
            }
            else {
                button.toggleGroup.forEach((b) => {
                    b.isSelected = false;
                });
                button.isSelected = true;
            }
        }
    }
    draw(button);
}
export function draw(button) {
    color(button.isPressed ? "blue" : "light_blue");
    rect(button.pos.x, button.pos.y, button.size.x, button.size.y);
    if (button.isToggle && !button.isSelected) {
        color("white");
        rect(button.pos.x + 1, button.pos.y + 1, button.size.x - 2, button.size.y - 2);
    }
    color(button.isHovered ? "black" : "blue");
    text(button.text, button.pos.x + 3, button.pos.y + 3);
}
