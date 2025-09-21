import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Building2, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  user_id: number;
  track_number: string;
  status: string;
  branch_id?: string;
  history: any; // Change to any to handle Json type from Supabase
  branches?: {
    name: string;
    city: string;
  };
}

const Orders = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const branchFilter = searchParams.get('branch');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          branches (
            name,
            city
          )
        `)
        .order('created_at', { ascending: false });

      // Filter by branch if specified
      if (branchFilter) {
        query = query.eq('branch_id', branchFilter);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        });
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [branchFilter]);

  const getStatusColor = (status: string) => {
    if (status.includes('доставлен') || status.includes('delivered')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
    if (status.includes('в пути') || status.includes('transit')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
    if (status.includes('филиал') || status.includes('branch')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getTimelineIcon = (stage: string) => {
    if (stage.includes('доставлен') || stage.includes('филиал')) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (stage.includes('в пути') || stage.includes('Китай')) {
      return <Clock className="w-4 h-4 text-blue-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-lg">{t('common.loading')}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('orders.title')}
          </h1>
          <p className="text-muted-foreground">
            {branchFilter ? 'Branch orders' : 'All orders and tracking information'}
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary-foreground" />
                      </div>
                      
                      <div>
                        <CardTitle className="text-lg">{order.track_number}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          {order.branches && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Building2 className="w-4 h-4" />
                              {order.branches.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      {expandedOrder === order.id ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>
                </CardHeader>
                
                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="pt-0">
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {t('orders.history')}
                          </h4>
                          
                          <div className="space-y-4">
                            {Array.isArray(order.history) ? order.history.map((item, historyIndex) => (
                              <motion.div
                                key={historyIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: historyIndex * 0.1 }}
                                className="flex items-start gap-3 pb-3 border-b last:border-b-0"
                              >
                                <div className="mt-1">
                                  {getTimelineIcon(item.stage)}
                                </div>
                                
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.stage}</p>
                                  <p className="text-xs text-muted-foreground">{item.date}</p>
                                </div>
                              </motion.div>
                            )) : (
                              <div className="text-sm text-muted-foreground">No history available</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Found</h3>
            <p className="text-muted-foreground">
              {branchFilter ? 'No orders found for this branch.' : 'No orders have been created yet.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;