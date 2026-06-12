import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Mic,
  BarChart2,
  Users,
  FolderOpen,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Sparkles },
    { name: 'Record Session', path: '/record', icon: Mic },
    { name: 'Consultations', path: '/consultations', icon: FolderOpen },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/40 backdrop-blur-md border-r border-slate-800/80 p-6 shrink-0 justify-between">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-astrology-500 to-indigo-600 shadow-lg shadow-astrology-950/50">
              <Sparkles className="h-6 w-6 text-accent-gold" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-astrology-300 bg-clip-text text-transparent">
                AstroRecord
              </span>
              <p className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">Manager</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    active
                      ? 'bg-astrology-600/20 text-astrology-300 border-l-2 border-astrology-500 shadow-inner shadow-astrology-950/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${active ? 'text-accent-gold' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-slate-800/80 pt-6 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
              <UserIcon className="h-5 w-5 text-astrology-400" />
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200 active:scale-98"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Toggleable) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm">
          <div className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent-gold" />
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-astrology-300 bg-clip-text text-transparent">
                    AstroRecord
                  </span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                        active
                          ? 'bg-astrology-600/20 text-astrology-300 border-l-2 border-astrology-500'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-slate-850 pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-astrology-400" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl font-medium text-sm text-rose-450 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="flex items-center justify-between md:justify-end px-6 py-4 border-b border-slate-900 bg-slate-950/20 backdrop-blur-md z-10 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-850"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-[11px] px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold tracking-wider uppercase">
              Vedic Assistant Ready
            </span>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto px-6 py-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default Layout;
