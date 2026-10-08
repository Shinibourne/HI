export * from './stknds/stkndsCore';
export * from './stknds/stickfigureStructure';
export * from './stknds/superheroAnimation';
export * from './stknds/sneezeAnimation';
export * from './stknds/bounceAnimation';
export * from './stknds/teleportAnimation';

export {
  type SpeedVsStrengthGeneratorConfig,
  type SpeedVsStrengthKeyframeSpec,
  CANONICAL_36_SPEED_VS_STRENGTH_FRAMES,
  buildAdjustedSpeedStrengthFrames,
  synthesizeSpeedStrengthStknds,
} from './speedVsStrengthFrames';

export {
  type PhantomShadowboxGeneratorConfig,
  type PhantomShadowboxKeyframeSpec,
  type StoryboardPanelMeta,
  STORYBOARD_PANELS,
  CANONICAL_75_PHANTOM_FRAMES,
  CANONICAL_40_PHANTOM_FRAMES,
  buildAdjustedPhantomFrames,
  synthesizePhantomShadowboxStknds,
} from './phantomShadowboxFrames';
