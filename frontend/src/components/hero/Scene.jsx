import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Stars, Sphere } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";

function Rings({ maxRadius = 20, count = 10 }) {
  const groupRef = useRef();
  
  useFrame(() => {
    groupRef.current.rotation.y += 0.0003;
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const radius = (i + 1) * (maxRadius / count);
        const opacity = Math.max(0, 1 - (radius / maxRadius)) * 0.4;
        
        return (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.008, 16, 128]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={opacity} />
          </mesh>
        );
      })}
    </group>
  );
}

function Atom({ scrollYProgress }) {
  const nucleusRef = useRef();
  const groupRef = useRef();

  useFrame(() => {
    const progress = scrollYProgress ? scrollYProgress.get() : 0;
    groupRef.current.rotation.y += 0.0005;
    const expansion = progress * 0.5;
    nucleusRef.current.scale.setScalar(1 + expansion);
  });

  return (
    <group ref={groupRef}>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <group ref={nucleusRef}>
          {/* Small glowing white core */}
          <Sphere args={[0.25, 64, 64]}>
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff" 
              emissiveIntensity={1.2}
              roughness={0.1}
              metalness={0.5}
            />
          </Sphere>
        </group>
        <pointLight color="#ffffff" intensity={5} distance={10} position={[0.5, 0.5, 1]} decay={2} />
        <pointLight color="#ffffff" intensity={3} distance={15} position={[-0.5, -0.5, 1]} decay={2} />
      </Float>

      <Rings maxRadius={24} count={12} />
    </group>
  );
}

export function Scene({ scrollYProgress }) {
  useFrame((state) => {
    const progress = scrollYProgress ? scrollYProgress.get() : 0;
    
    let targetZ = 16; 
    
    if (progress < 0.35) {
      const p = progress / 0.35;
      targetZ = THREE.MathUtils.lerp(16, 8, p);
    } else if (progress < 0.75) {
      targetZ = 8;
    } else {
      const p = (progress - 0.75) / 0.25;
      targetZ = THREE.MathUtils.lerp(8, 18, p);
    }

    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.02);
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0, 0.02);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0, 0.02);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={["#010204"]} />
      <ambientLight intensity={0.1} />
      <Stars radius={50} depth={50} count={3000} factor={2} saturation={0} fade speed={0.3} />
      
      <group position={[0, 0, 0]} rotation={[0.4, 0, -0.2]}>
        <Atom scrollYProgress={scrollYProgress} />
      </group>

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.5} 
          mipmapBlur 
          intensity={1.5} 
          levels={8}
        />
        <Noise opacity={0.18} />
        <Vignette eskil={false} offset={0.2} darkness={1.3} />
      </EffectComposer>
    </>
  );
}
