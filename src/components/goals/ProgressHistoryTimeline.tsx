import { useState, useEffect } from 'react';
import { Clock, Plus, Minus, Equal, TrendingUp, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ProgressEntry {
  id: string;
  entry_type: 'add' | 'subtract' | 'set';
  amount: number;
  previous_manual_amount: number;
  new_manual_amount: number;
  notes: string | null;
  created_at: string;
}

interface ProgressHistoryTimelineProps {
  goalId: string;
  goalName: string;
}

export const ProgressHistoryTimeline = ({ goalId, goalName }: ProgressHistoryTimelineProps) => {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'add' | 'subtract' | 'set'>('all');

  useEffect(() => {
    loadHistory();
  }, [goalId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goal_progress_entries')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error('Error loading progress history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(e => e.entry_type === filter);

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'add': return <Plus className="w-4 h-4" />;
      case 'subtract': return <Minus className="w-4 h-4" />;
      case 'set': return <Equal className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'add': return 'from-green-500 to-emerald-600';
      case 'subtract': return 'from-orange-500 to-red-600';
      case 'set': return 'from-blue-500 to-cyan-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getEntryLabel = (type: string) => {
    switch (type) {
      case 'add': return 'Added';
      case 'subtract': return 'Subtracted';
      case 'set': return 'Set to';
      default: return 'Updated';
    }
  };

  const getAmountDisplay = (entry: ProgressEntry) => {
    const amount = formatCurrency(entry.amount);
    switch (entry.entry_type) {
      case 'add': return `+${amount}`;
      case 'subtract': return `-${amount}`;
      case 'set': return amount;
      default: return amount;
    }
  };

  const exportHistory = () => {
    const csv = [
      ['Date', 'Type', 'Amount', 'Previous Total', 'New Total', 'Notes'],
      ...entries.map(e => [
        new Date(e.created_at).toLocaleString(),
        e.entry_type,
        e.amount,
        e.previous_manual_amount,
        e.new_manual_amount,
        e.notes || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${goalName.replace(/\s+/g, '_')}_progress_history.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Progress History</h3>
        <button
          onClick={exportHistory}
          className="flex items-center gap-2 px-3 py-2 glass-button text-white rounded-lg text-sm transition-all"
          disabled={entries.length === 0}
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'add', 'subtract', 'set'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as typeof filter)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              filter === filterType
                ? 'glass-button text-white'
                : 'glass text-white text-opacity-60 hover:text-opacity-100'
            }`}
          >
            {filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {filteredEntries.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Clock className="w-12 h-12 text-white text-opacity-40 mx-auto mb-3" />
          <p className="text-white text-opacity-80">
            {filter === 'all' ? 'No progress updates yet' : `No ${filter} entries found`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry, index) => (
            <div key={entry.id} className="glass-card rounded-2xl p-4 glass-hover">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${getEntryColor(entry.entry_type)} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  {getEntryIcon(entry.entry_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-white">
                        {getEntryLabel(entry.entry_type)} {getAmountDisplay(entry)}
                      </p>
                      <p className="text-sm text-white text-opacity-70">
                        {formatDate(entry.created_at)} at {new Date(entry.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="px-2 py-1 glass text-white text-xs font-medium rounded-full">
                        Latest
                      </span>
                    )}
                  </div>

                  {entry.notes && (
                    <p className="text-sm text-white text-opacity-80 mb-2 italic">
                      "{entry.notes}"
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-opacity-70">Previous:</span>
                      <span className="font-medium text-white">{formatCurrency(entry.previous_manual_amount)}</span>
                    </div>
                    <span className="text-white text-opacity-50">→</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-opacity-70">New:</span>
                      <span className="font-semibold text-white">{formatCurrency(entry.new_manual_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <p className="text-sm text-white text-opacity-80 text-center">
            {entries.length} total {entries.length === 1 ? 'update' : 'updates'} recorded
          </p>
        </div>
      )}
    </div>
  );
};
