import { Application } from "@splinetool/runtime";
import { useEffect, useRef, useState } from "react";

export function OrbHero() {
  const stageRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const app = new Application(canvasRef.current, { renderMode: "auto" });
    let mounted = true;

    app
      .load("/orb.splinecode")
      .then(() => {
        app.setBackgroundColor("rgba(0, 0, 0, 0)");
        app.setGlobalEvents(false);
        frameScene(app);
        if (mounted) setLoaded(true);
      })
      .catch(() => mounted && setLoaded(false));

    const resizeObserver = new ResizeObserver(() => frameScene(app));
    if (stageRef.current) resizeObserver.observe(stageRef.current);

    return () => {
      mounted = false;
      resizeObserver.disconnect();
      app.dispose();
    };
  }, []);

  return (
    <section ref={stageRef} className="orb-hero" aria-label="AI Spline scene">
      <canvas ref={canvasRef} className="spline-orb" />
      {!loaded && <div className="scene-fallback" aria-hidden="true" />}
    </section>
  );
}

function frameScene(app: Application) {
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  app.setZoom(isMobile ? 0.9 : 1.24);
}
