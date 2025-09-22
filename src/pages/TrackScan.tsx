import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Package, Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Branch {
  id: string;
  name: string;
  city: string;
}

const TrackScan = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { employee } = useAuth();
  
  const [trackNumber, setTrackNumber] = useState('');
  const [status, setStatus] = useState('');
  const [branchId, setBranchId] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Fetch branches when component mounts
  useEffect(() => {
    const fetchBranches = async () => {
      const { data } = await supabase.from('branches').select('*');
      if (data) setBranches(data);
    };
    fetchBranches();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee || employee.role !== 'admin') {
      toast({
        title: "Доступ запрещен",
        description: "Только администратор может создавать заказы",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create initial history entry
      const initialHistory = [{
        stage: "Добавлен трек в системе",
        date: new Date().toISOString().split('T')[0]
      }];

      const { data, error } = await supabase
        .from('orders')
        .insert({
          track_number: trackNumber,
          status: status || 'Добавлен в систему',
          branch_id: branchId || null,
          user_id: parseInt(userId) || 1001,
          history: initialHistory
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Успех!",
        description: `Заказ ${trackNumber} успешно создан`,
      });

      // Reset form
      setTrackNumber('');
      setStatus('');
      setBranchId('');
      setUserId('');
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать заказ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTrack = () => {
    if (trackNumber) {
      window.open(`/search?search=${trackNumber}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Управление треками
          </h1>
          <p className="text-muted-foreground">
            Создание новых заказов и поиск существующих треков
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Create New Track */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Создать новый трек
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleCreateOrder} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="trackNumber">Трек-номер *</Label>
                    <Input
                      id="trackNumber"
                      type="text"
                      placeholder="YT1234567890123"
                      value={trackNumber}
                      onChange={(e) => setTrackNumber(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userId">ID пользователя *</Label>
                    <Input
                      id="userId"
                      type="number"
                      placeholder="1001"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Статус</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Добавлен в систему">Добавлен в систему</SelectItem>
                        <SelectItem value="Принят в Китае">Принят в Китае</SelectItem>
                        <SelectItem value="В пути в Казахстан">В пути в Казахстан</SelectItem>
                        <SelectItem value="Прибыл в филиал">Прибыл в филиал</SelectItem>
                        <SelectItem value="Готов к выдаче">Готов к выдаче</SelectItem>
                        <SelectItem value="Выдан">Выдан</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">Филиал</Label>
                    <Select value={branchId} onValueChange={setBranchId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите филиал" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} - {branch.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Создание...' : 'Создать заказ'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search Track */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Поиск трека
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="searchTrack">Трек-номер</Label>
                  <Input
                    id="searchTrack"
                    type="text"
                    placeholder="Введите трек-номер для поиска"
                    value={trackNumber}
                    onChange={(e) => setTrackNumber(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleSearchTrack}
                  className="w-full"
                  disabled={!trackNumber}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Найти трек
                </Button>

                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => window.open('/orders', '_blank')}
                    className="w-full"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Все заказы
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TrackScan;