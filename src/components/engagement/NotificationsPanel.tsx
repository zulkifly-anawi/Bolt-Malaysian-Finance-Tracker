import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, AlertCircle, TrendingUp, Calendar, X, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatters';

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export const NotificationsPanel = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotification = async (notificationId: string) => {
    await supabase.from('notifications').delete().eq('id', notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'reminder':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'milestone':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-h-[70vh] sm:max-h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col">
            <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                <span className="truncate">Notifications</span>
              </h3>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap min-h-[44px] sm:min-h-0 flex items-center px-1"
                  >
                    <span className="hidden sm:inline">Mark all read</span>
                    <span className="sm:hidden">Mark read</span>
                  </button>
                )}
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center sm:min-h-0 sm:min-w-0"
                >
                  <X className="w-5 h-5 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 sm:py-12 px-4">
                  <BellOff className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-teal-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(notification.notification_type)}
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base break-words flex-1">
                              {notification.title}
                            </h4>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center sm:min-h-0 sm:min-w-0 flex-shrink-0 -mt-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 break-words leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="text-xs text-gray-500 order-2 sm:order-1">
                              {formatDate(notification.created_at)}
                            </span>
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-teal-600 hover:text-teal-700 font-medium min-h-[44px] sm:min-h-0 flex items-center justify-start sm:justify-end whitespace-nowrap order-1 sm:order-2"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string
) => {
  await supabase.from('notifications').insert({
    user_id: userId,
    notification_type: type,
    title,
    message,
  });
};

export const createReminders = async (userId: string) => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const reminders = [
    {
      user_id: userId,
      reminder_type: 'balance_update',
      title: 'Monthly Balance Update',
      message: 'Time to update your account balances!',
      frequency: 'monthly',
      next_reminder_date: nextMonth.toISOString(),
    },
    {
      user_id: userId,
      reminder_type: 'dividend_season',
      title: 'ASB Dividend Season',
      message: 'ASB dividend is usually announced in March. Check for updates!',
      frequency: 'yearly',
      next_reminder_date: new Date(now.getFullYear(), 2, 1).toISOString(),
    },
  ];

  await supabase.from('reminders').insert(reminders);
};
