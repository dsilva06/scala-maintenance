
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Car,
  Settings,
  ClipboardCheck,
  Package,
  FileText,
  BarChart3,
  Menu,
  Bell,
  Search,
  Map,
  BookOpen,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";

import AlertCard from "@/components/alerts/AlertCard";
import { Document } from "@/api/entities";
import { listMaintenanceOrders } from "@/api/maintenanceOrders";
import { listSpareParts } from "@/api/spareParts";
import { useAuth } from "@/auth/AuthContext";

const ADMIN_ONLY = ["admin"];
const ADMIN_EMPLOYEE = ["admin", "employee"];

const navigationItems = [
  {
    title: "Dashboard",
    url: "/app",
    icon: BarChart3,
    roles: ADMIN_EMPLOYEE,
  },
  {
    title: "Inventario",
    url: "/app/inventory",
    icon: Package,
    roles: ADMIN_ONLY,
  },
  {
    title: "Guías de Mantenimiento",
    url: "/app/maintenance-guides",
    icon: BookOpen,
    roles: ADMIN_EMPLOYEE,
  },
  {
    title: "Mantenimiento",
    url: "/app/maintenance",
    icon: Settings,
    roles: ADMIN_EMPLOYEE,
  },
  {
    title: "Compras",
    url: "/app/purchases",
    icon: ShoppingCart,
    roles: ADMIN_ONLY,
  },
  {
    title: "Vehículos",
    url: "/app/vehicles",
    icon: Car,
    roles: ADMIN_EMPLOYEE,
  },
  {
    title: "Viajes",
    url: "/app/trips",
    icon: Map,
    roles: ADMIN_EMPLOYEE,
  },
  {
    title: "Inspecciones",
    url: "/app/inspections",
    icon: ClipboardCheck,
    roles: ADMIN_EMPLOYEE,
  },
  {
    title: "Documentos",
    url: "/app/documents",
    icon: FileText,
    roles: ADMIN_ONLY,
  },
];

// const bottomNavItems = [
//     { title: "Asistente AI", url: createPageUrl("AIAssistant"), icon: Bot },
// ];

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userRole = (user?.role ?? "employee").toLowerCase();
  const [alerts, setAlerts] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const accessibleNavigationItems = navigationItems.filter((item) => {
    if (!Array.isArray(item.roles) || item.roles.length === 0) {
      return true;
    }
    return item.roles.includes(userRole);
  });

  useEffect(() => {
    loadAlerts();
  }, []);
  
  const loadAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
        const callIfAvailable = async (context, method, ...args) => {
          if (!context || typeof context[method] !== 'function') {
            return [];
          }
          try {
            return await context[method].call(context, ...args);
          } catch (error) {
            console.error('Error calling data provider', error);
            return [];
          }
        };

        const [expiringDocs, lowStockParts, criticalOrders] = await Promise.all([
            callIfAvailable(Document, 'filter', { status: "proximo_a_vencer" }),
            (async () => {
              try {
                const parts = await listSpareParts({ sort: 'name', limit: 200 });
                return parts.filter(part => {
                  const current = Number(part.current_stock ?? 0);
                  const minimum = Number(part.minimum_stock ?? 0);
                  return current <= minimum;
                });
              } catch (error) {
                console.error('Error loading spare part alerts', error);
                return [];
              }
            })(),
            (async () => {
              try {
                const orders = await listMaintenanceOrders({ sort: '-created_at', limit: 20, status: 'pendiente' });
                return orders.filter(order => order.priority === 'critica');
              } catch (error) {
                console.error('Error loading maintenance alerts', error);
                return [];
              }
            })(),
        ]);

        const allAlerts = [
            ...expiringDocs.map(d => ({ type: 'document', data: d, date: d.expiration_date })),
            ...lowStockParts.map(p => ({ type: 'inventory', data: p, date: p.updated_date })),
            ...criticalOrders.map(o => ({ type: 'maintenance', data: o, date: o.created_at ?? o.created_date })),
        ];
        
        // Sort alerts by date, most recent first
        allAlerts.sort((a, b) => new Date(b.date) - new Date(a.date));

        setAlerts(allAlerts);
    } catch (error) {
        console.error("Error loading alerts:", error);
    } finally {
        setIsLoadingAlerts(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Apple-like design */}
      <div className={`bg-gray-900 text-white w-64 min-h-screen ${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
        <div className="p-6">
          <h1 className="text-xl font-semibold text-white tracking-tight">FLOTA</h1>
        </div>
        
        <nav className="px-4 space-y-1">
          {accessibleNavigationItems.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-400 border border-dashed border-gray-700 rounded-xl">
              No tienes módulos asignados. Contacta a un administrador para obtener acceso.
            </div>
          ) : (
            accessibleNavigationItems.map((item) => {
              const isActive =
                location.pathname === item.url ||
                location.pathname.startsWith(`${item.url}/`);

              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                    }`}
                  />
                  {item.title}
                </Link>
              );
            })
          )}
        </nav>

        {/* AI assistant entry temporarily disabled */}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Apple-like design */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden hover:bg-gray-100 rounded-full"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="relative max-w-md flex-1 mx-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar vehículos, órdenes, repuestos..."
                className="pl-10 pr-4 py-2 h-10 rounded-full bg-gray-100/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 rounded-full">
                    <Bell className="h-5 w-5" />
                    {alerts.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                        {alerts.length > 9 ? '9+' : alerts.length}
                      </span>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute right-4 top-16 w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                  </div>
                  <div>
                    {isLoadingAlerts ? (
                      <div className="p-6 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        Cargando alertas...
                      </div>
                    ) : alerts.length > 0 ? (
                      alerts.slice(0, 10).map((alert, index) => <AlertCard key={index} alert={alert} />)
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        No hay nuevas alertas
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {user && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                    <span className="text-[11px] uppercase tracking-wide text-gray-400">
                      Rol: {userRole === 'admin' ? 'Administrador' : 'Colaborador'}
                    </span>
                  </div>
                  <Button variant="outline" onClick={handleLogout} className="text-sm">
                    Cerrar sesión
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
