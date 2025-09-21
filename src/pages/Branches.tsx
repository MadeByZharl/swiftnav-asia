import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Building2, Phone, MapPin, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
}

const Branches = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch branches",
          variant: "destructive",
        });
        return;
      }

      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch branches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

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
            {t('branches.title')}
          </h1>
          <p className="text-muted-foreground">
            Manage and view all branch locations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch, index) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{branch.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{branch.city}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{t('branches.address')}</p>
                      <p className="text-sm text-muted-foreground">{branch.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{t('branches.phone')}</p>
                      <p className="text-sm text-muted-foreground">{branch.phone}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                      onClick={() => {
                        // Navigate to orders filtered by branch
                        window.location.href = `/orders?branch=${branch.id}`;
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      {t('branches.viewOrders')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {branches.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Branches Found</h3>
            <p className="text-muted-foreground">No branches have been added yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Branches;