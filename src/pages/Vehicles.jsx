
import React, { useState, useEffect, useMemo } from "react";
import { Vehicle } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Filter, 
  Car
} from "lucide-react";

import VehicleForm from "../components/vehicles/VehicleForm";
import VehicleCard from "../components/vehicles/VehicleCard";
import VehicleFilters from "../components/vehicles/VehicleFilters";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    loadVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    if (searchTerm) {
      filtered = filtered.filter(vehicle => 
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFilter !== "all") {
      if (selectedFilter === "activo" || selectedFilter === "mantenimiento" || selectedFilter === "fuera_servicio") {
        filtered = filtered.filter(vehicle => vehicle.status === selectedFilter);
      } else {
        filtered = filtered.filter(vehicle => vehicle.vehicle_type === selectedFilter);
      }
    }

    return filtered;
  }, [vehicles, searchTerm, selectedFilter]);

  const loadVehicles = async () => {
    try {
      const data = await Vehicle.list('-created_date');
      setVehicles(data);
    } catch (error) {
      console.error("Error loading vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (vehicleData) => {
    try {
      if (editingVehicle) {
        await Vehicle.update(editingVehicle.id, vehicleData);
      } else {
        await Vehicle.create(vehicleData);
      }
      setShowForm(false);
      setEditingVehicle(null);
      loadVehicles();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      alert(`Error al guardar el vehículo: ${error.message || error}`);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este vehículo?")) {
      try {
        await Vehicle.delete(vehicleId);
        loadVehicles();
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert(`Error al eliminar el vehículo: ${error.message || error}`);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo': return 'text-green-700 bg-green-50 border-green-200';
      case 'mantenimiento': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'fuera_servicio': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'carga': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'pasajeros': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'especial': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
              Gestión de Vehículos
            </h1>
            <p className="text-gray-600">Administra tu flota de vehículos</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Vehículo
          </Button>
        </div>

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
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No hay vehículos registrados
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Comienza agregando tu primer vehículo a la flota para empezar a gestionar tu operación
            </p>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Registrar Primer Vehículo
            </Button>
          </div>
        )}

        {showForm && (
          <VehicleForm
            vehicle={editingVehicle}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingVehicle(null);
            }}
            existingVehicles={vehicles} // Pasar la lista de vehículos existentes
          />
        )}
      </div>
    </div>
  );
}
