import { useState, useRef, useEffect } from 'react';
import { Edit2, MoreVertical, TrendingUp, Calendar, CheckCircle, Eye, Link as LinkIcon, Hand } from 'lucide-react';
import { formatCurrency, formatDate, calculateProgress, isGoalOnTrack } from '../../utils/formatters';
import { QuickEditGoal } from './QuickEditGoal';
import { AccountGoalLinker } from './AccountGoalLinker';
import type { Goal } from '../../types/database';
import { ConfirmDialog } from '../ConfirmDialog';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface GoalCardProps {
  goal: Goal;
  accountProgress: number;
  onUpdateProgress: () => void;
  onViewDetails: () => void;
  onFullEdit: () => void;
  onDelete: () => void;
  onMarkComplete: () => void;
  onSuccess: () => void;
}

export const GoalCard = ({
  goal,
  accountProgress,
  onUpdateProgress,
  onViewDetails,
  onMarkComplete,
  onSuccess,
}: GoalCardProps) => {
  const { user } = useAuth();
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [showLinker, setShowLinker] = useState(false);
  const [showConfirmSwitch, setShowConfirmSwitch] = useState(false);
  const [savingSwitch, setSavingSwitch] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<'right' | 'left'>('right');
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showMenu && menuButtonRef.current && menuRef.current) {
      const buttonRect = menuButtonRef.current.getBoundingClientRect();
      const menuWidth = 192;
      const viewportWidth = window.innerWidth;
      const spaceOnRight = viewportWidth - buttonRect.right;

      if (spaceOnRight < menuWidth && buttonRect.left > menuWidth) {
        setMenuPosition('left');
      } else {
        setMenuPosition('right');
      }
    }
  }, [showMenu]);

  const manualProgress = goal.manual_amount || 0;
  const totalProgress = accountProgress + manualProgress;
  const progress = calculateProgress(totalProgress, goal.target_amount);
  const onTrack = isGoalOnTrack(totalProgress, goal.target_amount, goal.target_date);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleQuickEditSuccess = () => {
    setShowQuickEdit(false);
    onSuccess();
  };

  if (showQuickEdit) {
    return (
      <QuickEditGoal
        goal={goal}
        onCancel={() => setShowQuickEdit(false)}
        onSuccess={handleQuickEditSuccess}
      />
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 glass-hover transition-all relative group overflow-visible">
      {showConfirmSwitch && (
        <ConfirmDialog
          isOpen={showConfirmSwitch}
          title="Switch to Manual Tracking?"
          message="This will unlink all accounts from this goal. You can link them again later."
          confirmLabel={savingSwitch ? 'Switching…' : 'Switch to Manual'}
          cancelLabel="Cancel"
          variant="warning"
          onConfirm={async () => {
            if (!user) return;
            try {
              setSavingSwitch(true);
              // Remove all links
              const { error: delErr } = await supabase
                .from('account_goals')
                .delete()
                .eq('goal_id', goal.id);
              if (delErr) throw delErr;
              // Set manual mode
              const { error: updErr } = await supabase
                .from('goals')
                .update({ is_manual_goal: true })
                .eq('id', goal.id)
                .eq('user_id', user.id);
              if (updErr) throw updErr;
              setFlash('Tracking mode switched to Manual.');
              if (onSuccess) onSuccess();
            } catch (e) {
              console.error(e);
            } finally {
              setSavingSwitch(false);
              setShowConfirmSwitch(false);
              setTimeout(() => setFlash(null), 2500);
            }
          }}
          onCancel={() => setShowConfirmSwitch(false)}
        />
      )}

      {showLinker && (
        <AccountGoalLinker
          goal={goal}
          onClose={() => setShowLinker(false)}
          onSuccess={onSuccess}
        />
      )}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getPriorityColor(goal.priority)}`} title={`${goal.priority} priority`} />

        <div className="relative">
          <button
            ref={menuButtonRef}
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 glass-card text-white text-opacity-70 hover:text-opacity-100 rounded-lg transition-all"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div
                ref={menuRef}
                className={`absolute ${menuPosition === 'right' ? 'right-0' : 'left-0'} mt-2 w-48 glass-strong rounded-xl shadow-lg z-20 overflow-hidden animate-fade-in`}
              >
                {/* Manage/Link Accounts - single entry dependent on tracking mode */}
                {goal.is_manual_goal ? (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowLinker(true);
                    }}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white hover:bg-opacity-10 transition-all flex items-center gap-3"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Link Accounts
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowLinker(true);
                    }}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white hover:bg-opacity-10 transition-all flex items-center gap-3"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Manage Funding Sources
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onUpdateProgress();
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white hover:bg-opacity-10 transition-all flex items-center gap-3"
                >
                  <TrendingUp className="w-4 h-4" />
                  Update Progress
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowQuickEdit(true);
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white hover:bg-opacity-10 transition-all flex items-center gap-3"
                >
                  <Edit2 className="w-4 h-4" />
                  Quick Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onViewDetails();
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white hover:bg-opacity-10 transition-all flex items-center gap-3"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                {!goal.is_manual_goal && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowConfirmSwitch(true);
                    }}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white hover:bg-opacity-10 transition-all flex items-center gap-3"
                  >
                    <Hand className="w-4 h-4" />
                    Switch to Manual
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onMarkComplete();
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white hover:bg-opacity-10 transition-all flex items-center gap-3"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark {goal.is_achieved ? 'Incomplete' : 'Complete'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {flash && (
        <div className="mb-3 p-3 glass rounded-xl border border-blue-500/30 text-sm text-blue-200">
          {flash}
        </div>
      )}

      <div className="mb-6 mt-8">
        <h3 className="font-semibold text-white mb-1 text-lg">{goal.name}</h3>
        <div className="flex items-center gap-2 text-sm text-white text-opacity-80 mb-4 flex-wrap">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(goal.target_date)}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            onTrack ? 'glass text-green-300' : 'glass text-orange-300'
          }`}>
            {onTrack ? 'On Track' : 'Behind'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
            goal.is_manual_goal ? 'glass text-purple-300' : 'glass text-blue-300'
          }`}>
            {goal.is_manual_goal ? (
              <>
                <Hand className="w-3 h-3" />
                Manual
              </>
            ) : (
              <>
                <LinkIcon className="w-3 h-3" />
                Account-Linked
              </>
            )}
          </span>
        </div>
      </div>

      {goal.description && (
        <p className="text-sm text-white text-opacity-70 mb-4 line-clamp-2">
          {goal.description}
        </p>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-white text-opacity-80">Progress</span>
          <span className="font-semibold text-white">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full glass rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${onTrack ? 'bg-green-400' : 'bg-orange-400'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white text-opacity-80">{formatCurrency(totalProgress)}</span>
          <span className="font-medium text-white">{formatCurrency(goal.target_amount)}</span>
        </div>
      </div>

      {(accountProgress > 0 || manualProgress > 0) && (
        <div className="glass rounded-lg p-3 mb-4">
          <p className="text-xs text-white text-opacity-70 mb-2">Progress Breakdown</p>
          <div className="space-y-1 text-sm">
            {accountProgress > 0 && (
              <div className="flex justify-between">
                <span className="text-white text-opacity-80">From Accounts:</span>
                <span className="font-medium text-white">{formatCurrency(accountProgress)}</span>
              </div>
            )}
            {manualProgress > 0 && (
              <div className="flex justify-between">
                <span className="text-white text-opacity-80">Manual:</span>
                <span className="font-medium text-white">{formatCurrency(manualProgress)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {goal.last_progress_update && (
        <p className="text-xs text-white text-opacity-60 mb-4">
          Last updated: {formatDate(goal.last_progress_update)}
        </p>
      )}

      <button
        onClick={onUpdateProgress}
        className="w-full px-4 py-3 glass-button text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-5 h-5" />
        Update Progress
      </button>
    </div>
  );
};
