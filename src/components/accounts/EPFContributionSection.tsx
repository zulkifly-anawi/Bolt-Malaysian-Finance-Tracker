import { useState, useEffect } from 'react';
import { Info, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { getContributionRatePresets, validateContributionPercentages } from '../../utils/epfContributionHelpers';

interface EPFContributionSectionProps {
  monthlySalary: number;
  onContributionChange: (data: {
    isManual: boolean;
    manualAmount?: number;
    employeePercentage?: number;
    employerPercentage?: number;
    useTotal?: boolean;
  }) => void;
  initialData?: {
    isManual: boolean;
    manualAmount?: number;
    employeePercentage?: number;
    employerPercentage?: number;
    useTotal?: boolean;
  };
}

export const EPFContributionSection = ({
  monthlySalary,
  onContributionChange,
  initialData
}: EPFContributionSectionProps) => {
  const { user } = useAuth();
  const [contributionMode, setContributionMode] = useState<'auto' | 'manual'>(
    initialData?.isManual ? 'manual' : 'auto'
  );
  const [employeePercentage, setEmployeePercentage] = useState(initialData?.employeePercentage || 11);
  const [employerPercentage, setEmployerPercentage] = useState(initialData?.employerPercentage || 12);
  const [useTotal, setUseTotal] = useState(initialData?.useTotal ?? true);
  const [manualAmount, setManualAmount] = useState(initialData?.manualAmount || 0);
  const [showPresets, setShowPresets] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    loadProfileDefaults();
  }, [user]);

  useEffect(() => {
    if (contributionMode === 'auto') {
      const validation = validateContributionPercentages(employeePercentage, employerPercentage);
      setWarnings(validation.warnings);
      onContributionChange({
        isManual: false,
        employeePercentage,
        employerPercentage,
        useTotal,
      });
    } else {
      setWarnings([]);
      onContributionChange({
        isManual: true,
        manualAmount,
      });
    }
  }, [contributionMode, employeePercentage, employerPercentage, useTotal, manualAmount]);

  const loadProfileDefaults = async () => {
    if (!user || initialData) return;

    const { data } = await supabase
      .from('profiles')
      .select('epf_employee_contribution_percentage, epf_employer_contribution_percentage, include_employer_contribution')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setEmployeePercentage(data.epf_employee_contribution_percentage || 11);
      setEmployerPercentage(data.epf_employer_contribution_percentage || 12);
      setUseTotal(data.include_employer_contribution ?? true);
    }
  };

  const applyPreset = (preset: any) => {
    setEmployeePercentage(preset.employeePercentage);
    setEmployerPercentage(preset.employerPercentage);
    setShowPresets(false);
  };

  const employeeContribution = monthlySalary * (employeePercentage / 100);
  const employerContribution = monthlySalary * (employerPercentage / 100);
  const totalContribution = employeeContribution + employerContribution;

  const presets = getContributionRatePresets();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white text-opacity-95 mb-3">
          EPF Contribution Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setContributionMode('auto')}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${
              contributionMode === 'auto'
                ? 'glass-button text-white'
                : 'glass text-white text-opacity-70 hover:text-opacity-100'
            }`}
          >
            Calculate from Salary
          </button>
          <button
            type="button"
            onClick={() => setContributionMode('manual')}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${
              contributionMode === 'manual'
                ? 'glass-button text-white'
                : 'glass text-white text-opacity-70 hover:text-opacity-100'
            }`}
          >
            Enter Manual Amount
          </button>
        </div>
      </div>

      {contributionMode === 'auto' ? (
        <>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-white text-opacity-80">
                Standard KWSP rates: Employee 11%, Employer 12-13%. Adjust if your rates differ.
              </p>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white text-opacity-80">Monthly Salary</span>
              <span className="font-semibold text-white">{formatCurrency(monthlySalary)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Employee Contribution (%)
              </label>
              <input
                type="number"
                value={employeePercentage}
                onChange={(e) => setEmployeePercentage(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                min="0"
                max="20"
                step="0.1"
              />
              <p className="text-xs text-white text-opacity-60 mt-1">
                {formatCurrency(employeeContribution)}/month
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
                Employer Contribution (%)
              </label>
              <input
                type="number"
                value={employerPercentage}
                onChange={(e) => setEmployerPercentage(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
                min="0"
                max="20"
                step="0.1"
              />
              <p className="text-xs text-white text-opacity-60 mt-1">
                {formatCurrency(employerContribution)}/month
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="text-sm text-gray-300 hover:text-gray-200 transition-colors"
            >
              {showPresets ? 'Hide' : 'Show'} Rate Presets
            </button>

            {showPresets && (
              <div className="mt-3 space-y-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="w-full text-left px-4 py-3 glass rounded-xl hover:glass-button transition-all"
                  >
                    <div className="font-medium text-white text-sm">{preset.name}</div>
                    <div className="text-xs text-white text-opacity-70 mt-1">
                      {preset.description} ({preset.employeePercentage}% + {preset.employerPercentage}%)
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 glass rounded-2xl p-4">
            <input
              type="checkbox"
              id="useTotal"
              checked={useTotal}
              onChange={(e) => setUseTotal(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="useTotal" className="text-sm text-white text-opacity-90 cursor-pointer flex-1">
              Include employer contribution in retirement projections
              <span className="block text-xs text-white text-opacity-60 mt-1">
                Recommended for accurate retirement planning
              </span>
            </label>
          </div>

          <div className="glass-strong rounded-2xl p-4">
            <div className="text-sm text-white text-opacity-80 mb-3">Monthly Contribution Breakdown</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white text-opacity-80">Employee ({employeePercentage}%)</span>
                <span className="font-semibold text-white">{formatCurrency(employeeContribution)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-opacity-80">Employer ({employerPercentage}%)</span>
                <span className="font-semibold text-white">{formatCurrency(employerContribution)}</span>
              </div>
              <div className="pt-2 border-t border-white border-opacity-20">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">Total Contribution</span>
                  <span className="font-bold text-white text-lg">{formatCurrency(totalContribution)}</span>
                </div>
              </div>
              {!useTotal && (
                <div className="pt-2 border-t border-white border-opacity-20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white">Used in Projections</span>
                    <span className="font-bold text-gray-200 text-lg">{formatCurrency(employeeContribution)}</span>
                  </div>
                  <p className="text-xs text-white text-opacity-60 mt-1">
                    Only employee portion will be used for retirement calculations
                  </p>
                </div>
              )}
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="glass rounded-2xl p-4 border border-yellow-500 border-opacity-30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {warnings.map((warning, index) => (
                    <p key={index} className="text-sm text-yellow-200">{warning}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="glass rounded-2xl p-4 border border-orange-500 border-opacity-30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-orange-200">
                  Using manual amount will override automatic calculations based on your salary.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white text-opacity-95 mb-2">
              Monthly Contribution Amount (RM)
            </label>
            <input
              type="number"
              value={manualAmount || ''}
              onChange={(e) => setManualAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
              min="0"
              step="0.01"
              placeholder="Enter monthly contribution"
            />
          </div>

          {manualAmount > 0 && (
            <div className="glass-strong rounded-2xl p-4">
              <div className="text-sm text-white text-opacity-80 mb-2">Manual Contribution</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(manualAmount)}</div>
              <p className="text-xs text-white text-opacity-60 mt-2">
                This amount will be used for all EPF projections
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
