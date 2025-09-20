import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, Search, BarChart3 } from 'lucide-react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeatureCard from '@/components/FeatureCard';

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      title: t('features.trackScan.title'),
      description: t('features.trackScan.description'),
      icon: Package,
      bgColor: 'track-scan' as const,
      path: '/scan',
    },
    {
      title: t('features.shipments.title'),
      description: t('features.shipments.description'),
      icon: Truck,
      bgColor: 'shipments' as const,
      path: '/shipments',
    },
    {
      title: t('features.search.title'),
      description: t('features.search.description'),
      icon: Search,
      bgColor: 'search' as const,
      path: '/search',
    },
    {
      title: t('features.statistics.title'),
      description: t('features.statistics.description'),
      icon: BarChart3,
      bgColor: 'statistics' as const,
      path: '/statistics',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <HeroSection />

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.path}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              bgColor={feature.bgColor}
              onClick={() => navigate(feature.path)}
              delay={0.6 + index * 0.1}
            />
          ))}
        </motion.div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-card via-secondary/10 to-card rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              🚀 高效物流管理
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              专为中哈物流业务设计的员工工作平台，提供实时包裹追踪、订单管理和数据分析功能，
              让您的工作更加高效便捷。
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
