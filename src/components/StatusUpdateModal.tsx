import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatus, getActionButtonText } from '@/utils/orderStatus';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    track_number: string;
    status: string;
    version: number;
    branch_id?: string;
  };
  targetStatus: OrderStatus;
  onSuccess: () => void;
}

interface Branch {
  id: string;
  name: string;
  city: string;
  code: string;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  order,
  targetStatus,
  onSuccess
}) => {
  const [note, setNote] = useState('');
  const [branchId, setBranchId] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { employee } = useAuth();
  const { logAction } = useAuditLog();

  // Load branches if needed
  React.useEffect(() => {
    if (targetStatus === 'arrived_branch' && isOpen) {
      loadBranches();
    }
  }, [targetStatus, isOpen]);

  const loadBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, city, code')
        .order('name');
      
      if (error) throw error;
      setBranches(data || []);
      
      // Auto-select employee's branch for branch workers
      if (employee?.role === 'branch_worker' && employee.branch_id) {
        setBranchId(employee.branch_id);
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список филиалов",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!employee) return;
    
    // Require note for problem status
    if (targetStatus === 'problem' && !note.trim()) {
      toast({
        title: "Ошибка",
        description: "Для статуса 'Проблема' необходимо указать причину",
        variant: "destructive",
      });
      return;
    }

    // Require branch for arrived_branch status
    if (targetStatus === 'arrived_branch' && !branchId) {
      toast({
        title: "Ошибка", 
        description: "Необходимо выбрать филиал",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Start transaction
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: targetStatus,
          branch_id: targetStatus === 'arrived_branch' ? branchId : order.branch_id,
          version: order.version + 1
        })
        .eq('id', order.id)
        .eq('version', order.version); // Optimistic locking

      if (orderError) {
        if (orderError.code === '23505') {
          throw new Error('Версия заказа устарела. Обновите страницу и попробуйте снова.');
        }
        throw orderError;
      }

      // Add to order history
      await supabase.from('order_history').insert({
        order_id: order.id,
        status: targetStatus,
        changed_by: employee.id,
        note: note.trim() || null
      });

      // Log audit action
      await logAction('order_status_update', {
        orderId: order.id,
        trackNumber: order.track_number,
        oldStatus: order.status,
        newStatus: targetStatus,
        note: note.trim(),
        branchId: targetStatus === 'arrived_branch' ? branchId : undefined
      });

      toast({
        title: "Успешно",
        description: `Статус заказа ${order.track_number} обновлен`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить статус заказа",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {getActionButtonText(targetStatus)} - {order.track_number}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {targetStatus === 'arrived_branch' && (
            <div className="space-y-2">
              <Label htmlFor="branch">Филиал *</Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите филиал" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} ({branch.city})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">
              Комментарий {targetStatus === 'problem' && '*'}
            </Label>
            <Textarea
              id="note"
              placeholder={
                targetStatus === 'problem' 
                  ? "Опишите проблему..." 
                  : "Дополнительная информация (опционально)"
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Сохранение...' : 'Подтвердить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};