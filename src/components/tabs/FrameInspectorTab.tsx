import React from 'react';
import { StickfigureKeyframeSpec } from '../../lib/stknds/stkndsCore';

interface FrameInspectorTabProps {
  activeAnimationMode: string;
  sneezeFrames: StickfigureKeyframeSpec[];
  superheroFrames: StickfigureKeyframeSpec[];
}

export const FrameInspectorTab: React.FC<FrameInspectorTabProps> = ({
  activeAnimationMode,
  sneezeFrames,
  superheroFrames,
}) => {
  return (
    activeAnimationMode === 'parkour' ? (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
          <div className="text-xs font-mono text-[#0284C7] font-semibold">
            ACTS I–II · SPRINT ACCELERATION &amp; HURDLE DIVE JUMP (F00–37)
          </div>
          <h3 className="text-base font-semibold text-[#0F172A]">
            Locomotion Sprint &amp; Parabolic Dive Arc
          </h3>
          <p className="text-sm text-[#475569] leading-relaxed">
            Athlete accelerates from <code className="font-mono text-xs">X=300 → 610</code> with 16° forward torso lean and anti-phase arm pumping (±48°) canceling transverse spinal torsion. Lead foot punches into Ground <code className="font-mono text-xs">Y=755.0</code> at F24, launching airborne along a zero-drag parabolic arc reaching apex at <code className="font-mono text-xs">Y=430</code>. Cervical spine locks cranium onto landing target as arms reach forward-downward.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
          <div className="text-xs font-mono text-[#D97706] font-semibold">
            ACTS III–IV · SCAPULAR SHOULDER ROLL &amp; REBOUND SQUAT (F38–65)
          </div>
          <h3 className="text-base font-semibold text-[#0F172A]">
            Rotational Energy Dissipation &amp; Blocking Plant
          </h3>
          <p className="text-sm text-[#475569] leading-relaxed">
            Hands contact the floor at F38, elbows yield from 170° to 110° absorbing vertical velocity, and chin tucks to sternum. Body executes a diagonal scapular roll from right shoulder across thoracic spine to left hip with legs tucked tight (<code className="font-mono text-xs">I=Σmr²</code> minimized). Hips roll through at F56, feet plant firmly at <code className="font-mono text-xs">X=1045</code>, and knees compress to 105° in a deep spring block with arms swept back.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
          <div className="text-xs font-mono text-[#7C3AED] font-semibold">
            ACTS V–VI · EXPLOSIVE 360° BACKFLIP &amp; IMPACT CUSHION (F66–95)
          </div>
          <h3 className="text-base font-semibold text-[#0F172A]">
            Aerial Inversion &amp; Shock Absorption Settle
          </h3>
          <p className="text-sm text-[#475569] leading-relaxed">
            Explosive quad drive and overhead arm whip launch athlete to vertical apex <code className="font-mono text-xs">Y=390</code> (365 px above floor!). Knees pull tight to chest, driving 360° backward rotation in mid-air. At 300°, limbs extend to brake spin. Feet contact ground plane at <code className="font-mono text-xs">Y=755.0</code> (F84), knees compress 45° absorbing 32 px of drop shock, and torso pitches 14° forward to lock CoM solidly within Base of Support.
          </p>
        </div>
      </div>
    ) : activeAnimationMode === 'basketball' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#EA580C] font-semibold">
                    PHASES 00–03 · WALK GAIT, BRAKE PLANT &amp; DEEP CROUCH PICKUP (F00–11)
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Locomotion Approach &amp; 2-Bone IK Pickup
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Player stands at <code className="font-mono text-xs">X=480, Y=512</code> and walks toward the resting basketball at <code className="font-mono text-xs">(864.6, 737.0)</code> on Ground <code className="font-mono text-xs">Y=755</code>. Stance feet pin with 0.00 px slip during each step. At F07, a staggered base <code className="font-mono text-xs">[705..775]</code> is planted, the pelvis lowers into a deep squat (<code className="font-mono text-xs">Y=630</code>), and the right hand contacts the top of the ball at F10 (<code className="font-mono text-xs">dist=18.0 px</code>, reach 85.1% of max).
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#0284C7] font-semibold">
                    PHASES 04–07 · STAND CARRY, TRIPLE-EXTENSION TOSS &amp; CATCH (F12–18)
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Parabolic Ballistic Flight &amp; Yield Absorption
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Rising smoothly to standing height (<code className="font-mono text-xs">Y=512</code>), the player dips at F13 and drives upward with triple extension through ankles, knees, hips, and shoulder, releasing the ball at F15 (<code className="font-mono text-xs">vy=-26 px/f</code>). The ball reaches its parabolic apex at <code className="font-mono text-xs">Y=275</code> (F16) while the neck tracks upward (<code className="font-mono text-xs">110°</code>), then descends under gravity to be caught at F18 with a +15° elbow yield.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#059669] font-semibold">
                    PHASES 08–09 · ATHLETIC STANCE &amp; RHYTHMIC DRIBBLE CYCLE (F19–23)
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Waist-to-Turf Elastic Rebound Cycle
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Settling into an athletic crouch (<code className="font-mono text-xs">Y=532..536</code>) with the left guard arm engaged, the right wrist pushes the basketball down from waist height (<code className="font-mono text-xs">Y=580.1</code> at F20) to strike the floor at <code className="font-mono text-xs">Y=737.0</code> (F21, restitution <code className="font-mono text-xs">ε=0.85</code>), rebounding cleanly back to the cushioned palm at F23.
                  </p>
                </div>
              </div>
            ) : activeAnimationMode === 'stroll-kick' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#0284C7] font-semibold">
                    ACTS 01–03 · SEATED REST, TRUNK FOLD &amp; SQUAT STAND (F00–71)
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Squat Strategy &amp; Momentum Extension
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Man sits on the floor at <code className="font-mono text-xs">X=300, Y=726</code>, knees up, feet flat at <code className="font-mono text-xs">X=405, Y=755</code> with one forearm on knee and hand planted behind hips. Small breathing life (F00–18). Hand slides in, trunk folds forward 42°, and hips launch upward into a deep squat (<code className="font-mono text-xs">Y=658</code>) moving forward 95 px over feet as hands release. Legs extend into a standing equilibrium at <code className="font-mono text-xs">Y=510</code>. Zero foot sliding throughout.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#D97706] font-semibold">
                    ACTS 04–06 · RELAXED STROLL, DOUBLE-TAKE &amp; BRAKE (F72–129)
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Biomechanical Walk &amp; Braking Plant
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Weight shifts forward and he strolls from <code className="font-mono text-xs">X=405 → 650</code>. Exact clinical gait: 60% stance, 40% swing, hip flexed 25° at heel strike, knee flexed 20° after contact peaking 60° in swing, ankle plantar/dorsi-flexion, arm swing lagging legs by 3 frames. At F112, his head snaps down noticing the orange ball at <code className="font-mono text-xs">(900, 737)</code> mid-stride. He executes a braking plant with 6° torso lean-back, holding a brief double-take.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#059669] font-semibold">
                    ACTS 07–09 · EXCITED JUMP, SPRINT, KICK &amp; LAUNCH (F130–215)
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Joyous Leap, Sprint, Impact &amp; Moving Hold
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Crouches and leaps in excitement (<code className="font-mono text-xs">Y=462</code> apex) with both legs tucking up and arms cheering, landing cleanly at <code className="font-mono text-xs">Y=755</code>. Transitions into an aggressive forward-leaning sprint (arms 90°, knees folding to butt). Plants support foot at <code className="font-mono text-xs">X=835</code>, chambers right leg, and kicks the ball at F174 (<code className="font-mono text-xs">X=884, Y=735</code>). Ball launches diagonally offscreen (<code className="font-mono text-xs">vx=28, vy=-19</code>) while he watches it go and celebrates with subtle breathing life.
                  </p>
                </div>
              </div>
            ) : activeAnimationMode === 'phantom' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#0284C7] font-semibold">
                    STEPS 01–02 · THE FOCUS &amp; THE BLINK
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Rigid Stillness &amp; Instant Vanish (Frames 00–12)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Single stick figure stands rigid in exact center of frame (<code className="font-mono text-xs">X=640, Y=515</code>), feet shoulder-width, arms hanging straight down with loosely clenched fists, head tilted down. Held in total stillness for 1.0s (12 frames). At Frame 12, the character <em>completely disappears</em> — exactly one blank frame selling instantaneous teleport speed into thin air.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#D97706] font-semibold">
                    STEPS 03–04 · RAPID HANDS &amp; TELEPORT 2
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Jab, Cross, Uppercut &amp; Mid-Air Vanish (Frames 13–21)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Instant reappearance on the far right (<code className="font-mono text-xs">X=980</code>) in deep fighting stance facing left. Left arm snaps a 180° head-height jab with 1-frame sharp impact hold. Left arm recoils to chin while torso twists violently into a straight 180° right cross. Right arm drops, knees dip lower, and fist launches upward onto toes (+90° vertical uppercut). At the highest apex point in mid-air, the character vanishes again (1 blank frame at F21).
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#059669] font-semibold">
                    STEPS 05–07 · AERIAL ASSAULT, LANDING &amp; RESET
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Axe Kick, 3-Point Impact &amp; Reset Rise (Frames 22–39)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Reappears high in air on far left (<code className="font-mono text-xs">X=340, Y=275</code>) horizontally with back parallel to ceiling (0°). Right leg swings high and violently chops down in massive 190° arc toward floor (-88°). Right heel slams into ground (<code className="font-mono text-xs">Y=755</code>), left touches down, absorbing shock in deep 3-point crouch (right fist punched into floor, left defensive guard). Held 6 frames, then smoothly relaxes and stands completely straight to Step 1 pose.
                  </p>
                </div>
              </div>
            ) : activeAnimationMode === 'teleport' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#2563EB] font-semibold">
                    ACTS 01–03 · APPROACH, ZOOM &amp; WHIP-PAN
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    The Standoff, Close-Up &amp; Vanish (Frames 00–16)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Wide establishing shot as Character Blue walks calmly toward seated Character Red (<code className="font-mono text-xs">X: 960 → 756</code>). At F10, the camera zooms aggressively (<code className="font-mono text-xs">2.35x</code>) into Red’s face as he notices Blue and tilts his head up. In just 2 frames (F15–F16), a violent whip-pan pans to Blue’s spot — <em>Blue is completely gone</em>!
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#DC2626] font-semibold">
                    ACTS 04–05 · TELEPORT &amp; SWEEPING KICK
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Behind-the-Back Strike (Frames 17–23)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    The camera snaps wide as Blue instantly materializes behind seated Red at <code className="font-mono text-xs">X=168</code>. Blue immediately drops body weight (<code className="font-mono text-xs">Y=594</code>) and whips a heavy roundhouse kick directly targeting Red’s upper body with maximum momentum.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#D97706] font-semibold">
                    ACTS 06–08 · FOREARM BLOCK &amp; SCREEN SHAKE
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Seated Block, Hit-Stop &amp; Standoff (Frames 24–35)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Without standing up, Red twists sharply and catches Blue’s shin with a rigid forearm block (<code className="font-mono text-xs">Forearm +172° / -124°</code>). An intense hit-stop freeze triggers a 5-frame screen shake (F26–F30) before settling into a 5-frame locked martial arts standoff hold.
                  </p>
                </div>
              </div>
            ) : activeAnimationMode === 'superhero' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#475569] font-semibold">
                    ACTS 01–02 · STRIDE &amp; SCRATCH
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Walk Cycle &amp; Thoughtful Pause (Frames 00–09)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Character walks along the ground from <code className="font-mono text-xs">X=260 → 515</code>, stops, and reaches up to scratch their head with forearm oscillation (<code className="font-mono text-xs">±18°</code>) before taking flight.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#0284C7] font-semibold">
                    ACTS 03–04 · SKY FLIGHT CORRIDOR
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    12 Dedicated Sky-Flight Frames (Frames 10–21)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Zero-G levitation liftoff, sonic pitch-out, horizontal stratosphere cruise at <code className="font-mono text-xs">Y=144px</code> with supersonic wind speed-lines, and vertical meteor air brake.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#059669] font-semibold">
                    ACT 05 · THREE-POINT LANDING
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Superhero Impact Compression (Frames 22–26)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Impact compression with fist, left knee, and right foot planted on ground plane (<code className="font-mono text-xs">Y ≈ 754</code>) with shockwave damping.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#D97706] font-semibold">
                    ACTS 01–02 · ANTICIPATION &amp; HOLD TREMBLE
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    The Build-Up &amp; Stuck Sneeze Hold (Frames 00–10)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    Starts from a balanced standing equilibrium (<code className="font-mono text-xs">X=1120, Y=509</code>). As the massive breath builds, the head tilts back (<code className="font-mono text-xs">+90° → +142°</code>), the chest rises, and elbows bend up to the chest. When the sneeze gets stuck (F06–F10), the spine arches completely backward (<code className="font-mono text-xs">UpperChest +136°..+148°</code>) with a high-frequency tension tremble across the arms and legs while the feet stay planted on the ground (<code className="font-mono text-xs">Y ≈ 758</code>).
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#E11D48] font-semibold">
                    ACTS 03–04 · EXPLOSION &amp; THRUSTER BACKFLIP
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    2-Frame Whip &amp; Mid-Air Backflip Recoil (Frames 11–21)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    In just 2 frames (F11–F12), the character snaps violently forward: the spine curls into a tight ball (<code className="font-mono text-xs">-96°</code>), the head whips down past the knees (<code className="font-mono text-xs">-152°</code>), and both arms throw straight backward (<code className="font-mono text-xs">+172°..+178°</code>). The sneeze acts like a thruster (F13–F21), ripping the feet off the floor and launching the character backward (<code className="font-mono text-xs">X: 1104 → 512</code>) through a full 360° messy mid-air backflip (<code className="font-mono text-xs">Spine: -48° → +468°</code>).
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-mono text-[#059669] font-semibold">
                    ACTS 05–06 · FLAT BACK CRASH &amp; LEG TWITCH
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Secondary Limb Bounce &amp; 1s Stillness (Frames 22–35)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    At F22, the character crashes flat on their back (<code className="font-mono text-xs">Spine 538° ≡ 178°</code>). Impact momentum causes both arms and legs to bounce skyward once (F23–F24) before dropping flat at F26. The character then lies completely motionless for 1 full second (F27–F32, zero delta) before slowly twitching the right leg (F33–F35) to show they are still alive.
                  </p>
                </div>
              </div>
            )
  );
};
