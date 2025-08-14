
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
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
  Bot,
  Zap,
  BookOpen,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";

import AlertCard from "@/components/alerts/AlertCard";
import { SparePart, Document, MaintenanceOrder } from "@/api/entities";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: BarChart3,
  },
  {
    title: "Inventario",
    url: createPageUrl("Inventory"),
    icon: Package,
  },
  {
    title: "Guías de Mantenimiento",
    url: createPageUrl("MaintenanceGuides"),
    icon: BookOpen,
  },
  {
    title: "Mantenimiento",
    url: createPageUrl("Maintenance"),
    icon: Settings,
  },
  {
    title: "Compras",
    url: createPageUrl("Purchases"),
    icon: ShoppingCart,
  },
  {
    title: "Vehículos",
    url: createPageUrl("Vehicles"),
    icon: Car,
  },
  {
    title: "Viajes",
    url: createPageUrl("Trips"),
    icon: Map,
  },
  {
    title: "Inspecciones",
    url: createPageUrl("Inspections"),
    icon: ClipboardCheck,
  },
  {
    title: "Documentos",
    url: createPageUrl("Documents"),
    icon: FileText,
  },
];

const bottomNavItems = [
    { title: "Asistente AI", url: createPageUrl("AIAssistant"), icon: Bot },
    { title: "Guía de Migración", url: createPageUrl("MigrationGuide"), icon: Zap },
];

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);
  
  const loadAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
        const [expiringDocs, lowStockParts, criticalOrders] = await Promise.all([
            Document.filter({ status: "proximo_a_vencer" }),
            SparePart.filter({ stock_status: "bajo" }),
            MaintenanceOrder.filter({ priority: "critica", status: "pendiente" }),
        ]);

        const allAlerts = [
            ...expiringDocs.map(d => ({ type: 'document', data: d, date: d.expiration_date })),
            ...lowStockParts.map(p => ({ type: 'inventory', data: p, date: p.updated_date })),
            ...criticalOrders.map(o => ({ type: 'maintenance', data: o, date: o.created_date })),
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Apple-like design */}
      <div className={`bg-gray-900 text-white w-64 min-h-screen ${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
        <div className="p-6">
          <h1 className="text-xl font-semibold text-white tracking-tight">SCALA Fleet AI</h1>
        </div>
        
        <nav className="px-4 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                item.url === location.pathname
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                item.url === location.pathname ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
              }`} />
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 space-y-1 border-t border-gray-700">
          {bottomNavItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                item.url === location.pathname
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                item.url === location.pathname ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
              }`} />
              {item.title}
            </Link>
          ))}
        </div>
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
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
