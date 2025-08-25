import React, { useState } from 'react';
import { Clock, Edit3, Check, X, Trash2, Square, CheckSquare } from 'lucide-react';
import { LogEntry } from '../types';

interface LogTableProps {
  logs: LogEntry[];
  onUpdateDescription: (id: string, description: string) => void;
  onDeleteLog: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  canEdit: (entry: LogEntry) => boolean;
  canDelete: boolean;
  isAdmin?: boolean;
}

export const LogTable: React.FC<LogTableProps> = ({ 
  logs, 
  onUpdateDescription, 
  onDeleteLog, 
  onBulkDelete,
  canEdit, 
  canDelete,
  isAdmin = false
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(logs.map(log => log.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (onBulkDelete && selectedIds.length > 0) {
      try {
        const success = await onBulkDelete(selectedIds);
        if (success !== false) {
          setSelectedIds([]);
          setConfirmingBulkDelete(false);
          setShowBulkDelete(false);
        } else {
          console.error('Failed to bulk delete logs');
        }
      } catch (error) {
        console.error('Error bulk deleting logs:', error);
      }
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startEditing = (entry: LogEntry) => {
    setEditingId(entry.id);
    setEditValue(entry.description);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdateDescription(editingId, editValue);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleDelete = async () => {
    if (deletingId) {
      try {
        const success = await onDeleteLog(deletingId);
        if (success !== false) {
          setDeletingId(null);
        } else {
          console.error('Failed to delete log');
        }
      } catch (error) {
        console.error('Error deleting log:', error);
      }
    }
  };

  if (logs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
          <p className="text-gray-500">Try adjusting your filters to see more results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Bulk Delete Controls - Admin Only */}
      {isAdmin && canDelete && (
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {!showBulkDelete ? (
                <button
                  onClick={() => setShowBulkDelete(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Square className="w-4 h-4" />
                  Bulk Delete
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    Clear
                  </button>
                  <span className="text-sm text-gray-600">
                    {selectedIds.length} selected
                  </span>
                </div>
              )}
            </div>
            
            {showBulkDelete && (
              <div className="flex items-center gap-2">
                {selectedIds.length > 0 && (
                  <>
                    {!confirmingBulkDelete ? (
                      <button
                        onClick={() => setConfirmingBulkDelete(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected ({selectedIds.length})
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-600">Delete {selectedIds.length} logs?</span>
                        <button
                          onClick={handleBulkDelete}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmingBulkDelete(false)}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </>
                )}
                <button
                  onClick={() => {
                    setShowBulkDelete(false);
                    setSelectedIds([]);
                    setConfirmingBulkDelete(false);
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="hidden lg:block">
        <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {showBulkDelete && isAdmin && (
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                Select
              </th>
            )}
            <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Project
            </th>
            <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Worker
            </th>
            <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Activity
            </th>
            <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration & Hours
            </th>
            <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
              {showBulkDelete && isAdmin && (
                <td className="px-4 sm:px-6 py-4">
                  <button
                    onClick={() => toggleSelection(entry.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {selectedIds.includes(entry.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </td>
              )}
              <td className="px-4 sm:px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{formatDateDisplay(entry.date)}</div>
                  <div className="text-sm text-blue-600">{entry.project}</div>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4">
                <div className="text-sm text-gray-900">{entry.workers}</div>
              </td>
              <td className="px-4 sm:px-6 py-4">
                <div className="text-sm text-gray-900">{entry.activity}</div>
              </td>
              <td className="px-4 sm:px-6 py-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Clock className="w-4 h-4" />
                    {entry.duration}
                  </div>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4 max-w-xs">
                {deletingId === entry.id ? (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-red-700">Delete this activity?</span>
                    <button onClick={handleDelete} className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">Yes</button>
                    <button onClick={() => setDeletingId(null)} className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">No</button>
                  </div>
                ) : 
                editingId === entry.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm text-gray-900 line-clamp-2">{entry.description || 'No description'}</div>
                    <div className="flex gap-1">
                      {canEdit(entry) && (
                      <button
                        onClick={() => startEditing(entry)}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                      {canDelete && (
                        <button
                          onClick={() => confirmDelete(entry.id)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4 p-4">
        {logs.map((entry) => (
          <div key={entry.id} className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${
            selectedIds.includes(entry.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}>
            {showBulkDelete && isAdmin && (
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => toggleSelection(entry.id)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  {selectedIds.includes(entry.id) ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">
                    {selectedIds.includes(entry.id) ? 'Selected' : 'Select'}
                  </span>
                </button>
              </div>
            )}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm font-medium text-gray-900">{formatDateDisplay(entry.date)}</div>
                <div className="text-sm text-blue-600 font-medium">{entry.project}</div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <Clock className="w-4 h-4" />
                {entry.duration}
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-1">Worker:</div>
              <div className="text-sm font-medium text-gray-900">{entry.workers}</div>
            </div>
            
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-1">Activity:</div>
              <div className="text-sm text-gray-900">{entry.activity}</div>
            </div>
            
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-1">Description:</div>
              {deletingId === entry.id ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <span className="text-sm text-red-700">Delete this activity?</span>
                  <button onClick={handleDelete} className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">Yes</button>
                  <button onClick={() => setDeletingId(null)} className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">No</button>
                </div>
              ) : 
              editingId === entry.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm text-gray-900 flex-1">{entry.description || 'No description'}</div>
                  <div className="flex gap-1">
                    {canEdit(entry) && (
                      <button
                        onClick={() => startEditing(entry)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => confirmDelete(entry.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};