import { useState, useEffect, useRef } from "react";

export function useAudioLevel(stream: MediaStream | null) {
  const [mouthOpen, setMouthOpen] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream) {
      setMouthOpen(0);
      return;
    }

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const update = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      // Map to 0-1 range for blendshape (max volume usually around 128-255)
      // We use a threshold to ignore background noise
      const threshold = 10;
      const level = average > threshold ? Math.min(1, (average - threshold) / 50) : 0;
      
      setMouthOpen(level);
      
      animationFrameRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioCtx.close();
    };
  }, [stream]);

  return mouthOpen;
}
