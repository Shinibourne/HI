/**
 * Generalized Contact & Constraint Framework.
 * Governs contacts between feet, hands, body, environment, ground, and objects.
 */

export type ContactState =
  | 'approaching'
  | 'contact'
  | 'compression'
  | 'planted'
  | 'sliding'
  | 'release'
  | 'separation';

export interface ContactPoint {
  id: string;
  boneIndex: number;
  state: ContactState;
  worldX: number;
  worldY: number;
  targetX?: number;
  targetY?: number;
  friction: number; // 0 (slick) to 1 (infinite grip)
  surfaceNormalY: number; // -1 for standard ground facing UP
  penetrationDepth: number;
  contactFrames: number;
}

export interface ContactConstraintConfig {
  groundY: number;
  tolerancePx?: number;
  allowSliding?: boolean;
}

export interface ContactSolveResult {
  updatedContacts: ContactPoint[];
  pelvisAdjustmentX: number;
  pelvisAdjustmentY: number;
  correctionsApplied: string[];
}

export class ContactSystem {
  private contacts: Map<string, ContactPoint> = new Map();

  /**
   * Registers or updates a contact point.
   */
  public updateContact(contact: ContactPoint): void {
    this.contacts.set(contact.id, { ...contact });
  }

  /**
   * Solves contact state machine and enforces world-space pinning.
   * "If this foot is planted, the body must move relative to that fixed contact."
   */
  public solveContacts(
    bodyPelvisX: number,
    bodyPelvisY: number,
    config: ContactConstraintConfig
  ): ContactSolveResult {
    const groundY = config.groundY;
    const tolerance = config.tolerancePx ?? 1.5;
    let pelvisAdjX = 0;
    let pelvisAdjY = 0;
    const corrections: string[] = [];
    const updated: ContactPoint[] = [];

    for (const [id, c] of this.contacts.entries()) {
      const cur = { ...c };

      // State machine transitions based on distance to ground
      const distToGround = groundY - cur.worldY;

      if (cur.state === 'approaching' && distToGround <= tolerance && distToGround >= -tolerance) {
        cur.state = 'contact';
        cur.contactFrames = 0;
        corrections.push(`Contact ${id} transitioned from approaching -> contact at Y=${cur.worldY.toFixed(1)}`);
      } else if (cur.state === 'contact') {
        cur.state = 'compression';
        cur.contactFrames = 1;
      } else if (cur.state === 'compression' && cur.contactFrames >= 1) {
        cur.state = 'planted';
      } else if (cur.state === 'planted') {
        cur.contactFrames++;

        // Penetration correction: if below ground plane, elevate foot and shift pelvis upward if needed
        if (cur.worldY > groundY + 0.1) {
          const penetration = cur.worldY - groundY;
          cur.worldY = groundY;
          cur.penetrationDepth = 0;
          pelvisAdjY -= penetration * 0.5; // elevate pelvis to relieve leg compression
          corrections.push(`Contact ${id} ground penetration of ${penetration.toFixed(1)}px corrected.`);
        }

        // Sliding check: if planted, lock worldX to targetX
        if (cur.targetX !== undefined && Math.abs(cur.worldX - cur.targetX) > 0.5 && !config.allowSliding) {
          const slideErr = cur.worldX - cur.targetX;
          cur.worldX = cur.targetX;
          corrections.push(`Contact ${id} foot sliding of ${slideErr.toFixed(1)}px locked to target.`);
        }
      } else if (cur.state === 'release' || distToGround > tolerance * 5) {
        cur.state = 'separation';
        cur.contactFrames = 0;
      }

      this.contacts.set(id, cur);
      updated.push(cur);
    }

    return {
      updatedContacts: updated,
      pelvisAdjustmentX: pelvisAdjX,
      pelvisAdjustmentY: pelvisAdjY,
      correctionsApplied: corrections,
    };
  }

  public getContact(id: string): ContactPoint | undefined {
    return this.contacts.get(id);
  }

  public getAllContacts(): ContactPoint[] {
    return Array.from(this.contacts.values());
  }
}
