import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import { EmployeeRole } from '@/utils/orderStatus';

// Branch interface
interface Branch {
  id: string;
  name: string;
  city: string;
  code: string;
}

// Client interface
interface Client {
  id: number;
  telegram_id?: number;
  name?: string;
  phone?: string;
}

const TrackScan = () => {
  const [trackNumber, setTrackNumber] = useState('');
  const [clientTelegramId, setClientTelegramId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [branchId, setBranchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [existingOrder, setExistingOrder] = useState<any>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const { toast } = useToast();
  const { employee } = useAuth();
  const { logAction } = useAuditLog();

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, city, code')
        .order('name');
      
      if (error) {
        console.error('Error fetching branches:', error);
        return;
      }

      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  // Check for existing track number
  const checkExistingTrack = async (track: string) => {
    if (!track.trim()) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, track_number, status')
        .eq('track_number', track.toUpperCase())
        .maybeSingle();
      
      if (error) {
        console.error('Error checking track:', error);
        return;
      }

      if (data && data.status !== 'cancelled') {
        setExistingOrder(data);
        setShowDuplicateWarning(true);
      }
    } catch (error) {
      console.error('Error checking track:', error);
    }
  };

  const handleCreateOrder = async () => {
    // Check permissions
    if (!employee || !['admin', 'china_worker'].includes(employee.role)) {
      toast({
        title: "Доступ запрещен",
        description: "Только администраторы и сотрудники в Китае могут создавать заказы.",
        variant: "destructive",
      });
      return;
    }

    // Validate track number
    if (!trackNumber.trim()) {
      toast({
        title: "Ошибка",
        description: "Номер трека обязателен.",
        variant: "destructive",
      });
      return;
    }

    const normalizedTrack = trackNumber.trim().toUpperCase();
    
    // Validate track format (basic validation)
    if (normalizedTrack.length < 6 || normalizedTrack.length > 60) {
      toast({
        title: "Ошибка",
        description: "Номер трека должен содержать от 6 до 60 символов.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      let clientId: number | null = null;

      // Create or find client if provided
      if (clientTelegramId || clientPhone || clientName) {
        // Try to find existing client first
        let existingClient = null;
        
        if (clientTelegramId) {
          const { data } = await supabase
            .from('clients')
            .select('*')
            .eq('telegram_id', parseInt(clientTelegramId))
            .maybeSingle();
          existingClient = data;
        } else if (clientPhone) {
          const { data } = await supabase
            .from('clients')
            .select('*')
            .eq('phone', clientPhone.trim())
            .maybeSingle();
          existingClient = data;
        }

        if (existingClient) {
          clientId = existingClient.id;
        } else {
          // Create new client
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              telegram_id: clientTelegramId ? parseInt(clientTelegramId) : null,
              name: clientName.trim() || null,
              phone: clientPhone.trim() || null
            })
            .select()
            .single();

          if (clientError) throw clientError;
          clientId = newClient.id;
        }
      }

      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          track_number: normalizedTrack,
          status: 'created',
          client_id: clientId,
          created_by: employee.id,
          branch_id: branchId || null,
          version: 1
        })
        .select()
        .single();

      if (orderError) {
        if (orderError.code === '23505') {
          throw new Error('Трек с таким номером уже существует');
        }
        throw orderError;
      }

      // Create initial history entry
      await supabase.from('order_history').insert({
        order_id: orderData.id,
        status: 'created',
        changed_by: employee.id,
        note: 'Заказ создан'
      });

      // Log audit action
      await logAction('order_create', {
        orderId: orderData.id,
        trackNumber: normalizedTrack,
        clientId: clientId
      });

      toast({
        title: "Успешно",
        description: `Трек ${normalizedTrack} создан успешно.`,
      });

      // Reset form
      setTrackNumber('');
      setClientTelegramId('');
      setClientName('');
      setClientPhone('');
      setBranchId('');
      setShowDuplicateWarning(false);
      setExistingOrder(null);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать заказ.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTrack = () => {
    if (trackNumber.trim()) {
      window.open(`/search?track=${trackNumber.trim()}`, '_blank');
    }
  };

  const handleTrackNumberChange = (value: string) => {
    setTrackNumber(value);
    setShowDuplicateWarning(false);
    setExistingOrder(null);
    
    // Auto-check for duplicates after user stops typing
    const timeoutId = setTimeout(() => {
      if (value.trim().length >= 6) {
        checkExistingTrack(value.trim());
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  if (!employee) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Доступ запрещен</h2>
            <p className="text-muted-foreground">Войдите в систему для доступа к этой странице.</p>
          </div>
        </div>
      </div>
    );
  }

  const canCreateOrders = ['admin', 'china_worker'].includes(employee.role as EmployeeRole);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Khan Cargo - Управление треками</h1>
          <p className="text-muted-foreground">
            Создание новых заказов и поиск существующих треков
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create New Track Card */}
          {canCreateOrders && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-lg border shadow-sm p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Создать новый трек</h2>
              </div>

              {showDuplicateWarning && existingOrder && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-yellow-700">
                      Трек с номером {existingOrder.track_number} уже существует (ID: {existingOrder.id})
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="track-number">Номер трека *</Label>
                  <Input
                    id="track-number"
                    placeholder="YT8793828551429"
                    value={trackNumber}
                    onChange={(e) => handleTrackNumberChange(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="client-telegram-id">Telegram ID клиента</Label>
                  <Input
                    id="client-telegram-id"
                    type="number"
                    placeholder="123456789"
                    value={clientTelegramId}
                    onChange={(e) => setClientTelegramId(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="client-name">Имя клиента</Label>
                  <Input
                    id="client-name"
                    placeholder="Жаннур"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="client-phone">Телефон клиента</Label>
                  <Input
                    id="client-phone"
                    placeholder="+77001234567"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="branch">Филиал (опционально)</Label>
                  <Select value={branchId} onValueChange={setBranchId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите филиал" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} - {branch.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleCreateOrder} 
                  className="w-full"
                  disabled={loading || showDuplicateWarning}
                >
                  {loading ? "Создание..." : "Создать трек"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Search Track Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: canCreateOrders ? 0.1 : 0 }}
            className="bg-card rounded-lg border shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Поиск трека</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="search-track">Номер трека</Label>
                <Input
                  id="search-track"
                  placeholder="YT8793828551429"
                  value={trackNumber}
                  onChange={(e) => setTrackNumber(e.target.value)}
                  className="mt-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchTrack()}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleSearchTrack}
                  variant="outline"
                  className="w-full"
                  disabled={!trackNumber.trim()}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Поиск
                </Button>
                
                <Button 
                  onClick={() => window.open('/orders', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Все заказы
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TrackScan;