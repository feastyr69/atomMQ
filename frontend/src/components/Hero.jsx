import { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Trail, Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";
import { AddJobDialog } from "./AddJobDialog";

function Electron({ radius = 2, speed = 1, angle = 0, color = "#60a5fa", yRotation = 0 }) {
  const ref = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    ref.current.position.x = Math.sin(t + angle) * radius;
    ref.current.position.z = Math.cos(t + angle) * radius;
  });

  return (
    <group rotation={[0, 0, yRotation]}>
      <Trail local width={2} length={8} color={color} attenuation={(t) => t * t}>
        <mesh ref={ref}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </Trail>
      {/* Orbit path visual */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.015, 16, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function Atom() {
  return (
    <group>
      {/* Nucleus */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere args={[0.6, 32, 32]}>
          <meshStandardMaterial 
            color="#a78bfa" 
            emissive="#a78bfa" 
            emissiveIntensity={2} 
            roughness={0.2}
            metalness={0.8}
            toneMapped={false}
          />
        </Sphere>
        <pointLight color="#a78bfa" intensity={4} distance={10} decay={2} />
      </Float>

      {/* Electrons */}
      <Electron radius={2.5} speed={1.5} angle={0} color="#60a5fa" yRotation={Math.PI / 3} />
      <Electron radius={2.5} speed={1.2} angle={Math.PI} color="#c084fc" yRotation={-Math.PI / 3} />
      <Electron radius={2.5} speed={1.8} angle={Math.PI / 2} color="#818cf8" yRotation={Math.PI / 2} />
    </group>
  );
}

export function Hero({ bulkAddJobs }) {
  return (
    <section className="relative w-full min-h-[75vh] flex flex-col items-center justify-center overflow-hidden border-b border-border/40 py-20">
      {/* Background radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      {/* Three.js Canvas Background */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
          <color attach="background" args={["#09090b"]} />
          <ambientLight intensity={0.2} />
          <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          
          <group position={[3.5, 0, 0]} scale={1.2}>
            <Atom />
          </group>

          {/* Optional: allow user to slowly rotate */}
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate 
            autoRotateSpeed={0.5} 
            maxPolarAngle={Math.PI / 2 + 0.2}
            minPolarAngle={Math.PI / 2 - 0.2}
          />
        </Canvas>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 pointer-events-none">
        {/* Left: Copy & Actions */}
        <div className="flex-1 text-left space-y-8 max-w-2xl pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight font-sans">
              Distributed Scale. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-300">
                Atomic Precision.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="text-lg md:text-xl text-zinc-400 max-w-xl leading-relaxed font-light"
          >
            AtomMQ is a high-performance, resilient job scheduling engine. Built on Redis, it handles millions of asynchronous tasks, retries, and distributed workloads with zero friction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="pt-2"
          >
            <AddJobDialog onSubmit={bulkAddJobs} isHero />
          </motion.div>
        </div>

        {/* Right side is empty (Canvas renders behind it) */}
        <div className="flex-1 hidden md:block" />
      </div>
    </section>
  );
}
