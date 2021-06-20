//import * as PIXI from "pixi.js";
import { PIXI } from "https://taisukef.github.io/pixijs/es/pixi.v5.3.9.min.js";
const gridFilterFragment = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float width;
uniform float height;

float gridValue(vec2 uv, float res) {
  vec2 grid = fract(uv * res);
  return (step(res, grid.x) * step(res, grid.y));
}

void main(void) {
  vec4 color = texture2D(uSampler, vTextureCoord);  
  vec2 grid_uv = vTextureCoord.xy * vec2(width, height);
  float v = gridValue(grid_uv, 0.2);
  gl_FragColor.rgba = color * v;
}
`;
export function getGridFilter(width, height) {
    return new PIXI.Filter(undefined, gridFilterFragment, {
        width,
        height,
    });
}
