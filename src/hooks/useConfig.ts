import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { configService, AccountType, Institution, GoalCategory } from '../services/configService';

export function useAccountTypes() {
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadAccountTypes();

    const subscription = supabase
      .channel('admin_config_account_types_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'admin_config_account_types' },
        () => {
          loadAccountTypes();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadAccountTypes = async () => {
    try {
      setLoading(true);
      const data = await configService.getAccountTypes();
      setAccountTypes(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { accountTypes, loading, error, refetch: loadAccountTypes };
}

export function useInstitutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadInstitutions();

    const subscription = supabase
      .channel('admin_config_institutions_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'admin_config_institutions' },
        () => {
          loadInstitutions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const data = await configService.getInstitutions();
      setInstitutions(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { institutions, loading, error, refetch: loadInstitutions };
}

export function useGoalCategories() {
  const [categories, setCategories] = useState<GoalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadCategories();

    const subscription = supabase
      .channel('admin_config_goal_categories_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'admin_config_goal_categories' },
        () => {
          loadCategories();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await configService.getGoalCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, refetch: loadCategories };
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadSettings();

    const subscription = supabase
      .channel('admin_config_system_settings_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'admin_config_system_settings' },
        () => {
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await configService.getSystemSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, refetch: loadSettings };
}

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Failed to check admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading, refetch: checkAdminStatus };
}
