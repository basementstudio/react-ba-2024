export const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const wallFragment = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uBgColor;
uniform vec3 uLineColor;
uniform float uSize;

void main() {
  vec2 uv = vUv;
  float divisionsz = 30.0;
  float divisions = clamp(floor(uSize / 120.0), 5.0, 30.0);
  if (mod(divisions, 2.0) == 0.0) {
    divisions = divisions + 1.0;
  }
  float width = 0.95;
  float speed = 5.0;

  float mixStrength = step(width, fract((uv.y + (uTime * speed)) * divisionsz)) + step(width, fract(uv.x * divisions));
  mixStrength = round(clamp(mixStrength, 0.0, 1.0));
  mixStrength -= pow(uv.y, 0.5) + uv.y + 1.0 - 1.0;
  mixStrength = clamp(mixStrength, 0.0, 1.0);


  gl_FragColor = vec4(mix(uBgColor, uLineColor, mixStrength), 1.0);
}
`;

export const bgFragment = /* glsl */ `
uniform vec3 uBgColor;

void main() {
  gl_FragColor = vec4(uBgColor, 1.0);
}
`;
