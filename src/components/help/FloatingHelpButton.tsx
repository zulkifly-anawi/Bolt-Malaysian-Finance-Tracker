import { useState } from 'react';
import { HelpCircle, X, Lightbulb } from 'lucide-react';

interface FloatingHelpButtonProps {
  activeTab: string;
  onOpenHelp: () => void;
  onOpenFeedback: () => void;
}

const contextualTips: Record<string, { title: string; tips: string[] }> = {
  dashboard: {
    title: 'Dashboard Tips',
    tips: [
      'Add your first account to see your total wealth',
      'Create a goal to start tracking your progress',
      'Check Investment Insights for personalized recommendations',
      'Use the Overview cards to understand your financial position',
    ],
  },
  accounts: {
    title: 'Accounts Tips',
    tips: [
      'Add all your accounts for a complete financial picture',
      'Update balances monthly for accurate projections',
      'Use account types like ASB, EPF, Tabung Haji for Malaysian investments',
      'Add monthly contributions to track automatic savings',
    ],
  },
  goals: {
    title: 'Goals Tips',
    tips: [
      'Use Malaysian goal templates for common savings targets',
      'Set realistic target dates for better planning',
      'Allocate accounts to goals to track progress automatically',
      'Create multiple goals for different life priorities',
    ],
  },
  investments: {
    title: 'Investment Tools Tips',
    tips: [
      'Use the ASB Calculator to project dividend earnings',
      'Track EPF contributions and estimate retirement savings',
      'Monitor Tabung Haji for hajj planning',
      'Update dividend rates based on recent announcements',
    ],
  },
  engagement: {
    title: 'Engagement Tips',
    tips: [
      'Check notifications for goal milestones and reminders',
      'Earn achievements by staying consistent with tracking',
      'Review insights for personalized savings recommendations',
      'Export your data regularly for backup and analysis',
    ],
  },
  help: {
    title: 'Help Center Tips',
    tips: [
      'Use the search bar to find specific topics quickly',
      'Filter by category to browse related questions',
      'Click any question to expand the full answer',
      'Bookmark this page for quick reference',
    ],
  },
};

export const FloatingHelpButton = ({ activeTab, onOpenHelp, onOpenFeedback }: FloatingHelpButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tips = contextualTips[activeTab] || contextualTips.dashboard;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isExpanded && (
        <div className="glass-strong rounded-2xl p-6 mb-4 max-w-sm shadow-2xl glow animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-white">{tips.title}</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white text-opacity-60 hover:text-opacity-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <ul className="space-y-3">
            {tips.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-white text-opacity-80">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              setIsExpanded(false);
              onOpenHelp();
            }}
            className="w-full mt-4 px-4 py-2 glass rounded-xl text-white text-sm font-semibold hover:bg-white hover:bg-opacity-10 transition-all"
          >
            Open Help Center
          </button>
          <button
            onClick={() => {
              setIsExpanded(false);
              onOpenFeedback();
            }}
            className="w-full mt-2 px-4 py-2 glass rounded-xl text-white text-sm font-semibold hover:bg-white hover:bg-opacity-10 transition-all"
            aria-label="Navigate to feedback form"
          >
            Provide Your Feedback
          </button>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all glow"
        title="Help & Tips"
      >
        {isExpanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <HelpCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
};
