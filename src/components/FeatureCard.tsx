import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  bgColor: 'track-scan' | 'shipments' | 'search' | 'statistics';
  onClick: () => void;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  bgColor,
  onClick,
  delay = 0,
}) => {
  const colorMap = {
    'track-scan': 'bg-track-scan text-track-scan-foreground',
    'shipments': 'bg-shipments text-shipments-foreground',
    'search': 'bg-search text-search-foreground',
    'statistics': 'bg-statistics text-statistics-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.05,
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card 
        className={`h-48 cursor-pointer overflow-hidden border-0 ${colorMap[bgColor]} shadow-lg hover:shadow-2xl transition-all duration-300`}
        onClick={onClick}
      >
        <div className="p-6 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="h-12 w-12 mb-4" />
            </motion.div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="text-sm opacity-90 leading-relaxed">{description}</p>
          </div>
        </div>
        
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      </Card>
    </motion.div>
  );
};

export default FeatureCard;