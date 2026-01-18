
import { useState, useEffect, useMemo } from "react";
import { listSpareParts, createSparePart, updateSparePart, deleteSparePart } from "@/api/spareParts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import InventoryTable from "../components/inventory/InventoryTable";
import SparePartForm from "../components/inventory/SparePartForm";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, TrendingUp, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export default function Inventory() {
  const [parts, setParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadParts();
  }, []);

  const getPartStatus = (part) => {
    if (part.current_stock <= part.minimum_stock) return 'low';
    if (part.current_stock >= part.maximum_stock) return 'over';
    return 'ok';
  }

  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const searchMatch = (
        (part.name || '').toLowerCase().includes(lowerCaseSearchTerm) ||
        (part.brand || '').toLowerCase().includes(lowerCaseSearchTerm) ||
        (part.sku || '').toLowerCase().includes(lowerCaseSearchTerm) ||
        (part.part_number || '').toLowerCase().includes(lowerCaseSearchTerm)
      );
      
      const statusMatch = statusFilter === 'all' || getPartStatus(part) === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [searchTerm, statusFilter, parts]);

  const loadParts = async () => {
    setIsLoading(true);
    try {
      const data = await listSpareParts({ sort: 'name', limit: 500 });
      setParts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading spare parts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (partData) => {
    try {
      if (editingPart) {
        await updateSparePart(editingPart.id, partData);
        toast.success('Repuesto actualizado correctamente.');
      } else {
        await createSparePart(partData);
        toast.success('Repuesto creado correctamente.');
      }
      setShowForm(false);
      setEditingPart(null);
      loadParts();
    } catch (error) {
      console.error("Error saving spare part:", error);
      toast.error('Error al guardar', {
        description: getErrorMessage(error, 'Error al guardar el repuesto. Intentalo de nuevo.')
      });
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setShowForm(true);
  };

  const handleDelete = async (partId) => {
    if (!window.confirm('¿Eliminar este repuesto?')) return;
    try {
      await deleteSparePart(partId);
      toast.success('Repuesto eliminado correctamente.');
      loadParts();
    } catch (error) {
      console.error('Error deleting spare part:', error);
      toast.error('No se pudo eliminar el repuesto', {
        description: getErrorMessage(error, 'Intenta nuevamente.')
      });
    }
  };
  
  const getInventoryStats = () => {
      const totalValue = parts.reduce((sum, p) => {
        const stock = Number(p.current_stock ?? 0);
        const unitCost = Number(p.unit_cost ?? 0);
        return sum + stock * unitCost;
      }, 0);
      const lowStock = parts.filter(p => getPartStatus(p) === 'low').length;
      const okStock = parts.filter(p => getPartStatus(p) === 'ok').length;
      const overStock = parts.filter(p => getPartStatus(p) === 'over').length;
      return { totalValue, lowStock, okStock, overStock };
  }

  const stats = getInventoryStats();

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventario de Repuestos</h1>
            <p className="text-gray-600">Control de stock y disponibilidad.</p>
          </div>
          <Button onClick={() => { setEditingPart(null); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Repuesto
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre, marca, SKU o Nro. de Parte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500"/>
            <Button variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>Todos</Button>
            <Button variant={statusFilter === 'ok' ? 'default' : 'outline'} className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200" onClick={() => setStatusFilter('ok')}>Stock OK</Button>
            <Button variant={statusFilter === 'low' ? 'default' : 'outline'} className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200" onClick={() => setStatusFilter('low')}>Stock Bajo</Button>
            <Button variant={statusFilter === 'over' ? 'default' : 'outline'} className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200" onClick={() => setStatusFilter('over')}>Sobre-Stock</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card><CardContent className="p-4"><h4 className="text-sm font-medium">Valor Total</h4><p className="text-xl font-bold">${stats.totalValue.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="p-4"><h4 className="text-sm font-medium flex items-center gap-1"><CheckCircle className="text-green-500 w-4 h-4"/>Stock OK</h4><p className="text-xl font-bold">{stats.okStock}</p></CardContent></Card>
            <Card><CardContent className="p-4"><h4 className="text-sm font-medium flex items-center gap-1"><AlertCircle className="text-orange-500 w-4 h-4"/>Stock Bajo</h4><p className="text-xl font-bold">{stats.lowStock}</p></CardContent></Card>
            <Card><CardContent className="p-4"><h4 className="text-sm font-medium flex items-center gap-1"><TrendingUp className="text-red-500 w-4 h-4"/>Sobre-Stock</h4><p className="text-xl font-bold">{stats.overStock}</p></CardContent></Card>
        </div>

        <InventoryTable parts={filteredParts} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

        {showForm && (
          <SparePartForm
            part={editingPart}
            existingParts={parts}
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingPart(null); }}
          />
        )}
      </div>
    </div>
  );
}
