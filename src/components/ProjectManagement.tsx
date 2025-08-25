import React, { useState } from 'react';
import { FolderOpen, Plus, X, AlertCircle, Trash2 } from 'lucide-react';

interface ProjectManagementProps {
  isOpen: boolean;
  onClose: () => void;
  projects: string[];
  onAddProject: (projectName: string) => void;
  onRemoveProject: (projectName: string) => void;
}

export const ProjectManagement: React.FC<ProjectManagementProps> = ({
  isOpen,
  onClose,
  projects,
  onAddProject,
  onRemoveProject
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [createError, setCreateError] = useState('');
  const [deletingProject, setDeletingProject] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    
    if (!newProjectName.trim()) {
      setCreateError('Project name is required');
      return;
    }
    
    // Check if project already exists
    if (projects.some(p => p.toLowerCase() === newProjectName.trim().toLowerCase())) {
      setCreateError('Project already exists');
      return;
    }
    
    onAddProject(newProjectName.trim());
    setNewProjectName('');
    setShowCreateForm(false);
    setCreateError('');
  };

  const handleRemoveProject = async (projectName: string) => {
    try {
      await onRemoveProject(projectName);
      setDeletingProject(null);
    } catch (error) {
      console.error('Error removing project:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Project Management</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-96">
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{project}</div>
                    <div className="text-sm text-gray-500">Project Code</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {deletingProject === project ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600">Remove project and all logs?</span>
                      <button
                        onClick={() => handleRemoveProject(project)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingProject(null)}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingProject(project)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Project
              </button>
            ) : (
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-4">Create New Project</h3>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., RHB, RHR, BAY"
                      required
                    />
                  </div>
                  {createError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {createError}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Project
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};