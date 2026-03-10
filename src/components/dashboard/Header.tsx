'use client';

import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Header() {
  const { profile, toggleSidebar } = useAppStore();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
    router.push('/auth/login');
  };

  return (
    <header className="h-14 bg-dark-500 border-b border-dark-50 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-dark-200 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right mr-2">
          <div className="text-sm text-white">{profile?.full_name}</div>
          <div className="text-xs text-gray-500">Practitioner</div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-dark-200 rounded-lg transition-colors text-gray-400 hover:text-white text-sm"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
