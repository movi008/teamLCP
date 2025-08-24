import React, { useState } from 'react';
import { CheckSquare, Plus, X, User, FolderOpen, FileText, Clock, AlertCircle, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMorningCheckinData } from '../hooks/useMorningCheckinData';
import { useLogData } from '../hooks/useLogData';
import { useTimezone } from '../hooks/useTimezone';

export const MorningCheckinPage: React.FC = () => {
  const { user, allUsers } = useAuth();
  const { checkins, addCheckin, removeCheckin } = useMorningCheckinData();
  const { getUniqueValues } = useLogData(user?.name, user?.role);
  const { selectedTimezone, setSelectedTimezone, formatTime, availableTimezones } = useTimezone();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    project: '',
    task: '',
    memberName: user?.name || ''
  });
  const [error, setError] = useState('');

  const canAddTasks = user?.role === 'admin' || user?.role === 'member';
  const isAdmin = user?.role === 'admin';
  const projects = getUniqueValues('project');
  
  // Get available members (admin and member roles only)
  const availableMembers = allUsers.filter(u => u.role === 'admin' || u.role === 'member');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.project || !formData.task || !formData.memberName) {
      setError('Please fill in all fields');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    addCheckin({
      memberName: formData.memberName,
      project: formData.project,
      task: formData.task,
      timestamp: new Date().toISOString()
    });

    setFormData({ project: '', task: '', memberName: user?.name || '' });
    setShowAddForm(false);
  };

  // Reset form when showing/hiding
  const handleShowForm = () => {
    setFormData({
      project: '',
      task: '',
      memberName: user?.name || ''
    });
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setFormData({
      project: '',
      task: '',
      memberName: user?.name || ''
    });
    setShowAddForm(false);
    setError('');
  };

  const handleRemoveTask = (id: string) => {
    removeCheckin(id);
  };

  const canRemoveTask = (checkin: any) => {
    return isAdmin || checkin.memberName === user?.name;
  };

  // Group checkins by member
  const checkinsByMember = checkins.reduce((acc, checkin) => {
    if (!acc[checkin.memberName]) {
      acc[checkin.memberName] = [];
    }
    acc[checkin.memberName].push(checkin);
    return acc;
  }, {} as Record<string, typeof checkins>);

  const formatTimeLocal = (timestamp: string) => {
    return formatTime(timestamp);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <CheckSquare className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Morning Checkin</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-gray-600">Share what you're working on today</p>
          
          {/* Timezone Selector */}
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-500" />
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white"
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

      {/* Add Task Form */}
      {canAddTasks && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {isAdmin ? 'Add Task for Team Member' : 'Add Current Task'}
            </h2>
            {!showAddForm && (
              <button
                onClick={handleShowForm}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                {isAdmin ? 'Add Task for Member' : 'Add Task'}
              </button>
            )}
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Team Member *
                    </label>
                    <select
                      value={formData.memberName}
                      onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Select Member</option>
                      {availableMembers.map(member => (
                        <option key={member.id} value={member.name}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FolderOpen className="w-4 h-4 inline mr-2" />
                    Project *
                  </label>
                  <select
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                    <option value="new">+ Add New Project</option>
                  </select>
                  {formData.project === 'new' && (
                    <input
                      type="text"
                      placeholder="Enter new project name"
                      className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      onChange={(e) => {
                        if (e.target.value.trim()) {
                          setFormData({ ...formData, project: e.target.value.trim() });
                        }
                      }}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Task Description *
                  </label>
                  <input
                    type="text"
                    value={formData.task}
                    onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Working on user authentication API"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Team Tasks */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Team Tasks Today</h2>
          <p className="text-gray-600 text-sm mt-1">Current tasks being worked on by team members</p>
        </div>
        
        <div className="p-6">
          {Object.keys(checkinsByMember).length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks added yet</h3>
              <p className="text-gray-500">Team members haven't added their morning checkin tasks yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(checkinsByMember).map(([memberName, memberCheckins]) => {
                const member = allUsers.find(u => u.name === memberName);
                
                return (
                  <div key={memberName} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{memberName}</div>
                      </div>
                      <div className="ml-auto">
                        <span className="text-sm text-gray-500">
                          {memberCheckins.length} task{memberCheckins.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {memberCheckins.map((checkin) => (
                        <div key={checkin.id} className="flex flex-col sm:flex-row items-start justify-between p-4 bg-gray-50 rounded-lg gap-3">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                              <FolderOpen className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-blue-600">{checkin.project}</span>
                              <div className="flex items-center gap-1 text-xs text-gray-500 sm:ml-auto">
                                <Clock className="w-3 h-3" />
                                {formatTimeLocal(checkin.timestamp)}
                              </div>
                            </div>
                            <p className="text-gray-900">{checkin.task}</p>
                          </div>
                          
                          {canRemoveTask(checkin) && (
                            <button
                              onClick={() => handleRemoveTask(checkin.id)}
                              className="sm:ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors self-end sm:self-start"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};