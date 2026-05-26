import React from "react";
import { PostureState, JointRotation, INITIAL_POSTURE } from "../types";
import { Settings2, RotateCcw } from "lucide-react";

export interface JointConfig {
  id: keyof PostureState;
  label: string;
  axis: keyof JointRotation;
  min: number;
  max: number;
  color?: string;
}

interface ControlsProps {
  title: string;
  side: "left" | "right";
  joints: JointConfig[];
  posture: PostureState;
  onChange: (newPosture: PostureState) => void;
  children?: React.ReactNode;
}

export const Controls: React.FC<ControlsProps> = ({ title, side, joints, posture, onChange, children }) => {
  const updateJoint = (joint: keyof PostureState, axis: keyof JointRotation, value: string) => {
    const numValue = parseFloat(value);
    const currentJoint = posture[joint];
    
    if (typeof currentJoint === "object") {
      onChange({
        ...posture,
        [joint]: {
          ...currentJoint,
          [axis]: numValue,
        },
      });
    }
  };

  const resetJoint = (joint: keyof PostureState, axis: keyof JointRotation) => {
    const defaultValue = (INITIAL_POSTURE[joint] as any)[axis];
    const currentJoint = posture[joint];

    if (typeof currentJoint === "object") {
      onChange({
        ...posture,
        [joint]: {
          ...currentJoint,
          [axis]: defaultValue,
        },
      });
    }
  };

  const sideClass = side === "left" ? "left-6" : "right-6";

  return (
    <div className={`absolute ${sideClass} top-4 bottom-4 w-72 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800 p-4 flex flex-col gap-2.5 overflow-y-auto scrollbar-hide z-10 shadow-2xl`}>
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-1.5">
        <Settings2 className="w-4 h-4 text-blue-400" />
        <h2 className="font-semibold text-xs uppercase tracking-wider">{title}</h2>
      </div>

      <div className="space-y-2.5">
        {joints.map((joint) => (
          <div key={`${joint.id}-${joint.axis}`} className="space-y-0.5">
            <div className="flex justify-between items-center group/item">
              <div className="flex items-center gap-1.5">
                <label 
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: joint.color || "#a1a1aa" }}
                >
                  {joint.label}
                </label>
                <button
                  onClick={() => resetJoint(joint.id, joint.axis)}
                  className="p-0.5 hover:bg-zinc-800 rounded transition-all text-zinc-500 hover:text-white"
                  title="Restablecer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              </div>
              <span className="text-[8px] font-mono text-zinc-500 bg-zinc-800 px-1 py-0.5 rounded">
                {typeof posture[joint.id] === "object" ? ((posture[joint.id] as JointRotation)[joint.axis] * (180/Math.PI)).toFixed(1) : "0.0"}°
              </span>
            </div>
            <input
              type="range"
              min={joint.min}
              max={joint.max}
              step="0.01"
              value={typeof posture[joint.id] === "object" ? (posture[joint.id] as JointRotation)[joint.axis] : 0}
              onChange={(e) => updateJoint(joint.id, joint.axis, e.target.value)}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer transition-all outline-none"
              style={{ accentColor: joint.color || "#3b82f6" } as React.CSSProperties}
            />
          </div>
        ))}
      </div>
      
      {children && (
        <div className="mt-1 pt-3 border-t border-zinc-800 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};
