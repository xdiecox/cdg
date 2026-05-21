import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PostureState } from "../types";

interface HumanoidProps {
  posture: PostureState;
  onCoGUpdate: (cog: THREE.Vector3) => void;
}

export const Humanoid: React.FC<HumanoidProps> = ({ posture, onCoGUpdate }) => {
  const groupRef = useRef<THREE.Group>(null);
  const segmentsRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Mass distribution (approximate percentage)
  const masses = {
    head: 0.08,
    torso: 0.46,
    lUpperArm: 0.03,
    lLowerArm: 0.015,
    lHand: 0.005,
    rUpperArm: 0.03,
    rLowerArm: 0.015,
    rHand: 0.005,
    lUpperLeg: 0.11,
    lLowerLeg: 0.05,
    lFoot: 0.02,
    rUpperLeg: 0.11,
    rLowerLeg: 0.05,
    rFoot: 0.02,
  };

  useFrame(() => {
    if (!groupRef.current) return;

    const cog = new THREE.Vector3(0, 0, 0);
    let totalMass = 0;

    segmentsRef.current.forEach((mesh, name) => {
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const mass = masses[name as keyof typeof masses] || 0;
      cog.add(worldPos.multiplyScalar(mass));
      totalMass += mass;
    });

    if (totalMass > 0) {
      onCoGUpdate(cog.divideScalar(totalMass));
    }
  });

  const registerSegment = (name: string) => (el: THREE.Mesh | null) => {
    if (el) segmentsRef.current.set(name, el);
    else segmentsRef.current.delete(name);
  };

  const Bone = ({ length, width = 0.02, color = "#ffffff", name }: { length: number, width?: number, color?: string, name: string }) => (
    <mesh ref={registerSegment(name)} position={[0, -length/2, 0]}>
      <boxGeometry args={[width, length, width]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );

  const Joint = ({ color = "#00f2ff" }: { color?: string }) => (
    <group>
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      {/* Back marker dot */}
      <mesh position={[0, 0, -0.04]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );

  const colors = {
    torso: "#3b82f6",
    head: "#ef4444",
    rightArm: "#facc15",
    leftArm: "#f97316",
    rightLeg: "#ec4899",
    leftLeg: "#8b5cf6",
  };

  const calculateGroundingOffset = () => {
    // Coordinated squat angles
    const s = posture.squat;
    const qH = posture.rightHip.x + s * 1.4;
    const qK = posture.rightKnee.x + s * 2.4;
    // Simple trig for height difference
    // Standing height is 1.0 (0.5+0.5)
    // Current height is 0.5 * cos(qH) + 0.5 * cos(qK - qH)
    const currentHeight = 0.5 * Math.cos(qH) + 0.5 * Math.cos(qK - qH);
    return -(1.0 - currentHeight);
  };

  const groundingOffset = calculateGroundingOffset();
  
  const anklePivotY = -0.3;
  const kneePivotY = 0.2;
  
  const aLean = posture.ankleLean;
  const kLean = posture.kneeLean;

  // Ankle pivot world correction
  const ankleRotOffset = new THREE.Vector3(0, anklePivotY, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), aLean);
  const aLeanCorrY = anklePivotY - ankleRotOffset.y;
  const aLeanCorrZ = -ankleRotOffset.z;

  // Knee pivot correction (now relative to ankle-rotated space)
  const kneeRelToAnkleY = kneePivotY - anklePivotY; // 0.5
  const kneeRotOffset = new THREE.Vector3(0, kneeRelToAnkleY, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), kLean);
  const kLeanCorrY = (kneeRelToAnkleY - kneeRotOffset.y);
  const kLeanCorrZ = -kneeRotOffset.z;

  return (
    <group 
      ref={groupRef} 
      position={[0, -0.6 + groundingOffset + aLeanCorrY, aLeanCorrZ]}
      rotation={[aLean, 0, 0]}
    >
      {/* Root of the skeleton after ankle pivot */}
      <group 
        position={[0, kLeanCorrY, kLeanCorrZ]}
        rotation={[kLean, 0, 0]}
      >
        {/* Torso Skeleton Frame */}
        <group position={[0, 1, 0]}>
          {/* Hip horizontal bar */}
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.02]} />
            <meshStandardMaterial color={colors.torso} emissive={colors.torso} emissiveIntensity={0.4} />
          </mesh>

          {/* Leaning Upper Body from Hip Pivot */}
          <group position={[0, -0.3, 0]} rotation={[posture.hipLean, 0, 0]}>
            {/* Shoulder horizontal bar */}
            <mesh position={[0, 0.6, 0]}>
              <boxGeometry args={[0.5, 0.02, 0.02]} />
              <meshStandardMaterial color={colors.torso} emissive={colors.torso} emissiveIntensity={0.4} />
            </mesh>
            {/* Spine / Central torso registration for CoG */}
            <mesh ref={registerSegment("torso")} position={[0, 0.3, 0]}>
              <boxGeometry args={[0.01, 0.6, 0.01]} />
              <meshStandardMaterial color={colors.torso} transparent opacity={0} />
            </mesh>
            
            {/* Vertical torso bones */}
            <mesh position={[0.15, 0.3, 0]}>
              <boxGeometry args={[0.02, 0.6, 0.02]} />
              <meshStandardMaterial color={colors.torso} emissive={colors.torso} emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[-0.15, 0.3, 0]}>
              <boxGeometry args={[0.02, 0.6, 0.02]} />
              <meshStandardMaterial color={colors.torso} emissive={colors.torso} emissiveIntensity={0.4} />
            </mesh>

            {/* Neck & Head Skeleton */}
            <group position={[0, 0.6, 0]} rotation={[posture.neck.x, posture.neck.y, posture.neck.z]}>
              <Joint color={colors.head} />
              <mesh position={[0, 0.05, 0]} ref={registerSegment("head")}>
                 <boxGeometry args={[0.02, 0.1, 0.02]} />
                 <meshStandardMaterial color={colors.head} emissive={colors.head} emissiveIntensity={0.5} />
              </mesh>
              {/* Head Sphere Outline */}
              <group position={[0, 0.25, 0]}>
                <mesh>
                  <sphereGeometry args={[0.12, 16, 16]} />
                  <meshStandardMaterial color={colors.head} wireframe transparent opacity={0.4} emissive={colors.head} emissiveIntensity={0.2} />
                </mesh>
                <Joint color={colors.head} />
              </group>
            </group>

            {/* Right Arm (Screen Left) - Yellow */}
            <group position={[-0.25, 0.6, 0]} rotation={[posture.rightShoulder.x, posture.rightShoulder.y, posture.rightShoulder.z]}>
              <Joint color={colors.rightArm} />
              <Bone name="rUpperArm" length={0.4} color={colors.rightArm} />
              
              <group position={[0, -0.4, 0]} rotation={[posture.rightElbow.x, posture.rightElbow.y, posture.rightElbow.z]}>
                <Joint color={colors.rightArm} />
                <Bone name="rLowerArm" length={0.4} color={colors.rightArm} />
                <group position={[0, -0.4, 0]}>
                  <group position={[0, -0.05, 0]}>
                    <mesh ref={registerSegment("rHand")}>
                      <sphereGeometry args={[0.045, 8, 8]} />
                      <meshStandardMaterial color={colors.rightArm} emissive={colors.rightArm} emissiveIntensity={0.3} transparent opacity={0.6} />
                    </mesh>
                    <mesh position={[0, 0, -0.045]}>
                      <sphereGeometry args={[0.015, 8, 8]} />
                      <meshStandardMaterial color="#000000" />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>

            {/* Left Arm (Screen Right) - Orange */}
            <group position={[0.25, 0.6, 0]} rotation={[posture.leftShoulder.x, posture.leftShoulder.y, posture.leftShoulder.z]}>
              <Joint color={colors.leftArm} />
              <Bone name="lUpperArm" length={0.4} color={colors.leftArm} />
              
              <group position={[0, -0.4, 0]} rotation={[posture.leftElbow.x, posture.leftElbow.y, posture.leftElbow.z]}>
                <Joint color={colors.leftArm} />
                <Bone name="lLowerArm" length={0.4} color={colors.leftArm} />
                <group position={[0, -0.4, 0]}>
                  <group position={[0, -0.05, 0]}>
                    <mesh ref={registerSegment("lHand")}>
                      <sphereGeometry args={[0.045, 8, 8]} />
                      <meshStandardMaterial color={colors.leftArm} emissive={colors.leftArm} emissiveIntensity={0.3} transparent opacity={0.6} />
                    </mesh>
                    <mesh position={[0, 0, -0.045]}>
                      <sphereGeometry args={[0.015, 8, 8]} />
                      <meshStandardMaterial color="#000000" />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>
          </group>

          {/* Right Leg (Screen Left) - Pink */}
          <group position={[-0.15, -0.3, 0]} rotation={[posture.rightHip.x + posture.squat * 1.4, posture.rightHip.y, posture.rightHip.z]}>
            <Joint color={colors.rightLeg} />
            <Bone name="rUpperLeg" length={0.5} color={colors.rightLeg} />
            
            <group position={[0, -0.5, 0]} rotation={[posture.rightKnee.x + posture.squat * 2.4 - kLean, posture.rightKnee.y, posture.rightKnee.z]}>
              <Joint color={colors.rightLeg} />
              <Bone name="rLowerLeg" length={0.5} color={colors.rightLeg} />
              
              <group position={[0, -0.5, 0]} rotation={[posture.rightAnkle.x - posture.squat * 0.5 - aLean, posture.rightAnkle.y, posture.rightAnkle.z]}>
                <Joint color={colors.rightLeg} />
                <mesh ref={registerSegment("rFoot")} position={[0, -0.02, 0.05]}>
                  <boxGeometry args={[0.1, 0.02, 0.18]} />
                  <meshStandardMaterial color={colors.rightLeg} emissive={colors.rightLeg} emissiveIntensity={0.5} />
                </mesh>
                 {/* No heel point */}
               </group>
            </group>
          </group>

          {/* Left Leg (Screen Right) - Purple */}
          <group position={[0.15, -0.3, 0]} rotation={[posture.leftHip.x + posture.squat * 1.4, posture.leftHip.y, posture.leftHip.z]}>
            <Joint color={colors.leftLeg} />
            <Bone name="lUpperLeg" length={0.5} color={colors.leftLeg} />
            
            <group position={[0, -0.5, 0]} rotation={[posture.leftKnee.x + posture.squat * 2.4 - kLean, posture.leftKnee.y, posture.leftKnee.z]}>
              <Joint color={colors.leftLeg} />
              <Bone name="lLowerLeg" length={0.5} color={colors.leftLeg} />
              
              <group position={[0, -0.5, 0]} rotation={[posture.leftAnkle.x - posture.squat * 0.5 - aLean, posture.leftAnkle.y, posture.leftAnkle.z]}>
                <Joint color={colors.leftLeg} />
                <mesh ref={registerSegment("lFoot")} position={[0, -0.02, 0.05]}>
                  <boxGeometry args={[0.1, 0.02, 0.18]} />
                  <meshStandardMaterial color={colors.leftLeg} emissive={colors.leftLeg} emissiveIntensity={0.5} />
                </mesh>
                {/* No heel point */}
                </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
