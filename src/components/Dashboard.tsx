import React, { useState } from 'react';
import { BarChart3, Clock, Users, FolderOpen, Plus, Upload, Download, Activity } from 'lucide-react';
import { Header } from './Header';
import { FilterPanel } from './FilterPanel';
import { LogTable } from './LogTable';
import { UserManagement } from './UserManagement';
import { AddLogModal } from './AddLogModal';
import { CSVImportModal } from './CSVImportModal';
import { ProjectManagement } from './ProjectManagement';
import { ProfileModal } from './PasswordChangeModal';
import { StatusPage } from './StatusPage';
import { MorningCheckinPage } from './MorningCheckinPage';
import { ActiveTimeMemoPage } from './ActiveTimeMemoPage';
import { useAuth } from '../hooks/useAuth';
import { useLogData } from '../hooks/useLogData';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { logData, filters, setFilters, updateDescription, addLog, deleteLog, bulkDeleteLogs, importLogs, getUniqueValues, exportToCSV, addProject, removeProject } = useLogData(
    user?.name,
    user?.role
  );
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showProjectManagement, setShowProjectManagement] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentView, setCurrentView] = useState<'logs' | 'status' | 'checkin' | 'active-time'>('logs');

  const isAdmin = user?.role === 'admin';
  const canAddLogs = user?.role === 'admin' || user?.role === 'member';

  const canEditDescription = (entry: any) => {
    return (isAdmin || entry.workers === user?.name) && user?.role !== 'viewer';
  };

  if (currentView === 'checkin') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header onProfileOpen={() => setShowProfile(true)} />
        
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={() => setCurrentView('logs')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === 'logs' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Activity Logs</span>
            </button>
            <button
              onClick={() => setCurrentView('status')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === 'status' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Team Status</span>
            </button>
            <button
              onClick={() => setCurrentView('active-time')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === 'active-time' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
              disabled={!isAdmin}
              style={{ opacity: !isAdmin ? 0.5 : 1, cursor: !isAdmin ? 'not-allowed' : 'pointer' }}
            >
              <Clock className="w-4 h-4" />
              <span>Active Time</span>
            </button>
            <button
              onClick={() => setCurrentView('checkin')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === 'checkin' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Morning Checkin</span>
            </button>
          </div>
        </div>

        <MorningCheckinPage />
        
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-auto">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              All rights reserved - Lattice Code Pro
            </p>
          </div>
        </footer>
      </div>
    );
  }

  if (currentView === 'active-time') {
    // Redirect non-admin users back to logs
    if (!isAdmin) {
      setCurrentView('logs');
      return null;
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header onProfileOpen={() => setShowProfile(true)} />
        
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={() => setCurrentView('logs')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === 'logs' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Activity Logs</span>
            </button>
            <button
              onClick={() => setCurrentView('status')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === 'status' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Team Status</span>
            </button>
            <button
              onClick={() => setCurrentView('active-time')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === 'active-time' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
              disabled={!isAdmin}
              style={{ opacity: !isAdmin ? 0.5 : 1, cursor: !isAdmin ? 'not-allowed' : 'pointer' }}
            >
              <Clock className="w-4 h-4" />
              <span>Active Time</span>
            </button>
            <button
              onClick={() => setCurrentView('checkin')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === 'checkin' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Morning Checkin</span>
            </button>
          </div>
        </div>

        <ActiveTimeMemoPage />
        
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-auto">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              All rights reserved - Lattice Code Pro
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Calculate stats
  const totalHours = logData.reduce((sum, entry) => sum + entry.duration_seconds, 0) / 3600;
  const uniqueProjects = getUniqueValues('project').length;
  const uniqueWorkers = getUniqueValues('workers').length;

  if (currentView === 'status') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header onProfileOpen={() => setShowProfile(true)} />
        
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={() => setCurrentView('logs')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === 'logs' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Activity Logs
            </button>
            <button
              onClick={() => setCurrentView('status')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === 'status' 
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Team Status
            </button>
            <button
              onClick={() => setCurrentView('active-time')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === 'active-time' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
              disabled={!isAdmin}
              style={{ opacity: !isAdmin ? 0.5 : 1, cursor: !isAdmin ? 'not-allowed' : 'pointer' }}
            >
              <Clock className="w-4 h-4" />
              Active Time
            </button>
            <button
              onClick={() => setCurrentView('checkin')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === 'checkin' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              Morning Checkin
            </button>
          </div>
        </div>

        <StatusPage />
        
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-auto">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              All rights reserved - Lattice Code Pro
            </p>
          </div>
        </footer>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onProfileOpen={() => setShowProfile(true)} />
      
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={() => setCurrentView('logs')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              currentView === 'logs' 
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Activity Logs</span>
          </button>
          <button
            onClick={() => setCurrentView('status')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              currentView === 'status' 
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Team Status</span>
          </button>
          <button
            onClick={() => setCurrentView('active-time')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              currentView === 'active-time' 
                ? 'bg-orange-600 text-white' 
                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
            }`}
            disabled={!isAdmin}
            style={{ opacity: !isAdmin ? 0.5 : 1, cursor: !isAdmin ? 'not-allowed' : 'pointer' }}
          >
            <Clock className="w-4 h-4" />
            <span>Active Time</span>
          </button>
          <button
            onClick={() => setCurrentView('checkin')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              currentView === 'checkin' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Morning Checkin</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="grid grid-cols-2 lg:flex gap-4 lg:gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{logData.length}</div>
              <div className="text-xs sm:text-sm text-gray-500">Total Logs</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</div>
              <div className="text-xs sm:text-sm text-gray-500">Total Hours</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{uniqueProjects}</div>
              <div className="text-xs sm:text-sm text-gray-500">Projects</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{uniqueWorkers}</div>
              <div className="text-xs sm:text-sm text-gray-500">Workers</div>
            </div>
          </div>

          {canAddLogs && (
            <div className="col-span-2 lg:col-span-1 lg:ml-auto">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => setShowAddLog(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Log</span>
                  <span className="sm:hidden">Add</span>
                </button>
                <button
                  onClick={() => setShowCSVImport(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Import CSV</span>
                  <span className="sm:hidden">Import</span>
                </button>
                {isAdmin && (
                  <>
                <button
                  onClick={() => setShowProjectManagement(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="hidden lg:inline">Manage Projects</span>
                  <span className="lg:hidden">Projects</span>
                </button>
                <button
                  onClick={() => setShowUserManagement(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden lg:inline">Manage Users</span>
                  <span className="lg:hidden">Users</span>
                </button>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Export button for viewers */}
          {user?.role === 'viewer' && (
            <div className="col-span-2 lg:col-span-1 lg:ml-auto">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          )}
        </div>
      </div>

      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        uniqueWorkers={getUniqueValues('workers')}
        uniqueProjects={getUniqueValues('project')}
        onExport={exportToCSV}
      />

      <LogTable
        logs={logData}
        onUpdateDescription={updateDescription}
        onDeleteLog={deleteLog}
        onBulkDelete={bulkDeleteLogs}
        canEdit={canEditDescription}
        canDelete={isAdmin && user?.role !== 'viewer'}
        isAdmin={isAdmin}
      />

      <UserManagement
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
      />

      <ProjectManagement
        isOpen={showProjectManagement}
        onClose={() => setShowProjectManagement(false)}
        projects={getUniqueValues('project')}
        onAddProject={addProject}
        onRemoveProject={removeProject}
      />

      <AddLogModal
        isOpen={showAddLog}
        onClose={() => setShowAddLog(false)}
        onAddLog={addLog}
        workers={getUniqueValues('workers')}
        projects={getUniqueValues('project')}
      />

      <CSVImportModal
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        onImport={importLogs}
      />

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4 mt-auto">
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            All rights reserved - Lattice Code Pro
          </p>
        </div>
      </footer>
    </div>
  );
};