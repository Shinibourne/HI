/**
 * AUTO-GENERATED LIVING SKILLS CATALOG
 * Produced by Stick Nodes Animation Intelligence Subsystem
 */

import { LivingSkill } from '../intelligence/types';

export const LIVING_SKILLS_CATALOG: LivingSkill[] = [
  {
    "id": "skill_living_tech_ground_balance_shift",
    "name": "Living Skill: Dynamic Foot Contact & COM Shift",
    "version": "v1.2.0",
    "category": "balance",
    "description": "Alternating foot contact with Center of Mass progression dynamically mined across 2 reference projects.",
    "extractedFromTechniqueIds": [
      "tech_ground_balance_shift"
    ],
    "confidence": 0.7000000000000002,
    "parameters": {
      "plantedFootMaxSpeed": 179,
      "comMarginThreshold": 50,
      "kneeFlexionAngleDeg": 25,
      "verifiedByMasterSuite": true,
      "crouchHoldFrames": 3,
      "jabExtensionSnap": 2
    },
    "prerequisites": [
      "foot-contact-detection",
      "com-calculation"
    ],
    "timingProfile": {
      "id": "tp_ground_balance",
      "name": "Dynamic Ground Balance",
      "anticipationFrames": 2,
      "accelerationFrames": 4,
      "impactFrames": 1,
      "recoilFrames": 2,
      "recoveryFrames": 5,
      "holdFrames": 0,
      "totalDurationFrames": 14,
      "spacingProfile": "ease-in-out"
    },
    "bodyRelationships": [
      "Planted support foot anchors in world space while COM progresses and swing limb flexes.",
      "Kinetic chain propagation down 17-bone stickfigure tree",
      "COM support stability check"
    ],
    "provenance": [
      {
        "type": "raw-observation",
        "id": "obs_tech_ground_balance_shift_proj_8f17898ad0a0",
        "label": "Observation from proj_8f17898ad0a0",
        "sourceProjectIds": [
          "proj_8f17898ad0a0"
        ],
        "evidenceDetails": "Direct motion forensics and semantic events extracted from project proj_8f17898ad0a0",
        "confidenceScore": 0.9,
        "childNodeIds": [
          "pattern_tech_ground_balance_shift"
        ],
        "parentNodeIds": []
      },
      {
        "type": "raw-observation",
        "id": "obs_tech_ground_balance_shift_proj_842d304bdf64",
        "label": "Observation from proj_842d304bdf64",
        "sourceProjectIds": [
          "proj_842d304bdf64"
        ],
        "evidenceDetails": "Direct motion forensics and semantic events extracted from project proj_842d304bdf64",
        "confidenceScore": 0.9,
        "childNodeIds": [
          "pattern_tech_ground_balance_shift"
        ],
        "parentNodeIds": []
      },
      {
        "type": "inferred-pattern",
        "id": "pattern_tech_ground_balance_shift",
        "label": "Pattern: Dynamic Foot Contact & COM Shift",
        "sourceProjectIds": [
          "proj_8f17898ad0a0",
          "proj_842d304bdf64"
        ],
        "evidenceDetails": "Inferred recurring kinetic relationship across 2 projects",
        "confidenceScore": 0.6000000000000001,
        "childNodeIds": [
          "principle_tech_ground_balance_shift"
        ],
        "parentNodeIds": [
          "obs_tech_ground_balance_shift_proj_8f17898ad0a0",
          "obs_tech_ground_balance_shift_proj_842d304bdf64"
        ]
      },
      {
        "type": "generalized-principle",
        "id": "principle_tech_ground_balance_shift",
        "label": "Principle: BALANCE - Dynamic Foot Contact & COM Shift",
        "sourceProjectIds": [
          "proj_8f17898ad0a0",
          "proj_842d304bdf64"
        ],
        "evidenceDetails": "Generalized biomechanical principle applicable to procedural stickfigure generation",
        "confidenceScore": 0.6000000000000001,
        "childNodeIds": [
          "skill_living_tech_ground_balance_shift"
        ],
        "parentNodeIds": [
          "pattern_tech_ground_balance_shift"
        ]
      }
    ],
    "validationHistory": [
      {
        "timestamp": "2026-10-09T04:25:21.119Z",
        "score": 60,
        "passed": true,
        "notes": "Initial synthesis from 2 reference projects"
      },
      {
        "timestamp": "2026-10-09T04:25:21.119Z",
        "score": 95,
        "passed": true,
        "notes": "Validated in master test suite"
      },
      {
        "timestamp": "2026-10-09T04:25:21.192Z",
        "score": 92,
        "passed": true,
        "notes": "Automated self-improvement iteration for Self_Improvement_Final"
      }
    ],
    "implementationHooks": [
      {
        "generatorName": "phantomShadowboxFrames",
        "methodName": "buildAdjustedPhantomFrames"
      },
      {
        "generatorName": "speedVsStrengthFrames",
        "methodName": "buildAdjustedSpeedStrengthFrames"
      },
      {
        "generatorName": "proceduralKinematics",
        "methodName": "applyBiomechanicalPhysics"
      }
    ]
  },
  {
    "id": "skill_living_tech_impact_compression",
    "name": "Living Skill: Impact Compression & Secondary Recoil",
    "version": "v1.2.0",
    "category": "impact",
    "description": "High-energy contact creates immediate compression along kinetic chain (avg force: 28668) followed by delayed recoil.",
    "extractedFromTechniqueIds": [
      "tech_impact_compression"
    ],
    "confidence": 0.8400000000000001,
    "parameters": {
      "compressionDampingFactor": 0.82,
      "cameraShakeThreshold": 14334,
      "recoilLagFrames": 2,
      "verifiedByMasterSuite": true,
      "crouchHoldFrames": 3,
      "jabExtensionSnap": 2
    },
    "prerequisites": [
      "impact-detection",
      "kinetic-chain-propagation"
    ],
    "timingProfile": {
      "id": "tp_impact_compression",
      "name": "Dynamic Snap & Settle",
      "anticipationFrames": 3,
      "accelerationFrames": 2,
      "impactFrames": 1,
      "recoilFrames": 3,
      "recoveryFrames": 6,
      "holdFrames": 1,
      "totalDurationFrames": 16,
      "spacingProfile": "snap-and-settle"
    },
    "bodyRelationships": [
      "Contact node decelerates sharply -> torso and spine compress -> secondary arm/head follow-through.",
      "Kinetic chain propagation down 17-bone stickfigure tree",
      "COM support stability check"
    ],
    "provenance": [
      {
        "type": "raw-observation",
        "id": "obs_tech_impact_compression_proj_8f17898ad0a0",
        "label": "Observation from proj_8f17898ad0a0",
        "sourceProjectIds": [
          "proj_8f17898ad0a0"
        ],
        "evidenceDetails": "Direct motion forensics and semantic events extracted from project proj_8f17898ad0a0",
        "confidenceScore": 0.9,
        "childNodeIds": [
          "pattern_tech_impact_compression"
        ],
        "parentNodeIds": []
      },
      {
        "type": "raw-observation",
        "id": "obs_tech_impact_compression_proj_842d304bdf64",
        "label": "Observation from proj_842d304bdf64",
        "sourceProjectIds": [
          "proj_842d304bdf64"
        ],
        "evidenceDetails": "Direct motion forensics and semantic events extracted from project proj_842d304bdf64",
        "confidenceScore": 0.9,
        "childNodeIds": [
          "pattern_tech_impact_compression"
        ],
        "parentNodeIds": []
      },
      {
        "type": "inferred-pattern",
        "id": "pattern_tech_impact_compression",
        "label": "Pattern: Impact Compression & Secondary Recoil",
        "sourceProjectIds": [
          "proj_8f17898ad0a0",
          "proj_842d304bdf64"
        ],
        "evidenceDetails": "Inferred recurring kinetic relationship across 2 projects",
        "confidenceScore": 0.74,
        "childNodeIds": [
          "principle_tech_impact_compression"
        ],
        "parentNodeIds": [
          "obs_tech_impact_compression_proj_8f17898ad0a0",
          "obs_tech_impact_compression_proj_842d304bdf64"
        ]
      },
      {
        "type": "generalized-principle",
        "id": "principle_tech_impact_compression",
        "label": "Principle: IMPACT - Impact Compression & Secondary Recoil",
        "sourceProjectIds": [
          "proj_8f17898ad0a0",
          "proj_842d304bdf64"
        ],
        "evidenceDetails": "Generalized biomechanical principle applicable to procedural stickfigure generation",
        "confidenceScore": 0.74,
        "childNodeIds": [
          "skill_living_tech_impact_compression"
        ],
        "parentNodeIds": [
          "pattern_tech_impact_compression"
        ]
      }
    ],
    "validationHistory": [
      {
        "timestamp": "2026-10-09T04:25:21.119Z",
        "score": 74,
        "passed": true,
        "notes": "Initial synthesis from 2 reference projects"
      },
      {
        "timestamp": "2026-10-09T04:25:21.119Z",
        "score": 95,
        "passed": true,
        "notes": "Validated in master test suite"
      },
      {
        "timestamp": "2026-10-09T04:25:21.193Z",
        "score": 92,
        "passed": true,
        "notes": "Automated self-improvement iteration for Self_Improvement_Final"
      }
    ],
    "implementationHooks": [
      {
        "generatorName": "phantomShadowboxFrames",
        "methodName": "buildAdjustedPhantomFrames"
      },
      {
        "generatorName": "speedVsStrengthFrames",
        "methodName": "buildAdjustedSpeedStrengthFrames"
      },
      {
        "generatorName": "proceduralKinematics",
        "methodName": "applyBiomechanicalPhysics"
      }
    ]
  },
  {
    "id": "skill_living_tech_anticipation_burst",
    "name": "Living Skill: Anticipatory Windup & Burst Acceleration",
    "version": "v1.2.0",
    "category": "locomotion",
    "description": "Body compresses in opposing direction before unleashing high-acceleration directional burst mined across 2 reference projects.",
    "extractedFromTechniqueIds": [
      "tech_anticipation_burst"
    ],
    "confidence": 0.7500000000000001,
    "parameters": {
      "anticipationScale": 0.15,
      "accelerationFactor": 2.4,
      "verifiedByMasterSuite": true,
      "crouchHoldFrames": 3,
      "jabExtensionSnap": 2
    },
    "prerequisites": [
      "com-acceleration-tracking"
    ],
    "timingProfile": {
      "id": "tp_anticipation_burst",
      "name": "Exponential Burst",
      "anticipationFrames": 4,
      "accelerationFrames": 3,
      "impactFrames": 1,
      "recoilFrames": 2,
      "recoveryFrames": 4,
      "holdFrames": 0,
      "totalDurationFrames": 14,
      "spacingProfile": "exponential-impact"
    },
    "bodyRelationships": [
      "Pelvis lowers and tilts backward -> limb stores kinetic potential -> rapid linear extension.",
      "Kinetic chain propagation down 17-bone stickfigure tree",
      "COM support stability check"
    ],
    "provenance": [
      {
        "type": "raw-observation",
        "id": "obs_tech_anticipation_burst_proj_8f17898ad0a0",
        "label": "Observation from proj_8f17898ad0a0",
        "sourceProjectIds": [
          "proj_8f17898ad0a0"
        ],
        "evidenceDetails": "Direct motion forensics and semantic events extracted from project proj_8f17898ad0a0",
        "confidenceScore": 0.9,
        "childNodeIds": [
          "pattern_tech_anticipation_burst"
        ],
        "parentNodeIds": []
      },
      {
        "type": "raw-observation",
        "id": "obs_tech_anticipation_burst_proj_842d304bdf64",
        "label": "Observation from proj_842d304bdf64",
        "sourceProjectIds": [
          "proj_842d304bdf64"
        ],
        "evidenceDetails": "Direct motion forensics and semantic events extracted from project proj_842d304bdf64",
        "confidenceScore": 0.9,
        "childNodeIds": [
          "pattern_tech_anticipation_burst"
        ],
        "parentNodeIds": []
      },
      {
        "type": "inferred-pattern",
        "id": "pattern_tech_anticipation_burst",
        "label": "Pattern: Anticipatory Windup & Burst Acceleration",
        "sourceProjectIds": [
          "proj_8f17898ad0a0",
          "proj_842d304bdf64"
        ],
        "evidenceDetails": "Inferred recurring kinetic relationship across 2 projects",
        "confidenceScore": 0.65,
        "childNodeIds": [
          "principle_tech_anticipation_burst"
        ],
        "parentNodeIds": [
          "obs_tech_anticipation_burst_proj_8f17898ad0a0",
          "obs_tech_anticipation_burst_proj_842d304bdf64"
        ]
      },
      {
        "type": "generalized-principle",
        "id": "principle_tech_anticipation_burst",
        "label": "Principle: LOCOMOTION - Anticipatory Windup & Burst Acceleration",
        "sourceProjectIds": [
          "proj_8f17898ad0a0",
          "proj_842d304bdf64"
        ],
        "evidenceDetails": "Generalized biomechanical principle applicable to procedural stickfigure generation",
        "confidenceScore": 0.65,
        "childNodeIds": [
          "skill_living_tech_anticipation_burst"
        ],
        "parentNodeIds": [
          "pattern_tech_anticipation_burst"
        ]
      }
    ],
    "validationHistory": [
      {
        "timestamp": "2026-10-09T04:25:21.119Z",
        "score": 65,
        "passed": true,
        "notes": "Initial synthesis from 2 reference projects"
      },
      {
        "timestamp": "2026-10-09T04:25:21.119Z",
        "score": 95,
        "passed": true,
        "notes": "Validated in master test suite"
      },
      {
        "timestamp": "2026-10-09T04:25:21.193Z",
        "score": 92,
        "passed": true,
        "notes": "Automated self-improvement iteration for Self_Improvement_Final"
      }
    ],
    "implementationHooks": [
      {
        "generatorName": "phantomShadowboxFrames",
        "methodName": "buildAdjustedPhantomFrames"
      },
      {
        "generatorName": "speedVsStrengthFrames",
        "methodName": "buildAdjustedSpeedStrengthFrames"
      },
      {
        "generatorName": "proceduralKinematics",
        "methodName": "applyBiomechanicalPhysics"
      }
    ]
  }
];

export function getLivingSkillById(id: string): LivingSkill | undefined {
  return LIVING_SKILLS_CATALOG.find((s) => s.id === id);
}

export function getLivingSkillParameters(id: string): Record<string, number | string | boolean> {
  const skill = getLivingSkillById(id);
  return skill ? skill.parameters : {};
}
