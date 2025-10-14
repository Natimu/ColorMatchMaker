import React, { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

function ParticlesBackground() {
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine); // load lightweight engine
    }).then(() => {
      setEngineReady(true);
    });
  }, []);

  if (!engineReady) return null;

  return (
    <Particles
      id="tsparticles"
      options={{
        background: {
          color: { value:"" },
        },
        fpsLimit: 20,
        interactivity: {
          events: {
            onClick: { enable: true, mode: "push" },
            onHover: { enable: true, mode: "repulse" },
          },
          modes: {
            push: { quantity: 4 },
            repulse: { distance: 100, duration: 0.4 },
          },
        },
        particles: {
          color: { value: "random",
                        animation: {
                        enable: true,
                        speed: 200,
                        sync: false}},
          links: { color: "random", distance: 150, enable: true, opacity: 0.3, width: 1 },
          move: { enable: true, speed: 1 },
          number: { value: 250, density: { enable: true, area: 800 } },
          opacity: { value: 0.5 },
          shape: { type: ["triangle", "circle"] },
          size: { value: { min: 1, max: 5 } },
        },
        detectRetina: true,
      }}
    />
  );
}

export default React.memo(ParticlesBackground);
