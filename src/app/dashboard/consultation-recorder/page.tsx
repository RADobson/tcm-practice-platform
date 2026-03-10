'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

type PatientOption = { id: string; first_name: string; last_name: string };

interface SOAPNotes {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface Recording {
  id: string;
  patient_id: string;
  audio_url: string;
  transcript: string;
  soap_notes: SOAPNotes;
  status: string;
  created_at: string;
}

export default function ConsultationRecorderPage() {
  const { practice, profile } = useAppStore();
  const supabase = createClient();

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loading, setLoading] = useState(true);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [soapNotes, setSoapNotes] = useState<SOAPNotes | null>(null);
  const [editedSoap, setEditedSoap] = useState<SOAPNotes>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  // History
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!practice) return;
    loadPatients();
  }, [practice]);

  useEffect(() => {
    if (!selectedPatientId || !practice) return;
    loadRecordings();
  }, [selectedPatientId, practice]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  async function loadPatients() {
    const { data } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .eq('practice_id', practice!.id)
      .eq('is_active', true)
      .order('last_name');
    setPatients(data || []);
    setLoading(false);
  }

  async function loadRecordings() {
    const { data } = await supabase
      .from('consultation_recordings')
      .select('*')
      .eq('patient_id', selectedPatientId)
      .order('created_at', { ascending: false })
      .limit(20);
    setRecordings((data as Recording[]) || []);
  }

  async function startRecording() {
    if (!selectedPatientId) {
      toast.error('Please select a patient first');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

      toast.success('Recording started');
    } catch {
      toast.error('Microphone access denied. Please allow microphone access.');
    }
  }

  function pauseRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  function resumeRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    }
  }

  async function stopRecording() {
    if (!mediaRecorderRef.current) return;

    return new Promise<Blob>((resolve) => {
      mediaRecorderRef.current!.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        resolve(blob);
      };
      mediaRecorderRef.current!.stop();
      mediaRecorderRef.current!.stream.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      setIsPaused(false);
    });
  }

  async function handleStopAndProcess() {
    const audioBlob = await stopRecording();
    if (!audioBlob || !practice) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('patient_id', selectedPatientId);
      formData.append('practice_id', practice.id);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Transcription failed');

      const data = await res.json();
      setTranscript(data.transcript || '');
      setSoapNotes(data.soap_notes || null);
      setEditedSoap(data.soap_notes || { subjective: '', objective: '', assessment: '', plan: '' });
      toast.success('Transcription and SOAP extraction complete');
      loadRecordings();
    } catch {
      toast.error('Failed to process recording');
    } finally {
      setProcessing(false);
    }
  }

  async function handleSaveToNotes() {
    if (!practice || !profile || !selectedPatientId) return;
    setSavingNote(true);
    try {
      const { error } = await supabase.from('clinical_notes').insert({
        practice_id: practice.id,
        patient_id: selectedPatientId,
        practitioner_id: profile.id,
        visit_date: new Date().toISOString(),
        subjective: editedSoap.subjective,
        objective: editedSoap.objective,
        assessment: editedSoap.assessment,
        plan: editedSoap.plan,
        patient_visible: false,
        is_signed: false,
      });
      if (error) throw error;
      toast.success('Clinical note saved');
    } catch {
      toast.error('Failed to save clinical note');
    } finally {
      setSavingNote(false);
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function loadFromRecording(rec: Recording) {
    setTranscript(rec.transcript || '');
    setSoapNotes(rec.soap_notes || null);
    setEditedSoap(rec.soap_notes || { subjective: '', objective: '', assessment: '', plan: '' });
    setShowHistory(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Consultation Recorder</h1>
          <p className="text-sm text-gray-400">Record, transcribe, and extract SOAP notes from consultations</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn-secondary text-sm"
        >
          {showHistory ? 'New Recording' : 'View History'}
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6">
        <p className="text-xs text-amber-400">
          Ensure patient consent before recording. AI-generated SOAP notes must be reviewed for accuracy before finalising.
        </p>
      </div>

      {/* Patient Selector */}
      <div className="card mb-6">
        <label className="input-label">Select Patient</label>
        <select
          className="input-field max-w-md"
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
        >
          <option value="">Choose a patient...</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.last_name}, {p.first_name}
            </option>
          ))}
        </select>
      </div>

      {!selectedPatientId ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3 opacity-30">🎙</div>
          <p className="text-gray-400">Select a patient to begin recording</p>
        </div>
      ) : showHistory ? (
        /* History */
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Recording History ({recordings.length})</h2>
          {recordings.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400">No recordings for this patient.</p>
            </div>
          ) : (
            recordings.map((rec) => (
              <div
                key={rec.id}
                className="card-hover cursor-pointer"
                onClick={() => loadFromRecording(rec)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">
                      {format(new Date(rec.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {rec.transcript?.substring(0, 150)}...
                    </p>
                  </div>
                  <span className={`badge ${rec.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                    {rec.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Recorder */}
          <div className="space-y-6">
            {/* Recording Controls */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Audio Recorder</h2>

              {/* Timer Display */}
              <div className="text-center mb-6">
                <div className={`text-5xl font-mono font-bold ${
                  isRecording ? (isPaused ? 'text-amber-400' : 'text-red-400') : 'text-gray-600'
                }`}>
                  {formatTime(recordingTime)}
                </div>
                {isRecording && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-red-400 animate-pulse'}`} />
                    <span className="text-xs text-gray-400">
                      {isPaused ? 'Paused' : 'Recording'}
                    </span>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-white" />
                  </button>
                ) : (
                  <>
                    {isPaused ? (
                      <button
                        onClick={resumeRecording}
                        className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors"
                        title="Resume"
                      >
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={pauseRecording}
                        className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center transition-colors"
                        title="Pause"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={handleStopAndProcess}
                      className="w-16 h-16 rounded-full bg-dark-200 border-2 border-red-500 hover:bg-dark-100 flex items-center justify-center transition-colors"
                      title="Stop & Process"
                    >
                      <div className="w-5 h-5 rounded-sm bg-red-500" />
                    </button>
                  </>
                )}
              </div>

              {!isRecording && recordingTime === 0 && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  Press the record button to start capturing the consultation
                </p>
              )}
            </div>

            {/* Processing Indicator */}
            {processing && (
              <div className="card border-cyan-400/20">
                <div className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <div>
                    <p className="text-sm text-cyan-400 font-medium">Processing audio...</p>
                    <p className="text-xs text-gray-500">Transcribing with Whisper, then extracting SOAP notes with GPT-4o</p>
                  </div>
                </div>
              </div>
            )}

            {/* Transcript */}
            {transcript && (
              <div className="card">
                <h3 className="text-sm font-medium text-white mb-3">Full Transcript</h3>
                <div className="bg-dark-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{transcript}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: SOAP Notes */}
          <div className="space-y-6">
            {!soapNotes && !processing ? (
              <div className="card text-center py-16">
                <div className="text-4xl mb-3 opacity-30">📋</div>
                <p className="text-gray-400">SOAP notes will appear here after recording</p>
              </div>
            ) : soapNotes ? (
              <>
                <div className="card border-cyan-400/20">
                  <h2 className="text-lg font-semibold text-cyan-400 mb-4">AI-Extracted SOAP Notes</h2>
                  <p className="text-xs text-gray-500 mb-4">Review and edit before saving to clinical notes.</p>

                  {/* Subjective */}
                  <div className="mb-4">
                    <label className="input-label">
                      <span className="text-cyan-400 font-bold mr-1">S</span> — Subjective
                    </label>
                    <textarea
                      className="input-field"
                      rows={4}
                      value={editedSoap.subjective}
                      onChange={(e) => setEditedSoap({ ...editedSoap, subjective: e.target.value })}
                    />
                  </div>

                  {/* Objective */}
                  <div className="mb-4">
                    <label className="input-label">
                      <span className="text-cyan-400 font-bold mr-1">O</span> — Objective
                    </label>
                    <textarea
                      className="input-field"
                      rows={4}
                      value={editedSoap.objective}
                      onChange={(e) => setEditedSoap({ ...editedSoap, objective: e.target.value })}
                    />
                  </div>

                  {/* Assessment */}
                  <div className="mb-4">
                    <label className="input-label">
                      <span className="text-cyan-400 font-bold mr-1">A</span> — Assessment
                    </label>
                    <textarea
                      className="input-field"
                      rows={4}
                      value={editedSoap.assessment}
                      onChange={(e) => setEditedSoap({ ...editedSoap, assessment: e.target.value })}
                    />
                  </div>

                  {/* Plan */}
                  <div className="mb-4">
                    <label className="input-label">
                      <span className="text-cyan-400 font-bold mr-1">P</span> — Plan
                    </label>
                    <textarea
                      className="input-field"
                      rows={4}
                      value={editedSoap.plan}
                      onChange={(e) => setEditedSoap({ ...editedSoap, plan: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveToNotes}
                  disabled={savingNote}
                  className="btn-primary w-full py-3"
                >
                  {savingNote ? 'Saving...' : 'Save as Clinical Note'}
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
