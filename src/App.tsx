import React, { useState, useCallback, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid, Environment, ContactShadows, Text } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "motion/react";
import { Activity, MousePointer2, ZoomIn, RotateCcw, ArrowUp, Upload, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";

import { Humanoid } from "./components/Humanoid";
import { Controls, JointConfig } from "./components/Controls";
import { PostureState, INITIAL_POSTURE } from "./types";

export default function App() {
  const [posture, setPosture] = useState<PostureState>(INITIAL_POSTURE);
  const [cog, setCoG] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgOffset, setBgOffset] = useState({ x: 0, y: 0 });
  const [bgScale, setBgScale] = useState(1);

  const handleReset = useCallback(() => {
    setPosture(INITIAL_POSTURE);
    setBgOffset({ x: 0, y: 0 });
    setBgScale(1);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBgImage(e.target?.result as string);
        setBgOffset({ x: 0, y: 0 });
        setBgScale(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const moveBg = (dx: number, dy: number) => {
    setBgOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const zoomBg = (factor: number) => {
    setBgScale(prev => Math.max(0.1, Math.min(5, prev * factor)));
  };

  const leftJoints: JointConfig[] = useMemo(() => [
    { id: "rightShoulder", label: "Hombro Der. (Frente/Atrás)", axis: "x", min: -3.1416, max: 1.57, color: "#facc15" },
    { id: "rightShoulder", label: "Hombro Der. (Lateral)", axis: "z", min: -3.14, max: 3.14, color: "#facc15" },
    { id: "rightElbow", label: "Codo Derecho", axis: "x", min: -2.0, max: 0, color: "#d946ef" },
    { id: "rightHip", label: "Cadera Der. (Frente/Atrás)", axis: "x", min: -1.57, max: 1.57, color: "#ef4444" },
    { id: "rightHip", label: "Cadera Der. (Lateral)", axis: "z", min: -1.57, max: 1.57, color: "#ef4444" },
    { id: "rightKnee", label: "Rodilla Derecha", axis: "x", min: -3.1416, max: 3.1416, color: "#22c55e" },
    { id: "rightAnkle", label: "Tobillo Derecho", axis: "x", min: -0.5, max: 0.5, color: "#f472b6" },
  ], []);

  const rightJoints: JointConfig[] = useMemo(() => [
    { id: "leftShoulder", label: "Hombro Izq. (Frente/Atrás)", axis: "x", min: -3.1416, max: 1.57, color: "#facc15" },
    { id: "leftShoulder", label: "Hombro Izq. (Lateral)", axis: "z", min: -3.14, max: 3.14, color: "#facc15" },
    { id: "leftElbow", label: "Codo Izquierdo", axis: "x", min: -2.0, max: 0, color: "#d946ef" },
    { id: "leftHip", label: "Cadera Izq. (Frente/Atrás)", axis: "x", min: -1.57, max: 1.57, color: "#ef4444" },
    { id: "leftHip", label: "Cadera Izq. (Lateral)", axis: "z", min: -1.57, max: 1.57, color: "#ef4444" },
    { id: "leftKnee", label: "Rodilla Izquierda", axis: "x", min: 0, max: 2.5, color: "#22c55e" },
    { id: "leftAnkle", label: "Tobillo Izquierdo", axis: "x", min: -0.5, max: 0.5, color: "#f472b6" },
  ], []);

  return (
    <div className="relative w-full h-full font-sans select-none overflow-hidden bg-black">
      {/* Fixed Background Image */}
      {bgImage && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-50 overflow-hidden"
        >
          <div 
            className="w-full h-full transition-transform duration-300"
            style={{ 
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              transform: `translate(${bgOffset.x}px, ${bgOffset.y}px) scale(${bgScale})`,
              transformOrigin: 'center center'
            }}
          />
        </div>
      )}

      {/* 3D Scene */}
      <Canvas shadows dpr={[1, 2]} className="z-10">
        <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          <Humanoid posture={posture} onCoGUpdate={setCoG} />

          {/* Center of Gravity Marker */}
          <group position={cog}>
            <mesh>
              <sphereGeometry args={[0.06, 32, 32]} />
              <meshStandardMaterial 
                color="#00f2ff" 
                emissive="#00f2ff" 
                emissiveIntensity={2} 
                toneMapped={false} 
              />
              <pointLight color="#00f2ff" intensity={0.8} distance={1} />
            </mesh>
            <Text
              position={[0, 0.15, 0]}
              fontSize={0.08}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              CdG
            </Text>
          </group>

          {/* Visual Aids */}
          {!bgImage && (
            <Grid
              infiniteGrid
              fadeDistance={20}
              fadeStrength={5}
              cellSize={0.5}
              sectionSize={2.5}
              sectionThickness={1.5}
              sectionColor="#333333"
              cellColor="#111111"
            />
          )}
          
          <ContactShadows 
            position={[0, -1.01, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={1} 
          />

          <OrbitControls 
            makeDefault 
            minDistance={2} 
            maxDistance={8} 
            enablePan={false}
          />
        </Suspense>
      </Canvas>

      {/* UI Panels */}
      <div className="contents">
        <Controls 
          title="Lado Izquierdo"
          side="left"
          joints={rightJoints}
          posture={posture} 
          onChange={setPosture} 
        >
          {/* Brand, Upload Button and CdG Stats relocated here */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-stretch gap-3">
              <div className="flex flex-col">
                <div className="flex items-center mb-0.5">
                  <h1 className="text-base font-black tracking-tighter text-white uppercase italic">Human Gravity</h1>
                </div>
                <p className="text-zinc-500 text-[8px] font-mono uppercase tracking-[0.2em]">Gravity Module v1.0</p>
              </div>
              <label className="flex items-center px-2.5 bg-zinc-800 hover:bg-blue-600/20 hover:text-blue-400 rounded-lg transition-all text-zinc-400 border border-zinc-700 hover:border-blue-500/50 shadow-lg group opacity-50 hover:opacity-100 cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
                <ArrowUp className="w-4 h-4 group-hover:translate-y-[-1px] transition-transform" />
              </label>
              {bgImage && (
                <button 
                  onClick={() => setBgImage(null)}
                  className="flex items-center px-2.5 bg-zinc-800 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-all text-zinc-400 border border-zinc-700 hover:border-red-500/50 shadow-lg group opacity-50 hover:opacity-100"
                  title="Eliminar Imagen"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest leading-none">Posición CdG (Centro de Gravedad)</p>
              <div className="flex items-center gap-3">
                <div className="grid grid-cols-1 gap-1.5 font-mono text-xs w-28 text-center">
                  <div className="flex items-center justify-between bg-zinc-950/80 px-2 py-1.5 rounded-lg border border-zinc-800 shadow-inner">
                    <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-tighter">X</span>
                    <span className="text-blue-400 font-bold">{cog.x.toFixed(3)}</span>
                  </div>
                  <div className="flex items-center justify-between bg-zinc-950/80 px-2 py-1.5 rounded-lg border border-zinc-800 shadow-inner">
                    <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-tighter">Y</span>
                    <span className="text-blue-400 font-bold">{cog.y.toFixed(3)}</span>
                  </div>
                  <div className="flex items-center justify-between bg-zinc-950/80 px-2 py-1.5 rounded-lg border border-zinc-800 shadow-inner">
                    <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-tighter">Z</span>
                    <span className="text-blue-400 font-bold">{cog.z.toFixed(3)}</span>
                  </div>
                </div>
                <button 
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center self-stretch bg-zinc-800 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-all text-zinc-400 border border-zinc-700 hover:border-red-500/50 shadow-lg group opacity-50 hover:opacity-100"
                  title="Resetear Todo"
                >
                  <RotateCcw className="w-4 h-4 group-active:rotate-[-180deg] transition-transform duration-500" />
                </button>
              </div>
            </div>

          </div>
        </Controls>
        <Controls 
          title="Lado Derecho"
          side="right"
          joints={leftJoints}
          posture={posture} 
          onChange={setPosture} 
        >
          {/* Inclination Controls added here */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center group/item">
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                    Inclinación (Cadera)
                  </label>
                  <button
                    onClick={() => setPosture({ ...posture, hipLean: 0 })}
                    className="p-0.5 hover:bg-zinc-800 rounded transition-all text-zinc-500 hover:text-white"
                    title="Restablecer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                </div>
                <span className="text-[10px] font-mono" style={{ color: "#ef4444" }}>{(posture.hipLean * (180/Math.PI)).toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="-3.1416"
                max="3.1416"
                step="0.01"
                value={posture.hipLean}
                onChange={(e) => setPosture({ ...posture, hipLean: parseFloat(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer transition-all outline-none"
                style={{ accentColor: "#ef4444" } as React.CSSProperties}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center group/item">
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                    Inclinación (Rodilla)
                  </label>
                  <button
                    onClick={() => setPosture({ ...posture, kneeLean: 0 })}
                    className="p-0.5 hover:bg-zinc-800 rounded transition-all text-zinc-500 hover:text-white"
                    title="Restablecer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                </div>
                <span className="text-[10px] font-mono" style={{ color: "#22c55e" }}>{(posture.kneeLean * (180/Math.PI)).toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="-3.1416"
                max="0"
                step="0.01"
                value={posture.kneeLean}
                onChange={(e) => setPosture({ ...posture, kneeLean: parseFloat(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer transition-all outline-none"
                style={{ accentColor: "#22c55e" } as React.CSSProperties}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center group/item">
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                    Inclinación (Tobillo)
                  </label>
                  <button
                    onClick={() => setPosture({ ...posture, ankleLean: 0 })}
                    className="p-0.5 hover:bg-zinc-800 rounded transition-all text-zinc-500 hover:text-white"
                    title="Restablecer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                </div>
                <span className="text-[10px] font-mono" style={{ color: "#f472b6" }}>{(posture.ankleLean * (180/Math.PI)).toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.7854"
                step="0.01"
                value={posture.ankleLean}
                onChange={(e) => setPosture({ ...posture, ankleLean: parseFloat(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer transition-all outline-none"
                style={{ accentColor: "#f472b6" } as React.CSSProperties}
              />
            </div>
          </div>
        </Controls>
      </div>

      {/* Floating Centered Background Adjustment Panel */}
      {bgImage && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 p-3.5 bg-zinc-900/60 backdrop-blur-md border border-zinc-800/60 rounded-2xl shadow-2xl opacity-50 hover:opacity-100 transition-opacity duration-300 w-80 text-white select-none pointer-events-auto">
          <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-widest leading-none self-start mb-1">Ajuste de Fondo</p>
          <div className="flex items-center justify-between gap-4 w-full">
            {/* Position D-Pad */}
            <div className="grid grid-cols-3 gap-1">
              <div />
              <button 
                onClick={() => moveBg(0, -10)} 
                className="w-8 h-8 flex items-center justify-center bg-zinc-850 hover:bg-zinc-750 active:scale-95 rounded-md text-zinc-400 border border-zinc-700 select-none transition-all"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <div />
              <button 
                onClick={() => moveBg(-10, 0)} 
                className="w-8 h-8 flex items-center justify-center bg-zinc-850 hover:bg-zinc-750 active:scale-95 rounded-md text-zinc-400 border border-zinc-700 select-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 flex items-center justify-center bg-zinc-950 rounded-md border border-zinc-850">
                <div className="w-1 h-1 bg-zinc-600 rounded-full" />
              </div>
              <button 
                onClick={() => moveBg(10, 0)} 
                className="w-8 h-8 flex items-center justify-center bg-zinc-850 hover:bg-zinc-750 active:scale-95 rounded-md text-zinc-400 border border-zinc-700 select-none transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div />
              <button 
                onClick={() => moveBg(0, 10)} 
                className="w-8 h-8 flex items-center justify-center bg-zinc-850 hover:bg-zinc-750 active:scale-95 rounded-md text-zinc-400 border border-zinc-700 select-none transition-all"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <div />
            </div>

            {/* Scale Controls */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => zoomBg(1.1)} 
                  className="flex-1 h-8 flex items-center justify-center bg-zinc-850 hover:bg-zinc-750 rounded-md text-zinc-400 border border-zinc-700 active:scale-95 transition-all gap-1 text-[10px] uppercase font-bold"
                >
                  <Plus className="w-3 h-3" /> Zoom
                </button>
                <button 
                  onClick={() => zoomBg(0.9)} 
                  className="flex-1 h-8 flex items-center justify-center bg-zinc-850 hover:bg-zinc-750 rounded-md text-zinc-400 border border-zinc-700 active:scale-95 transition-all gap-1 text-[10px] uppercase font-bold"
                >
                  <Minus className="w-3 h-3" /> Zoom
                </button>
              </div>
              <button 
                onClick={() => { setBgOffset({ x: 0, y: 0 }); setBgScale(1); }}
                className="w-full h-8 flex items-center justify-center bg-zinc-950 hover:bg-zinc-850 rounded-md text-zinc-500 border border-zinc-900 active:scale-95 transition-all text-[9px] uppercase font-bold tracking-tighter"
              >
                Restablecer Fondo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

