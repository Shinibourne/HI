/**
 * STICK NODES ANIMATION INTELLIGENCE
 * Core Domain Interfaces and Type Definitions
 */

export type CorpusProjectCategory =
  | 'reference'
  | 'template'
  | 'generated'
  | 'test'
  | 'experimental'
  | 'malformed'
  | 'unsupported';

export interface CharacterHierarchyNode {
  index: number;
  uid: number;
  name?: string;
  parentIndex: number;
  childrenIndices: number[];
  role?: 'root' | 'torso' | 'head' | 'pelvis' | 'arm' | 'leg' | 'hand' | 'foot' | 'prop' | 'secondary';
  length: number;
  thickness: number;
}

export interface CharacterStructureProfile {
  figureName: string;
  nodeCount: number;
  nodes: CharacterHierarchyNode[];
  rootIndex: number;
  headIndex?: number;
  pelvisIndex?: number;
  leftHandIndex?: number;
  rightHandIndex?: number;
  leftFootIndex?: number;
  rightFootIndex?: number;
  kineticChains: {
    name: string;
    jointIndices: number[];
  }[];
}

export interface ProjectMetadata {
  id: string;
  fileName: string;
  filePath: string;
  sha256: string;
  projectName: string;
  fps: number;
  tweenedFrames: number;
  frameCount: number;
  durationSeconds: number;
  category: CorpusProjectCategory;
  characterCount: number;
  characters: CharacterStructureProfile[];
  hasCameraData: boolean;
  hasAudioData: boolean;
  fileSizeBytes: number;
  decompressedSizeBytes: number;
  analyzedAt: string;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface NodeMotionState {
  nodeIndex: number;
  worldPosition: Point2D;
  localPosition: Point2D;
  worldAngle: number;
  localAngle: number;
  angleDelta: number;
  velocity: Vector2D;
  speed: number;
  acceleration: Vector2D;
  accelerationMagnitude: number;
  angularVelocity: number;
  angularAcceleration: number;
}

export interface CenterOfMassState {
  position: Point2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  speed: number;
}

export interface SupportPolygonState {
  supportType: 'double-leg' | 'single-leg' | 'airborne' | 'ground-contact-other' | 'unstable';
  groundY: number;
  plantedFeetIndices: number[];
  movingFeetIndices: number[];
  supportCenter: Point2D;
  comMarginOfStability: number;
}

export interface FrameMotionForensics {
  frameIndex: number;
  timeSeconds: number;
  figureInstances: {
    instanceIndex: number;
    rootPosition: Point2D;
    rootVelocity: Vector2D;
    centerOfMass: CenterOfMassState;
    supportState: SupportPolygonState;
    nodes: NodeMotionState[];
  }[];
  cameraState?: {
    x: number;
    y: number;
    zoom: number;
    velocity: Vector2D;
    shakeMagnitude: number;
  };
}

export type MotionEventType =
  | 'foot-contact'
  | 'foot-liftoff'
  | 'hand-contact'
  | 'impact'
  | 'compression'
  | 'extension'
  | 'recoil'
  | 'recovery'
  | 'anticipation'
  | 'acceleration-burst'
  | 'deceleration-stop'
  | 'apex-height'
  | 'directional-change'
  | 'camera-shake'
  | 'sfx-trigger';

export interface SemanticMotionEvent {
  id: string;
  projectId: string;
  frameIndex: number;
  timeSeconds: number;
  eventType: MotionEventType;
  primaryBodyPart?: string;
  affectedJointIndices?: number[];
  description: string;
  magnitude: number;
  kinematicContext: {
    comVelocity: Vector2D;
    supportType: string;
    leadLimb?: string;
    secondaryMotionDetected: boolean;
  };
}

export interface TimingSpacingProfile {
  id: string;
  name: string;
  anticipationFrames: number;
  accelerationFrames: number;
  impactFrames: number;
  recoilFrames: number;
  recoveryFrames: number;
  holdFrames: number;
  totalDurationFrames: number;
  spacingProfile: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'snap-and-settle' | 'exponential-impact';
}

export interface KnowledgeProvenanceNode {
  type: 'raw-observation' | 'inferred-pattern' | 'generalized-principle' | 'skill' | 'implementation';
  id: string;
  label: string;
  sourceProjectIds: string[];
  evidenceDetails: string;
  confidenceScore: number; // 0.0 to 1.0
  childNodeIds: string[];
  parentNodeIds: string[];
}

export interface ExtractedTechnique {
  id: string;
  name: string;
  category: 'locomotion' | 'combat' | 'impact' | 'falling' | 'balance' | 'secondary-motion' | 'camera' | 'style';
  description: string;
  prerequisites: string[];
  applicableSituations: string[];
  timingProfile: TimingSpacingProfile;
  bodyMechanicsPattern: string;
  parameters: Record<string, number | string | boolean>;
  variations: string[];
  confidence: number;
  supportingProjectIds: string[];
  limitations: string[];
  implementationNotes: string;
}

export interface LivingSkill {
  id: string;
  name: string;
  version: string; // e.g. "v1.2.0"
  category: string;
  description: string;
  extractedFromTechniqueIds: string[];
  confidence: number;
  parameters: Record<string, number | string | boolean>;
  prerequisites: string[];
  timingProfile: TimingSpacingProfile;
  bodyRelationships: string[];
  provenance: KnowledgeProvenanceNode[];
  validationHistory: {
    timestamp: string;
    score: number;
    passed: boolean;
    notes: string;
  }[];
  implementationHooks: {
    generatorName: string;
    methodName: string;
  }[];
}

export interface CategoryAuditScore {
  category:
    | 'timing'
    | 'spacing'
    | 'weight'
    | 'balance'
    | 'footContact'
    | 'torsoMechanics'
    | 'armMechanics'
    | 'headBehavior'
    | 'impact'
    | 'secondaryMotion'
    | 'camera'
    | 'sfxTiming';
  score: number; // 0 to 100
  weight: number;
  issues: string[];
  strengths: string[];
}

export interface QualityReport {
  id: string;
  targetAnimationName: string;
  overallScore: number;
  categoryScores: CategoryAuditScore[];
  primaryIssues: string[];
  recommendedSkillsToApply: string[];
  suggestedParameterTweaks: Record<string, number | string>;
  createdAt: string;
}

export interface CorpusCatalog {
  generatedAt: string;
  totalProjectsScanned: number;
  analyzedProjects: ProjectMetadata[];
  malformedProjects: { filePath: string; reason: string }[];
  categoriesCount: Record<CorpusProjectCategory, number>;
}
