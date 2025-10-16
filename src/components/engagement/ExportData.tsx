import { Download, FileText, FileSpreadsheet, Printer } from 'lucide-react';
import { exportGoalsToCSV, exportAccountsToCSV, downloadFinancialReport, generateFinancialReportHTML } from '../../utils/exportData';

interface ExportDataProps {
  user: any;
  netWorth: number;
  goals: any[];
  accounts: any[];
  achievements: any[];
}

export const ExportData = ({ user, netWorth, goals, accounts, achievements }: ExportDataProps) => {
  // Generate formatted financial report and open in print-optimized window
  const handlePrint = () => {
    try {
      // Generate the HTML report with all dashboard data
      const reportHTML = generateFinancialReportHTML(user, netWorth, goals, accounts, achievements);

      // Try to open report in a new window optimized for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');

      if (!printWindow) {
        // Pop-up was blocked - offer alternative download
        const userConfirmed = window.confirm(
          'Pop-up blocker detected. Would you like to download the report as an HTML file instead?'
        );

        if (userConfirmed) {
          downloadFinancialReport(user, netWorth, goals, accounts, achievements);
        } else {
          alert('Please allow pop-ups for this site and try again, or use the "Financial Report (HTML)" button to download the report.');
        }
        return;
      }

      // Write content to the new window
      printWindow.document.write(reportHTML);
      printWindow.document.close();

      // Wait for content to load, then trigger print dialog
      // Using setTimeout as fallback if onload doesn't fire
      let printTriggered = false;

      const triggerPrint = () => {
        if (!printTriggered && printWindow && !printWindow.closed) {
          printTriggered = true;
          try {
            printWindow.focus();
            printWindow.print();

            // Close window after printing or if user cancels
            printWindow.onafterprint = () => {
              printWindow.close();
            };
          } catch (err) {
            console.error('Print error:', err);
            printWindow.close();
            alert('Unable to print. Please try downloading the report instead.');
          }
        }
      };

      printWindow.onload = triggerPrint;

      // Fallback timeout in case onload doesn't fire
      setTimeout(triggerPrint, 250);

    } catch (error) {
      console.error('Error generating print report:', error);
      alert('An error occurred while preparing the report. Please try the "Financial Report (HTML)" download option instead.');
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

        <button
          onClick={handlePrint}
          className="glass-card rounded-3xl p-6 border-2 border-orange-400 border-opacity-20 hover:border-opacity-50 hover:glow transition-all text-left group liquid-shine"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-600 group-hover:bg-orange-500 rounded-xl flex items-center justify-center transition-colors shadow-lg">
              <Printer className="w-6 h-6 text-white transition-colors" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                Print Dashboard
              </h3>
              <p className="text-sm text-white text-opacity-70">
                Generate and print a formatted financial report
              </p>
            </div>
          </div>
        </button>
      </div>

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
              <strong className="text-white">Financial Report:</strong> Complete overview including net worth, goals, accounts, and achievements in a formatted HTML document
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
