//@ts-nocheck

import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";

export const ControlView = ({
  onControlsUpdate,
}: {
  onControlsUpdate: (controls: any) => void;
}) => {
  const [permission, setPermission] = useState(false);
  const [resetDevice, setResetDevice] = useState(false);

  const [controls, setControls] = useState({
    a: false,
    b: false,
    acelerometer: [0, 0, 0],
    gyroscope: [0, 0, 0],
  });

  useEffect(() => {
    onControlsUpdate(controls);
  }, [controls]);

  const setControl = useCallback(
    (targetControl: string) => (value: any) => {
      setControls((controls) => {
        return { ...controls, [targetControl]: value };
      });
    },
    [setControls],
  );

  const movement = (event: any) => {
    setControl("acelerometer")([
      event.acceleration.x,
      event.acceleration.y,
      event.acceleration.z,
    ]);
  };

  const orientation = useCallback(
    (event: any) => {
      setControl("gyroscope")([event.alpha, event.beta, event.gamma]);
    },
    [setControl],
  );

  const askForPermission = () => {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      DeviceMotionEvent.requestPermission()
        .then((permissionState) => {})
        .catch(console.error);
    } else {
      alert("DeviceMotionEvent is not firing");
    }

    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {})
        .catch(console.error);
    } else {
      alert("DeviceOrientationEvent is not firing");
    }

    setPermission(true);
  };

  useEffect(() => {
    if (resetDevice) setResetDevice(false);

    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", movement, false);
    }

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", orientation, false);
    }

    return () => {
      window.removeEventListener("devicemotion", movement, false);
      window.removeEventListener("deviceorientation", orientation, false);
    };
  }, [resetDevice]);

  return (
    <div className="select-none flex flex-col gap-4 rounded-lg border-2 border-green-500 bg-black p-4 font-mono text-green-500 shadow-[0_0_10px_rgba(0,255,0,0.3)]">
      {!permission && (
        <button
          onClick={askForPermission}
          className="w-full border-2 border-green-500 p-2 text-sm uppercase tracking-wider transition-colors"
        >
          &gt; INITIALIZE SENSORS_
        </button>
      )}
      <button
        onClick={() => {
          setResetDevice(true);
        }}
        className="w-full border-2 border-red-500 p-2 text-sm uppercase tracking-wider transition-colors"
      >
        &gt; RESET TARGET_
      </button>

      <div className="border border-green-500 p-3">
        <h3 className="mb-2 border-b border-green-500 pb-1 text-sm">
          GYROSCOPE_DATA
        </h3>
        <div className="relative mx-auto h-32 w-32">
          <div
            className="absolute h-full w-full border border-green-500"
            style={{
              transform: `rotateX(${controls?.gyroscope?.[1] || 0}deg) 
                           rotateY(${controls?.gyroscope?.[0] || 0}deg) 
                           rotateZ(${controls?.gyroscope?.[2] || 0}deg)`,
            }}
          >
            <div className="absolute left-0 top-1/2 h-px w-full bg-green-500 opacity-50" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-green-500 opacity-50" />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1 text-xs font-bold">
          <p>α:{controls?.gyroscope?.[0]?.toFixed(1)}°</p>
          <p>β:{controls?.gyroscope?.[1]?.toFixed(1)}°</p>
          <p>γ:{controls?.gyroscope?.[2]?.toFixed(1)}°</p>
        </div>
      </div>

      {/* Accelerometer Display */}
      <div className="border border-green-500 p-3">
        <h3 className="mb-2 border-b border-green-500 pb-1 text-sm">
          ACCELEROMETER_DATA
        </h3>
        <div className="space-y-2">
          {["X", "Y", "Z"].map((axis, index) => (
            <div key={axis} className="flex items-center gap-2">
              <span className="w-4 text-xs">{axis}:</span>
              <div className="relative h-4 flex-1 overflow-hidden border border-green-500">
                <div
                  className="h-full bg-green-500 opacity-50 transition-all"
                  style={{
                    width: `${Math.min(Math.abs(controls?.acelerometer?.[index] || 0) * 10, 100)}%`,
                  }}
                />
                <div className="absolute inset-0 grid grid-cols-10">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-green-500 opacity-30"
                    />
                  ))}
                </div>
              </div>
              <span className="w-16 text-right text-xs">
                [{controls?.acelerometer?.[index]?.toFixed(2)}]
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Control Interface */}
      <div className="grid grid-cols-2 gap-3">
        {["A", "B"].map((button) => (
          <button
            key={button}
            className={clsx(
              "border-2 border-green-500 p-4 text-xl font-bold transition-all active:scale-95",
              controls?.[button.toLowerCase()] && "bg-green-500 text-black",
            )}
            onTouchStart={() => setControl(button.toLowerCase())(true)}
            onTouchEnd={() => setControl(button.toLowerCase())(false)}
          >
            [{button}_BTN]
          </button>
        ))}
      </div>
    </div>
  );
};
