import React, { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { LogEntry } from '../types';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (logs: Omit<LogEntry, 'id'>[]) => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    const headers = [
      'Date',
      'Project',
      'Worker',
      'Activity',
      'HH:MM:SS',
      'Upwork Hours'
    ];
    
    const sampleData = [
      '01/08/2025',
      'RHB',
      'Hasan Khan',
      'RHB - Build Instagram Reels Transcript API',
      '07:44:31',
      '7.74'
    ];

    const csvContent = [
      headers.join(','),
      sampleData.map(field => `"${field}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity-log-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    const result: string[][] = [];
    
    for (const line of lines) {
      const fields: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      fields.push(current.trim());
      result.push(fields);
    }
    
    return result;
  };

  const calculateDurationSeconds = (duration: string): number => {
    const parts = duration.split(':');
    if (parts.length !== 3) return 0;
    
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError('');
      setSuccess('');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        setError('CSV file must contain at least a header row and one data row');
        setIsProcessing(false);
        return;
      }

      const headers = rows[0].map(h => h.toLowerCase().replace(/['"]/g, ''));
      const dataRows = rows.slice(1);

      // Validate required columns
      const requiredColumns = ['date', 'project', 'worker', 'activity'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        setError(`Missing required columns: ${missingColumns.join(', ')}`);
        setIsProcessing(false);
        return;
      }

      const logs: Omit<LogEntry, 'id'>[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        
        if (row.length !== headers.length) {
          setError(`Row ${i + 2} has incorrect number of columns`);
          setIsProcessing(false);
          return;
        }

        const rowData: { [key: string]: string } = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index]?.replace(/^"|"$/g, '') || '';
        });

        // Validate required fields
        if (!rowData.date || !rowData.activity || !rowData.project || !rowData.worker) {
          setError(`Row ${i + 2} is missing required data`);
          setIsProcessing(false);
          return;
        }

        // Parse date from DD/MM/YYYY to YYYY-MM-DD
        const parseDate = (dateStr: string) => {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
          }
          return new Date().toISOString().split('T')[0];
        };

        const duration = rowData['hh:mm:ss'] || '00:00:00';
        const durationSeconds = calculateDurationSeconds(duration);

        const log: Omit<LogEntry, 'id'> = {
          activity: rowData.activity,
          project: rowData.project,
          workers: rowData.worker,
          duration: duration,
          duration_seconds: durationSeconds,
          upwork_hours: parseFloat(rowData['upwork hours']) || 0,
          description: '',
          date: parseDate(rowData.date)
        };

        logs.push(log);
      }

      onImport(logs);
      setSuccess(`Successfully imported ${logs.length} activity logs`);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setError('Failed to parse CSV file. Please check the format.');
    }

    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Import CSV File</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Download the template to see the required format and column structure.
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            
            {!file ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select CSV File
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose a CSV file containing activity log data
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Choose File
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  File Selected
                </h3>
                <p className="text-gray-600 mb-4">{file.name}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleImport}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Import Data'}
                  </button>
                  <button
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Choose Different File
                  </button>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-4">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg mt-4">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Required CSV Columns:</h4>
            <div className="text-sm text-blue-700 grid grid-cols-2 gap-2">
              <div>• Date (DD/MM/YYYY format)</div>
              <div>• Project (required)</div>
              <div>• Worker (required)</div>
              <div>• Activity (required)</div>
              <div>• HH:MM:SS (optional)</div>
              <div>• Upwork Hours (optional)</div>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              <strong>Date Format:</strong> Use DD/MM/YYYY format (e.g., 01/08/2025)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};