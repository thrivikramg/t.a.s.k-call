"use client";

import { useEffect, useRef, useState } from "react";
import { TrackingData } from "./useStore";

export function useFaceTracking() {
  const [trackingData, setTrackingData] = useState<TrackingData>({
    headRotation: [0, 0, 0],
    mouthOpen: 0,
    eyeBlinkLeft: 0,
    eyeBlinkRight: 0,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<any>(null);

  useEffect(() => {
    // Create video element for webcam
    const video = document.createElement("video");
    video.style.display = "none";
    document.body.appendChild(video);
    videoRef.current = video;

    let stream: MediaStream | null = null;
    let animationFrameId: number;
    let faceLandmarker: any = null;

    const initFaceTracking = async () => {
      try {
        // Dynamically import to avoid SSR issues
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });

        faceLandmarkerRef.current = faceLandmarker;

        navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
          .then((s) => {
            stream = s;
            video.srcObject = s;
            video.onloadedmetadata = () => {
              video.play();

              const onFrame = async () => {
                if (!video.paused && !video.ended && faceLandmarker) {
                  const startTimeMs = performance.now();
                  const results = faceLandmarker.detectForVideo(video, startTimeMs);

                  if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                    const blendshapes = results.faceBlendshapes[0].categories;

                    // Find specific blendshapes
                    const jawOpenRaw = blendshapes.find((c: any) => c.categoryName === "jawOpen")?.score || 0;
                    const jawOpen = Math.min(jawOpenRaw * 15.0, 1.0); // Amplify mouth open
                    const eyeBlinkLeftRaw = blendshapes.find((c: any) => c.categoryName === "eyeBlinkLeft")?.score || 0;
                    const eyeBlinkRightRaw = blendshapes.find((c: any) => c.categoryName === "eyeBlinkRight")?.score || 0;
                    
                    const eyeBlinkLeft = eyeBlinkLeftRaw > 0.3 ? 1.0 : 0.0;
                    const eyeBlinkRight = eyeBlinkRightRaw > 0.3 ? 1.0 : 0.0;

                    // Extract head rotation from landmarks
                    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                      const landmarks = results.faceLandmarks[0];
                      const nose = landmarks[4];
                      const leftTemple = landmarks[127];
                      const rightTemple = landmarks[356];

                      const center = {
                        x: (leftTemple.x + rightTemple.x) / 2,
                        y: (leftTemple.y + rightTemple.y) / 2,
                      };

                      // Linear approximation for rotation
                      const yaw = (nose.x - center.x) * 4; // Increased sensitivity for left-right
                      const pitch = (nose.y - center.y) * 1.5; // Reduced sensitivity for up-down

                      setTrackingData({
                        headRotation: [pitch, yaw, 0],
                        mouthOpen: jawOpen,
                        eyeBlinkLeft: eyeBlinkLeft,
                        eyeBlinkRight: eyeBlinkRight,
                      });
                    }
                  }
                  animationFrameId = requestAnimationFrame(onFrame);
                }
              };
              animationFrameId = requestAnimationFrame(onFrame);
            };
          })
          .catch((err) => console.error("Failed to get webcam stream", err));

      } catch (error) {
        console.error("Failed to initialize FaceLandmarker", error);
      }
    };

    initFaceTracking();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (faceLandmarker) faceLandmarker.close();
      video.remove();
    };
  }, []);

  return trackingData;
}
