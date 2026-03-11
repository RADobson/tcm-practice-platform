'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import type {
  PostConsultationResult,
  MeridianPoint,
  MeridianData,
  TreatedPoint,
} from '@/lib/types';
import PointDetail from '@/components/visualization/PointDetail';

// Dynamic import for Three.js (SSR incompatible)
const MeridianBody3D = dynamic(
  () => import('@/components/visualization/MeridianBody3D'),
  { ssr: false, loading: () => <Loader /> }
);

export default function ResultsPage() {
  const params = useParams();
  const token = params.token as string;

  const [result, setResult] = useState<PostConsultationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visualization' | 'summary' | 'lifestyle'>('visualization');
  const [selectedPoint, setSelectedPoint] = useState<{
    point: MeridianPoint;
    meridian: MeridianData;
    treated?: TreatedPoint;
  } | null>(null);

  useEffect(() => {
    async function fetchResult() {
      if (!token) return;

      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('post_consultation_results')
        .select('*')
        .eq('access_token', token)
        .single();

      if (fetchError || !data) {
        setError('This treatment summary could not be found or has expired.');
        setLoading(false);
        return;
      }

      setResult(data);
      setLoading(false);

      // Track view
      await supabase.from('post_consultation_views').insert({
        result_id: data.id,
        user_agent: navigator.userAgent,
      });
    }
    fetchResult();
  }, [token]);

  const handlePointClick = useCallback(
    (point: MeridianPoint, meridian: MeridianData, treated?: TreatedPoint) => {
      setSelectedPoint({ point, meridian, treated });
    },
    []
  );

  if (loading) return <Loader />;
  if (error || !result) return <ErrorState message={error} />;

  const treatmentDate = new Date(result.treatment_date).toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-dark-700 text-white">
      {/* Header */}
      <header className="border-b border-dark-50 bg-dark-500/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gradient">Your Treatment Summary</h1>
            <p className="text-xs text-gray-500">{treatmentDate}</p>
          </div>
          <div className="flex gap-1 bg-dark-300 rounded-lg p-0.5">
            {(['visualization', 'summary', 'lifestyle'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-earth-300/20 text-earth-300'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'visualization' ? '3D View' : tab === 'summary' ? 'Summary' : 'Lifestyle'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {activeTab === 'visualization' && (
          <div className="relative h-[calc(100vh-56px)]">
            <MeridianBody3D
              treatedPoints={result.treated_points}
              beforeState={result.visualization_data.qi_flow_before}
              afterState={result.visualization_data.qi_flow_after}
              patientGender={result.patient_gender}
              onPointClick={handlePointClick}
            />
            {selectedPoint && (
              <PointDetail
                point={selectedPoint.point}
                meridian={selectedPoint.meridian}
                treated={selectedPoint.treated}
                onClose={() => setSelectedPoint(null)}
              />
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
            {/* Treatment Summary */}
            <section className="card">
              <h2 className="text-sm font-semibold text-earth-300 uppercase tracking-wider mb-4">Treatment Summary</h2>
              <div className="text-gray-300 leading-relaxed text-[15px] space-y-3">
                {result.ai_summary_plain.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            {/* Points Used */}
            {result.treated_points.length > 0 && (
              <section className="card">
                <h2 className="text-sm font-semibold text-earth-300 uppercase tracking-wider mb-4">
                  Acupuncture Points Used ({result.treated_points.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.treated_points.map((pt, i) => (
                    <div
                      key={i}
                      className="bg-dark-300 rounded-lg p-3 border border-dark-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-cyan-400 font-semibold">{pt.point_id}</span>
                        <span className="text-xs bg-dark-100 px-2 py-0.5 rounded text-gray-400">
                          {pt.technique_chinese} ({pt.technique})
                        </span>
                      </div>
                      {pt.therapeutic_purpose && (
                        <p className="text-xs text-gray-500 mt-1">{pt.therapeutic_purpose}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Classical References */}
            {result.classical_references.length > 0 && (
              <section className="card">
                <h2 className="text-sm font-semibold text-earth-300 uppercase tracking-wider mb-4">From the Classical Texts</h2>
                <div className="space-y-4">
                  {result.classical_references.map((ref, i) => (
                    <div key={i} className="border-l-2 border-earth-300/40 pl-4">
                      <p className="text-gray-300 italic text-[15px] leading-relaxed">
                        &ldquo;{ref.passage}&rdquo;
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        — {ref.text_name} ({ref.text_chinese})
                        {ref.chapter && `, ${ref.chapter}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{ref.relevance}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Research Enrichment */}
            {result.research_enrichment.length > 0 && (
              <section className="card">
                <h2 className="text-sm font-semibold text-earth-300 uppercase tracking-wider mb-4">Research Insights</h2>
                <div className="space-y-4">
                  {result.research_enrichment.map((item, i) => (
                    <div key={i} className="bg-dark-300 rounded-lg p-4 border border-dark-50">
                      <h3 className="text-sm font-semibold text-white mb-2">{item.topic}</h3>
                      <p className="text-sm text-gray-300 leading-relaxed">{item.modern_research}</p>
                      <p className="text-xs text-gray-500 mt-2 italic">{item.classical_basis}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{item.source}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pathology Info */}
            <section className="card">
              <h2 className="text-sm font-semibold text-earth-300 uppercase tracking-wider mb-4">Pattern Diagnosis</h2>
              <div className="space-y-2">
                <p className="text-white font-medium">{result.pathology_state.primary_pattern}</p>
                {result.pathology_state.secondary_patterns.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.pathology_state.secondary_patterns.map((pat, i) => (
                      <span key={i} className="badge-earth">{pat}</span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-2">{result.pathology_state.description}</p>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'lifestyle' && (
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
            {/* Lifestyle Recommendations */}
            {Object.entries(result.lifestyle_recommendations).map(([category, items]) => {
              if (!items || (items as string[]).length === 0) return null;
              const labels: Record<string, { title: string; icon: string }> = {
                diet: { title: 'Dietary Guidance', icon: '🍵' },
                exercise: { title: 'Movement & Exercise', icon: '🏃' },
                sleep: { title: 'Rest & Sleep', icon: '🌙' },
                emotional: { title: 'Emotional Wellness', icon: '🧘' },
                seasonal: { title: 'Seasonal Living', icon: '🌿' },
                general: { title: 'General Wellness', icon: '✨' },
              };
              const label = labels[category] || { title: category, icon: '•' };

              return (
                <section key={category} className="card">
                  <h2 className="text-sm font-semibold text-earth-300 uppercase tracking-wider mb-4">
                    {label.title}
                  </h2>
                  <ul className="space-y-2">
                    {(items as string[]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="text-cyan-400 mt-0.5 shrink-0">&#8226;</span>
                        <span className="text-gray-300 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            {/* Dietary Therapy */}
            {result.dietary_therapy && (
              <>
                {result.dietary_therapy.beneficial_foods?.length > 0 && (
                  <section className="card">
                    <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
                      Beneficial Foods
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.dietary_therapy.beneficial_foods.map((food, i) => (
                        <div key={i} className="bg-dark-300 rounded-lg p-3 border border-dark-50">
                          <p className="text-sm font-medium text-white">{food.food}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-100 text-gray-400 capitalize">
                              {food.nature}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-100 text-gray-400 capitalize">
                              {food.flavour}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{food.therapeutic_action}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {result.dietary_therapy.foods_to_avoid?.length > 0 && (
                  <section className="card">
                    <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">
                      Foods to Minimise
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.dietary_therapy.foods_to_avoid.map((food, i) => (
                        <div key={i} className="bg-dark-300 rounded-lg p-3 border border-red-500/10">
                          <p className="text-sm font-medium text-white">{food.food}</p>
                          <p className="text-xs text-gray-500 mt-1">{food.therapeutic_action}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {result.dietary_therapy.tea_recommendations?.length > 0 && (
                  <section className="card">
                    <h2 className="text-sm font-semibold text-earth-300 uppercase tracking-wider mb-4">
                      Tea Recommendations
                    </h2>
                    <ul className="space-y-2">
                      {result.dietary_therapy.tea_recommendations.map((tea, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <span className="text-earth-300 mt-0.5 shrink-0">&#8226;</span>
                          <span className="text-gray-300">{tea}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}

            {/* Next Appointment */}
            {result.next_appointment && (
              <section className="card border-cyan-400/20">
                <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                  Next Appointment
                </h2>
                <p className="text-white font-medium">
                  {new Date(result.next_appointment).toLocaleDateString('en-AU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-50 py-6 text-center">
        <p className="text-xs text-gray-600">
          This summary was prepared with AI assistance. It is for informational purposes
          and does not replace professional medical advice.
        </p>
        <p className="text-[10px] text-gray-700 mt-2">
          Powered by Consult Results
        </p>
      </footer>
    </div>
  );
}

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-700">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-earth-300/20 border-t-earth-300 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-cyan-400/10 border-b-cyan-400/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-sm text-gray-400">Loading your treatment map...</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-700 p-6">
      <div className="card max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Summary Not Found</h2>
        <p className="text-sm text-gray-400">
          {message || 'This treatment summary could not be found. The link may have expired or is invalid.'}
        </p>
      </div>
    </div>
  );
}
