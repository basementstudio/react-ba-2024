import { PlaneGeometry, ShaderMaterial, Vector3 } from "three";

import { vertexShader, wallFragment, bgFragment } from "./shaders";

export const baseGeometry = new PlaneGeometry(1, 1, 1, 1);

export const topBottomMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader: wallFragment,
  uniforms: {
    uTime: { value: 0 },
    uBgColor: { value: new Vector3(0, 0, 0) },
    uLineColor: { value: new Vector3(0, 0, 0) },
    uSize: { value: 0 },
  },
});

export const leftRightMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader: wallFragment,
  uniforms: {
    uTime: { value: 0 },
    uBgColor: { value: new Vector3(0, 0, 0) },
    uLineColor: { value: new Vector3(0, 0, 0) },
    uSize: { value: 0 },
  },
});

export const backgroundMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader: bgFragment,
  uniforms: { uBgColor: { value: new Vector3(0, 0, 0) } },
});

export const getCurrentViewport = (camera: any, offset: number) => {
  const width = document.body.clientWidth - offset;
  const height =
    (document.getElementById("wrapper")?.clientHeight || window.innerHeight) -
    offset;

  const distance = camera.position.distanceTo(new Vector3(0, 0, 0));

  const fov = (camera.fov * Math.PI) / 180;
  const h = 2 * Math.tan(fov * 0.5) * distance;
  const w = h * (width / height);

  return { w, h };
};

export const HalfPI = Math.PI * 0.5;
export const PI = Math.PI;

export const rgbaToVector3 = (rgba: string) =>
  new Vector3(
    ...rgba
      .replace(/[^\d,]/g, "")
      .split(",")
      .slice(0, 3)
      .map((n) => +n / 255)
  );
