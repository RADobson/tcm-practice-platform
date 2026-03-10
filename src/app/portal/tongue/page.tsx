'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { TONGUE_BODY_COLORS, TONGUE_COATING_COLORS } from '@/lib/tcm-data';
import type { TongueAnalysis } from '@/lib/types';

export default function PortalTongue() {
  const { profile } = useAppStore();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [patientId, setPatientId] = useState<string | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [history, setHistory] = useState<TongueAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Capture state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Form state
  const [bodyColor, setBodyColor] = useState('Pale-red (Normal)');
  const [coatingColor, setCoatingColor] = useState('White');
  const [moisture, setMoisture] = useState('normal');

  useEffect(() => {
    if (!profile) return;
    loadData();

    return () => {
      // Clean up camera on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [profile]);

  async function loadData() {
    if (!profile) return;

    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('id, practice_id')
        .eq('user_id', profile.id)
        .single();

      if (!patient) {
        setLoading(false);
        return;
      }

      setPatientId(patient.id);
      setPracticeId(patient.practice_id);

      const { data: analyses } = await supabase
        .from('tongue_analyses')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setHistory(analyses || []);
    } catch (err) {
      console.error('Failed to load tongue data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(mediaStream);
      setCameraActive(true);

      // Wait for ref to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera access denied:', err);
      toast.error('Camera access denied. Please use the upload option instead.');
    }
  }

  function capturePhoto() {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);

    // Stop camera
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
    setStream(null);
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
    setStream(null);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function clearCapture() {
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit() {
    if (!capturedImage || !patientId || !profile) return;

    setSubmitting(true);
    try {
      // Upload the image to Supabase storage
      const fileName = `tongue_${patientId}_${Date.now()}.jpg`;

      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tongue-images')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      let imageUrl = capturedImage; // Fallback to data URL if storage not configured
      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('tongue-images')
          .getPublicUrl(uploadData.path);
        imageUrl = urlData.publicUrl;
      }

      const payload = {
        patient_id: patientId,
        practice_id: practiceId,
        submitted_by: profile.id,
        image_url: imageUrl,
        body_color: bodyColor,
        coating_color: coatingColor,
        moisture: moisture,
        is_self_assessment: true,
        regions: {},
        ai_patterns: [],
      };

      const { error } = await supabase.from('tongue_analyses').insert(payload);
      if (error) throw error;

      toast.success('Tongue assessment submitted!');
      setCapturedImage(null);
      setBodyColor('Pale-red (Normal)');
      setCoatingColor('White');
      setMoisture('normal');

      // Reload history
      const { data: refreshed } = await supabase
        .from('tongue_analyses')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(20);

      setHistory(refreshed || []);
    } catch (err) {
      console.error('Failed to submit tongue analysis:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-earth-300/30 border-t-earth-300 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tongue Self-Assessment</h1>
        <p className="text-gray-400 text-sm mt-1">
          Take a photo of your tongue for your practitioner to review.
        </p>
      </div>

      {/* Camera / Upload */}
      <div className="portal-card space-y-4">
        {!capturedImage && !cameraActive && (
          <div className="space-y-3">
            <div className="aspect-[4/3] bg-dark-300 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-dark-50">
              <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <p className="text-sm text-gray-400">Capture or upload tongue photo</p>
              <p className="text-xs text-gray-600 mt-1">
                Stick out your tongue in good lighting
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={startCamera} className="btn-cyan py-3 rounded-xl">
                Open Camera
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary py-3 rounded-xl"
              >
                Upload Photo
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Camera view */}
        {cameraActive && (
          <div className="space-y-3">
            <div className="aspect-[4/3] bg-black rounded-xl overflow-hidden relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Overlay guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-24 border-2 border-white/30 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={capturePhoto} className="btn-primary py-3 rounded-xl">
                Capture
              </button>
              <button onClick={stopCamera} className="btn-secondary py-3 rounded-xl">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Captured preview */}
        {capturedImage && (
          <div className="space-y-3">
            <div className="aspect-[4/3] bg-dark-300 rounded-xl overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedImage}
                alt="Captured tongue"
                className="w-full h-full object-cover"
              />
            </div>
            <button onClick={clearCapture} className="btn-secondary py-2 rounded-lg w-full text-sm">
              Retake / Choose Different
            </button>
          </div>
        )}
      </div>

      {/* Self-assessment form - only show when image captured */}
      {capturedImage && (
        <div className="portal-card space-y-5">
          <h2 className="text-lg font-semibold text-white">Quick Assessment</h2>

          <div>
            <label className="input-label">How does your tongue body look? (Color)</label>
            <div className="grid grid-cols-2 gap-2">
              {TONGUE_BODY_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setBodyColor(color)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    bodyColor === color
                      ? 'bg-earth-300/20 text-earth-300 border border-earth-300/40'
                      : 'bg-dark-300 text-gray-300 border border-dark-50 hover:border-dark-50/80'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Any coating?</label>
            <div className="grid grid-cols-2 gap-2">
              {TONGUE_COATING_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setCoatingColor(color)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    coatingColor === color
                      ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/40'
                      : 'bg-dark-300 text-gray-300 border border-dark-50 hover:border-dark-50/80'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">How does your mouth feel?</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'dry', label: 'Dry' },
                { value: 'normal', label: 'Normal' },
                { value: 'moist', label: 'Moist' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMoisture(opt.value)}
                  className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    moisture === opt.value
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-dark-300 text-gray-300 border border-dark-50 hover:border-dark-50/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="portal-btn bg-earth-300 hover:bg-earth-400 text-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Past Submissions</h2>
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="portal-card">
                <div className="flex gap-4">
                  {entry.image_url && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-dark-300 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.image_url}
                        alt="Tongue"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {format(new Date(entry.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {entry.body_color && (
                        <span className="badge-earth">{entry.body_color}</span>
                      )}
                      {entry.coating_color && (
                        <span className="badge-cyan">{entry.coating_color}</span>
                      )}
                      {entry.moisture && (
                        <span className="badge-success">{entry.moisture}</span>
                      )}
                      {entry.is_self_assessment && (
                        <span className="badge-warning">Self-assessed</span>
                      )}
                    </div>
                    {entry.practitioner_notes && (
                      <p className="text-xs text-gray-400 mt-2">
                        Practitioner: {entry.practitioner_notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && !capturedImage && (
        <div className="portal-card text-center py-8">
          <svg className="w-10 h-10 text-gray-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          <p className="text-gray-400 text-sm">No tongue assessments yet.</p>
          <p className="text-gray-500 text-xs mt-1">
            Take your first tongue photo above to get started.
          </p>
        </div>
      )}
    </div>
  );
}
