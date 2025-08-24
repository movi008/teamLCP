import React, { useState, useEffect } from 'react';
import { Clock, User, FolderOpen, Calendar, Filter, X, Save, FileText, Edit3, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStatusData } from '../hooks/useStatusData';
import { useActiveTimeTracking } from '../hooks/useActiveTimeTracking';
import { useTimezone } from '../hooks/useTimezone';
import { useLogData } from '../hooks/useLogData';

export const ActiveTimeMemoPage: React.FC = () => {
  const { user, allUsers } = useAuth();
  const { getStatus, updateStatus } = useStatusData();
  const { formatDuration, getUserActiveTimeForDate, getActiveTimeData } = useActiveTimeTracking();
  const { formatTime } = useTimezone();
  const { getUniqueValues } = useLogData(user?.name, user?.role);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMember, setSelectedMember] = useState('');
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [, forceUpdate] = useState({});
  const [editingMemo, setEditingMemo] = useState<{userId: string, sessionIndex: number} | null>(null);
  const [editMemoText, setEditMemoText] = useState('');
  const [activeTimeData, setActiveTimeData] = useState(() => getActiveTimeData());

  const projects = getUniqueValues('project');
  const isAdmin = user?.role === 'admin';
  const canSetStatus = user?.role === 'admin' || user?.role === 'member';

  // Force re-render every 3 seconds for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimeData(getActiveTimeData());
      forceUpdate({});
    }, 500);
    
    return () => clearInterval(interval);
  }, []);


  // Filter members based on role and selection
  const filteredMembers = allUsers.filter(member => {
    if (member.role === 'viewer') return false;
    if (!isAdmin && member.id !== user?.id) return false;
    if (selectedMember && member.name !== selectedMember) return false;
    return true;
  });

  const handleActiveClick = (userId: string) => {
    if (getStatus(userId) === 'active') {
      // If already active, just toggle off
      updateStatus(userId, 'available-for-work');
    } else {
      // Show memo modal for setting active
      setPendingUserId(userId);
      setShowMemoModal(true);
    }
  };

  const handleSaveMemo = () => {
    if (pendingUserId && memoText.trim() && selectedProject) {
      const memoWithProject = `[${selectedProject}] ${memoText.trim()}`;
      updateStatus(pendingUserId, 'active', memoWithProject);
      setShowMemoModal(false);
      setMemoText('');
      setSelectedProject('');
      setPendingUserId(null);
    }
  };

  const handleCancelMemo = () => {
    setShowMemoModal(false);
    setMemoText('');
    setSelectedProject('');
    setPendingUserId(null);
  };

  const handleEditMemo = (userId: string, sessionIndex: number, currentMemo: string) => {
    setEditingMemo({ userId, sessionIndex });
    setEditMemoText(currentMemo);
  };

  const handleSaveEditMemo = () => {
    if (editingMemo && editMemoText.trim()) {
      const activeTimeData = getActiveTimeData();
      const userEntry = activeTimeData.find(entry => 
        entry.userId === editingMemo.userId && entry.date === selectedDate
      );
      
      if (userEntry && userEntry.sessions[editingMemo.sessionIndex]) {
        userEntry.sessions[editingMemo.sessionIndex].memo = editMemoText.trim();
        localStorage.setItem('active_time_data', JSON.stringify(activeTimeData));
        forceUpdate({});
      }
      
      setEditingMemo(null);
      setEditMemoText('');
    }
  };

  const handleCancelEditMemo = () => {
    setEditingMemo(null);
    setEditMemoText('');
  };

  const handleDeleteSession = (userId: string, sessionIndex: number) => {
    if (confirm('Are you sure you want to delete this work session?')) {
      const activeTimeData = getActiveTimeData();
      const userEntry = activeTimeData.find(entry => 
        entry.userId === userId && entry.date === selectedDate
      );
      
      if (userEntry && userEntry.sessions[sessionIndex]) {
        const deletedSession = userEntry.sessions[sessionIndex];
        userEntry.sessions.splice(sessionIndex, 1);
        userEntry.totalSeconds -= deletedSession.durationSeconds;
        localStorage.setItem('active_time_data', JSON.stringify(activeTimeData));
        forceUpdate({});
      }
    }
  };

  // Get user's sessions for selected date
  const getUserSessions = (userId: string) => {
    const userEntry = activeTimeData.find(entry => 
      entry.userId === userId && entry.date === selectedDate
    );
    return userEntry?.sessions || [];
  };

  const formatDateDisplay = (dateStr: string) => {
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

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Active Time & Memos</h1>
        </div>
        <p className="text-gray-600">Track active work time and view detailed work session memos</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Filter by Member
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Members</option>
                {allUsers
                  .filter(u => u.role !== 'viewer')
                  .map(member => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-6">
        {filteredMembers.map(member => {
          const currentStatus = getStatus(member.id);
          const totalActiveTime = getUserActiveTimeForDate(member.id, selectedDate);
          const sessions = getUserSessions(member.id);
          const isCurrentlyActive = currentStatus === 'active';

          return (
            <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Member Header */}
              <div className={`p-6 border-b border-gray-200 ${
                isCurrentlyActive ? 'bg-green-50' : 'bg-gray-50'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      {isCurrentlyActive && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">{member.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{member.role}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        isCurrentlyActive ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {formatDuration(totalActiveTime)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total for {formatDateDisplay(selectedDate)}
                      </div>
                    </div>
                    
                    {canSetStatus && (member.id === user?.id || isAdmin) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleActiveClick(member.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                            isCurrentlyActive
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          {isCurrentlyActive ? 'Stop Working' : 'Start Working'}
                        </button>
                        {!isCurrentlyActive && (
                          <>
                            <button
                              onClick={() => updateStatus(member.id, 'available-for-work')}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                                currentStatus === 'available-for-work'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                              }`}
                            >
                              Available
                            </button>
                            <button
                              onClick={() => updateStatus(member.id, 'not-available')}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                                currentStatus === 'not-available'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700'
                              }`}
                            >
                              Not Available
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Current Status */}
                <div className="mt-4 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isCurrentlyActive ? 'bg-green-500' : 
                    currentStatus === 'available-for-work' ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    Current Status: {getStatusText(currentStatus)}
                  </span>
                </div>
              </div>

              {/* Sessions List */}
              <div className="p-6">
                {sessions.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Work Sessions ({sessions.length})
                    </h4>
                    <div className="space-y-3">
                      {sessions
                        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                        .map((session, index) => {
                          // Extract project from memo if it exists
                          const memoMatch = session.memo?.match(/^\[([^\]]+)\]\s*(.*)$/);
                          const project = memoMatch ? memoMatch[1] : 'No Project';
                          const memo = memoMatch ? memoMatch[2] : session.memo || 'No memo';
                          
                          return (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FolderOpen className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-blue-600">{project}</span>
                                  </div>
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <p className="text-gray-900 flex-1">{memo}</p>
                                    {isAdmin && (
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => handleEditMemo(member.id, index, memo)}
                                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSession(member.id, index)}
                                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      {formatTime(session.startTime)}
                                      {session.endTime && ` - ${formatTime(session.endTime)}`}
                                      {!session.endTime && ' (ongoing)'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-900">
                                    {formatDuration(session.durationSeconds)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {(session.durationSeconds / 3600).toFixed(2)}h
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No work sessions recorded for {formatDateDisplay(selectedDate)}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredMembers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-500">
              {selectedMember ? 'No member matches the selected filter.' : 'No team members available.'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Memo Modal */}
      {editingMemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Memo</h3>
            </div>
            
            <div className="p-6">
              <textarea
                value={editMemoText}
                onChange={(e) => setEditMemoText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Edit memo..."
              />
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleSaveEditMemo}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={handleCancelEditMemo}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Memo Input Modal */}
      {showMemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Start Working</h3>
              <p className="text-sm text-gray-600 mt-1">What are you working on?</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FolderOpen className="w-4 h-4 inline mr-2" />
                  Project *
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Task Description *
                </label>
                <textarea
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  placeholder="Describe what you're working on..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  rows={3}
                  autoFocus
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleSaveMemo}
                disabled={!memoText.trim() || !selectedProject}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                Start Working
              </button>
              <button
                onClick={handleCancelMemo}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatDateDisplay = (dateStr: string) => {
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