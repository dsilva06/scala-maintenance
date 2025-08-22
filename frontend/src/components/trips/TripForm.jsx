
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Map, Plus, Trash2, MapPin, Navigation, Calculator } from "lucide-react";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Driver } from "@/api/entities";
import LocationSearchInput from "./LocationSearchInput"; // New import for LocationSearchInput

// Configurar iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Iconos personalizados para marcadores
const createLocationIcon = (type) => {
  const colors = {
    origin: '#10b981',
    destination: '#ef4444'
  };

  return L.divIcon({
    html: `<div style="background-color: ${colors[type]}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <div style="color: white; font-size: 10px; font-weight: bold;">${type === 'origin' ? 'O' : 'D'}</div>
    </div>`,
    className: 'location-marker-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Componente para manejar clics en el mapa
function MapClickHandler({ onLocationSelect, selectedType }) {
  useMapEvents({
    click: (e) => {
      if (selectedType) {
        onLocationSelect(selectedType, e.latlng);
      }
    }
  });
  return null;
}

export default function TripForm({ trip, vehicles, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    vehicle_id: trip?.vehicle_id || "",
    driver_id: trip?.driver_id || "",
    driver_name: trip?.driver_name || "",
    origin: trip?.origin || "",
    destination: trip?.destination || "",
    origin_coords: trip?.origin_coords || null,
    destination_coords: trip?.destination_coords || null,
    start_date: trip?.start_date ? format(new Date(trip.start_date), 'yyyy-MM-dd\'T\'HH:mm') : "",
    estimated_arrival: trip?.estimated_arrival ? format(new Date(trip.estimated_arrival), 'yyyy-MM-dd\'T\'HH:mm') : "",
    distance_planned: trip?.distance_planned || 0,
    cargo_description: trip?.cargo_description || "",
    cargo_weight: trip?.cargo_weight || 0,
    status: trip?.status || "planificado",
    planned_route: trip?.planned_route || []
  });

  const [drivers, setDrivers] = useState([]);
  const [routePoints, setRoutePoints] = useState(trip?.planned_route || []);
  const [mapCenter, setMapCenter] = useState([4.6097, -74.0817]); // Bogotá por defecto
  const [selectedLocationType, setSelectedLocationType] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    // Calcular distancia automáticamente cuando se seleccionen ambos puntos
    if (formData.origin_coords && formData.destination_coords) {
      calculateDistance();
    }
  }, [formData.origin_coords, formData.destination_coords]);

  const loadDrivers = async () => {
    try {
      const driversData = await Driver.filter({ status: 'activo' });
      setDrivers(driversData);
    } catch (error) {
      console.error("Error loading drivers:", error);
      setDrivers([]);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // New function to handle selection from LocationSearchInput
  const handleLocationSearchSelect = (type, { address, coords }) => {
    console.log(`Selecting ${type}:`, { address, coords }); // Debug log
    if (type === 'origin') {
      setFormData(prev => ({ 
        ...prev, 
        origin: address, 
        origin_coords: coords 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        destination: address, 
        destination_coords: coords 
      }));
    }
  };

  const handleDriverSelect = (driverId) => {
    const selectedDriver = drivers.find(d => d.id === driverId);
    setFormData(prev => ({ 
      ...prev, 
      driver_id: driverId,
      driver_name: selectedDriver ? selectedDriver.full_name : ""
    }));
  };

  const handleLocationSelect = async (type, latlng) => {
    const coords = { lat: latlng.lat, lng: latlng.lng };

    // Obtener dirección usando geocodificación inversa
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      const address = data.display_name || `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;

      if (type === 'origin') {
        setFormData(prev => ({
          ...prev,
          origin: address,
          origin_coords: coords
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          destination: address,
          destination_coords: coords
        }));
      }
    } catch (error) {
      console.error("Error getting address:", error);
      // Fallback a coordenadas
      const coordsText = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
      if (type === 'origin') {
        setFormData(prev => ({
          ...prev,
          origin: coordsText,
          origin_coords: coords
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          destination: coordsText,
          destination_coords: coords
        }));
      }
    }

    setSelectedLocationType(null);
  };

  const calculateDistance = async () => {
    if (!formData.origin_coords || !formData.destination_coords) return;

    setIsCalculatingDistance(true);
    try {
      // Calcular distancia usando la fórmula de Haversine
      const R = 6371; // Radio de la Tierra en km
      const dLat = (formData.destination_coords.lat - formData.origin_coords.lat) * Math.PI / 180;
      const dLon = (formData.destination_coords.lng - formData.origin_coords.lng) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(formData.origin_coords.lat * Math.PI / 180) * Math.cos(formData.destination_coords.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      setFormData(prev => ({
        ...prev,
        distance_planned: Math.round(distance)
      }));
    } catch (error) {
      console.error("Error calculating distance:", error);
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const addRoutePoint = () => {
    setRoutePoints(prev => [...prev, { lat: 0, lng: 0, address: "" }]);
  };

  const removeRoutePoint = (index) => {
    setRoutePoints(prev => prev.filter((_, i) => i !== index));
  };

  const updateRoutePoint = (index, field, value) => {
    setRoutePoints(prev => prev.map((point, i) =>
      i === index ? { ...point, [field]: value } : point
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.vehicle_id || !formData.driver_id || !formData.origin || !formData.destination) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    onSubmit({
      ...formData,
      planned_route: routePoints.filter(point => point.address.trim() !== "")
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            {trip ? 'Editar Viaje' : 'Nuevo Viaje'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicle_id">Vehículo *</Label>
                <Select value={formData.vehicle_id} onValueChange={(value) => handleChange('vehicle_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.filter(v => v.status === 'activo').map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.plate} - {v.brand} {v.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="driver_id">Conductor *</Label>
                <Select value={formData.driver_id} onValueChange={handleDriverSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar conductor" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.full_name} - Licencia: {driver.license_category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selección de ubicaciones */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Ruta del Viaje</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2"
                >
                  <Map className="w-4 h-4" />
                  {showMap ? 'Ocultar Mapa' : 'Ver en Mapa'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin">Origen *</Label>
                  <LocationSearchInput
                    value={formData.origin}
                    onSelect={(place) => handleLocationSearchSelect('origin', place)}
                    placeholder="Buscar dirección de origen..."
                  />
                  {formData.origin_coords && (
                    <p className="text-xs text-green-600 mt-1">
                      Coordenadas: {formData.origin_coords.lat.toFixed(4)}, {formData.origin_coords.lng.toFixed(4)}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="destination">Destino *</Label>
                  <LocationSearchInput
                    value={formData.destination}
                    onSelect={(place) => handleLocationSearchSelect('destination', place)}
                    placeholder="Buscar dirección de destino..."
                  />
                  {formData.destination_coords && (
                    <p className="text-xs text-green-600 mt-1">
                      Coordenadas: {formData.destination_coords.lat.toFixed(4)}, {formData.destination_coords.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>

              {/* Mostrar distancia calculada */}
              {formData.distance_planned > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Distancia calculada: {formData.distance_planned} km
                    </span>
                  </div>
                </div>
              )}

              {showMap && (
                <Card className="p-4 bg-gray-50">
                  <div className="mb-4 flex gap-2">
                    <Button
                      type="button"
                      variant={selectedLocationType === 'origin' ? 'default' : 'outline'}
                      onClick={() => setSelectedLocationType('origin')}
                      className="flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-green-500" />
                      Seleccionar Origen en Mapa
                    </Button>
                    <Button
                      type="button"
                      variant={selectedLocationType === 'destination' ? 'default' : 'outline'}
                      onClick={() => setSelectedLocationType('destination')}
                      className="flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-red-500" />
                      Seleccionar Destino en Mapa
                    </Button>
                  </div>

                  <div className="h-80 rounded-lg overflow-hidden">
                    <MapContainer
                      center={mapCenter}
                      zoom={13}
                      className="h-full w-full"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />

                      <MapClickHandler
                        onLocationSelect={handleLocationSelect}
                        selectedType={selectedLocationType}
                      />

                      {formData.origin_coords && (
                        <Marker
                          position={[formData.origin_coords.lat, formData.origin_coords.lng]}
                          icon={createLocationIcon('origin')}
                        />
                      )}

                      {formData.destination_coords && (
                        <Marker
                          position={[formData.destination_coords.lat, formData.destination_coords.lng]}
                          icon={createLocationIcon('destination')}
                        />
                      )}
                    </MapContainer>
                  </div>

                  {selectedLocationType && (
                    <p className="mt-2 text-sm text-blue-600">
                      Haz clic en el mapa para seleccionar el {selectedLocationType === 'origin' ? 'origen' : 'destino'}
                    </p>
                  )}
                </Card>
              )}
            </div>

            {/* Fechas y distancia */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="start_date">Fecha y Hora de Inicio</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="estimated_arrival">Llegada Estimada</Label>
                <Input
                  id="estimated_arrival"
                  type="datetime-local"
                  value={formData.estimated_arrival}
                  onChange={(e) => handleChange('estimated_arrival', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="distance_planned">Distancia (km)</Label>
                <div className="flex gap-2">
                  <Input
                    id="distance_planned"
                    type="number"
                    min="0"
                    value={formData.distance_planned}
                    onChange={(e) => handleChange('distance_planned', parseInt(e.target.value) || 0)}
                    readOnly={formData.origin_coords && formData.destination_coords}
                  />
                  {isCalculatingDistance && (
                    <div className="flex items-center">
                      <Calculator className="w-4 h-4 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
                {formData.origin_coords && formData.destination_coords && (
                  <p className="text-xs text-green-600 mt-1">Calculado automáticamente</p>
                )}
              </div>
            </div>

            {/* Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planificado">Planificado</SelectItem>
                    <SelectItem value="en_curso">En Curso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Carga */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cargo_description">Descripción de Carga</Label>
                <Textarea
                  id="cargo_description"
                  value={formData.cargo_description}
                  onChange={(e) => handleChange('cargo_description', e.target.value)}
                  placeholder="Descripción de la carga transportada"
                />
              </div>
              <div>
                <Label htmlFor="cargo_weight">Peso de Carga (kg)</Label>
                <Input
                  id="cargo_weight"
                  type="number"
                  min="0"
                  value={formData.cargo_weight}
                  onChange={(e) => handleChange('cargo_weight', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Puntos de Ruta */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Puntos de Ruta (Opcional)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRoutePoint}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Punto
                </Button>
              </div>
              <div className="space-y-3">
                {routePoints.map((point, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <Input
                      placeholder="Dirección"
                      value={point.address}
                      onChange={(e) => updateRoutePoint(index, 'address', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Lat"
                      type="number"
                      step="any"
                      value={point.lat}
                      onChange={(e) => updateRoutePoint(index, 'lat', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                    <Input
                      placeholder="Lng"
                      type="number"
                      step="any"
                      value={point.lng}
                      onChange={(e) => updateRoutePoint(index, 'lng', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRoutePoint(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {trip ? 'Actualizar' : 'Crear'} Viaje
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
