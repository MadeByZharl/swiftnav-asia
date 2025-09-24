import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLogPayload {
  orderId?: string;
  trackNumber?: string;
  oldStatus?: string;
  newStatus?: string;
  note?: string;
  [key: string]: any;
}

export const useAuditLog = () => {
  const { employee } = useAuth();

  const logAction = useCallback(async (action: string, payload: AuditLogPayload) => {
    if (!employee) return;

    try {
      await supabase.from('audit_logs').insert({
        employee_id: employee.id,
        action,
        payload: payload as any
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  }, [employee]);

  return { logAction };
};