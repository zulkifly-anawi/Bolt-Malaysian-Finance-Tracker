import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle, BookOpen, Shield, TrendingUp, Target, Wallet } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I add my first account?',
    answer: 'Click on the "Accounts" tab, then click "+ Add Account". Select your account type (ASB, EPF, Tabung Haji, etc.), enter the details, and save. You can add multiple accounts to track all your investments.',
  },
  {
    category: 'Getting Started',
    question: 'What types of accounts can I track?',
    answer: 'You can track ASB (Amanah Saham Bumiputera), EPF (Employees Provident Fund), Tabung Haji, savings accounts, fixed deposits, unit trusts, stocks, and other investment accounts.',
  },
  {
    category: 'Goals',
    question: 'How do I set a financial goal?',
    answer: 'Go to the "Goals" tab and click "+ Add Goal". You can use our Malaysian goal templates (home, education, hajj, etc.) or create a custom goal. Set your target amount and date, then allocate accounts to fund this goal.',
  },
  {
    category: 'Goals',
    question: 'What are goal templates?',
    answer: 'Goal templates are pre-configured savings targets for common Malaysian financial goals like buying a home, education funds, hajj, emergency savings, retirement, and more. They come with suggested target amounts based on Malaysian standards.',
  },
  {
    category: 'Goals',
    question: 'How do I track multiple goals?',
    answer: 'You can create unlimited goals. Each goal can be funded by multiple accounts, and you can set allocation percentages to split your savings across different goals.',
  },
  {
    category: 'Accounts',
    question: 'How often should I update my account balances?',
    answer: 'We recommend updating your balances monthly to get accurate projections and insights. You can set up reminders to help you remember.',
  },
  {
    category: 'Accounts',
    question: 'Can I track ASB dividends?',
    answer: 'Yes! When adding an ASB account, enter your current balance, units held, and monthly contribution. Our ASB calculator will estimate your dividend earnings based on historical rates.',
  },
  {
    category: 'Accounts',
    question: 'How do I delete an account?',
    answer: 'In the Accounts tab, find the account you want to delete and click the trash icon. Note that deleting an account will also remove it from any goals it\'s allocated to.',
  },
  {
    category: 'EPF & Retirement',
    question: 'Can I track my EPF contributions?',
    answer: 'Yes! Add an EPF account and enter your current balance, age, and monthly contribution. Our EPF calculator will project your retirement savings and estimate your balance at retirement age.',
  },
  {
    category: 'EPF & Retirement',
    question: 'How is my EPF projection calculated?',
    answer: 'EPF projections use historical average dividend rates (around 5-6% annually) and factor in your current balance, monthly contributions, and years until retirement (age 55).',
  },
  {
    category: 'Tabung Haji',
    question: 'Can I track Tabung Haji for hajj savings?',
    answer: 'Absolutely! Add a Tabung Haji account and track your progress toward hajj. You can also create a hajj goal and allocate your Tabung Haji account to it.',
  },
  {
    category: 'Tabung Haji',
    question: 'How do Tabung Haji dividends work?',
    answer: 'Tabung Haji typically declares annual dividends (hibah). Our calculator estimates earnings based on historical rates, but actual dividends may vary each year.',
  },
  {
    category: 'Calculations',
    question: 'How accurate are the projections?',
    answer: 'Projections are estimates based on historical data and your current savings rate. Actual results may vary due to changes in dividend rates, market conditions, and your contribution patterns.',
  },
  {
    category: 'Calculations',
    question: 'What dividend rates are used?',
    answer: 'We use historical average rates: ASB (around 5-7%), EPF (5-6%), Tabung Haji (4-5%). You can adjust these estimates when adding or editing accounts.',
  },
  {
    category: 'Privacy & Security',
    question: 'Is my financial data secure?',
    answer: 'Yes! Your data is encrypted and stored securely in Supabase. We use industry-standard security practices including Row Level Security (RLS) to ensure only you can access your data.',
  },
  {
    category: 'Privacy & Security',
    question: 'Do you have access to my actual bank accounts?',
    answer: 'No. This is a manual tracking tool. You enter your account balances yourself, and we don\'t connect to your actual bank accounts or investment platforms.',
  },
  {
    category: 'Features',
    question: 'What are achievements?',
    answer: 'Achievements are milestones you earn as you use the app - like adding your first account, reaching savings goals, or maintaining consistent tracking. They help keep you motivated!',
  },
  {
    category: 'Features',
    question: 'Can I export my data?',
    answer: 'Yes! Use the Export Data feature to download your accounts and goals data in CSV or JSON format for your records or analysis.',
  },
  {
    category: 'Features',
    question: 'What are insights and tips?',
    answer: 'Insights are personalized recommendations based on your financial data - like which goals need more attention, which accounts are performing best, and savings tips tailored to your situation.',
  },
  {
    category: 'Support',
    question: 'What if I need help?',
    answer: 'Use the floating help button (bottom-right corner) for quick tips, search this FAQ page, or check the context-sensitive help tooltips throughout the app.',
  },
];

const categories = [
  { name: 'All', icon: HelpCircle },
  { name: 'Getting Started', icon: BookOpen },
  { name: 'Accounts', icon: Wallet },
  { name: 'Goals', icon: Target },
  { name: 'EPF & Retirement', icon: TrendingUp },
  { name: 'Privacy & Security', icon: Shield },
];

export const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Help Center</h2>
        <p className="text-white text-opacity-70">Find answers to common questions about managing your finances</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-opacity-40 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="w-full pl-12 pr-4 py-3 glass text-white placeholder-white placeholder-opacity-40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'glass text-white text-opacity-70 hover:text-opacity-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <HelpCircle className="w-12 h-12 text-white text-opacity-40 mx-auto mb-4" />
            <p className="text-white text-opacity-70">No results found. Try a different search or category.</p>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <button
                key={index}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full glass-card rounded-2xl p-6 text-left hover:scale-[1.01] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs px-3 py-1 rounded-full glass text-white text-opacity-60">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                    {isExpanded && (
                      <p className="text-white text-opacity-80 mt-3 leading-relaxed">{faq.answer}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white text-opacity-40" />
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
