import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useErrorToast } from '@/hooks/useErrorToast';
import { getErrorMessage } from '@/lib/errors';
import { List, Map, Plus, Search } from 'lucide-react';
import { isToday, isYesterday, subDays } from 'date-fns';
import { toast } from 'sonner';
import TripCard from '../components/TripCard';
import TripForm from '../components/TripForm';
import TripMapView from '../components/TripMapView';
import TripStats from '../components/TripStats';
import { useVehicles } from '@/features/vehicles/hooks/useVehicles';
import { useCreateTrip, useTrip, useTrips, useUpdateTrip } from '../hooks/useTrips';
import { useTripTelemetry } from '../hooks/useTripTelemetry';

export default function TripsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [monthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTripId, setSelectedTripId] = useState(null);
  const positionHistoryLimit = 60;

  const listParams = useMemo(() => ({ sort: '-start_date', month: monthFilter }), [monthFilter]);
  const vehicleListParams = useMemo(() => ({ sort: 'plate', limit: 500 }), []);
  const tripsQuery = useTrips(listParams);
  const vehiclesQuery = useVehicles(vehicleListParams);

  const trips = tripsQuery.data ?? [];
  const vehicles = vehiclesQuery.data ?? [];

  const selectedTripQuery = useTrip(selectedTripId);
  const selectedTrip = useMemo(() => {
    if (!selectedTripId) {
      return null;
    }
    return selectedTripQuery.data ?? trips.find((trip) => trip.id === selectedTripId) ?? null;
  }, [selectedTripId, selectedTripQuery.data, trips]);

  useTripTelemetry({
    enabled: viewMode === 'map',
    tripId: selectedTripId,
    listParams,
    positionHistoryLimit,
  });

  useErrorToast(tripsQuery.error, 'Error al cargar los viajes');
  useErrorToast(vehiclesQuery.error, 'Error al cargar los vehículos');
  useErrorToast(selectedTripId ? selectedTripQuery.error : null, 'Error al cargar el viaje');

  const createTripMutation = useCreateTrip();
  const updateTripMutation = useUpdateTrip();

  const filteredTrips = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    let filtered = trips.filter((trip) => {
      const vehiclePlate =
        vehicles.find((vehicle) => vehicle.id === trip.vehicle_id)?.plate?.toLowerCase() ?? '';
      const matchesSearch =
        trip.driver_name.toLowerCase().includes(normalizedSearch) ||
        trip.origin.toLowerCase().includes(normalizedSearch) ||
        trip.destination.toLowerCase().includes(normalizedSearch) ||
        vehiclePlate.includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
      const matchesVehicle =
        selectedVehicle === 'all' || String(trip.vehicle_id) === selectedVehicle;

      let matchesDate = true;
      if (dateFilter !== 'all') {
        const tripDate = new Date(trip.start_date);
        const today = new Date();

        switch (dateFilter) {
          case 'today':
            matchesDate = isToday(tripDate);
            break;
          case 'yesterday':
            matchesDate = isYesterday(tripDate);
            break;
          case 'week':
            matchesDate = tripDate >= subDays(today, 7);
            break;
          case 'month':
            matchesDate = tripDate >= subDays(today, 30);
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesVehicle && matchesDate;
    });

    return filtered.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  }, [trips, searchTerm, statusFilter, dateFilter, selectedVehicle, vehicles]);

  const handleFormSubmit = async (tripData) => {
    try {
      if (editingTrip) {
        await updateTripMutation.mutateAsync({
          id: editingTrip.id,
          payload: tripData,
        });
      } else {
        await createTripMutation.mutateAsync(tripData);
      }
      setShowForm(false);
      setEditingTrip(null);
    } catch (error) {
      console.error('Error saving trip:', error);
      toast.error(getErrorMessage(error, 'Error al guardar el viaje'));
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setShowForm(true);
  };

  const handleTripSelect = (trip) => {
    if (!trip) {
      setSelectedTripId(null);
      return;
    }

    setViewMode('map');
    setSelectedTripId(trip.id);
  };

  const getTripStats = () => {
    const total = filteredTrips.length;
    const active = filteredTrips.filter((trip) => trip.status === 'en_curso').length;
    const planned = filteredTrips.filter((trip) => trip.status === 'planificado').length;
    const completed = filteredTrips.filter((trip) => trip.status === 'completado').length;
    const cancelled = filteredTrips.filter((trip) => trip.status === 'cancelado').length;

    const totalDistance = filteredTrips.reduce(
      (sum, trip) => sum + (trip.distance_traveled || trip.distance_planned || 0),
      0
    );
    const avgDistance = total > 0 ? totalDistance / total : 0;

    return { total, active, planned, completed, cancelled, totalDistance, avgDistance };
  };

  const stats = getTripStats();
  const isLoading = tripsQuery.isLoading || vehiclesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          className="mb-6"
          title="Gestión de Viajes"
          subtitle="Monitoreo y trazabilidad de la flota"
          actions={(
            <>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => {
                  setViewMode('grid');
                  setSelectedTripId(null);
                }}
                className="transition-colors duration-200"
              >
                <List className="w-4 h-4 mr-2" />
                Lista
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                onClick={() => setViewMode('map')}
                className="transition-colors duration-200"
              >
                <Map className="w-4 h-4 mr-2" />
                Mapa
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Viaje
              </Button>
            </>
          )}
        />

        <TripStats stats={stats} />

        {viewMode === 'grid' && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar viajes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="planificado">Planificados</SelectItem>
                    <SelectItem value="en_curso">En Curso</SelectItem>
                    <SelectItem value="completado">Completados</SelectItem>
                    <SelectItem value="cancelado">Cancelados</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las fechas</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="yesterday">Ayer</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mes</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los vehículos</SelectItem>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                        {vehicle.plate} - {vehicle.brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('all');
                    setSelectedVehicle('all');
                  }}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  vehicle={vehicles.find((vehicle) => vehicle.id === trip.vehicle_id)}
                  onEdit={handleEdit}
                  onViewMap={handleTripSelect}
                />
              ))}
            </div>

            {filteredTrips.length === 0 && (
              <EmptyState
                icon={<Map className="w-10 h-10 text-gray-400" />}
                title="No hay viajes que coincidan con los filtros"
                description="Intenta ajustar los filtros o crear un nuevo viaje"
                action={(
                  <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Viaje
                  </Button>
                )}
              />
            )}
          </>
        ) : (
          <TripMapView
            trips={selectedTrip ? [selectedTrip] : filteredTrips}
            vehicles={vehicles}
            selectedTrip={selectedTrip}
            onTripSelect={handleTripSelect}
            onBackToList={() => {
              setViewMode('grid');
              setSelectedTripId(null);
            }}
          />
        )}

        {showForm && (
          <TripForm
            trip={editingTrip}
            vehicles={vehicles}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingTrip(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
