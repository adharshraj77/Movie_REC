import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import FOG from 'vanta/dist/vanta.fog.min';

export default function VantaBackground() {
  const containerRef = useRef(null);
  const effectRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || effectRef.current) return;

    try {
      window.THREE = THREE;
      effectRef.current = FOG({
        el: containerRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0x991b1b,
        midtoneColor: 0x3b0764,
        lowlightColor: 0x090912,
        baseColor: 0x06060a,
        blurFactor: 0.72,
        speed: 1.35,
        zoom: 1.15,
      });
    } catch {
      // Fallback gradient handled by container CSS if WebGL is unavailable
    }

    return () => {
      if (effectRef.current) {
        try {
          effectRef.current.destroy();
        } catch {
          // ignore cleanup error
        }
        effectRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none opacity-75"
      style={{
        background:
          'radial-gradient(circle at 20% 20%, rgba(153, 27, 27, 0.25), transparent 55%), radial-gradient(circle at 80% 80%, rgba(88, 28, 135, 0.22), transparent 55%), #06060a',
      }}
    />
  );
}

