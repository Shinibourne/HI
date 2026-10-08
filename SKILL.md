# Stick Nodes Animation Forge

## Purpose

Create **new, independently authored Stick Nodes animations** in `.stknds` format by reverse-engineering supplied working projects.

The supplied `.stknds` files are a **binary corpus/reference set**, not animation templates to copy. Their purpose is to reveal the file format, valid serialization, figure hierarchy, frame layout, node types, and application-compatible container structure.

The primary success criterion is:

> The resulting `.stknds` must open in Stick Nodes and visibly perform the requested animation. It must not merely pass a superficial binary validator.

---

## Core rules

### 1. Never confuse "valid bytes" with "working Stick Nodes project"

A file can:
- have the correct prefix,
- decompress,
- contain a plausible version,
- have plausible frame counts,
- and still fail to open in Stick Nodes.

Therefore validate at three levels:

1. **Container validation**
   - outer prefix
   - gzip
   - decompression
   - version/name metadata
   - file structure

2. **Semantic validation**
   - figure library parses
   - node hierarchy is internally consistent
   - frame records correspond to the expected node traversal
   - node types and lengths are valid

3. **Application behavior**
   - if possible, open in Stick Nodes and inspect/play the result
   - if app testing is unavailable, explicitly say so; never claim it was smoke-tested

---

## 2. Templates are references, not things to duplicate

The user may supply several `.stknds` files.

Do NOT:
- rename a template and return it;
- duplicate a template's animation;
- preserve the template's walking/takeoff/other motion and merely change appearance;
- assume that changing one node's type automatically creates a new animation.

DO:
- compare multiple working files;
- identify invariants;
- identify which bytes are figure-library data;
- identify which bytes are frame/pose data;
- identify which fields actually control the visible object;
- preserve only the minimum proven-good structure;
- author new frame positions from scratch.

The animation must be independently designed from the user's requested description.

---

## 3. Known Stick Nodes corpus facts

For the supplied Stick Nodes corpus, projects have shown:

- `.stknds` begins with a 9-byte prefix:
  `01 02 03 04 05 06 07 08 09`
- The remainder begins with GZIP.
- Decompressed project version observed in the corpus:
  `334`
- Project metadata begins with:
  - 32-bit big-endian version
  - 32-bit big-endian project-name length
  - project name
- One known-good project used:
  - 24 FPS
  - tweened frames value 5
- A known-good project (`project6`) had:
  - decompressed size 28969 bytes
  - frame count 22
  - frame data beginning at decompressed offset 2594
  - frame size 1197 bytes
  - frame header 167 bytes
  - 17 node records
  - each node record 58 bytes
  - 44-byte camera/footer region
- In those frame records:
  - scene X/Y were found at relative offsets 130/134
  - node traversal records stored X/Y at record-relative +4/+12
- These offsets are **corpus-specific observations**, not universal Stick Nodes constants. Confirm them against the actual supplied corpus before using them.

---

## 4. Embedded stickfigure serialization

A known v334 stickfigure header has been observed as:

- version: big-endian int32
- scale: float32
- color: 4 bytes
- recursive node serialization

A known figure in `project6` was found around decompressed offset 1116:

- name length = 17
- name = `MyBase(long foot)`
- version = 334
- scale = 1.0
- color = `ff000000`

Its node hierarchy contained 17 nodes.

Important: the figure hierarchy and the frame pose records are separate concepts.

A figure may contain a parent/child hierarchy such as:

```
root
 ├─ limb
 │   └─ ...
 ├─ limb
 │   └─ ...
 └─ body
     └─ ...
```

Changing or hiding one node does not necessarily remove the behavior of the hierarchy.

---

## 5. Node types and circles

The corpus and Stick Nodes reverse-engineering work established that native circle/fill node types exist.

A known node in the corpus was:
- node type `2`
- no children
- length around 180
- thickness around 2

A separate experiment established that a native filled-circle node type (`4` in the examined v334 serialization) can render as a ball when its serialization is otherwise valid.

Do not assume a numeric node type is universal without confirming it in the supplied corpus/tooling.

### Critical lesson

A "ball" can fail in several different ways:

- changing an existing node into a circle while leaving the rest of the stickfigure intact -> old figure remains visible;
- hiding nodes using alpha/color -> hierarchy may still affect rendering;
- deleting hierarchy nodes -> project may become unreadable by Stick Nodes;
- animating the wrong frame record -> ball remains static while some other node moves.

Therefore determine:

> Which exact figure node corresponds to the visible ball, and which exact per-frame record controls that node?

Prove this with controlled one-variable experiments before generating the final animation.

---

## 6. Minimal-change engineering

When a known-good project opens, prefer:

> mutate the smallest number of verified bytes possible.

Do not redesign the complete `.stknds` serialization unless the format has been reverse-engineered sufficiently to justify it.

Safe progression:

1. start from a known-good working file;
2. locate figure-library region;
3. locate target node;
4. prove target node renders;
5. locate target node's frame record;
6. move only that target node;
7. verify the visible result;
8. only then add squash/stretch, scale, or additional effects.

If a structural rewrite causes Stick Nodes to reject the project, revert to the last known-good structure.

---

## 7. How to discover the correct animated node

This is one of the most important procedures.

Do NOT assume traversal order equals the visible node you want.

Use controlled experiments:

### Experiment A — static identity
Make one candidate node visually distinctive:
- unique color,
- unique size,
- or unique position.

Open the project and identify what moved/changed.

### Experiment B — frame motion
Change only one candidate node's X coordinate in one frame by a large but safe amount.

If the visible object moves, that candidate's frame record controls it.

### Experiment C — hierarchy isolation
Do not delete nodes. Instead:
- freeze candidate nodes,
- collapse verified non-target geometry only after confirming the field semantics,
- keep hierarchy count and ordering unchanged.

The objective is to identify:

```
figure node ID -> traversal position -> frame record index
```

Only after this mapping is known should the animation generator write motion.

---

## 8. Authoring a bounce from scratch

A basic ball bounce should not be a random list of Y values.

Use intentional animation principles:

### Phase 1: contact
Ball starts near the ground.

### Phase 2: launch
Several frames move upward with increasing displacement.

### Phase 3: ascent
Vertical displacement decreases as the ball approaches its apex.

### Phase 4: apex
One or more frames are close together vertically to create a brief slow moment.

### Phase 5: fall
Vertical displacement increases downward toward impact.

### Phase 6: impact
Ball reaches the ground.

### Phase 7: rebound
A smaller second bounce can follow.

### Phase 8: settle
Return to contact/rest.

Example 22-frame conceptual normalized Y positions:

```
0, -18, -42, -70, -96, -115, -126, -130, -126, -112, -90,
-62, -30, 0, -42, -70, -84, -88, -82, -64, -34, 0
```

These are **design examples**, not byte offsets. Adapt them to the project's coordinate system and ground location.

For a polished bounce:
- impact should be fast;
- apex should be slower;
- second bounce should be smaller;
- final rest should visibly settle.

---

## 9. Squash and stretch

Only add squash/stretch after basic translation works.

A useful sequence:

- contact: wider + shorter
- launch: slightly tall
- ascent: near-normal
- apex: normal
- fall: slightly tall
- impact: wide + short
- rebound: moderately tall
- settle: normal

Do not change scale fields until they have been verified as per-frame or node-level scale fields.

If the ball moves correctly but its size does not change, first determine whether:
- scale is stored in the figure definition,
- scale is stored in the frame record,
- or scale is inherited from a parent node.

---

## 10. Building a new figure from scratch

Only do this when the serialization is sufficiently reverse-engineered.

A tempting but dangerous approach is:

```
root -> ball
```

created by deleting the old recursive hierarchy.

This previously produced unreadable projects.

Therefore:

- preserve the known-good hierarchy when possible;
- repurpose an existing leaf node when possible;
- do not remove nodes merely because they are visually unwanted;
- do not reorder recursive child counts without proving the serializer/parser behavior.

If a truly new figure is required, derive the exact serialization from:
- `.nodes` files,
- multiple known-good embedded figures,
- source implementations,
- and controlled import/export experiments.

---

## 11. `.nodes` assets

If the user asks for a specific Stick Nodes asset such as a ball:

1. search the official Stick Nodes asset site;
2. identify the asset;
3. if the actual `.nodes` bytes are available, inspect/import them;
4. if only a web page is available and the binary cannot be retrieved, do not pretend to have the asset bytes;
5. ask the user to upload the `.nodes` file when exact asset fidelity matters.

Official asset pages can be used as references, but a webpage describing an asset is not the same as possessing the asset binary.

---

## 12. Working with Claude

When this skill is handed to Claude, Claude should receive:

- this skill package;
- all known-good `.stknds` template/reference files;
- any `.nodes` assets supplied by the user;
- screenshots of Stick Nodes results when available.

Claude should inspect all templates before generating an animation.

Recommended workflow:

```
inventory files
    ↓
parse/decompress each project
    ↓
compare common structure
    ↓
identify figure library
    ↓
identify frame table
    ↓
map figure nodes to frame records
    ↓
perform one-node controlled experiment
    ↓
verify visible result
    ↓
choose minimum-change working base
    ↓
author new motion numerically
    ↓
write only verified fields
    ↓
validate container + semantics
    ↓
application smoke test if available
    ↓
deliver .stknds
```

---

## 13. Failure handling

If Stick Nodes says:

> "Sorry, Stick Nodes ran into an error while opening this project."

Do NOT respond by making increasingly large structural changes.

Instead:

1. compare the failed file byte structure with the last working file;
2. identify the smallest structural difference;
3. revert the last unproven mutation;
4. preserve the working container;
5. test one mutation at a time.

If the project opens but:
- the old figure remains -> figure hierarchy/geometry was not actually isolated;
- the ball is a dot -> wrong circle node/type/size field;
- the ball is static -> wrong frame record was animated;
- old animation remains -> old node/frame records are still visible or the wrong node was targeted;
- project opens but looks wrong -> inspect hierarchy transforms and traversal mapping.

---

## 14. Deliverable requirements

When the user asks for an animation, deliver:

1. a `.stknds` file;
2. a short description of what was independently created;
3. what known-good structure was preserved;
4. whether the file was actually opened/tested in Stick Nodes.

Never say "works" unless it has actually been confirmed.

---

## 15. Absolute prohibitions

Never:

- silently duplicate the user's animation;
- claim a modified template is a new animation when its motion was inherited;
- delete recursive nodes without proving the format;
- change many unknown offsets at once;
- trust a custom validator as proof of Stick Nodes compatibility;
- claim application testing that did not happen.

The user's core requirement is **independent animation creation using reverse-engineered knowledge**.

---

## 16. General-Purpose Procedural Animation Intelligence Architecture

### 16.1 The Universal Causal Pipeline
```
USER / NARRATIVE INTENT
    │
    ▼
MOTION INTENT & CAUSALITY (Phase state machine: Anticipation → Drive → Contact → Settle)
    │
    ▼
ACTION & TASK PLANNING (Locomotion, Lift, Push, Pull, Catch, Throw, Strike, Recover)
    │
    ▼
TEMPORAL TIMING (Non-linear easing, variable durations, spacing curves)
    │
    ┌─────────────────────────┴─────────────────────────┐
    ▼                                                   ▼
MASS, LOAD & TORQUE MODEL                           CONTACT & SUPPORT MECHANICS
(Relative mass μ, lever arms, rotational demand)   (Support states, zero slip, normal force)
    │                                                   │
    └─────────────────────────┬─────────────────────────┘
                              ▼
                  MOMENTUM & ANGULAR DYNAMICS
                  (Linear dP/dt, angular dL/dt, rotational inertia I, kinetic chain)
                              ▼
                  DYNAMIC BALANCE & COM EQUILIBRIUM
                  (XCoM Hof criterion, support polygon BoS, recovery strategies)
                              ▼
                  GENERAL MULTI-ENTITY INTERACTION
                  (Shared world coordinates, collision precision, hit-stop coincidence)
                              ▼
                  FULL-BODY FORCE REACTION
                  (Newton's 3rd law, pelvic-thoracic counter-twist, recoil)
                              ▼
                  ANALYTICAL KINEMATICS & IK
                  (Coupled 2-bone IK, knee 1-DOF polarity, anterior elbow limits)
                              ▼
                  SECONDARY MOTION & FOLLOW-THROUGH
                  (Inertial lag, damped harmonic decay, organic moving holds)
                              ▼
                  FRAME STATE GENERATION (Timestamped, fully articulated FrameState)
                              ▼
                  BIOMECHANICAL AUDIT GATE (7-Domain quantitative critic)
                  ┌───────────┴───────────┐
                  ▼                       ▼
                PASS                    FAIL
                  │                       │
                  ▼                       ▼
            .STKNDS EXPORT         CAUSAL REPAIR LOOP
```

### 16.2 Core vs. Domain-Specific Concepts
- **Core Primitives (Universal)**:
  - `Mass`: Normalized mass ratio $\mu = M_{obj} / M_{char}$
  - `Load`: Lever-arm torque demand $\vec{\tau} = \vec{r} \times \vec{F}$
  - `Contact`: Support states (`SWING`, `APPROACH`, `CONTACT`, `LOAD`, `PLANT`, `UNLOAD`, `RELEASE`)
  - `Momentum`: Linear momentum $P = Mv$, angular momentum $L = I\omega$, kinetic chain lag
  - `Balance`: Center of Mass, Extrapolated CoM ($X_{xcom} = X_{com} + V_{com}/\omega_0$), Base of Support
  - `Continuity`: $C^1$-continuous Hermite blending across phase boundaries
  - `Interaction`: Single shared Cartesian coordinate space ($Y_{ground} = 755.0$)
- **Domain Specializations (Built on Core Primitives)**:
  - `Locomotion`: Walk, run, jump, land, brake, turn
  - `Object Interaction`: Lift, carry, push, pull, catch, throw, drop
  - `Combat & Collision`: Strike, kick, evade, recoil, clash hit-stop
  - `Perturbation`: Controlled instability, trips, slips, athletic recovery

### 16.3 Configurable Physical Assumptions
The engine does NOT hard-code universal constants. All physics parameters are configurable:
- `gravity`: Standard $980\text{px/s}^2$
- `character_mass`: Default $100$
- `object_mass`: Configurable per prop ($5$ to $150$)
- `ground_plane`: Configurable $Y$ elevation (default $755.0\text{px}$)
- `friction`: Ground traction coefficient (default $0.70$)
- `contact_threshold`: Geometric reach tolerance (default $12.0\text{px}$)
- `balance_threshold`: Stability margin boundary (default $25.0\text{px}$)
- `restitution`: Elastic collision coefficient (default $0.60$)

### 16.4 Inter-Skill Communication Contract
- **Input State**: `FrameState(t-1)`, `MotionIntent`, `ConfigurablePhysicsParams`
- **Output State**: `FrameState(t)`, `WorldEntityState[]`, `BiomechanicalAuditReport`
- **Validation Mandate**: Before `.stknds` serialization, frames must pass the 7-Domain Biomechanical Audit with zero hyperextensions, zero foot slip ($< 0.5\text{px}$), and verifiable torque-lean proportionality.

