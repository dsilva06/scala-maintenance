import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map, Navigation, MapPin, Clock, AlertTriangle } from "lucide-react";

// Configurar iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Iconos personalizados por estado
const createCustomIcon = (color) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-div-icon',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const statusColors = {
  planificado: '#3b82f6',
  en_curso: '#f59e0b',
  completado: '#10b981',
  cancelado: '#6b7280'
};

export default function TripMap({ trips, vehicles }) {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [center, setCenter] = useState([4.6097, -74.0817]); // Bogotá por defecto

  useEffect(() => {
    // Centrar el mapa en el primer viaje activo si existe
    const activeTrip = trips.find(t => t.status === 'en_curso' && t.current_position);
    if (activeTrip && activeTrip.current_position) {
      setCenter([activeTrip.current_position.lat, activeTrip.current_position.lng]);
    }
  }, [trips]);

  const activeTrips = trips.filter(t => t.status === 'en_curso');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-96">
      {/* Mapa */}
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5" />
              Mapa de Viajes en Tiempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full pb-6">
            <MapContainer 
              center={center} 
              zoom={6} 
              className="h-full w-full rounded-lg"
              style={{ height: '400px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {trips.map((trip) => {
                const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
                
                // Mostrar marcador de posición actual si está disponible
                if (trip.current_position) {
                  return (
                    <Marker 
                      key={trip.id}
                      position={[trip.current_position.lat, trip.current_position.lng]}
                      icon={createCustomIcon(statusColors[trip.status])}
                    >
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-semibold">{vehicle?.plate || 'Vehículo N/A'}</h4>
                          <p className="text-sm text-gray-600">{trip.driver_name}</p>
                          <p className="text-sm">{trip.origin} → {trip.destination}</p>
                          <Badge className={`mt-1 ${
                            trip.status === 'en_curso' ? 'bg-orange-100 text-orange-800' :
                            trip.status === 'completado' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {trip.status}
                          </Badge>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                
                return null;
              })}
              
              {/* Mostrar ruta planificada del viaje seleccionado */}
              {selectedTrip && selectedTrip.planned_route && selectedTrip.planned_route.length > 1 && (
                <Polyline
                  positions={selectedTrip.planned_route.map(point => [point.lat, point.lng])}
                  color="blue"
                  weight={3}
                  opacity={0.7}
                />
              )}
            </MapContainer>
          </CardContent>
        </Card>
      </div>

      {/* Panel lateral con viajes activos */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Viajes Activos
              <Badge variant="secondary">{activeTrips.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-y-auto max-h-96">
            {activeTrips.length > 0 ? (
              activeTrips.map((trip) => {
                const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
                return (
                  <div 
                    key={trip.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTrip?.id === trip.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{vehicle?.plate || 'N/A'}</h4>
                      <Badge className="bg-orange-100 text-orange-800 text-xs">
                        En curso
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{trip.driver_name}</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-green-500" />
                        <span className="text-xs">{trip.origin}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span className="text-xs">{trip.destination}</span>
                      </div>
                    </div>
                    
                    {trip.alerts && trip.alerts.length > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-orange-500" />
                        <span className="text-xs text-orange-600">
                          {trip.alerts.length} alertas
                        </span>
                      </div>
                    )}
                    
                    {trip.estimated_arrival && (
                      <div className="mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-600">
                          ETA: {new Date(trip.estimated_arrival).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6">
                <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay viajes activos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}