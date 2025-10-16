import { useState } from 'react';
import { MessageSquare, Star, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const FeedbackForm = () => {
  const { user } = useAuth();
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature_request' | 'general' | 'other'>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await supabase.from('user_feedback').insert({
        user_id: user?.id || null,
        feedback_type: feedbackType,
        subject,
        message,
        rating: rating > 0 ? rating : null,
        email: email || null,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        },
      });

      if (submitError) throw submitError;

      setSubmitted(true);
      setSubject('');
      setMessage('');
      setRating(0);
      setEmail('');

      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback. Please try again.');
      console.error('Feedback submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-card rounded-3xl p-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
        <p className="text-white text-opacity-80 mb-4">
          Your feedback has been submitted successfully. We appreciate you taking the time to help us improve!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Share Your Feedback</h2>
          <p className="text-sm text-white text-opacity-70">Help us improve your experience</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Feedback Type</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'bug', label: 'Bug Report', emoji: '🐛' },
              { value: 'feature_request', label: 'Feature Request', emoji: '💡' },
              { value: 'general', label: 'General Feedback', emoji: '💬' },
              { value: 'other', label: 'Other', emoji: '📝' },
            ].map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFeedbackType(value as any)}
                className={`p-3 rounded-xl text-left transition-all ${
                  feedbackType === value
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'glass text-white text-opacity-70 hover:text-opacity-100'
                }`}
              >
                <span className="text-lg mr-2">{emoji}</span>
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-2">Rate Your Experience (Optional)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-all hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-white text-opacity-30'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-white mb-2">
            Subject *
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="Brief description of your feedback"
            className="w-full px-4 py-3 glass text-white placeholder-white placeholder-opacity-40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
            Message *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={6}
            placeholder="Tell us more about your experience, suggestion, or issue..."
            className="w-full px-4 py-3 glass text-white placeholder-white placeholder-opacity-40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
          />
        </div>

        {!user && (
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
              Email (Optional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com (if you'd like a response)"
              className="w-full px-4 py-3 glass text-white placeholder-white placeholder-opacity-40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        )}

        {error && (
          <div className="glass-strong rounded-xl p-4 border border-red-500 border-opacity-30">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !subject || !message}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
};
