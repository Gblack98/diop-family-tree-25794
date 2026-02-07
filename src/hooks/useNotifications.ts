import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  admin_id: string;
  change_history_id: string | null;
  actor_name: string;
  action_type: 'INSERT' | 'UPDATE' | 'DELETE';
  target_table: string;
  target_label: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { profile, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!profile?.id || !isAdmin) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('admin_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // Table might not exist yet
        console.warn('Notifications table not available:', error.message);
        setLoading(false);
        return;
      }

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.read).length);
    } catch (error) {
      console.warn('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, isAdmin]);

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to Realtime
  useEffect(() => {
    if (!profile?.id || !isAdmin) return;

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
          filter: `admin_id=eq.${profile.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, isAdmin]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!profile?.id) return;

      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('admin_id', profile.id);

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    },
    [profile?.id]
  );

  const markAllAsRead = useCallback(async () => {
    if (!profile?.id) return;

    const { error } = await supabase
      .from('admin_notifications')
      .update({ read: true })
      .eq('admin_id', profile.id)
      .eq('read', false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  }, [profile?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
