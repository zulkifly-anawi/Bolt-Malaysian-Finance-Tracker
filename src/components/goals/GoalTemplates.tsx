import { useState, useEffect } from 'react';
import { Home, Shield, Plane, Compass, GraduationCap, PiggyBank, Heart, Car, Plus, Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/formatters';

interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  default_amount: number;
  icon: string;
}

interface GoalTemplatesProps {
  onSelectTemplate: (template: GoalTemplate) => void;
}

const iconMap: Record<string, any> = {
  'home': Home,
  'shield': Shield,
  'plane': Plane,
  'compass': Compass,
  'graduation-cap': GraduationCap,
  'piggy-bank': PiggyBank,
  'heart': Heart,
  'car': Car,
};

export const GoalTemplates = ({ onSelectTemplate }: GoalTemplatesProps) => {
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('goal_templates')
      .select('*')
      .order('category');

    if (data) {
      setTemplates(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white drop-shadow-lg">Malaysian Goal Templates</h3>
          <p className="text-sm text-white text-opacity-80 mt-1">Quick start with common financial goals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const IconComponent = iconMap[template.icon] || Target;

          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="glass-card rounded-2xl p-6 glass-hover text-left group transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center transition-all shadow-lg group-hover:scale-110">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {template.name}
                  </h4>
                  <p className="text-xs text-white text-opacity-70 mb-3 line-clamp-2">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(template.default_amount)}
                    </span>
                    <span className="text-xs text-white text-opacity-60 glass px-2 py-1 rounded-lg">
                      {template.category}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 glass-strong rounded-2xl p-6 border-2 border-dashed border-cyan-400 border-opacity-30 glow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white mb-2">Create Custom Goal</h4>
            <p className="text-sm text-white text-opacity-80 mb-4">
              Don't see what you're looking for? Create a custom goal with your own target amount and date.
            </p>
            <button
              onClick={() => onSelectTemplate({
                id: 'custom',
                name: '',
                description: '',
                category: 'Other',
                default_amount: 0,
                icon: 'target',
              })}
              className="px-4 py-2 bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:scale-105 transition-all shadow-lg"
            >
              Create Custom Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
