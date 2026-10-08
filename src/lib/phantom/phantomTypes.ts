export interface StoryboardPanelMeta {
  panelNumber: number;
  title: string;
  frameRangeStr: string;
  startFrame: number;
  endFrame: number;
  actionSummary: string;
  visualCues: string[];
}

export interface PhantomShadowboxGeneratorConfig {
  projectName: string;
  targetFps: 12 | 24;
  interpolate24FpsFrames: boolean;
  primaryColorHex: string;
  headColorHex: string;
  stillnessHoldFrames: number;
  crouchHoldFrames: number;
  jabExtensionSnap: number;
}

export interface PhantomShadowboxKeyframeSpec {
  frame: number;
  storyboardPanel: number;
  storyboardLabel: string;
  act: string;
  phase: string;
  isTeleportBlank: boolean;
  sceneX: number;
  sceneY: number;
  worldAngles: number[];
  facingDirection: 'center' | 'left' | 'right';
  contactGroundY?: number;
  screenShake?: boolean;
  teleportEffect?: 'boom' | 'dissipation';
  actionSmear?: 'axe_kick' | 'punch_snap';
  notes: string;
}
