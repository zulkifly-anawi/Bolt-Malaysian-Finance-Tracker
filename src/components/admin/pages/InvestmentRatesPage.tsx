import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, AlertCircle, Save, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { auditService } from '../../../services/auditService';

interface DividendRate {
  id: string;
  account_type: string;
  year: number;
  dividend_rate: number;
  is_projection: boolean;
  created_at: string;
}

interface RateFormData {
  account_type: string;
  year: number;
  dividend_rate: number;
  is_projection: boolean;
}

export const InvestmentRatesPage = () => {
  const [rates, setRates] = useState<DividendRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState<DividendRate | null>(null);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const [formData, setFormData] = useState<RateFormData>({
    account_type: 'ASB',
    year: new Date().getFullYear(),
    dividend_rate: 0,
    is_projection: false,
  });

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dividend_history')
        .select('*')
        .order('year', { ascending: false })
        .order('account_type');

      if (error) throw error;
      setRates(data || []);
    } catch (err: any) {
      console.error('Failed to load rates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.dividend_rate <= 0) {
      setError('Dividend rate must be greater than 0');
      return;
    }

    if (formData.year < 2000 || formData.year > 2100) {
      setError('Please enter a valid year');
      return;
    }

    try {
      if (editingRate) {
        const { error: updateError } = await supabase
          .from('dividend_history')
          .update({
            account_type: formData.account_type,
            year: formData.year,
            dividend_rate: formData.dividend_rate,
            is_projection: formData.is_projection,
          })
          .eq('id', editingRate.id);

        if (updateError) throw updateError;

        await auditService.logAction({
          action_type: 'UPDATE',
          table_name: 'dividend_history',
          record_id: editingRate.id,
          old_value: editingRate,
          new_value: formData,
        });
      } else {
        const { data: newRate, error: insertError } = await supabase
          .from('dividend_history')
          .insert([formData])
          .select()
          .single();

        if (insertError) throw insertError;

        await auditService.logAction({
          action_type: 'CREATE',
          table_name: 'dividend_history',
          record_id: newRate.id,
          new_value: formData,
        });
      }

      await loadRates();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save dividend rate');
      console.error('Save error:', err);
    }
  };

  const handleEdit = (rate: DividendRate) => {
    setEditingRate(rate);
    setFormData({
      account_type: rate.account_type,
      year: rate.year,
      dividend_rate: rate.dividend_rate,
      is_projection: rate.is_projection,
    });
    setShowForm(true);
  };

  const handleDelete = async (rate: DividendRate) => {
    if (!confirm(`Delete ${rate.account_type} rate for ${rate.year}?`)) return;

    try {
      const { error: deleteError } = await supabase
        .from('dividend_history')
        .delete()
        .eq('id', rate.id);

      if (deleteError) throw deleteError;

      await auditService.logAction({
        action_type: 'DELETE',
        table_name: 'dividend_history',
        record_id: rate.id,
        old_value: rate,
      });

      await loadRates();
    } catch (err: any) {
      setError(err.message || 'Failed to delete rate');
      console.error('Delete error:', err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRate(null);
    setFormData({
      account_type: 'ASB',
      year: new Date().getFullYear(),
      dividend_rate: 0,
      is_projection: false,
    });
    setError('');
  };

  const filteredRates = filterType === 'all'
    ? rates
    : rates.filter(r => r.account_type === filterType);

  const accountTypes = Array.from(new Set(rates.map(r => r.account_type))).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Investment Rates</h1>
          <p className="text-white/70">Manage historical dividend rates for Malaysian investments</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 glass-button text-white rounded-xl font-medium transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Rate
          </button>
        )}
      </div>

      {error && (
        <div className="glass-strong rounded-2xl p-4 border border-red-500/30">
          <div className="flex items-center gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editingRate ? 'Edit Dividend Rate' : 'Add New Dividend Rate'}
            </h2>
            <button
              onClick={resetForm}
              className="text-white/70 hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Investment Type *
                </label>
                <select
                  required
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                  className="w-full px-4 py-2 glass-card text-white rounded-xl focus:ring-2 focus:ring-white/30 outline-none"
                >
                  <option value="ASB" className="bg-gray-800">ASB</option>
                  <option value="Tabung Haji" className="bg-gray-800">Tabung Haji</option>
                  <option value="EPF" className="bg-gray-800">EPF</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  required
                  min="2000"
                  max="2100"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 glass-card text-white rounded-xl focus:ring-2 focus:ring-white/30 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Dividend Rate (%) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.dividend_rate}
                  onChange={(e) => setFormData({ ...formData, dividend_rate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 glass-card text-white rounded-xl focus:ring-2 focus:ring-white/30 outline-none"
                  placeholder="e.g., 4.75"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_projection}
                    onChange={(e) => setFormData({ ...formData, is_projection: e.target.checked })}
                    className="w-5 h-5 rounded glass-card"
                  />
                  <span className="text-white/80 font-medium">Projected Rate</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 glass text-white/70 hover:text-white rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 glass-button text-white rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingRate ? 'Update Rate' : 'Add Rate'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Historical Rates</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 glass-card text-white rounded-lg text-sm focus:ring-2 focus:ring-white/30 outline-none"
            >
              <option value="all" className="bg-gray-800">All Types</option>
              {accountTypes.map(type => (
                <option key={type} value={type} className="bg-gray-800">{type}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
          </div>
        ) : filteredRates.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p className="text-white/50">No dividend rates found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/80 font-semibold">Investment Type</th>
                  <th className="text-left py-3 px-4 text-white/80 font-semibold">Year</th>
                  <th className="text-left py-3 px-4 text-white/80 font-semibold">Dividend Rate</th>
                  <th className="text-left py-3 px-4 text-white/80 font-semibold">Type</th>
                  <th className="text-right py-3 px-4 text-white/80 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRates.map((rate) => (
                  <tr
                    key={rate.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium text-white">{rate.account_type}</span>
                    </td>
                    <td className="py-4 px-4 text-white/80">{rate.year}</td>
                    <td className="py-4 px-4">
                      <span className="text-lg font-bold text-green-300">{rate.dividend_rate}%</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        rate.is_projection
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {rate.is_projection ? 'Projected' : 'Actual'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(rate)}
                          className="p-2 glass-card text-blue-300 hover:text-blue-400 rounded-lg transition-all"
                          title="Edit rate"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rate)}
                          className="p-2 glass-card text-red-300 hover:text-red-400 rounded-lg transition-all"
                          title="Delete rate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
