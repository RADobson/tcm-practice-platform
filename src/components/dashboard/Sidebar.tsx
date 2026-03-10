'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '⊞' },
  { href: '/dashboard/patients', label: 'Patients', icon: '⊕' },
  { href: '/dashboard/appointments', label: 'Appointments', icon: '◷' },
  { href: '/dashboard/notes', label: 'Clinical Notes', icon: '✎' },
  { href: '/dashboard/diagnostics/tongue', label: 'Tongue Analysis', icon: '◉' },
  { href: '/dashboard/diagnostics/trigger-points', label: 'Trigger Points', icon: '◎' },
  { href: '/dashboard/diagnostics/pulse', label: 'Pulse Diagnosis', icon: '♡' },
  { href: '/dashboard/diagnostics/patterns', label: 'Pattern Diff.', icon: '⬡' },
  { href: '/dashboard/treatments', label: 'Treatments', icon: '⊹' },
  { href: '/dashboard/herbs', label: 'Herbal Formulas', icon: '❋' },
  { href: '/dashboard/billing', label: 'Billing', icon: '⊡' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '◈' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, practice } = useAppStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 bg-dark-500 border-r border-dark-50 h-screen sticky top-0 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-dark-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-earth-300/20 flex items-center justify-center">
            <span className="text-earth-300 text-lg">针</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-white truncate">
              {practice?.name || 'TCM Practice'}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Practice Platform</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-dark-50">
        <Link href="/dashboard/export" className="sidebar-link text-xs">
          <span className="w-5 text-center">↓</span>
          <span>Export Data</span>
        </Link>
      </div>
    </aside>
  );
}
