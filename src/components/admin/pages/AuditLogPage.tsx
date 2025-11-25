import { useState, useEffect } from 'react';
import { Download, Filter, Calendar, User, FileText, RefreshCw } from 'lucide-react';
import { auditService, AuditLogEntry, AuditLogFilter } from '../../../services/auditService';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<AuditLogFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [retentionWarnings, setRetentionWarnings] = useState<AuditLogEntry[]>([]);

  const itemsPerPage = 50;

  useEffect(() => {
    loadLogs();
    loadRetentionWarnings();
  }, [currentPage, filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const [logsData, count] = await Promise.all([
        auditService.getAuditLogs(filters, itemsPerPage, offset),
        auditService.getAuditLogCount(filters),
      ]);
      setLogs(logsData);
      setTotalCount(count);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRetentionWarnings = async () => {
    try {
      const warnings = await auditService.getRetentionWarnings();
      setRetentionWarnings(warnings);
    } catch (error) {
      console.error('Failed to load retention warnings:', error);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      const blob = await auditService.exportAuditLogs(filters, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export audit logs:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (key: keyof AuditLogFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'CREATE':
        return 'bg-green-500/20 text-green-300';
      case 'UPDATE':
        return 'bg-blue-500/20 text-blue-300';
      case 'DELETE':
        return 'bg-red-500/20 text-red-300';
      case 'REORDER':
        return 'bg-purple-500/20 text-purple-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Audit Log</h1>
          <p className="text-white/70">Complete history of admin configuration changes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              showFilters ? 'glass-button text-white' : 'glass text-white/70 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 glass text-white/70 hover:text-white rounded-xl font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 glass-button text-white rounded-xl font-medium transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 glass-button text-white rounded-xl font-medium transition-all"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {retentionWarnings.length > 0 && (
        <div className="glass-strong rounded-2xl p-4 border border-orange-500/30">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-orange-300 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-semibold mb-1">Retention Policy Warning</h3>
              <p className="text-white/70 text-sm mb-2">
                {retentionWarnings.length} audit log {retentionWarnings.length === 1 ? 'entry' : 'entries'} approaching 7-year retention limit
              </p>
              <p className="text-white/60 text-xs">
                Records older than 7 years will be automatically archived according to compliance requirements.
              </p>
            </div>
          </div>
        </div>
      )}

      {showFilters && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Filter Audit Logs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 glass-card text-white rounded-lg focus:ring-2 focus:ring-white/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 glass-card text-white rounded-lg focus:ring-2 focus:ring-white/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Table Name</label>
              <input
                type="text"
                placeholder="e.g., goal_templates"
                value={filters.tableName || ''}
                onChange={(e) => handleFilterChange('tableName', e.target.value)}
                className="w-full px-3 py-2 glass-card text-white placeholder-white/40 rounded-lg focus:ring-2 focus:ring-white/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Action Type</label>
              <select
                value={filters.actionType || ''}
                onChange={(e) => handleFilterChange('actionType', e.target.value)}
                className="w-full px-3 py-2 glass-card text-white rounded-lg focus:ring-2 focus:ring-white/30 outline-none"
              >
                <option value="" className="bg-gray-800">All Actions</option>
                <option value="CREATE" className="bg-gray-800">CREATE</option>
                <option value="UPDATE" className="bg-gray-800">UPDATE</option>
                <option value="DELETE" className="bg-gray-800">DELETE</option>
                <option value="REORDER" className="bg-gray-800">REORDER</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 glass text-white/70 hover:text-white rounded-xl font-medium transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-white/70" />
            <span className="text-white/80">
              Showing {logs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p className="text-white/50">No audit logs found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="glass rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getActionColor(log.action_type)}`}>
                        {log.action_type}
                      </span>
                      <span className="px-2 py-1 glass rounded-lg text-xs font-medium text-white/80">
                        {log.table_name}
                      </span>
                      {log.record_id && (
                        <span className="text-xs text-white/50 font-mono">
                          ID: {log.record_id.substring(0, 8)}...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
                      <User className="w-4 h-4" />
                      <span>{log.admin_email}</span>
                    </div>

                    {(log.old_value !== null || log.new_value !== null) && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-white/60 hover:text-white/80">
                          View Changes
                        </summary>
                        <div className="mt-2 space-y-2">
                          {log.old_value !== null && (
                            <div className="glass-strong rounded-lg p-3">
                              <p className="text-xs text-red-300 font-semibold mb-1">Old Value:</p>
                              <pre className="text-xs text-white/70 overflow-x-auto">
                                {JSON.stringify(log.old_value, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.new_value !== null && (
                            <div className="glass-strong rounded-lg p-3">
                              <p className="text-xs text-green-300 font-semibold mb-1">New Value:</p>
                              <pre className="text-xs text-white/70 overflow-x-auto">
                                {JSON.stringify(log.new_value, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-sm text-white/80 font-medium">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-white/50">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 glass text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-all"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all ${
                      currentPage === pageNum
                        ? 'glass-button text-white'
                        : 'glass text-white/70 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 glass text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
