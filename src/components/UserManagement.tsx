import React, { useState } from 'react';
import { Users, Plus, X, Mail, User, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ isOpen, onClose }) => {
  const { allUsers, createUser, createViewer, removeUser, user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'member' | 'viewer'>('member');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    
    const trimmedName = newUserName.trim();
    const trimmedEmail = newUserEmail.trim();
    
    if (!trimmedName || !trimmedEmail) {
      setCreateError('Name and email are required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setCreateError('Please enter a valid email address');
      return;
    }
    
    // Check if email already exists
    if (allUsers.some(u => u.email.toLowerCase() === trimmedEmail.toLowerCase())) {
      setCreateError('Email already exists');
      return;
    }
    
    const createUserAsync = async () => {
      try {
        const newUser = newUserRole === 'viewer' 
          ? await createViewer(trimmedEmail, trimmedName)
          : await createUser(trimmedEmail, trimmedName);
          
        if (newUser) {
          setNewUserEmail('');
          setNewUserName('');
          setNewUserRole('member');
          setShowCreateForm(false);
          setCreateError('');
        } else {
          setCreateError('Failed to create user');
        }
      } catch (error) {
        console.error('Error creating user:', error);
        setCreateError('Failed to create user');
      }
    };
    
    createUserAsync();
  };

  const handleRemoveUser = (userId: string) => {
    if (deletingUserId === userId) {
      removeUser(userId).then(success => {
        if (success) {
          setDeletingUserId(null);
        } else {
          console.error('Failed to remove user');
        }
      }).catch(error => {
        console.error('Error removing user:', error);
        setDeletingUserId(null);
      });
    }
  };
  const isAdmin = user?.role === 'admin';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
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
            {allUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    u.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : u.role === 'viewer'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role}
                  </span>
                  {isAdmin && u.role !== 'admin' && (
                    <div>
                      {deletingUserId === u.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-600">Remove {u.role}?</span>
                          <button
                            onClick={() => handleRemoveUser(u.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeletingUserId(null)}
                            className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingUserId(u.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isAdmin && (
            <div className="mt-6">
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New User
                </button>
              ) : (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-4">Create New User</h3>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User Role
                      </label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as 'member' | 'viewer')}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="member">Member (Can add/edit logs)</option>
                        <option value="viewer">Viewer (Read-only access)</option>
                      </select>
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
                        Create User
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
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      <strong>Note:</strong> New users can sign in with password: demo123
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};