
import { useState, useEffect } from "react";
import { listMaintenanceOrders, createMaintenanceOrder, updateMaintenanceOrder } from "@/api/maintenanceOrders";
import { listVehicles } from "@/api/vehicles";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

import MaintenanceKanban from "../components/maintenance/MaintenanceKanban";
import MaintenanceOrderForm from "../components/maintenance/MaintenanceOrderForm";

export default function Maintenance() {
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    loadData();
  }, [monthFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, vehiclesData] = await Promise.all([
        listMaintenanceOrders({ sort: '-created_at', limit: 200, month: monthFilter }),
        listVehicles({ sort: 'plate', limit: 500 })
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
    } catch (error) {
      console.error("Error loading maintenance data:", error);
      toast.error("Error al cargar los datos de mantenimiento.", {
        description: getErrorMessage(error, "No se pudo cargar la informacion de mantenimiento.")
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (orderData) => {
    try {
      if (editingOrder) {
        await updateMaintenanceOrder(editingOrder.id, orderData);
      } else {
        await createMaintenanceOrder({
          ...orderData,
          order_number: `MNT-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`
        });
      }
      setShowForm(false);
      setEditingOrder(null);
      loadData();
    } catch (error) {
      console.error("Error saving maintenance order:", error);
      toast.error("Error al guardar la orden de mantenimiento", {
        description: getErrorMessage(error, "No se pudo guardar la orden.")
      });
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setShowForm(true);
  };
  
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateMaintenanceOrder(Number(orderId), { status: newStatus });
      loadData();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("No se pudo actualizar el estado", {
        description: getErrorMessage(error, "Intenta nuevamente.")
      });
    }
  };

  const handleInventoryUpdate = () => {
    // Callback para actualizar datos cuando se modifique inventario desde la guía
    loadData();
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 h-full flex flex-col">
      <div className="max-w-full mx-auto flex-grow w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Órdenes de Mantenimiento</h1>
            <p className="text-gray-600">Gestiona y monitorea todas las órdenes de servicio con guías inteligentes.</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Mes:</label>
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={() => { setEditingOrder(null); setShowForm(true); }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Orden
            </Button>
          </div>
        </div>

        <MaintenanceKanban 
          orders={orders}
          vehicles={vehicles}
          isLoading={isLoading}
          onEdit={handleEdit}
          onStatusChange={handleStatusChange}
        />

        {showForm && (
          <MaintenanceOrderForm
            order={editingOrder}
            vehicles={vehicles}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingOrder(null);
            }}
            onInventoryUpdate={handleInventoryUpdate}
            existingOrders={orders}
          />
        )}
      </div>
    </div>
  );
}
