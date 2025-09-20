import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Camera, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';

const TrackScan: React.FC = () => {
  const { t } = useTranslation();
  const [trackingCode, setTrackingCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleScan = () => {
    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      if (trackingCode.length > 5) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    }, 2000);
  };

  const StatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-search" />;
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-16 w-16 text-statistics" />
          </motion.div>
        );
      case 'error':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="animate-shake"
          >
            <XCircle className="h-16 w-16 text-track-scan" />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-8 shadow-lg">
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-track-scan to-statistics bg-clip-text text-transparent">
                {t('scan.title')}
              </h1>
            </motion.div>

            <div className="space-y-6">
              <div className="flex space-x-2">
                <Input
                  placeholder={t('scan.placeholder')}
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                />
                <Button
                  onClick={handleScan}
                  disabled={!trackingCode || status === 'loading'}
                  className="bg-search hover:bg-search/90"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // Camera functionality would go here
                  console.log('Camera scan');
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                {t('scan.camera')}
              </Button>

              <AnimatePresence mode="wait">
                {status !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center space-y-4 py-8"
                  >
                    <StatusIcon />
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-lg font-medium"
                    >
                      {status === 'loading' && t('scan.processing')}
                      {status === 'success' && t('scan.success')}
                      {status === 'error' && t('scan.error')}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-statistics/10 border border-statistics/20 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-statistics mb-2">包裹信息</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">追踪号:</span> {trackingCode}</p>
                    <p><span className="font-medium">状态:</span> 运输中</p>
                    <p><span className="font-medium">位置:</span> 阿拉木图仓库</p>
                    <p><span className="font-medium">预计送达:</span> 2024-01-15</p>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TrackScan;