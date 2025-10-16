import { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportGoalsToCSV, exportAccountsToCSV, downloadFinancialReport, exportComprehensiveDashboardJSON } from '../../utils/exportData';

interface ExportDataProps {
  user: any;
  netWorth: number;
  goals: any[];
  accounts: any[];
  achievements: any[];
}

// Feature Flag: Set to true to enable JSON export functionality in the UI
// Backend code remains fully functional and can be re-enabled by changing this to true
const ENABLE_JSON_EXPORT = false;

export const ExportData = ({ user, netWorth, goals, accounts, achievements }: ExportDataProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleJSONExport = async () => {
    setIsExporting(true);
    setExportStatus(null);

    try {
      const result = await exportComprehensiveDashboardJSON(user, netWorth, goals, accounts, achievements);

      setExportStatus({
        type: 'success',
        message: `Successfully exported ${result.recordCount} records to ${result.filename}`
      });

      setTimeout(() => setExportStatus(null), 5000);
    } catch (error: any) {
      console.error('JSON export error:', error);
      setExportStatus({
        type: 'error',
        message: error.message || 'Failed to export data. Please try again.'
      });

      setTimeout(() => setExportStatus(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Export & Reports</h2>
          <p className="text-sm text-white text-opacity-80">Download your financial data and reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => exportGoalsToCSV(goals)}
          className="glass-card rounded-3xl p-6 border-2 border-green-400 border-opacity-20 hover:border-opacity-50 hover:glow transition-all text-left group liquid-shine"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 group-hover:from-green-400 group-hover:to-emerald-500 rounded-xl flex items-center justify-center transition-colors shadow-lg">
              <FileSpreadsheet className="w-6 h-6 text-white transition-colors" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
                Export Goals to CSV
              </h3>
              <p className="text-sm text-white text-opacity-70">
                Download all your financial goals with progress data
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => exportAccountsToCSV(accounts)}
          className="glass-card rounded-3xl p-6 border-2 border-blue-400 border-opacity-20 hover:border-opacity-50 hover:glow transition-all text-left group liquid-shine"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:from-blue-400 group-hover:to-indigo-500 rounded-xl flex items-center justify-center transition-colors shadow-lg">
              <FileSpreadsheet className="w-6 h-6 text-white transition-colors" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                Export Accounts to CSV
              </h3>
              <p className="text-sm text-white text-opacity-70">
                Download all your investment account details
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => downloadFinancialReport(user, netWorth, goals, accounts, achievements)}
          className="glass-card rounded-3xl p-6 border-2 border-purple-400 border-opacity-20 hover:border-opacity-50 hover:glow transition-all text-left group liquid-shine"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 group-hover:from-purple-400 group-hover:to-pink-500 rounded-xl flex items-center justify-center transition-colors shadow-lg">
              <FileText className="w-6 h-6 text-white transition-colors" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                Financial Report (HTML)
              </h3>
              <p className="text-sm text-white text-opacity-70">
                Generate a comprehensive financial summary report
              </p>
            </div>
          </div>
        </button>

        {/* JSON Export Button - Temporarily disabled via ENABLE_JSON_EXPORT flag */}
        {/* To re-enable: Change ENABLE_JSON_EXPORT constant to true at the top of this file */}
        {/* All backend functionality (exportComprehensiveDashboardJSON) remains intact */}
        {ENABLE_JSON_EXPORT && (
          <button
            onClick={handleJSONExport}
            disabled={isExporting}
            className="glass-card rounded-3xl p-6 border-2 border-emerald-400 border-opacity-20 hover:border-opacity-50 hover:glow transition-all text-left group liquid-shine disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 group-hover:from-emerald-400 group-hover:to-green-500 rounded-xl flex items-center justify-center transition-colors shadow-lg">
                {isExporting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <Download className="w-6 h-6 text-white transition-colors" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                  {isExporting ? 'Exporting...' : 'Export All Data (JSON)'}
                </h3>
                <p className="text-sm text-white text-opacity-70">
                  Download complete dashboard data with history and projections
                </p>
              </div>
            </div>
          </button>
        )}
      </div>

      {exportStatus && (
        <div className={`glass-strong rounded-2xl p-4 mb-4 border-2 ${
          exportStatus.type === 'success'
            ? 'border-green-400 border-opacity-30'
            : 'border-red-400 border-opacity-30'
        }`}>
          <p className={`text-sm ${
            exportStatus.type === 'success' ? 'text-green-200' : 'text-red-200'
          }`}>
            {exportStatus.message}
          </p>
        </div>
      )}

      <div className="glass-strong rounded-3xl p-6 liquid-shine">
        <h3 className="font-bold text-white mb-4">What's Included in Exports</h3>
        <div className="space-y-3 text-sm text-white text-opacity-80">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            <div>
              <strong className="text-white">Goals CSV:</strong> Goal name, category, target amount, current progress, target date, and completion status
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            <div>
              <strong className="text-white">Accounts CSV:</strong> Account name, type, institution, current balance, and monthly contributions
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            <div>
              <strong className="text-white">Financial Report (HTML):</strong> Complete overview including net worth, goals, accounts, and achievements in a formatted HTML document
            </div>
          </div>
          {/* JSON Export description - Hidden when ENABLE_JSON_EXPORT is false */}
          {ENABLE_JSON_EXPORT && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
              <div>
                <strong className="text-white">Complete Data Export (JSON):</strong> Comprehensive export including all accounts with historical balances, all goals with progress tracking and projections, investment-specific projections (ASB, EPF, Tabung Haji), achievements, complete balance history, goal progress timeline, and export metadata. Perfect for data backup, analysis, or migration.
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
