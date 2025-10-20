import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { auditService } from '../../../services/auditService';

interface AdminEmail {
  id: string;
  email: string;
  created_at: string;
}

export const AdminEmailsPage = () => {
  const [emails, setEmails] = useState<AdminEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadEmails = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('admin_authorized_emails')
      .select('id, email, created_at')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setEmails(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadEmails();
  }, []);

  const addEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const { error } = await supabase
      .from('admin_authorized_emails')
      .insert({ email });
    if (error) {
      setError(error.message);
      return;
    }
    // audit log
    try {
      await auditService.logAction({
        action_type: 'CREATE',
        table_name: 'admin_authorized_emails',
        record_id: email,
        old_value: null,
        new_value: { email },
      });
    } catch (e) {
      // non-blocking
      console.warn('Audit log failed:', e);
    }
    setNewEmail('');
    loadEmails();
  };

  const removeEmail = async (id: string) => {
    setError(null);
    const { error } = await supabase
      .from('admin_authorized_emails')
      .delete()
      .eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    try {
      await auditService.logAction({
        action_type: 'DELETE',
        table_name: 'admin_authorized_emails',
        record_id: id,
        old_value: { id },
        new_value: null,
      });
    } catch (e) {
      console.warn('Audit log failed:', e);
    }
    setEmails((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-2">Admin Emails</h3>
        <p className="text-white/70 mb-4">Emails listed here grant admin access in addition to the profile flag.</p>

        <form onSubmit={addEmail} className="flex gap-3">
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:scale-105 transition-all"
          >
            Add
          </button>
        </form>

        {error && (
          <div className="mt-3 text-red-400 text-sm">{error}</div>
        )}
      </div>

      <div className="glass-strong rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Authorized Emails</h4>
        {loading ? (
          <div className="text-white/70">Loading…</div>
        ) : emails.length === 0 ? (
          <div className="text-white/60">No admin emails yet.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {emails.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3">
                <span className="text-white">{e.email}</span>
                <button
                  onClick={() => removeEmail(e.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
