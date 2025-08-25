import React, { useState } from 'react';
import { Users, Circle, Clock, User, Globe, Calendar, FileText, Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStatusData } from '../hooks/useStatusData';
import { useTimezone } from '../hooks/useTimezone';
import { ActiveTimeDisplay } from './ActiveTimeDisplay';

export const StatusPage: React.FC = () => {
  const { user, allUsers } = useAuth();
  const { statuses, updateStatus, getStatus, getStatusTimestamp } = useStatusData();
  const { selectedTimezone, setSelectedTimezone, formatTime, getTimezoneAbbreviation, availableTimezones } = useTimezone();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showMemoInput, setShowMemoInput] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const getStatusColor = (status: 'active' | 'available-for-work' | 'not-available') => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'available-for-work':
        return 'text-blue-500';
      case 'not-available':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBgColor = (status: 'active' | 'available-for-work' | 'not-available') => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200';
      case 'available-for-work':
        return 'bg-blue-50 border-blue-200';
      case 'not-available':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: 'active' | 'available-for-work' | 'not-available') => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'available-for-work':
        return 'Available for Work';
      case 'not-available':
        return 'Not Available';
      default:
        return 'Unknown';
    }
  };

  const canSetStatus = user?.role === 'admin' || user?.role === 'member';

  const handleStatusChange = (userId: string, newStatus: 'active' | 'available-for-work' | 'not-available') => {
    if (!user) {
      console.error('No authenticated user');
      return;
    }

    // Only allow users to update their own status, or admins to update any status
    if (user.role !== 'admin' && userId !== user.id) {
      console.error('Unauthorized status update attempt');
      return;
    }

    // Validate UUID format
    if (!userId || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.error('Invalid user ID format:', userId);
      return;
    }

    updateStatus(userId, newStatus)
      .then((success) => {
        if (!success) {
          console.error('Failed to update status');
        }
      })
      .catch((error) => {
        console.error('Error updating status:', error);
      });
  };

  const handleSaveMemo = () => {
    if (pendingUserId && memoText.trim()) {
      updateStatus(pendingUserId, 'active', memoText.trim());
      setShowMemoInput(false);
      setMemoText('');
      setPendingUserId(null);
    }
  };

  const handleCancelMemo = () => {
    setShowMemoInput(false);
    setMemoText('');
    setPendingUserId(null);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Team Status</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-gray-600">View and manage team member availability status</p>
          
          {/* Timezone Selector */}
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-500" />
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              {availableTimezones.map(timezone => (
                <option key={timezone} value={timezone}>
                  {timezone} Time ({timezone === 'Bangladesh' ? 'BST' : 'CET'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* My Status Update - For Members and Admins */}
      {canSetStatus && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Update My Status</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleStatusChange(user!.id, 'active')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                getStatus(user!.id) === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
              }`}
            >
              <Circle className="w-4 h-4" />
              Active - Working
            </button>
            
            <button
              onClick={() => handleStatusChange(user!.id, 'available-for-work')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                getStatus(user!.id) === 'available-for-work'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <Circle className="w-4 h-4" />
              Available for Work
            </button>
            
            <button
              onClick={() => handleStatusChange(user!.id, 'not-available')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                getStatus(user!.id) === 'not-available'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700'
              }`}
            >
              <Circle className="w-4 h-4" />
              Not Available
            </button>
          </div>
        </div>
      )}



      {/* All Team Members Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Team Members</h2>
          <p className="text-gray-600 text-sm mt-1">Current availability status for all team members</p>
        </div>
        
        <div className="p-6">
          <div className="grid gap-4">
            {allUsers
              .filter(u => u.role !== 'viewer') // Don't show viewers in status list
              .map((member) => {
                const status = getStatus(member.id);
                const statusTimestamp = getStatusTimestamp(member.id);
                const lastUpdated = statusTimestamp 
                  ? new Date(statusTimestamp).toLocaleString()
                  : 'Never updated';
                
                return (
                  <div
                    key={member.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border-2 transition-all gap-4 ${getStatusBgColor(status)}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          status === 'active' 
                            ? 'bg-green-500' 
                            : status === 'available-for-work'
                            ? 'bg-blue-500'
                            : 'bg-red-500'
                        }`}></div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{member.role}</div>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : status === 'available-for-work'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <Circle className={`w-3 h-3 ${getStatusColor(status)}`} />
                        {getStatusText(status)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        {statusTimestamp ? `Updated ${formatTime(statusTimestamp)} on ${new Date(statusTimestamp).toLocaleDateString()}` : 'Never updated'}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <h3 className="font-medium text-gray-900 mb-3">Status Legend</h3>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-700">Active - Currently working</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-700">Available for Work - Ready to take on tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-700">Not Available - Away</span>
          </div>
        </div>
      </div>
    </div>
  );
};