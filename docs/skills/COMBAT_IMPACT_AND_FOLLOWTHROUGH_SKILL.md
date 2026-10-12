# Combat, Impact, and Follow-Through Animation Skill (v3.0)

## Purpose

Plan readable strikes, dodges, collisions, knockback, and recoveries as cause-and-effect sequences with **computed** timing, impulse, friction limits and environment effects. Complements `FORCE_REACTION_FOLLOWTHROUGH_SKILL.md`, `MOMENTUM_DYNAMICS_SKILL.md`, `MOTION_INTENT_AND_CAUSALITY_SKILL.md`, `GENERAL_INTERACTION_SKILL.md`, and the shared constants in `PHYSICS_ENVIRONMENT_AND_QUANTUM_SKILL.md`.

## Evidence and provenance

- Alan Becker, [Stick Figure Animation (revamped)](https://www.youtube.com/watch?v=mViKZJQcbpM): stick-figure workflow source; transcript page located, complete archive not verified.
- Alan Becker, [How to Animate a Perfect Fight Scene](https://www.youtube.com/results?search_query=Alan+Becker+How+to+Animate+a+Perfect+Fight+Scene): candidate source. The linked secondary summary (https://youtubesummary.com/summary/5rH6TfPPEds) is not a verified transcript; canonical upload and exact transcript need review.
- National Film Board of Canada, [The 12 principles of animation](https://blog.nfb.ca/blog/2015/03/20/12-principles-animation/): anticipation, staging, arcs, timing, and follow-through/overlap.
- Biomechanics grounding (v3): Hof et al. 2005 (extrapolated CoM / margin of stability), Hill 1938 and Huxley 1957 (muscle force–velocity), Winter 2009 / Dempster 1955 (segment parameters). Full list in the physics skill §9.

Treat detailed choreography recommendations below as implementation synthesis, not direct quotations from the videos. Numbers tagged [TUNE] are engineering defaults.

## Action phases

For each attack or collision, identify the applicable phases:

1. **Intent/staging:** show target, direction, and action clearly.
2. **Anticipation:** load the movement when the action benefits from preparation.
3. **Acceleration:** coordinate support, root/pelvis, torso, shoulder, and striking limb.
4. **Contact or near-miss:** define the exact target relationship and frame/event.
5. **Reaction:** move the receiving character or object in a way that corresponds to the applied action.
6. **Follow-through/recoil:** let the kinetic chain and affected body parts resolve at different rates.
7. **Recovery:** restore balance, guard, or the next meaningful pose.

A feint, light tap, fast stylized strike, or interrupted action may omit or compress phases.

### Timing budget (all in milliseconds, then converted: frames = ms × fps / 1000)
| Phase | Light/fast | Heavy/power | @24 fps |
|---|---|---|---|
| Anticipation | 80–120 ms | 200–400 ms | 2–3 / 5–10 f |
| Acceleration (pelvis → hand) | 100–150 ms | 150–250 ms | 2–4 / 4–6 f |
| Hit-stop (stylistic) | 40–80 ms | 80–125 ms | 1–2 / 2–3 f |
| Reaction onset (passive) | 0 ms | 0 ms | same frame as contact |
| Defender voluntary response | ≥ 150 ms | ≥ 150 ms | ≥ 4 f |
| Recovery | 150–300 ms | 300–600 ms | 4–7 / 7–14 f |
Defender reflex only fits in at ~1 frame (stretch/flinch); balance reaction 2–3 frames. [TUNE]

## Strike mechanics

- Define the intended target and contact point before refining the hand/foot trajectory.
- Coordinate root and support foot with pelvis/torso rotation; the stance foot must stay within friction: $\mu_{req}=F_t/F_n\le\mu_s$.
- Ensure the elbow/knee bend direction remains stable; preserve segment lengths.
- Make the contact frame readable through pose, spacing, staging, and optionally an impact effect.
- Target reaction starts at or after the causal contact event.
- If the attacker is stopped by impact, represent the velocity change and body response rather than freezing every joint.

### Quantifying a strike
1. **Chain speed budget** (overhand/straight strike hand speed, example shares [TUNE]): legs/pelvis 15 %, trunk 30 %, shoulder 25 %, elbow 20 %, wrist 10 %. A 8 m/s fist: 1.2 m/s from legs/pelvis, 2.4 from trunk, etc. Peak speed order: pelvis → torso (+1–2 f) → arm (+2–3 f).
2. **Hill cap**: peak power at ≈ 0.31 $v_{max}$ with ≈ 0.31 $F_0$. A very fast fist carries little *push*; a slow shove carries large force. Use that to choose "snap" (fast, short contact) vs "drive" (slower, long contact, more knockback).
3. **Impulse**: $J=m_{eff}\,v_{rel}\,(1+e)$. Effective mass $m_{eff}$ ≈ 3–6 kg for a fist/forearm, 6–12 kg for a committed kick (leg + hip) [TUNE].
   - Example: $m_{eff}=6$ kg, $v=8$ m/s, $e=0.2$: $J=57.6$ N·s. Contact duration ≈ 5–15 ms (real), so peak force is thousands of N; the animation shows it as hit-stop and a velocity change, not a long push.
4. **Defender velocity change**: $\Delta v=J/m_{def}$. 57.6 N·s on 70 kg → 0.82 m/s (≈ 8.9 px/f at 24 fps, 260 px/m).
5. **Block or armor**: compliance lengthens contact: $\bar F=J/\Delta t$. A relaxed yield of 80 ms drops mean force 5–8×.

## Reaction and knockback

The receiving character reacts to contact location and direction. Check:
- initial target alignment,
- displacement and rotation direction (torque $\tau=r\times J$ about the CoM: a hit above the CoM rotates the upper body backward, below tilts forward),
- support-foot response,
- pelvis and torso response,
- arm/head follow-through (head lags ≥ 1 frame),
- balance loss or recovery,
- subsequent environment collision.

### Knockback calculations
- **Slide**: $s=\dfrac{(\Delta v)^2}{2\mu g}$. 0.82 m/s: dry rubber/concrete ($\mu=0.8$) 4.3 cm (11 px); wet ($\mu=0.45$) 7.6 cm (20 px); ice ($\mu=0.1$) 34 cm (89 px).
- **Step instead of slide** when $MoS<0$: $X^{ext}_{CoM}=x+v/\omega_0$, $\omega_0=\sqrt{g/l}$. With $\Delta v=0.82$ m/s, $l=1$ m: offset 0.26 m (68 px). If it exceeds the stance base, the defender must step ≥ that distance + margin or fall.
- **Airborne launch** (large blows): $v_0$ from $J$; flight $y=v_yt-\tfrac12gt^2$, drag and wind via physics skill §3.4. Rotation from off-center impulse: $\omega=\tau/I$ then conserved in flight.
- **Wall/obstacle collision**: restitution $e$; momentum change goes into the object (the wall) and body compresses; add 1–2 frame squash then slide down.
- **Gravity variants**: Moon: same $\Delta v$ with $g=1.62$ → slides 6× farther, flights ×6 longer.
- **Wind**: gusts add $F_D=\tfrac12\rho C_dA v_{rel}^2$; 10 m/s tailwind on a flying body adds ≈ 0.6 m/s² drift: noticeable in a 1-s flight.

Do not use a large screen-space translation as the only representation of impact. Articulation and support changes communicate force. Do not add arbitrary recoil when the action is a controlled touch or block.

## Follow-through and overlap

- Use action-specific timing (in ms), not a universal fixed delay.
- Damped oscillator $\theta=\theta_t+\delta_0e^{-\zeta\omega_nt}\cos(\omega_dt)$; $\zeta$ hair/cloth 0.1–0.3, relaxed arms 0.3–0.5, guarded limbs 0.7–1.0 [TUNE].
- Do not let overlap break planted contacts or joint connectivity.
- Keep the main action's silhouette readable.
- Damp or terminate oscillation deliberately; settle ≈ $4/(\zeta\omega_n)$.
- Avoid random jitter; if noise is used, low-pass (≈ 8 Hz) and scale with force (signal-dependent).

## Visual effects synchronization

For smear frames, trails, flashes, impact rings, dust, or camera shake:
- anchor to the movement/contact event; set deliberate onset and decay,
- **smear length** ≈ $v\cdot t_{exposure}$ (e.g. 8.9 px/f fist with a 180° shutter → ~4.5 px of blur; stylized smears can be 2–3× longer),
- dust amount scales with $J$ and drops on wet surfaces; wind skews dust direction,
- impact ring radius grows $r\propto\sqrt{J}$ (stylistic) and decays over 2–4 frames,
- camera shake amplitude ∝ $\sqrt{J}$, damped with $\zeta\approx0.3$, decays within 6–10 frames,
- preserve visibility of the contact pose; test effect-free and composited,
- avoid effects that hide a misaligned hit.

### Optional `QUANTUM_STYLE` effects (fantasy/sci-fi only, opt-in)
Afterimage dodges weighted by probability that collapse on the contact frame; "tunneling" blinks through a barrier with logged momentum conservation. Never used for realistic combat. See physics skill §6.4.

## Validation checks

- Target and striking limb meet at the intended contact point (≤ 12 px).
- Contact/reaction ordering is causally coherent (reaction ≥ contact frame).
- No unintended limb-length change or joint flip.
- Attacker and receiver keep coherent support/balance: $\mu_{req}\le\mu_s$ or a logged slip.
- Defender slide/step matches $s=(\Delta v)^2/(2\mu g)$ or the step rule within 25 %.
- No voluntary defender counter within 4 frames of impact (24 fps); only passive/reflex.
- Hit-stop is simultaneous for both characters (1–3 frames).
- Impact reads in silhouette and playback; follow-through visible but not noisy.
- Effects are synchronized and do not conceal defects.
- Recovery pose plausibly leads into the next action.
- Review at least anticipation, pre-contact, contact, immediate reaction, and recovery frames.
