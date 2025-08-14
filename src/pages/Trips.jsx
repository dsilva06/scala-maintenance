import { useState, useEffect, useMemo } from "react";
import { Trip, Vehicle } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Map, Search, List } from "lucide-react";
import { isToday, isYesterday, subDays } from "date-fns";

import TripCard from "../components/trips/TripCard";
import TripForm from "../components/trips/TripForm";
import TripMapView from "../components/trips/TripMapView";
import TripStats from "../components/trips/TripStats";

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid | map
  const [selectedTrip, setSelectedTrip] = useState(null); // Para vista detallada en mapa

  useEffect(() => {
    loadData();
  }, []);

  const filteredTrips = useMemo(() => {
    let filtered = trips.filter(trip => {
      const matchesSearch = trip.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicles.find(v => v.id === trip.vehicle_id)?.plate.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
      const matchesVehicle = selectedVehicle === "all" || trip.vehicle_id === selectedVehicle;
      
      // Filtro por fecha
      let matchesDate = true;
      if (dateFilter !== "all") {
        const tripDate = new Date(trip.start_date);
        const today = new Date();
        
        switch (dateFilter) {
          case "today":
            matchesDate = isToday(tripDate);
            break;
          case "yesterday":
            matchesDate = isYesterday(tripDate);
            break;
          case "week":
            matchesDate = tripDate >= subDays(today, 7);
            break;
          case "month":
            matchesDate = tripDate >= subDays(today, 30);
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesVehicle && matchesDate;
    });

    // Ordenar por fecha más reciente
    return filtered.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  }, [trips, searchTerm, statusFilter, dateFilter, selectedVehicle, vehicles]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tripsData, vehiclesData] = await Promise.all([
        Trip.list('-start_date'),
        Vehicle.list()
      ]);
      setTrips(tripsData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Error loading trips data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (tripData) => {
    try {
      if (editingTrip) {
        await Trip.update(editingTrip.id, tripData);
      } else {
        await Trip.create(tripData);
      }
      setShowForm(false);
      setEditingTrip(null);
      loadData();
    } catch (error) {
      console.error("Error saving trip:", error);
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setShowForm(true);
  };

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setViewMode("map");
  };

  const getTripStats = () => {
    const total = filteredTrips.length;
    const active = filteredTrips.filter(t => t.status === 'en_curso').length;
    const planned = filteredTrips.filter(t => t.status === 'planificado').length;
    const completed = filteredTrips.filter(t => t.status === 'completado').length;
    const cancelled = filteredTrips.filter(t => t.status === 'cancelado').length;
    
    const totalDistance = filteredTrips.reduce((sum, t) => sum + (t.distance_traveled || t.distance_planned || 0), 0);
    const avgDistance = total > 0 ? totalDistance / total : 0;
    
    return { total, active, planned, completed, cancelled, totalDistance, avgDistance };
  };

  const stats = getTripStats();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Gestión de Viajes</h1>
            <p className="text-gray-600">Monitoreo y trazabilidad de la flota</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => {
                setViewMode('grid');
                setSelectedTrip(null);
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
          </div>
        </div>

        {/* Estadísticas */}
        <TripStats stats={stats} />

        {/* Filtros */}
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
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} - {vehicle.brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setDateFilter("all");
                    setSelectedVehicle("all");
                  }}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contenido */}
        {viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  vehicle={vehicles.find(v => v.id === trip.vehicle_id)}
                  onEdit={handleEdit}
                  onViewMap={handleTripSelect}
                />
              ))}
            </div>

            {filteredTrips.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay viajes que coincidan con los filtros
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Intenta ajustar los filtros o crear un nuevo viaje
                  </p>
                  <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Viaje
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <TripMapView 
            trips={selectedTrip ? [selectedTrip] : filteredTrips}
            vehicles={vehicles}
            selectedTrip={selectedTrip}
            onTripSelect={setSelectedTrip}
            onBackToList={() => {
              setViewMode('grid');
              setSelectedTrip(null);
            }}
          />
        )}

        {/* Modal del formulario */}
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
