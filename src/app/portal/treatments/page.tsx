'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import type { TreatmentRecord } from '@/lib/types';

interface TreatmentWithFormula extends TreatmentRecord {
  herbal_formula?: {
    name: string;
    chinese_name?: string;
    dosage_instructions?: string;
  } | null;
}

export default function PortalTreatments() {
  const { profile } = useAppStore();
  const supabase = createClient();

  const [treatments, setTreatments] = useState<TreatmentWithFormula[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    loadTreatments();
  }, [profile]);

  async function loadTreatments() {
    if (!profile) return;

    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (!patient) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('treatment_records')
        .select(`
          *,
          herbal_formula:herbal_formulas(name, chinese_name, dosage_instructions)
        `)
        .eq('patient_id', patient.id)
        .order('treatment_date', { ascending: false })
        .limit(50);

      setTreatments(data || []);
    } catch (err) {
      console.error('Failed to load treatments:', err);
    } finally {
      setLoading(false);
    }
  }

  function getTechniques(treatment: TreatmentRecord): string[] {
    const techniques: string[] = [];
    if (treatment.acupuncture_points.length > 0) techniques.push('Acupuncture');
    if (treatment.moxa_applied) techniques.push('Moxa');
    if (treatment.cupping_applied) techniques.push('Cupping');
    if (treatment.tuina_applied) techniques.push('Tuina');
    if (treatment.electroacupuncture) techniques.push('Electro');
    if (treatment.gua_sha) techniques.push('Gua Sha');
    return techniques;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-earth-300/30 border-t-earth-300 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading treatments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Treatment History</h1>
        <p className="text-gray-400 text-sm mt-1">
          Your past treatments and herbal prescriptions.
        </p>
      </div>

      {treatments.length === 0 ? (
        <div className="portal-card text-center py-12">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          <p className="text-gray-400 text-sm">No treatments recorded yet.</p>
          <p className="text-gray-500 text-xs mt-1">
            Your treatment history will appear here after visits.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {treatments.map((treatment) => {
            const techniques = getTechniques(treatment);
            const isExpanded = expandedId === treatment.id;

            return (
              <div key={treatment.id} className="portal-card">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : treatment.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {format(new Date(treatment.treatment_date), 'EEEE, MMM d, yyyy')}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {techniques.map((tech) => (
                          <span key={tech} className="badge-earth">{tech}</span>
                        ))}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-dark-50 space-y-4">
                    {/* Acupuncture Points */}
                    {treatment.acupuncture_points.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Acupuncture Points
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {treatment.acupuncture_points.map((pt, i) => (
                            <span key={i} className="badge-cyan">
                              {pt.point}
                              {pt.technique && ` (${pt.technique})`}
                            </span>
                          ))}
                        </div>
                        {treatment.needle_technique && (
                          <p className="text-xs text-gray-500 mt-1.5">
                            Technique: {treatment.needle_technique}
                          </p>
                        )}
                        {treatment.retention_time && (
                          <p className="text-xs text-gray-500">
                            Retention: {treatment.retention_time} min
                          </p>
                        )}
                      </div>
                    )}

                    {/* Moxa */}
                    {treatment.moxa_applied && treatment.moxa_details && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Moxibustion
                        </h4>
                        <p className="text-sm text-gray-300">{treatment.moxa_details}</p>
                      </div>
                    )}

                    {/* Cupping */}
                    {treatment.cupping_applied && treatment.cupping_details && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Cupping
                        </h4>
                        <p className="text-sm text-gray-300">{treatment.cupping_details}</p>
                      </div>
                    )}

                    {/* Tuina */}
                    {treatment.tuina_applied && treatment.tuina_details && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Tuina Massage
                        </h4>
                        <p className="text-sm text-gray-300">{treatment.tuina_details}</p>
                      </div>
                    )}

                    {/* Gua Sha */}
                    {treatment.gua_sha && treatment.gua_sha_details && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Gua Sha
                        </h4>
                        <p className="text-sm text-gray-300">{treatment.gua_sha_details}</p>
                      </div>
                    )}

                    {/* Electroacupuncture */}
                    {treatment.electroacupuncture && treatment.electroacupuncture_details && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Electroacupuncture
                        </h4>
                        <p className="text-sm text-gray-300">{treatment.electroacupuncture_details}</p>
                      </div>
                    )}

                    {/* Herbal Formula */}
                    {treatment.herbal_formula && (
                      <div className="bg-dark-300 rounded-xl p-3">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Herbal Formula
                        </h4>
                        <p className="text-sm font-medium text-earth-300">
                          {treatment.herbal_formula.name}
                          {treatment.herbal_formula.chinese_name && (
                            <span className="text-gray-500 ml-1.5">
                              ({treatment.herbal_formula.chinese_name})
                            </span>
                          )}
                        </p>
                        {treatment.herbal_formula.dosage_instructions && (
                          <p className="text-xs text-gray-400 mt-1">
                            {treatment.herbal_formula.dosage_instructions}
                          </p>
                        )}
                      </div>
                    )}

                    {treatment.herbal_notes && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Herbal Notes
                        </h4>
                        <p className="text-sm text-gray-300">{treatment.herbal_notes}</p>
                      </div>
                    )}

                    {/* Lifestyle Advice */}
                    {(treatment.dietary_advice || treatment.exercise_recommendations || treatment.lifestyle_notes) && (
                      <div className="bg-dark-300 rounded-xl p-3 space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Recommendations
                        </h4>
                        {treatment.dietary_advice && (
                          <div>
                            <span className="text-xs text-earth-300 font-medium">Diet: </span>
                            <span className="text-xs text-gray-300">{treatment.dietary_advice}</span>
                          </div>
                        )}
                        {treatment.exercise_recommendations && (
                          <div>
                            <span className="text-xs text-cyan-400 font-medium">Exercise: </span>
                            <span className="text-xs text-gray-300">{treatment.exercise_recommendations}</span>
                          </div>
                        )}
                        {treatment.lifestyle_notes && (
                          <div>
                            <span className="text-xs text-emerald-400 font-medium">Lifestyle: </span>
                            <span className="text-xs text-gray-300">{treatment.lifestyle_notes}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Follow Up */}
                    {treatment.follow_up_plan && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Follow-up Plan
                        </h4>
                        <p className="text-sm text-gray-300">{treatment.follow_up_plan}</p>
                      </div>
                    )}

                    {/* Patient Response */}
                    {treatment.patient_response && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Response to Treatment
                        </h4>
                        <p className="text-sm text-gray-300 italic">{treatment.patient_response}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
