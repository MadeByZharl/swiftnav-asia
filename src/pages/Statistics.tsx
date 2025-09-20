import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Package, TrendingUp, MapPin, Calendar } from 'lucide-react';
import Header from '@/components/Header';

const monthlyData = [
  { month: '11月', orders: 450, delivered: 420 },
  { month: '12月', orders: 620, delivered: 580 },
  { month: '1月', orders: 750, delivered: 700 },
];

const regionData = [
  { name: '阿拉木图', value: 35, color: 'hsl(var(--search))' },
  { name: '努尔苏丹', value: 25, color: 'hsl(var(--statistics))' },
  { name: '奇姆肯特', value: 20, color: 'hsl(var(--shipments))' },
  { name: '其他', value: 20, color: 'hsl(var(--track-scan))' },
];

const Statistics: React.FC = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('month');

  const statsCards = [
    {
      title: '总订单数',
      value: '1,847',
      change: '+12.5%',
      icon: Package,
      color: 'search',
    },
    {
      title: '成功送达',
      value: '1,702',
      change: '+8.2%',
      icon: TrendingUp,
      color: 'statistics',
    },
    {
      title: '运输中',
      value: '145',
      change: '+5.8%',
      icon: MapPin,
      color: 'shipments',
    },
    {
      title: '平均时长',
      value: '4.2天',
      change: '-0.3天',
      icon: Calendar,
      color: 'track-scan',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-statistics to-track-scan bg-clip-text text-transparent mb-4 md:mb-0">
              {t('nav.statistics')}
            </h1>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">本周</SelectItem>
                <SelectItem value="month">本月</SelectItem>
                <SelectItem value="quarter">本季度</SelectItem>
                <SelectItem value="year">本年</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className={`text-sm ${
                        stat.change.startsWith('+') 
                          ? 'text-statistics' 
                          : stat.change.startsWith('-') && stat.title === '平均时长'
                          ? 'text-statistics'
                          : 'text-track-scan'
                      }`}>
                        {stat.change}
                      </p>
                    </div>
                    <motion.div
                      className={`p-3 rounded-lg bg-${stat.color}/10`}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Orders Chart */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-6">月度订单统计</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="orders" 
                      fill="hsl(var(--search))" 
                      name="总订单"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="delivered" 
                      fill="hsl(var(--statistics))" 
                      name="已送达"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Regional Distribution Chart */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-6">地区分布</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Delivery Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-2"
            >
              <Card className="p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-6">配送趋势</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="delivered" 
                      stroke="hsl(var(--statistics))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--statistics))', strokeWidth: 2, r: 6 }}
                      name="送达数量"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Statistics;