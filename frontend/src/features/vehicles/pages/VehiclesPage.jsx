import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';
import PageHeader from '@/components/ui/page-header';
import { useErrorToast } from '@/hooks/useErrorToast';
import { getErrorMessage } from '@/lib/errors';
import { Car, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import VehicleCard from '../components/VehicleCard';
import VehicleFilters from '../components/VehicleFilters';
import VehicleForm from '../components/VehicleForm';
import {
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
  useVehicles,
} from '../hooks/useVehicles';

export default function VehiclesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const listParams = useMemo(() => ({ sort: '-created_at' }), []);
  const vehiclesQuery = useVehicles(listParams);
  const vehicles = vehiclesQuery.data ?? [];

  useErrorToast(vehiclesQuery.error, 'No se pudieron cargar los vehículos');

  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((vehicle) => {
        const plate = vehicle.plate?.toLowerCase() ?? '';
        const brand = vehicle.brand?.toLowerCase() ?? '';
        const model = vehicle.model?.toLowerCase() ?? '';

        return (
          plate.includes(normalizedSearch) ||
          brand.includes(normalizedSearch) ||
          model.includes(normalizedSearch)
        );
      });
    }

    if (selectedFilter !== 'all') {
      if (
        selectedFilter === 'activo' ||
        selectedFilter === 'mantenimiento' ||
        selectedFilter === 'fuera_servicio'
      ) {
        filtered = filtered.filter((vehicle) => vehicle.status === selectedFilter);
      } else {
        filtered = filtered.filter((vehicle) => vehicle.vehicle_type === selectedFilter);
      }
    }

    return filtered;
  }, [vehicles, searchTerm, selectedFilter]);

  const handleSubmit = async (vehicleData) => {
    try {
      if (editingVehicle) {
        await updateVehicleMutation.mutateAsync({
          id: editingVehicle.id,
          payload: vehicleData,
        });
      } else {
        await createVehicleMutation.mutateAsync(vehicleData);
      }
      setShowForm(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Error al guardar el vehículo', {
        description: getErrorMessage(error, 'No se pudo guardar el vehiculo.')
      });
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      try {
        await deleteVehicleMutation.mutateAsync(vehicleId);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast.error('Error al eliminar el vehículo', {
          description: getErrorMessage(error, 'No se pudo eliminar el vehiculo.')
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'mantenimiento':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'fuera_servicio':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'carga':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'pasajeros':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'especial':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (vehiclesQuery.isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse bg-gray-50 border-gray-200">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <PageHeader
          className="mb-8"
          title="Gestión de Vehículos"
          subtitle="Administra tu flota de vehículos"
          actions={(
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Vehículo
            </Button>
          )}
        />

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por placa, marca o modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <VehicleFilters
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              getStatusColor={getStatusColor}
              getTypeColor={getTypeColor}
            />
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <EmptyState
            icon={<Car className="w-10 h-10 text-gray-400" />}
            title="No hay vehículos registrados"
            description="Comienza agregando tu primer vehículo a la flota para empezar a gestionar tu operación"
            action={(
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Registrar Primer Vehículo
              </Button>
            )}
          />
        )}

        {showForm && (
          <VehicleForm
            vehicle={editingVehicle}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingVehicle(null);
            }}
            existingVehicles={vehicles}
          />
        )}
      </div>
    </div>
  );
}
