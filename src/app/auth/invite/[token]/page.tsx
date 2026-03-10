'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function InvitePage() {
  const [practiceName, setPracticeName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [patientId, setPatientId] = useState('');
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const token = params.token as string;

  useEffect(() => {
    async function validateToken() {
      const { data, error } = await supabase
        .from('patients')
        .select('id, email, first_name, last_name, practice_id, practices:practice_id(name)')
        .eq('invite_token', token)
        .single();

      if (error || !data) {
        setValid(false);
      } else {
        setValid(true);
        setPatientId(data.id);
        setEmail(data.email || '');
        setFullName(`${data.first_name} ${data.last_name}`);
        setPracticeName((data as any).practices?.name || '');
      }
      setValidating(false);
    }
    validateToken();
  }, [token, supabase]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'patient' } },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Link patient record to user
      await supabase
        .from('patients')
        .update({ user_id: data.user.id, invite_token: null })
        .eq('id', patientId);

      toast.success('Welcome! Your patient portal is ready.');
      router.push('/portal');
    }

    setLoading(false);
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Validating invitation...</div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <h1 className="text-xl font-bold text-white mb-2">Invalid Invitation</h1>
          <p className="text-gray-400">
            This invitation link is invalid or has already been used.
            Please contact your practitioner for a new invitation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-cyan-400/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-cyan-400 text-2xl">✦</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Join {practiceName}</h1>
          <p className="text-gray-400 mt-2">Create your patient portal account</p>
        </div>

        <form onSubmit={handleSignup} className="card space-y-5">
          <div>
            <label className="input-label">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="input-label">Create Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Min 8 characters"
              minLength={8}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-cyan w-full py-3">
            {loading ? 'Creating Account...' : 'Create Patient Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
