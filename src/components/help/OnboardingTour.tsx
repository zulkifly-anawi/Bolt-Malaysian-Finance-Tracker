import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface OnboardingStep {
  title: string;
  description: string;
  tip: string;
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to Your Financial Journey!',
    description: 'Track your savings, investments, and financial goals all in one place. Built specifically for Malaysians.',
    tip: 'Start by adding your first account - like your ASB, EPF, or Tabung Haji.',
  },
  {
    title: 'Create Your Accounts',
    description: 'Add all your financial accounts to get a complete picture of your wealth. We support ASB, EPF, Tabung Haji, and more.',
    tip: 'Click the Accounts tab and use "+ Add Account" to get started.',
  },
  {
    title: 'Set Financial Goals',
    description: 'Define what you\'re saving for - a home, education, retirement, or hajj. Track your progress automatically.',
    tip: 'Use our Malaysian goal templates for common savings targets.',
  },
  {
    title: 'Track & Grow Your Wealth',
    description: 'Monitor your progress, get insights, and stay motivated with achievements. Update your balances regularly for accurate projections.',
    tip: 'Set up reminders to update your account balances monthly.',
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setIsVisible(false);
    onComplete();
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-strong rounded-3xl max-w-2xl w-full p-8 relative glow">
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 text-white text-opacity-60 hover:text-opacity-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white text-opacity-60">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-cyan-300 font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 glass rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">{step.title}</h2>
          <p className="text-lg text-white text-opacity-80 mb-6">{step.description}</p>
          <div className="glass-card rounded-xl p-4 border-l-4 border-cyan-400">
            <p className="text-sm text-white text-opacity-90">
              <span className="font-semibold text-cyan-300">Tip: </span>
              {step.tip}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 text-white text-opacity-60 hover:text-opacity-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-cyan-400 w-8'
                    : index < currentStep
                    ? 'bg-cyan-400 opacity-50'
                    : 'bg-white opacity-20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Get Started
                <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
