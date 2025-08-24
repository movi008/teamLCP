import React from 'react';
import { Calendar, User, FolderOpen, Download, X } from 'lucide-react';

interface FilterPanelProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    workers: string[];
    projects: string[];
  };
  onFiltersChange: (filters: any) => void;
  uniqueWorkers: string[];
  uniqueProjects: string[];
  onExport: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  uniqueWorkers,
  uniqueProjects,
  onExport
}) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'workers' | 'projects', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const removeArrayFilter = (key: 'workers' | 'projects', value: string) => {
    const newArray = filters[key].filter(item => item !== value);
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      startDate: '',
      endDate: '',
      workers: [],
      projects: []
    });
  };

  const hasActiveFilters = filters.startDate || filters.endDate || 
                          filters.workers.length > 0 || filters.projects.length > 0;

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex flex-col lg:flex-row flex-wrap gap-4 items-start lg:items-center">
        {/* Date Range */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">From:</span>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilter('startDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">To:</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilter('endDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Workers Multi-Select */}
        <div className="relative w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <select
              onChange={(e) => {
                if (e.target.value) {
                  toggleArrayFilter('workers', e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-auto min-w-[150px]"
            >
              <option value="">Select Workers...</option>
              {uniqueWorkers.map(worker => (
                <option key={worker} value={worker} disabled={filters.workers.includes(worker)}>
                  {worker}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Projects Multi-Select */}
        <div className="relative w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-gray-400" />
            <select
              onChange={(e) => {
                if (e.target.value) {
                  toggleArrayFilter('projects', e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-auto min-w-[150px]"
            >
              <option value="">Select Projects...</option>
              {uniqueProjects.map(project => (
                <option key={project} value={project} disabled={filters.projects.includes(project)}>
                  {project}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Export Button */}
        <div className="w-full sm:w-auto">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm w-full sm:w-auto justify-center"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="w-full sm:w-auto">
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm w-full sm:w-auto justify-center"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Active Filter Tags */}
      {(filters.workers.length > 0 || filters.projects.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.workers.map(worker => (
            <span
              key={`worker-${worker}`}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm"
            >
              <User className="w-3 h-3" />
              {worker}
              <button
                onClick={() => removeArrayFilter('workers', worker)}
                className="ml-1 hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.projects.map(project => (
            <span
              key={`project-${project}`}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm"
            >
              <FolderOpen className="w-3 h-3" />
              {project}
              <button
                onClick={() => removeArrayFilter('projects', project)}
                className="ml-1 hover:text-purple-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};