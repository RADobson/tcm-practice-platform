'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'practitioner' },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create practice
      const { error: practiceError } = await supabase
        .from('practices')
        .insert({ owner_id: data.user.id, name: practiceName });

      if (practiceError) {
        toast.error('Account created but failed to set up practice: ' + practiceError.message);
      } else {
        toast.success('Account created! Welcome to TCM Practice Platform.');
      }
      router.push('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-earth-300/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-earth-300 text-2xl">针</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Your Practice</h1>
          <p className="text-gray-400 mt-2">Set up your TCM practice management account</p>
        </div>

        <form onSubmit={handleSignup} className="card space-y-5">
          <div>
            <label className="input-label">Your Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="Dr. Zhang Wei"
              required
            />
          </div>
          <div>
            <label className="input-label">Practice Name</label>
            <input
              type="text"
              value={practiceName}
              onChange={(e) => setPracticeName(e.target.value)}
              className="input-field"
              placeholder="Harmony Acupuncture Clinic"
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
              placeholder="you@practice.com"
              required
            />
          </div>
          <div>
            <label className="input-label">Password</label>
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
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating Account...' : 'Create Practice Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-earth-300 hover:text-earth-200">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
