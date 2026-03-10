'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { setProfile, setPractice, sidebarOpen } = useAppStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setProfile(profile);

        if (profile.role === 'patient') {
          router.push('/portal');
          return;
        }

        const { data: practice } = await supabase
          .from('practices')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (practice) {
          setPractice(practice);
        }
      }

      setLoading(false);
    }
    init();
  }, [supabase, router, setProfile, setPractice]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-700">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-earth-300/30 border-t-earth-300 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading practice...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark-700">
      <Sidebar />
      <div className={`flex-1 flex flex-col ${sidebarOpen ? '' : ''}`}>
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
