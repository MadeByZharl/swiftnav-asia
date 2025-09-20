import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Package, Plane, Building, Truck } from 'lucide-react';
import Header from '@/components/Header';

interface Shipment {
  id: string;
  trackingNumber: string;
  customer: string;
  status: string;
  currentLocation: string;
  estimatedDelivery: string;
  timeline: Array<{
    status: string;
    location: string;
    date: string;
    completed: boolean;
  }>;
}

const mockShipments: Shipment[] = [
  {
    id: '1',
    trackingNumber: 'CN2024001',
    customer: '张三',
    status: '运输中',
    currentLocation: '阿拉木图仓库',
    estimatedDelivery: '2024-01-15',
    timeline: [
      { status: '已发货', location: '广州', date: '2024-01-10', completed: true },
      { status: '运输中', location: '阿拉木图', date: '2024-01-12', completed: true },
      { status: '清关中', location: '阿拉木图', date: '2024-01-14', completed: false },
      { status: '派送中', location: '努尔苏丹', date: '2024-01-15', completed: false },
    ]
  },
  {
    id: '2',
    trackingNumber: 'CN2024002',
    customer: 'Айгуль Нұрланова',
    status: '已送达',
    currentLocation: '已送达',
    estimatedDelivery: '2024-01-12',
    timeline: [
      { status: '已发货', location: '深圳', date: '2024-01-08', completed: true },
      { status: '运输中', location: '阿拉木图', date: '2024-01-10', completed: true },
      { status: '清关完成', location: '阿拉木图', date: '2024-01-11', completed: true },
      { status: '已送达', location: '阿拉木图', date: '2024-01-12', completed: true },
    ]
  }
];

const Shipments: React.FC = () => {
  const { t } = useTranslation();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已送达': return 'bg-statistics text-statistics-foreground';
      case '运输中': return 'bg-search text-search-foreground';
      case '清关中': return 'bg-shipments text-shipments-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case '已发货': return Package;
      case '运输中': return Plane;
      case '清关中': case '清关完成': return Building;
      case '派送中': case '已送达': return Truck;
      default: return Package;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-shipments to-search bg-clip-text text-transparent">
            {t('nav.shipments')}
          </h1>
          
          <div className="space-y-4">
            {mockShipments.map((shipment, index) => (
              <motion.div
                key={shipment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <motion.div
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedCard(
                      expandedCard === shipment.id ? null : shipment.id
                    )}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-xl font-semibold">{shipment.trackingNumber}</h3>
                          <Badge className={getStatusColor(shipment.status)}>
                            {shipment.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                          客户: {shipment.customer} • 当前位置: {shipment.currentLocation}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedCard === shipment.id ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {expandedCard === shipment.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t bg-secondary/20"
                      >
                        <div className="p-6">
                          <h4 className="font-semibold mb-4 text-lg">物流时间线</h4>
                          <div className="space-y-4">
                            {shipment.timeline.map((item, timelineIndex) => {
                              const IconComponent = getTimelineIcon(item.status);
                              return (
                                <motion.div
                                  key={timelineIndex}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: timelineIndex * 0.1 }}
                                  className={`flex items-center space-x-4 ${
                                    item.completed ? 'text-foreground' : 'text-muted-foreground'
                                  }`}
                                >
                                  <motion.div
                                    className={`p-2 rounded-full ${
                                      item.completed 
                                        ? 'bg-statistics text-statistics-foreground' 
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    <IconComponent className="h-4 w-4" />
                                  </motion.div>
                                  <div className="flex-1">
                                    <p className="font-medium">{item.status}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {item.location} • {item.date}
                                    </p>
                                  </div>
                                  {item.completed && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-3 h-3 bg-statistics rounded-full"
                                    />
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Shipments;