import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronDown, ChevronRight, Clock, User, Building2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { StatusUpdateModal } from '@/components/StatusUpdateModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  OrderStatus, 
  EmployeeRole, 
  getStatusDisplayName, 
  getStatusColor, 
  getAvailableActions,
  getActionButtonText 
} from '@/utils/orderStatus';

interface Order {
  id: string;
  track_number: string;
  status: OrderStatus;
  branch_id?: string;
  client_id?: number;
  version: number;
  created_at: string;
  branches?: { name: string; city: string; };
  clients?: { name?: string; phone?: string; };
  order_history?: Array<{
    id: number;
    status: string;
    changed_at: string;
    note?: string;
    employees?: { name: string; };
  }>;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('created');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { toast } = useToast();
  const { employee } = useAuth();

  useEffect(() => {
    if (employee) fetchOrders();
  }, [employee]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          branches (name, city),
          clients (name, phone),
          order_history!order_history_order_id_fkey (
            id, status, changed_at, note,
            employees (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (employee?.role === 'branch_worker' && employee.branch_id) {
        query = query.eq('branch_id', employee.branch_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders((data || []).map(order => ({
        ...order,
        status: order.status as OrderStatus
      })));
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Ошибка", description: "Не удалось загрузить заказы", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleStatusUpdate = (order: Order, targetStatus: OrderStatus) => {
    setSelectedOrder(order);
    setSelectedStatus(targetStatus);
    setShowStatusModal(true);
  };

  const getAvailableOrderActions = (order: Order): OrderStatus[] => {
    if (!employee) return [];
    return getAvailableActions(employee.role as EmployeeRole, order.status, employee.branch_id, order.branch_id);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.track_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Khan Cargo - Заказы</h1>
          <p className="text-muted-foreground">Управление заказами и отслеживание статусов</p>
        </div>

        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Поиск по треку или имени..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Фильтр по статусу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="created">Создан</SelectItem>
                <SelectItem value="arrived_cn">Прибыл в Китай</SelectItem>
                <SelectItem value="packed">Упакован</SelectItem>
                <SelectItem value="sent_to_kz">Отправлен в Казахстан</SelectItem>
                <SelectItem value="in_transit">В пути</SelectItem>
                <SelectItem value="arrived_branch">Прибыл в филиал</SelectItem>
                <SelectItem value="ready_for_pickup">Готов к выдаче</SelectItem>
                <SelectItem value="issued">Выдан клиенту</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center">
              Найдено: {filteredOrders.length}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const isExpanded = expandedOrders.has(order.id);
            const availableActions = getAvailableOrderActions(order);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="p-1"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </Button>
                          
                          <div>
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5 text-primary" />
                              <span className="font-semibold text-lg">{order.track_number}</span>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusDisplayName(order.status)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              {order.clients?.name && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {order.clients.name}
                                </div>
                              )}
                              {order.branches && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {order.branches.name}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(order.created_at).toLocaleDateString('ru-RU')}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {availableActions.slice(0, 2).map((action) => (
                            <Button
                              key={action}
                              size="sm"
                              onClick={() => handleStatusUpdate(order, action)}
                              className="text-xs"
                            >
                              {getActionButtonText(action)}
                            </Button>
                          ))}
                          
                          {availableActions.length > 2 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {availableActions.slice(2).map((action) => (
                                  <DropdownMenuItem
                                    key={action}
                                    onClick={() => handleStatusUpdate(order, action)}
                                  >
                                    {getActionButtonText(action)}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(order, 'problem')}
                            className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Проблема
                          </Button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t bg-muted/30"
                        >
                          <div className="p-4">
                            <h4 className="font-semibold mb-3">История заказа</h4>
                            {order.order_history && order.order_history.length > 0 ? (
                              <div className="space-y-3">
                                {order.order_history
                                  .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
                                  .map((history) => (
                                    <div key={history.id} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                      <div className="flex-1">
                                        <Badge className={getStatusColor(history.status as OrderStatus)} variant="secondary">
                                          {getStatusDisplayName(history.status as OrderStatus)}
                                        </Badge>
                                        <div className="text-xs text-muted-foreground mt-1">
                                          {new Date(history.changed_at).toLocaleString('ru-RU')}
                                          {history.employees && ` • ${history.employees.name}`}
                                        </div>
                                        {history.note && <div className="text-sm mt-1">{history.note}</div>}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-muted-foreground">История заказа пуста</div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Заказы не найдены</h3>
          </div>
        )}

        {showStatusModal && selectedOrder && (
          <StatusUpdateModal
            isOpen={showStatusModal}
            onClose={() => setShowStatusModal(false)}
            order={selectedOrder}
            targetStatus={selectedStatus}
            onSuccess={() => { fetchOrders(); setShowStatusModal(false); }}
          />
        )}
      </main>
    </div>
  );
};

export default Orders;