
export interface JointRotation {
  x: number;
  y: number;
  z: number;
}

export interface PostureState {
  neck: JointRotation;
  leftShoulder: JointRotation;
  leftElbow: JointRotation;
  rightShoulder: JointRotation;
  rightElbow: JointRotation;
  leftHip: JointRotation;
  leftKnee: JointRotation;
  leftAnkle: JointRotation;
  rightHip: JointRotation;
  rightKnee: JointRotation;
  rightAnkle: JointRotation;
  squat: number;
  kneeLean: number;
  hipLean: number;
  ankleLean: number;
}

export const INITIAL_POSTURE: PostureState = {
  neck: { x: 0, y: 0, z: 0 },
  leftShoulder: { x: 0, y: 0, z: 0 },
  leftElbow: { x: 0, y: 0, z: 0 },
  rightShoulder: { x: 0, y: 0, z: 0 },
  rightElbow: { x: 0, y: 0, z: 0 },
  leftHip: { x: 0, y: 0, z: 0 },
  leftKnee: { x: 0, y: 0, z: 0 },
  leftAnkle: { x: 0, y: 0, z: 0 },
  rightHip: { x: 0, y: 0, z: 0 },
  rightKnee: { x: 0, y: 0, z: 0 },
  rightAnkle: { x: 0, y: 0, z: 0 },
  squat: 0,
  kneeLean: 0,
  hipLean: 0,
  ankleLean: 0,
};

export interface BodySegment {
  name: string;
  weight: number; // percentage of total mass
  length: number;
  width: number;
  color: string;
}
