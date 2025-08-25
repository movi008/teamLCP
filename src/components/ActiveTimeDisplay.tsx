import React, { useEffect, useState } from 'react';
import { Clock, User, FileText } from 'lucide-react';
import { useActiveTimeTracking } from '../hooks/useActiveTimeTracking';
import { useAuth } from '../hooks/useAuth';
import { useTimezone } from '../hooks/useTimezone';

interface ActiveTimeDisplayProps {
  selectedDate?: string;
}

export const ActiveTimeDisplay: React.FC<ActiveTimeDisplayProps> = ({ 
  selectedDate = new Date().toISOString().split('T')[0] 
}) => {
  const [, forceUpdate] = useState({});
  const { 
    getAllUsersActiveTimeForDate, 
    formatDuration, 
    isUserCurrentlyActive,
    getCurrentActiveUsers,
    activeTimeData
  } = useActiveTimeTracking();
  const { allUsers, user } = useAuth();
  const { formatTime } = useTimezone();

  // Force re-render every 2 seconds to show live updates
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const dailyUserSummaries = getAllUsersActiveTimeForDate(selectedDate);
  const currentlyActiveUsers = getCurrentActiveUsers();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    
    if (dateStr === today) {
      return 'Today';
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Active Time Tracking</h2>
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(selectedDate)}
        </div>
      </div>

      {/* Currently Active Users */}
      {currentlyActiveUsers.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Currently Active ({currentlyActiveUsers.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentlyActiveUsers.map(user => (
              <span
                key={user.id}
                className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                <User className="w-3 h-3" />
                {user.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Individual User Active Times */}
      <div className="space-y-6">
        <h3 className="font-medium text-gray-900 mb-3">Active Time & Work Sessions</h3>

        {/* Show users with recorded time or currently active */}
        {(isAdmin ? allUsers : allUsers.filter(u => u.id === user?.id))
          .filter(u => {
            const userData = dailyUserSummaries.find(data => data.userId === u.id);
            return (userData && userData.activeSeconds > 0) || isUserCurrentlyActive(u.id);
          })
          .map(u => {
            const userData = dailyUserSummaries.find(data => data.userId === u.id) || {
              userId: u.id,
              userName: u.name,
              activeSeconds: 0
            };
            const isActive = isUserCurrentlyActive(u.id);
            const userActiveTimeEntry = dailyUserSummaries.find(entry => 
              entry.userId === u.id && entry.date === selectedDate
            );
            
            return (
              <div key={u.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* User Header */}
                <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${
                  isActive ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      {isActive && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{u.name}</div>
                      {isActive && (
                        <div className="text-xs text-green-600 font-medium">Currently Active</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      isActive ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {formatDuration(userData.activeSeconds)}
                    </div>
                    {userData.activeSeconds > 0 && (
                      <div className="text-xs text-gray-500">
                        {Math.round(userData.activeSeconds / 3600 * 100) / 100}h total
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Work Sessions List */}
                {userActiveTimeEntry && userActiveTimeEntry.sessions.length > 0 && (
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Work Sessions ({userActiveTimeEntry.sessions.length})
                    </h4>
                    <div className="space-y-2">
                      {userActiveTimeEntry.sessions
                        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                        .map((session, index) => (
                        <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">
                                {formatTime(session.startTime)}
                                {session.endTime && ` - ${formatTime(session.endTime)}`}
                              </span>
                            </div>
                            {session.memo && (
                              <p className="text-sm text-gray-900 mb-1">{session.memo}</p>
                            )}
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDuration(session.durationSeconds)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        
        {/* Show message if no users with active time */}
        {(isAdmin ? allUsers : allUsers.filter(u => u.id === user?.id))
          .filter(u => {
            const userData = dailyUserSummaries.find(data => data.userId === u.id);
            return (userData && userData.activeSeconds > 0) || isUserCurrentlyActive(u.id);
          }).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No active time recorded for {formatDate(selectedDate)}</p>
          </div>
        )}
      </div>
    </div>
  );
};