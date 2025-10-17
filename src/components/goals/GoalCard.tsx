import { useState, useRef, useEffect } from 'react';
import { Edit2, MoreVertical, TrendingUp, Calendar, CheckCircle, Trash2, Eye } from 'lucide-react';
import { formatCurrency, formatDate, calculateProgress, isGoalOnTrack } from '../../utils/formatters';
import { QuickEditGoal } from './QuickEditGoal';
import type { Goal } from '../../types/database';

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
  onFullEdit,
  onDelete,
  onMarkComplete,
  onSuccess,
}: GoalCardProps) => {
  const [showQuickEdit, setShowQuickEdit] = useState(false);
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
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onFullEdit();
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white hover:bg-opacity-10 transition-all flex items-center gap-3"
                >
                  <Edit2 className="w-4 h-4" />
                  Full Edit
                </button>
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
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                  className="w-full px-4 py-3 text-left text-red-300 hover:bg-red-500 hover:bg-opacity-20 transition-all flex items-center gap-3"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Goal
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="pr-16">
        <h3 className="font-semibold text-white mb-1 text-lg">{goal.name}</h3>
        <div className="flex items-center gap-2 text-sm text-white text-opacity-80 mb-4">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(goal.target_date)}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            onTrack ? 'glass text-green-300' : 'glass text-orange-300'
          }`}>
            {onTrack ? 'On Track' : 'Behind'}
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
