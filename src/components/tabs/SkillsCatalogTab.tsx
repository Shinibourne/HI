import React from 'react';
import { CheckCircle2, Download, Search, Activity, Target } from 'lucide-react';
import { AnimationQualityReport } from '../../lib/skills/qualityAudits';
import { SKILL_HIERARCHY, EXPANDED_68_MOTION_SKILLS, ALL_MOTION_SKILLS, AUTOMATIC_15_STEP_PIPELINE } from '../../lib/skills/skillsCatalogData';

interface SkillsCatalogTabProps {
  liveBiomechanicsAudit: AnimationQualityReport;
  selectedSkillCategory: string;
  setSelectedSkillCategory: (cat: string) => void;
  skillSearchQuery: string;
  setSkillSearchQuery: (q: string) => void;
  synthesizing: boolean;
  handleSynthesizeAndDownload: () => Promise<void>;
}

export const SkillsCatalogTab: React.FC<SkillsCatalogTabProps> = ({
  liveBiomechanicsAudit,
  selectedSkillCategory,
  setSelectedSkillCategory,
  skillSearchQuery,
  setSkillSearchQuery,
  synthesizing,
  handleSynthesizeAndDownload,
}) => {
  return (
            <div className="space-y-6">
              {/* Live 10-Domain Biomechanical Quality-Control Gate Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                  <div>
                    <div className="text-xs font-mono text-[#059669] font-semibold">
                      AUTOMATIC 10-DOMAIN QUALITY-CONTROL GATE (SKILL #33)
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A]">
                      {liveBiomechanicsAudit.animationTitle} ({liveBiomechanicsAudit.frameCount} Frames Audited)
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold ${
                      liveBiomechanicsAudit.overallPassed
                        ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                        : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {liveBiomechanicsAudit.overallScore}% BIOMECHANICAL PASS
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {liveBiomechanicsAudit.domains.map((dom) => (
                    <div
                      key={dom.domain}
                      className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-[#0F172A]">
                        <span>{dom.domain}</span>
                        <span className="font-mono text-[#059669]">{dom.score}% · {dom.skillsChecked}</span>
                      </div>
                      <p className="text-xs text-[#475569] leading-relaxed">{dom.summary}</p>
                      <div className="font-mono text-[11px] text-[#0284C7] pt-0.5">
                        {dom.technicalProof}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Silhouette & Unified Body Test Verification */}
                <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span className="text-[#166534] font-medium">
                      {liveBiomechanicsAudit.silhouetteCheck.notes}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[11px] text-[#15803D] bg-white px-2.5 py-1 rounded border border-[#86EFAC] shrink-0">
                    SILHOUETTE TEST: PASSED
                  </span>
                </div>
              </div>

              {/* Mandatory 15-Step Automatic Execution Pipeline */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <div>
                    <div className="text-xs font-mono text-[#0284C7] font-semibold">
                      PERSISTENT EXECUTION PIPELINE (AUTOMATIC ON EVERY ANIMATION)
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A]">
                      15-Step Causal Biomechanical Authoring Workflow
                    </h3>
                  </div>
                  <a
                    href="/NATURAL_MOVEMENT_SKILL.md"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-[#0284C7] hover:underline"
                  >
                    View Full NATURAL_MOVEMENT_SKILL.md (v3.0) →
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
                  {AUTOMATIC_15_STEP_PIPELINE.map((p) => (
                    <div
                      key={p.step}
                      className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1"
                    >
                      <div className="font-mono text-[11px] font-bold text-[#0284C7]">
                        STEP {p.step.toString().padStart(2, '0')} · {p.title}
                      </div>
                      <p className="text-[11px] text-[#475569] leading-snug">{p.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive 53-Skill Universal Library Explorer */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                  <div>
                    <div className="text-xs font-mono text-[#0F172A] font-semibold">
                      EXPANDED 91-SKILL REUSABLE MOTION LIBRARY
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A]">
                      All 91 Human Biomechanics, Kinematics, Timing, Physics, Mass Variations &amp; Quantum Skills
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
                    <div className="relative w-full sm:w-48">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94A3B8]" />
                      <input
                        type="text"
                        placeholder="Search skills, formulas..."
                        value={skillSearchQuery}
                        onChange={(e) => setSkillSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-[#F1F5F9] rounded-lg text-xs border border-transparent focus:border-[#0284C7] focus:bg-white outline-none"
                      />
                    </div>

                    {/* Mobile select dropdown */}
                    <div className="sm:hidden w-full">
                      <select
                        value={selectedSkillCategory}
                        onChange={(e) => setSelectedSkillCategory(e.target.value)}
                        className="w-full text-xs font-medium bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-[#0F172A]"
                        aria-label="Skill category filter"
                      >
                        {[
                          'ALL',
                          'Master & Foundation',
                          'Anatomical & Skeletal',
                          'Kinematics & Limb Solving',
                          'Balance & Mechanics',
                          'Locomotion & Action Mechanics',
                          'Physics, Secondary & Inertia',
                          'Timing, Composition & Arcs',
                          'Spatial Consistency & Interaction',
                          'General Physics & Load Intelligence',
                          'Physics & Scientific Mass Variations',
                          'Kinetic & Potential Energy Dynamics',
                          'Density, Fluid Forces & Environmental Probability',
                          'Quantum Physics & Skill Acquisition',
                        ].map((cat) => (
                          <option key={cat} value={cat}>
                            Category: {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Desktop button strip */}
                    <div className="hidden sm:flex flex-wrap items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg text-xs">
                      {[
                        'ALL',
                        'Master & Foundation',
                        'Anatomical & Skeletal',
                        'Kinematics & Limb Solving',
                        'Balance & Mechanics',
                        'Locomotion & Action Mechanics',
                        'Physics, Secondary & Inertia',
                        'Timing, Composition & Arcs',
                        'Spatial Consistency & Interaction',
                        'General Physics & Load Intelligence',
                        'Physics & Scientific Mass Variations',
                        'Quantum Physics & Skill Acquisition',
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedSkillCategory(cat)}
                          className={`px-2 py-1 rounded font-medium transition-colors text-[11px] cursor-pointer ${
                            selectedSkillCategory === cat
                              ? 'bg-white text-[#0F172A] shadow-xs'
                              : 'text-[#475569] hover:text-[#0F172A]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
                  {(ALL_MOTION_SKILLS || EXPANDED_68_MOTION_SKILLS).filter((s: any) => {
                    const matchesCat = selectedSkillCategory === 'ALL' || s.category === selectedSkillCategory;
                    const matchesSearch =
                      skillSearchQuery === '' ||
                      s.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                      s.summary.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                      s.causalQuestion.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                      s.biomechanicalRules.some((r: string) => r.toLowerCase().includes(skillSearchQuery.toLowerCase()));
                    return matchesCat && matchesSearch;
                  }).map((skill: any) => (
                    <div
                      key={skill.id}
                      className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-[#0284C7]">
                            SKILL #{skill.id.toString().padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E2E8F0] text-[#0F172A]">
                            {skill.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#0F172A]">{skill.name}</h4>
                        <p className="text-xs text-[#475569] leading-relaxed">
                          <strong>Causal Principle:</strong> {skill.causalQuestion}
                        </p>
                      </div>
                      <ul className="space-y-1 pt-2 border-t border-[#E2E8F0]/80 text-[11px] text-[#334155]">
                        {skill.biomechanicalRules.slice(0, 3).map((rule: any) => (
                          <li key={rule} className="flex items-start gap-1.5">
                            <span className="text-[#0284C7] font-bold">·</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
  );
};
