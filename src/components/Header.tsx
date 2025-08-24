import React from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onProfileOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onProfileOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lattice Code Pro Team</h1>
          <p className="text-gray-600 text-xs sm:text-sm">Activity tracking and time management</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={onProfileOpen}
            className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl w-full sm:w-auto transition-colors group"
          >
            <User className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-blue-600">{user?.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
            </div>
          </button>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all w-full sm:w-auto justify-center"
            >
              <LogOut className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Sign Out</span>
              <span className="text-xs sm:text-sm font-medium sm:hidden">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};