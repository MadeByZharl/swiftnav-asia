import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, UserCheck, Building2, Edit, Trash2, UserPlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'china_worker' | 'branch_worker';
  branch_id?: string;
  branches?: {
    name: string;
  };
}

interface Branch {
  id: string;  
  name: string;
  city: string;
  address: string;
  phone: string;
}

const Employees = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { employee, createEmployee } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEmployee, setNewEmployee] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'admin' | 'china_worker' | 'branch_worker' | '';
    branch_id: string;
  }>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    branch_id: ''
  });

  // Only admins can access this page
  if (employee?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          branches (
            name
          )
        `)
        .order('name');

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch employees",
          variant: "destructive",
        });
        return;
      }

      setEmployees((data || []).map(emp => ({
        ...emp,
        role: emp.role as 'admin' | 'china_worker' | 'branch_worker'
      })));
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleCreateEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password || !newEmployee.role) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    try {
      await createEmployee({
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone || undefined,
        password: newEmployee.password,
        role: newEmployee.role as 'admin' | 'china_worker' | 'branch_worker',
        branch_id: newEmployee.branch_id || undefined
      });
      
      toast({
        title: "Успешно",
        description: "Сотрудник создан",
      });
      
      setShowCreateDialog(false);
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: '',
        branch_id: ''
      });
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать сотрудника",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchBranches();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive text-destructive-foreground';
      case 'china_worker':
        return 'bg-primary text-primary-foreground';
      case 'branch_worker':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'china_worker':
        return 'Сотрудник Китай';
      case 'branch_worker':
        return 'Сотрудник филиала';
      default:
        return role;
    }
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
            {t('employees.title')}
          </h1>
          <p className="text-muted-foreground">
            Управление аккаунтами сотрудников и разрешениями
          </p>
        </div>

        <div className="mb-6">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Добавить сотрудника
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Создать сотрудника</DialogTitle>
                <DialogDescription>
                  Заполните данные для нового сотрудника
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Имя *
                  </Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                    placeholder="Имя сотрудника"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                    className="col-span-3"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Телефон
                  </Label>
                  <Input
                    id="phone"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                    className="col-span-3"
                    placeholder="+7 777 123 45 67"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Пароль *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, password: e.target.value }))}
                    className="col-span-3"
                    placeholder="Пароль"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Роль *
                  </Label>
                  <Select 
                    value={newEmployee.role} 
                    onValueChange={(value: 'admin' | 'china_worker' | 'branch_worker') => setNewEmployee(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="china_worker">Сотрудник Китай</SelectItem>
                      <SelectItem value="branch_worker">Сотрудник филиала</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="branch" className="text-right">
                    Филиал
                  </Label>
                  <Select 
                    value={newEmployee.branch_id} 
                    onValueChange={(value) => setNewEmployee(prev => ({ ...prev, branch_id: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Выберите филиал (опционально)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Без филиала</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} - {branch.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreateEmployee}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp, index) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{emp.name}</CardTitle>
                        <Badge className={`text-xs ${getRoleColor(emp.role)}`}>
                          {getRoleLabel(emp.role)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{emp.email}</p>
                    </div>
                  </div>
                  
                  {emp.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Телефон</p>
                        <p className="text-sm text-muted-foreground">{emp.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {emp.branches && (
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Филиал</p>
                        <p className="text-sm text-muted-foreground">{emp.branches.name}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 flex items-center gap-2"
                      onClick={() => {
                        toast({
                          title: "Скоро",
                          description: "Функция редактирования скоро будет доступна",
                        });
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      Изменить
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 flex items-center gap-2 text-destructive hover:text-destructive"
                      onClick={() => {
                        toast({
                          title: "Скоро",
                          description: "Функция удаления скоро будет доступна",
                        });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Удалить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {employees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Сотрудники не найдены</h3>
            <p className="text-muted-foreground">Пока не зарегистрировано ни одного сотрудника.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Employees;