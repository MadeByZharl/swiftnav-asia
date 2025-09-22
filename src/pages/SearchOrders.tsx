import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Package, Building2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  user_id: number;
  track_number: string;
  status: string;
  branch_id?: string;
  history: any;
  branches?: {
    name: string;
    city: string;
  };
  created_at: string;
}

const SearchOrders = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const searchOrders = async (query: string) => {
    if (!query.trim()) {
      setOrders([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          branches (
            name,
            city
          )
        `)
        .or(`track_number.ilike.%${query}%,user_id.eq.${isNaN(Number(query)) ? 0 : Number(query)}`)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Ошибка поиска",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSearch) {
      searchOrders(initialSearch);
    }
  }, [initialSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchOrders(searchQuery);
  };

  const getStatusColor = (status: string) => {
    if (status.includes('выдан') || status.includes('delivered')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
    if (status.includes('пути') || status.includes('transit')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
    if (status.includes('филиал') || status.includes('branch') || status.includes('готов')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getTimelineIcon = (stage: string) => {
    if (stage.includes('выдан') || stage.includes('готов')) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (stage.includes('пути') || stage.includes('Китай')) {
      return <Clock className="w-4 h-4 text-blue-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Поиск заказов
          </h1>
          <p className="text-muted-foreground">
            Найдите заказ по трек-номеру или ID пользователя
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Введите трек-номер или ID пользователя"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Поиск...' : 'Найти'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
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
                          <span className="text-sm text-muted-foreground">
                            ID: {order.user_id}
                          </span>
                          {order.branches && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Building2 className="w-4 h-4" />
                              {order.branches.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      История заказа
                    </h4>
                    
                    <div className="space-y-3">
                      {Array.isArray(order.history) && order.history.length > 0 ? order.history.map((item, historyIndex) => (
                        <div
                          key={historyIndex}
                          className="flex items-start gap-3 pb-3 border-b last:border-b-0"
                        >
                          <div className="mt-1">
                            {getTimelineIcon(item.stage)}
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.stage}</p>
                            <p className="text-xs text-muted-foreground">{item.date}</p>
                          </div>
                        </div>
                      )) : order.history && typeof order.history === 'object' && Array.isArray(order.history) ? 
                        order.history.map((item, historyIndex) => (
                        <div
                          key={historyIndex}
                          className="flex items-start gap-3 pb-3 border-b last:border-b-0"
                        >
                          <div className="mt-1">
                            {getTimelineIcon(item.stage)}
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.stage}</p>
                            <p className="text-xs text-muted-foreground">{item.date}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-sm text-muted-foreground">История недоступна</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* No Results */}
        {searchQuery && orders.length === 0 && !loading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Ничего не найдено</h3>
            <p className="text-muted-foreground">
              По запросу "{searchQuery}" заказы не найдены.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Поиск заказов</h3>
            <p className="text-muted-foreground">
              Введите трек-номер или ID пользователя для поиска заказов
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchOrders;