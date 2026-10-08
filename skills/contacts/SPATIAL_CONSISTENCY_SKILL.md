---
name: "spatial-consistency-and-character-interaction"
version: "1.0.0"
description: >-
  Universal Spatial Consistency, Elevation, Ground Plane, and Character Interaction
  Framework for multi-character Stick Nodes (.stknds), 2D skeletal animation, and
  procedural scenes. Enforces shared world coordinates, master scene references,
  interaction anchors, contact collision precision, and export-roundtrip fidelity.
---

# Spatial Consistency, Elevation & Character Interaction Framework

## 1. Core Mandate & Automatic Usage Rule

**This skill is NOT an optional post-export cleanup tool — it is the foundational spatial constitution governing all multi-character and environmental animation.**

Whenever an animation contains:
- More than one character (e.g. Attacker and Defender, allies walking together),
- Environmental surfaces (ground plane, elevated platforms, stairs, ledges),
- Props, weapons, or projectiles,
- Physical interactions (strikes, blocks, grabs, throws, collisions, object passes),

the system **MUST automatically activate the Spatial Consistency & Character Interaction pipeline** before authoring or synthesizing any frame.

### The Import-Roundtrip Law
> **The Golden Law**: An animation is NEVER correct simply because each character's isolated joints move plausibly. The animation is correct ONLY when all characters and objects occupy the intended shared physical coordinates relative to each other, such that upon downloading the `.stknds` project and importing it into Stick Nodes, all characters stand on the same ground plane and all attacks physically connect.

---

## 2. The 10 Core Architectural Pillars

### Pillar 1: Shared World Space
- All characters, props, camera frames, and environmental surfaces exist in **ONE unified global coordinate system**.
- Never author Character A around a local `(0, 0)` origin and Character B around a different arbitrary local origin.
- In the Stick Nodes v334 standard viewport:
  - Coordinate convention: Origin `(0, 0)` is top-left in screen space.
  - Horizontal axis: $+X$ extends to the Right.
  - Vertical axis: $+Y$ extends Downward; $-Y$ extends Upward.
  - Default Ground Plane: $Y_{\text{ground}} = 755.0\text{ px}$ (or explicitly defined platform level).
  - Scene Width $\times$ Height: $1280 \times 720$ (or $1920 \times 1080$).

### Pillar 2: Master Scene Reference Frame
Before animating any entity, establish the **Scene Reference Frame**:
$$\mathcal{S} = \{ Y_{\text{ground}}, X_{\text{center}}, Y_{\text{center}}, S_{\text{default}}, \mathcal{P}_{\text{platforms}}, \mathcal{Z}_{\text{interaction}}, \text{Cam}_{\text{default}} \}$$
- Every subsequent frame and character inherits $\mathcal{S}$.
- Components may never redefine their own private coordinate systems.

### Pillar 3: Ground Plane & Elevation Invariance
- Every grounded character must maintain an exact spatial relationship with the ground plane:
  $$P_{\text{foot\_contact}}.y \approx Y_{\text{ground}} \quad (\pm 2.0\text{ px})$$
- Zero vertical drifting across frames for standing, walking, or seated characters.
- Ballistic jumps must strictly return to the takeoff ground plane (or a designated target platform):
  $$\text{Ground} \to \text{Takeoff} \to \text{Ascent} \to \text{Apex} \to \text{Descent} \to \text{Touchdown} \to \text{Ground}$$

### Pillar 4: Character Root Hierarchy
Characters move through space via an explicit hierarchical transformation chain:
$$\text{World Coordinate Space} \to \text{Character Scene Root } (X_{\text{scene}}, Y_{\text{scene}}) \to \text{Pelvis (Node 0)} \to \text{Limbs} \to \text{Effectors}$$
- Individual limbs are articulated *relative* to the character body.
- Never translate individual extremities globally to fake character movement.

### Pillar 5: Character Scale Consistency
- All characters in a scene share a consistent scale ratio:
  $$\frac{S_{\text{character\_A}}}{S_{\text{character\_B}}} \approx 1.0 \quad (\pm 5\% \text{ unless deliberately stylized})$$
- Bone lengths, reach envelopes, and stride distances scale proportionally with character instance scale.

### Pillar 6: Relative Positioning & Spatial Solving
- Determine attack and interaction positions **relative to the target**, never as arbitrary disconnected screen coordinates:
  $$\vec{P}_{\text{effector}} = \vec{P}_{\text{target\_anchor}} + \vec{\delta}_{\text{contact}}$$
- For a punch: solve the attacker's body pose so that the attacker's fist reaches the defender's chest anchor.
- For a block: solve the defender's forearm so that it intersects the attacker's striking shin or fist in world space.

### Pillar 7: Interaction Anchor System
Every character defines 8 canonical anatomical interaction anchors:
1. `HEAD` (midpoint of Head circle / Node 13)
2. `CHEST` (terminus of Upper Chest / Node 8)
3. `PELVIS` (scene root / Pelvis Node 0)
4. `LEFT_HAND` (terminus of Left Forearm / Hand Node 16)
5. `RIGHT_HAND` (terminus of Right Forearm / Hand Node 11)
6. `LEFT_FOOT` (terminus of Left Shin / Foot Node 6)
7. `RIGHT_FOOT` (terminus of Right Shin / Foot Node 3)
8. `CENTER_OF_MASS` (whole-body weighted mass centroid)

Interactions are specified as explicit anchor-to-anchor relationships:
- **Punch**: `ATTACKER.RIGHT_HAND → TARGET.CHEST`
- **Low Sweep**: `ATTACKER.RIGHT_SHIN → TARGET.LEFT_SHIN`
- **Forearm Block**: `DEFENDER.RIGHT_FOREARM ↔ ATTACKER.RIGHT_SHIN`
- **Throw**: `ATTACKER.HANDS → TARGET.PELVIS`

### Pillar 8: Contact Precision & Collision Consistency
- At the frame of impact, the contact points must physically meet in world space:
  $$\|\vec{P}_{\text{striking\_effector}} - \vec{P}_{\text{target\_anchor}}\| \le \epsilon_{\text{contact}} \quad (\epsilon \le 18.0\text{ px})$$
- Zero phantom hits where an attack misses by 50 px while the defender flinches.
- Contact is reinforced by a 1–2 frame **hit-stop freeze** and equal-and-opposite momentum transfer.

### Pillar 9: Relative Motion Dynamics
When characters interact while moving, the interaction accounts for both bodies' velocities:
$$\vec{V}_{\text{relative}} = \vec{V}_{\text{attacker}} - \vec{V}_{\text{defender}}$$
- If the attacker advances while the defender retreats, the strike length and timing account for the expanding distance.

### Pillar 10: Camera vs World Movement Decoupling
- **World Movement**: Character translates in world space $(X_{\text{world}}, Y_{\text{world}})$.
- **Camera Movement**: Camera translates in viewport offset $(\text{Cam}_X, \text{Cam}_Y)$ and zoom $(\text{Cam}_{\text{zoom}})$.
- **Strict Prohibition**: Never bake camera panning or zooming into character world coordinates. When the camera whip-pans or zooms, character world coordinates remain stable.

---

## 3. The 10-Check Automated Spatial Validation Gate

Before synthesizing or exporting any `.stknds` binary, the system must execute the 10-Check Spatial Gate:

| Domain | Validation Check | Passing Threshold | Failure Consequence |
| :--- | :--- | :--- | :--- |
| **1. Ground Alignment** | Planted feet match scene ground elevation | $|P_{\text{foot}}.y - Y_{\text{ground}}| \le 2.0\text{ px}$ | Floating or sunken characters |
| **2. Elevation Compatibility** | Interacting entities share compatible surfaces | $|Y_{\text{surface\_A}} - Y_{\text{surface\_B}}| = 0$ (or valid jump delta) | Attacks passing over heads |
| **3. Scale Consistency** | Characters maintain uniform proportion ratio | $|S_A - S_B| \le 0.05$ | Lilliput / giant scaling bugs |
| **4. World Root Stability** | Character roots follow continuous trajectories | Max single-frame $\Delta \le 45\text{ px}$ (non-teleport) | Jittery positional snapping |
| **5. Reachability Envelope** | Target anchor is within attacker limb reach | $D_{\text{target}} \le L_1 + L_2$ | Hyperextended broken limbs |
| **6. Contact Precision** | Striking bone intersects target boundary | Distance $\le 18.0\text{ px}$ at clash frame | Phantom hits in empty air |
| **7. Relative Motion** | Momentum transfer reflects relative speed | Defender slide $\propto \|\vec{V}_{\text{rel}}\|$ | Unresponsive flinchless bodies |
| **8. Jump Landings** | Touchdown height equals target surface | Landing $Y = Y_{\text{surface}}$ | Sinking into ground after jumps |
| **9. Camera Isolation** | Character world coordinates decoupled from camera | Zero character jump on camera pan | Disorienting scene displacement |
| **10. Stick Nodes Roundtrip** | Exported offsets preserve physical layout in app | Verified byte container layout | Scene breaks upon app import |

---

## 4. Interaction-First Authoring Workflow

For multi-character sequences, authoring must follow this sequence:
1. **Define Master Scene**: Ground $Y = 755$, Center $X = 640$.
2. **Place Character Roots**: Assign starting positions on the shared ground plane.
3. **Define Interaction Event**: E.g., `KICK_CONTACT` at Frame 24 between Blue Right Shin and Red Right Forearm.
4. **Anchor Contact Target**: Set contact point at $X = 440, Y = 620$.
5. **Solve Attacker Limb via IK**: Attacker hip and leg solve to place Right Shin at contact point.
6. **Solve Defender Guard via IK**: Defender shoulder and forearm solve to place Right Forearm at contact point.
7. **Simulate Momentum Transfer**: Defender pelvis slides $+5.5\text{ px}$ and compresses downward $+2.0\text{ px}$.
8. **Verify Spatial Consistency**: Run 10-Check Gate; confirm 100% pass before binary packaging.
