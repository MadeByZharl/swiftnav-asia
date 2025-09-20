import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Star, StarOff, Package } from 'lucide-react';
import Header from '@/components/Header';

interface SearchResult {
  id: string;
  trackingNumber: string;
  customer: string;
  status: string;
  origin: string;
  destination: string;
  weight: string;
  estimatedDelivery: string;
  isFavorite: boolean;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    trackingNumber: 'CN2024001',
    customer: '张三',
    status: '运输中',
    origin: '广州',
    destination: '阿拉木图',
    weight: '2.5kg',
    estimatedDelivery: '2024-01-15',
    isFavorite: false,
  },
  {
    id: '2',
    trackingNumber: 'CN2024002',
    customer: 'Айгуль Нұрланова',
    status: '已送达',
    origin: '深圳',
    destination: '努尔苏丹',
    weight: '1.8kg',
    estimatedDelivery: '2024-01-12',
    isFavorite: true,
  },
];

const SearchOrders: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const filtered = mockResults.filter(
        item => 
          item.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.customer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
      setIsSearching(false);
    }, 1000);
  };

  const toggleFavorite = (id: string) => {
    setResults(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已送达': return 'bg-statistics text-statistics-foreground';
      case '运输中': return 'bg-search text-search-foreground';
      case '清关中': return 'bg-shipments text-shipments-foreground';
      default: return 'bg-muted text-muted-foreground';
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
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-search to-statistics bg-clip-text text-transparent">
            {t('nav.search')}
          </h1>
          
          <Card className="p-6 mb-8 shadow-lg">
            <div className="flex space-x-2">
              <Input
                placeholder={t('scan.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="bg-search hover:bg-search/90"
              >
                {isSearching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Search className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </Card>

          <AnimatePresence mode="wait">
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold mb-4">
                  搜索结果 ({results.length})
                </h2>
                
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <motion.div
                            className="p-3 bg-search/10 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Package className="h-6 w-6 text-search" />
                          </motion.div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-xl font-semibold">{result.trackingNumber}</h3>
                              <Badge className={getStatusColor(result.status)}>
                                {result.status}
                              </Badge>
                            </div>
                            
                            <p className="text-muted-foreground">
                              客户: {result.customer}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-muted-foreground">起始地:</span>
                                <p>{result.origin}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">目的地:</span>
                                <p>{result.destination}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">重量:</span>
                                <p>{result.weight}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">预计送达:</span>
                                <p>{result.estimatedDelivery}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <motion.button
                          onClick={() => toggleFavorite(result.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2"
                        >
                          {result.isFavorite ? (
                            <Star className="h-5 w-5 text-shipments fill-current" />
                          ) : (
                            <StarOff className="h-5 w-5 text-muted-foreground" />
                          )}
                        </motion.button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {searchQuery && results.length === 0 && !isSearching && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">未找到结果</h3>
                <p className="text-muted-foreground">
                  请检查搜索条件并重试
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default SearchOrders;