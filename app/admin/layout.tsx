'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Trophy,
  Users,
  UserCheck,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Competitions', href: '/admin/competitions', icon: Trophy },
  { name: 'Teams', href: '/admin/teams', icon: Users },
  { name: 'Evaluators', href: '/admin/evaluators', icon: UserCheck },
  { name: 'Leaderboard', href: '/admin/leaderboard', icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (role !== 'superadmin' && role !== 'organizer'))) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
      toast.success('Signed out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#888888]">Loading...</div>
      </div>
    );
  }

  if (!user || (role !== 'superadmin' && role !== 'organizer')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#0a0a0a] border-r border-[#333333] transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#333333]">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-semibold">CryptX</span>
            <span className="text-[#888888]">/</span>
            <span className="text-[#888888] text-sm">Admin</span>
          </Link>
          <button
            className="lg:hidden text-[#888888] hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-[#a1a1a1] hover:text-white hover:bg-[#171717]'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#333333]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#333333] flex items-center justify-center text-sm font-medium">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{user.email}</p>
              <p className="text-xs text-[#888888] capitalize">{role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[#888888]"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-[#333333] bg-[#0a0a0a]">
          <button
            className="text-[#888888] hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold">CryptX Admin</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
