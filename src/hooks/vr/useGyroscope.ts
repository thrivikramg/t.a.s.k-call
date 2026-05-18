import { useState, useEffect, useCallback } from "react";

export function useGyroscope() {
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = useCallback(async () => {
    // @ts-ignore
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        // @ts-ignore
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === "granted") {
          setHasPermission(true);
          return true;
        }
      } catch (error) {
        console.error("DeviceOrientation permission failed", error);
      }
      return false;
    } else {
      // Non-iOS devices usually don't need permission
      setHasPermission(true);
      return true;
    }
  }, []);

  useEffect(() => {
    // Only auto-enable on Desktop devices. Mobile devices (iOS & Android) MUST require a user gesture 
    // to unlock sensors and WebRTC audio, otherwise the DeviceOrientationControls may receive NaN and crash the Canvas.
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      setHasPermission(true);
    }
  }, []);

  useEffect(() => {
    if (!hasPermission) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      setOrientation({
        alpha: e.alpha || 0, // Z axis (compass)
        beta: e.beta || 0,   // X axis (front-back)
        gamma: e.gamma || 0, // Y axis (left-right)
      });
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [hasPermission]);

  return { orientation, requestPermission, hasPermission };
}
