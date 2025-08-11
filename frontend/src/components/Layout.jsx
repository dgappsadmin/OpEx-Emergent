import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Plus, 
  GitBranch, 
  BarChart3, 
  FileX, 
  FileText,
  LogOut,
  User
} from 'lucide-react';

const Layout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/initiatives/new', icon: Plus, label: 'New Initiative' },
    { path: '/workflow', icon: GitBranch, label: 'Workflow' },

    { path: '/kpi-tracking', icon: BarChart3, label: 'KPI Tracking' },
    { path: '/closure', icon: FileX, label: 'Closure' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl border-r border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            OpEx Manager
          </h1>
          <p className="text-sm text-slate-600 mt-1">Operational Excellence</p>
        </div>
        
        <nav className="p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 hover:scale-[1.02] ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.role} • {user?.site}</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            size="sm" 
            className="w-full text-slate-600 hover:text-red-600 hover:border-red-300"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <div className="bg-white shadow-sm border-b border-slate-200 px-8 py-6">
          <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;