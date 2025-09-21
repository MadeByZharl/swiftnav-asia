import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, Truck, Clock, CheckCircle, Building2, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

interface Statistics {
  totalOrders: number;
  deliveredOrders: number;
  inTransitOrders: number;
  pendingOrders: number;
  branchStats: Array<{
    branch: string;
    count: number;
  }>;
}

const NewStatistics = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [stats, setStats] = useState<Statistics>({
    totalOrders: 0,
    deliveredOrders: 0,
    inTransitOrders: 0,
    pendingOrders: 0,
    branchStats: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    try {
      // Fetch all orders with branch information
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          branches (
            name,
            city
          )
        `);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch statistics",
          variant: "destructive",
        });
        return;
      }

      const totalOrders = orders?.length || 0;
      
      // Count orders by status
      const deliveredOrders = orders?.filter(order => 
        order.status.toLowerCase().includes('доставлен') || 
        order.status.toLowerCase().includes('delivered')
      ).length || 0;

      const inTransitOrders = orders?.filter(order => 
        order.status.toLowerCase().includes('в пути') || 
        order.status.toLowerCase().includes('китай') ||
        order.status.toLowerCase().includes('transit') ||
        order.status.toLowerCase().includes('china')
      ).length || 0;

      const pendingOrders = totalOrders - deliveredOrders - inTransitOrders;

      // Count orders by branch
      const branchCounts: { [key: string]: number } = {};
      orders?.forEach(order => {
        if (order.branches) {
          const branchName = order.branches.name;
          branchCounts[branchName] = (branchCounts[branchName] || 0) + 1;
        }
      });

      const branchStats = Object.entries(branchCounts).map(([branch, count]) => ({
        branch,
        count
      }));

      setStats({
        totalOrders,
        deliveredOrders,
        inTransitOrders,
        pendingOrders,
        branchStats
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const statusData = [
    { name: t('statistics.delivered'), value: stats.deliveredOrders, color: '#10b981' },
    { name: t('statistics.inTransit'), value: stats.inTransitOrders, color: '#3b82f6' },
    { name: t('statistics.pending'), value: stats.pendingOrders, color: '#f59e0b' },
  ];

  const statCards = [
    {
      title: t('statistics.totalOrders'),
      value: stats.totalOrders,
      icon: Package,
      color: 'bg-primary',
      textColor: 'text-primary-foreground'
    },
    {
      title: t('statistics.delivered'),
      value: stats.deliveredOrders,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-white'
    },
    {
      title: t('statistics.inTransit'),
      value: stats.inTransitOrders,
      icon: Truck,
      color: 'bg-blue-500',
      textColor: 'text-white'
    },
    {
      title: t('statistics.pending'),
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-white'
    }
  ];

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
            {t('statistics.title')}
          </h1>
          <p className="text-muted-foreground">
            Overview of orders and business metrics
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Order Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Branch Distribution Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {t('statistics.byBranch')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.branchStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="branch" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default NewStatistics;