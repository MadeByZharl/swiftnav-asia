import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, UserCheck, Building2, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const Employees = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { employee } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchEmployees();
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
        return 'Admin';
      case 'china_worker':
        return 'China Worker';
      case 'branch_worker':
        return 'Branch Worker';
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
            Manage employee accounts and permissions
          </p>
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
                      <p className="text-sm font-medium">{t('employees.email')}</p>
                      <p className="text-sm text-muted-foreground">{emp.email}</p>
                    </div>
                  </div>
                  
                  {emp.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('employees.phone')}</p>
                        <p className="text-sm text-muted-foreground">{emp.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {emp.branches && (
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('employees.branch')}</p>
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
                          title: "Feature Coming Soon",
                          description: "Edit employee functionality will be available soon.",
                        });
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      {t('common.edit')}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 flex items-center gap-2 text-destructive hover:text-destructive"
                      onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description: "Delete employee functionality will be available soon.",
                        });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('common.delete')}
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
            <h3 className="text-lg font-semibold text-foreground mb-2">No Employees Found</h3>
            <p className="text-muted-foreground">No employees have been registered yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Employees;