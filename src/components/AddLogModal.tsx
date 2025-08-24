import React, { useState } from 'react';
import { Plus, X, User, FolderOpen, FileText, AlertCircle } from 'lucide-react';
import { LogEntry } from '../types';

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLog: (log: Omit<LogEntry, 'id'>) => void;
  workers: string[];
  projects: string[];
}

export const AddLogModal: React.FC<AddLogModalProps> = ({
  isOpen,
  onClose,
  onAddLog,
  workers,
  projects
}) => {
  const [formData, setFormData] = useState({
    activity: '',
    project: '',
    workers: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    upworkHours: 0,
    description: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const parseDuration = (duration: string) => {
    const parts = duration.split(':');
    if (parts.length !== 3) return 0;
    
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.activity || !formData.project || !formData.workers || !formData.duration) {
      setError('Please fill in all required fields');
      return;
    }

    const durationSeconds = parseDuration(formData.duration);
    if (durationSeconds <= 0) {
      setError('Please enter a valid duration in HH:MM:SS format');
      return;
    }

    const newLog: Omit<LogEntry, 'id'> = {
      activity: formData.activity,
      project: formData.project,
      workers: formData.workers,
      duration: formData.duration,
      duration_seconds: durationSeconds,
      upwork_hours: formData.upworkHours,
      description: formData.description,
      date: formData.date
    };

    onAddLog(newLog);
    
    // Reset form
    setFormData({
      activity: '',
      project: '',
      workers: '',
      date: new Date().toISOString().split('T')[0],
      duration: '',
      upworkHours: 0,
      description: ''
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Add Activity Log</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Activity Description *
              </label>
              <input
                type="text"
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., RHB - CRM bug fix and testing"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FolderOpen className="w-4 h-4 inline mr-2" />
                Project *
              </label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Worker *
              </label>
              <select
                value={formData.workers}
                onChange={(e) => setFormData({ ...formData, workers: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Worker</option>
                {workers.map(worker => (
                  <option key={worker} value={worker}>{worker}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (HH:MM:SS) *
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 07:44:31"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upwork Hours
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.upworkHours}
                onChange={(e) => setFormData({ ...formData, upworkHours: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 7.74"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Add detailed description of the work done..."
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-4">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium"
            >
              Add Activity Log
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};