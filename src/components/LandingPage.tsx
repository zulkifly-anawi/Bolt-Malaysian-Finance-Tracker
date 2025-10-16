import { Target, Wallet, TrendingUp, Shield, Lightbulb, Users, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
            Track Your Financial Journey
          </h1>
          <p className="text-xl text-white text-opacity-90 mb-8 max-w-3xl mx-auto">
            A complete financial tracking platform built specifically for Malaysians. Monitor your ASB, EPF, Tabung Haji, and achieve your financial goals with confidence.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-all shadow-2xl"
          >
            Get Started Free
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Wallet,
              title: 'Track All Accounts',
              description: 'Manage your ASB, EPF, Tabung Haji, savings, and investments in one place.',
              gradient: 'from-blue-500 to-cyan-600',
            },
            {
              icon: Target,
              title: 'Set Financial Goals',
              description: 'Define goals for home, education, hajj, or retirement and track progress automatically.',
              gradient: 'from-teal-500 to-emerald-600',
            },
            {
              icon: TrendingUp,
              title: 'Malaysian Calculators',
              description: 'Get accurate projections with ASB, EPF, and Tabung Haji calculators based on historical rates.',
              gradient: 'from-purple-500 to-pink-600',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="glass-card rounded-3xl p-8 hover:scale-105 transition-all">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white text-opacity-80">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="glass-card rounded-3xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose This Platform?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your financial data is encrypted and protected with industry-standard security. Only you can access your information.',
              },
              {
                icon: Lightbulb,
                title: 'Smart Insights',
                description: 'Get personalized recommendations and insights based on your financial patterns and goals.',
              },
              {
                icon: Users,
                title: 'Built for Malaysians',
                description: 'Designed with Malaysian investments in mind - ASB dividends, EPF contributions, Tabung Haji tracking, and more.',
              },
              {
                icon: Target,
                title: 'Goal Templates',
                description: 'Use pre-configured Malaysian goal templates for common savings targets like home ownership, education, and hajj.',
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-white text-opacity-80">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Take Control?</h2>
          <p className="text-white text-opacity-80 mb-8 max-w-2xl mx-auto">
            Join Malaysians who are already tracking their financial journey. Start monitoring your investments, setting goals, and building wealth today.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-all shadow-2xl"
          >
            Create Free Account
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white text-opacity-60 text-sm">
            100% Free • No Credit Card Required • Your Data Stays Private
          </p>
        </div>
      </div>
    </div>
  );
};
