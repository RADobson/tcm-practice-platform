'use client';

import type { MeridianData, MeridianPoint, TreatedPoint } from '@/lib/types';

interface PointDetailProps {
  point: MeridianPoint;
  meridian: MeridianData;
  treated?: TreatedPoint;
  onClose: () => void;
}

const TECHNIQUE_LABELS: Record<string, { label: string; chinese: string; description: string }> = {
  tonify: { label: 'Tonifying', chinese: '补法', description: 'Strengthening and nourishing — needle inserted gently with the flow of the meridian' },
  reduce: { label: 'Reducing', chinese: '泻法', description: 'Dispersing and clearing — needle manipulated against the flow to release excess' },
  even: { label: 'Even Method', chinese: '平补平泻', description: 'Balanced tonifying and reducing — harmonising technique for moderate conditions' },
  moxa: { label: 'Moxibustion', chinese: '灸法', description: 'Burning mugwort herb to warm the point — used to expel cold and strengthen yang qi' },
  cupping: { label: 'Cupping', chinese: '拔罐', description: 'Suction cups applied to promote blood flow and release stagnation' },
  electroacupuncture: { label: 'Electroacupuncture', chinese: '电针', description: 'Mild electrical stimulation through the needles for enhanced therapeutic effect' },
  bloodletting: { label: 'Bloodletting', chinese: '刺血', description: 'Pricking technique to release a few drops of blood — clears heat and removes stasis' },
};

const CATEGORY_COLOURS: Record<string, string> = {
  'Yuan-Source': 'text-amber-400 bg-amber-400/10',
  'Luo-Connecting': 'text-purple-400 bg-purple-400/10',
  'Xi-Cleft': 'text-red-400 bg-red-400/10',
  'He-Sea': 'text-blue-400 bg-blue-400/10',
  'Jing-Well': 'text-cyan-400 bg-cyan-400/10',
  'Ying-Spring': 'text-emerald-400 bg-emerald-400/10',
  'Shu-Stream': 'text-violet-400 bg-violet-400/10',
  'Jing-River': 'text-sky-400 bg-sky-400/10',
  'Back-Shu': 'text-orange-400 bg-orange-400/10',
  'Front-Mu': 'text-pink-400 bg-pink-400/10',
  'Hui-Meeting': 'text-yellow-400 bg-yellow-400/10',
  'Command': 'text-rose-400 bg-rose-400/10',
  'Confluent': 'text-indigo-400 bg-indigo-400/10',
};

export default function PointDetail({ point, meridian, treated, onClose }: PointDetailProps) {
  const technique = treated ? TECHNIQUE_LABELS[treated.technique] : null;
  const categoryStyle = point.category
    ? CATEGORY_COLOURS[point.category] || 'text-gray-400 bg-gray-400/10'
    : null;

  return (
    <div className="absolute top-4 left-4 z-20 w-[340px] max-h-[calc(100%-32px)] overflow-y-auto bg-dark-400/95 backdrop-blur-md border border-dark-50 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 bg-dark-400/95 backdrop-blur-md p-4 pb-3 border-b border-dark-50 rounded-t-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: meridian.colour }}
              />
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                {meridian.name_english} Meridian
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{point.id}</h3>
            <p className="text-sm text-earth-300">{point.name_pinyin}</p>
            <p className="text-lg text-gray-400 mt-0.5">{point.name_chinese}</p>
            <p className="text-xs text-gray-500 mt-0.5">{point.name_english}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-dark-200 transition-colors text-gray-400 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Point Category */}
        {point.category && (
          <div>
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${categoryStyle}`}>
              {point.category}
            </span>
          </div>
        )}

        {/* Technique Used (if treated) */}
        {treated && technique && (
          <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-xl p-3">
            <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-1">Technique Applied</p>
            <p className="text-sm text-white font-medium">
              {technique.label} <span className="text-gray-400">{technique.chinese}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{technique.description}</p>
            {treated.retention_time && (
              <p className="text-xs text-gray-500 mt-1">Retention: {treated.retention_time} minutes</p>
            )}
            {treated.sensation && (
              <p className="text-xs text-gray-500">Sensation: {treated.sensation}</p>
            )}
            {treated.therapeutic_purpose && (
              <p className="text-xs text-earth-300 mt-1">{treated.therapeutic_purpose}</p>
            )}
          </div>
        )}

        {/* Functions */}
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Classical Functions</p>
          <ul className="space-y-1.5">
            {point.functions.map((fn, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-earth-300 mt-0.5 shrink-0">&#8226;</span>
                <span className="text-gray-300 leading-relaxed">{fn}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Indications */}
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Common Indications</p>
          <div className="flex flex-wrap gap-1.5">
            {point.indications.map((ind, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-xs bg-dark-200 text-gray-400 border border-dark-50"
              >
                {ind}
              </span>
            ))}
          </div>
        </div>

        {/* Meridian Info */}
        <div className="border-t border-dark-50 pt-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Meridian</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Channel:</span>
              <span className="text-gray-300 ml-1">{meridian.name_pinyin}</span>
            </div>
            <div>
              <span className="text-gray-500">Organ:</span>
              <span className="text-gray-300 ml-1">{meridian.organ}</span>
            </div>
            <div>
              <span className="text-gray-500">Element:</span>
              <span className="text-gray-300 ml-1">{meridian.element}</span>
            </div>
            <div>
              <span className="text-gray-500">Nature:</span>
              <span className="text-gray-300 ml-1 capitalize">{meridian.yin_yang}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
