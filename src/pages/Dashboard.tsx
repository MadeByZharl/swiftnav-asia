import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  Search, 
  BarChart3, 
  Building2, 
  Users, 
  ClipboardList,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut, employee } = useAuth();

  const features = [
    {
      key: 'trackScan',
      icon: Package,
      route: '/scan',
      color: 'bg-track-scan',
      textColor: 'text-track-scan-foreground'
    },
    {
      key: 'shipments',
      icon: Truck,
      route: '/shipments',
      color: 'bg-shipments',
      textColor: 'text-shipments-foreground'
    },
    {
      key: 'search',
      icon: Search,
      route: '/search',
      color: 'bg-search',
      textColor: 'text-search-foreground'
    },
    {
      key: 'statistics',
      icon: BarChart3,
      route: '/statistics',
      color: 'bg-statistics',
      textColor: 'text-statistics-foreground'
    },
    {
      key: 'branches',
      icon: Building2,
      route: '/branches',
      color: 'bg-primary',
      textColor: 'text-primary-foreground'
    },
    {
      key: 'orders',
      icon: ClipboardList,
      route: '/orders',
      color: 'bg-secondary',
      textColor: 'text-secondary-foreground'
    }
  ];

  // Add employees feature only for admins
  if (employee?.role === 'admin') {
    features.push({
      key: 'employees',
      icon: Users,
      route: '/employees',
      color: 'bg-accent',
      textColor: 'text-accent-foreground'
    });
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Khan Cargo
            </h1>
            <p className="text-muted-foreground">
              {employee ? `Welcome, ${employee.name}` : 'Welcome'}
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            {t('nav.logout')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                onClick={() => navigate(feature.route)}
              >
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon 
                      size={32} 
                      className={feature.textColor}
                    />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t(`features.${feature.key}.title`)}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground">
                    {t(`features.${feature.key}.description`)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;