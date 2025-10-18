import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="glass-card rounded-3xl p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
            <p className="text-white text-opacity-70">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-8 text-white text-opacity-90">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-cyan-400" />
              Overview
            </h2>
            <p className="leading-relaxed mb-4">
              This financial tracking platform is designed to help Malaysians manage their personal finances. We take your privacy seriously and are committed to protecting your personal and financial information.
            </p>
            <p className="leading-relaxed">
              This privacy policy explains how we collect, use, store, and protect your data when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-cyan-400" />
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div className="glass rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">Account Information</h3>
                <p className="text-sm">Email address, name, and password (encrypted) used for authentication.</p>
              </div>
              <div className="glass rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">Financial Data</h3>
                <p className="text-sm">Account balances, goals, and investment information you manually enter into the platform.</p>
              </div>
              <div className="glass rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">Usage Data</h3>
                <p className="text-sm">Information about how you use the platform, including features accessed and actions taken.</p>
              </div>
              <div className="glass rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">Feedback & Support</h3>
                <p className="text-sm">Any feedback, bug reports, or support requests you submit through the platform.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-cyan-400" />
              How We Use Your Information
            </h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <span>To provide and maintain the financial tracking service</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <span>To calculate projections and provide personalized insights</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <span>To communicate with you about updates, features, and support</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <span>To improve our platform based on usage patterns and feedback</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <span>To detect and prevent fraud or abuse of the service</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-cyan-400" />
              Data Security
            </h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span><strong>Encryption:</strong> All data is encrypted in transit (HTTPS) and at rest</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span><strong>Row Level Security:</strong> Database policies ensure you can only access your own data</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span><strong>Authentication:</strong> Secure authentication powered by Supabase</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span><strong>No Third-Party Access:</strong> We do not connect to your actual bank accounts or share your data with third parties</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-cyan-400" />
              Data Storage & Retention
            </h2>
            <p className="leading-relaxed mb-4">
              Your data is stored securely on Supabase servers with automatic backups. We retain your data for as long as your account is active.
            </p>
            <p className="leading-relaxed">
              You can request data deletion at any time by contacting support. Upon deletion, all your personal and financial data will be permanently removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-cyan-400" />
              Your Rights
            </h2>
            <p className="leading-relaxed mb-4">You have the right to:</p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Access your personal data stored in the platform</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Export your data in CSV</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Correct or update your information at any time</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Delete your account and all associated data</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Opt out of marketing communications</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-cyan-400" />
              Third-Party Services
            </h2>
            <p className="leading-relaxed mb-4">
              We use the following third-party services to operate our platform:
            </p>
            <div className="space-y-3">
              <div className="glass rounded-xl p-4">
                <h3 className="font-semibold text-white mb-1">Supabase</h3>
                <p className="text-sm">Database hosting, authentication, and storage. View their privacy policy at supabase.com/privacy</p>
              </div>
            </div>
            <p className="leading-relaxed mt-4">
              We do not share your personal or financial data with any third parties for marketing or advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Mail className="w-6 h-6 text-cyan-400" />
              Updates to This Policy
            </h2>
            <p className="leading-relaxed">
              We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Mail className="w-6 h-6 text-cyan-400" />
              Contact Us
            </h2>
            <p className="leading-relaxed mb-4">
              If you have any questions about this privacy policy or how we handle your data, please contact us through the feedback form in the Help Center.
            </p>
            <div className="glass-strong rounded-xl p-6 border-l-4 border-cyan-400">
              <p className="text-sm">
                <strong>Your privacy matters.</strong> We are committed to transparency and protecting your financial information. This is a manual tracking tool - we never access your actual bank accounts or share your data with third parties.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
