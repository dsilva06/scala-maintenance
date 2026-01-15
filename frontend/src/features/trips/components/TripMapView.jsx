import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Map, 
  Navigation, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  ArrowLeft,
  Route,
  Play,
  Square,
  CheckCircle,
  XCircle,
  Truck,
  User,
  Calendar,
  Minimize2,
  Maximize2,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

// Configurar iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Colores por estado de viaje
const STATUS_COLORS = {
  planificado: {
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  en_curso: {
    color: '#f59e0b',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200'
  },
  completado: {
    color: '#10b981',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  cancelado: {
    color: '#6b7280',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200'
  }
};

// Iconos personalizados por estado
const createCustomIcon = (color, size = 'small') => {
  const dimension = size === 'large' ? 16 : 12;
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: ${dimension}px; height: ${dimension}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-div-icon',
    iconSize: [dimension, dimension],
    iconAnchor: [dimension/2, dimension/2]
  });
};

// Marcadores de inicio y fin
const createMarkerIcon = (type) => {
  const colors = {
    start: '#10b981',
    end: '#ef4444'
  };
  
  return L.divIcon({
    html: `<div style="background-color: ${colors[type]}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <div style="color: white; font-size: 8px; font-weight: bold;">${type === 'start' ? 'S' : 'E'}</div>
    </div>`,
    className: 'marker-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

export default function TripMapView({ trips, vehicles, selectedTrip, onTripSelect, onBackToList }) {
  const [center, setCenter] = useState([4.6097, -74.0817]); // Bogotá por defecto
  const [mapBounds, setMapBounds] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef(null);

  // Cleanup function para el mapa
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedTrip && selectedTrip.position_history && selectedTrip.position_history.length > 0) {
      // Si hay un viaje seleccionado, centrar en su ruta
      const positions = selectedTrip.position_history;
      const lats = positions.map(p => p.lat);
      const lngs = positions.map(p => p.lng);
      
      const bounds = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      ];
      setMapBounds(bounds);
    } else if (trips && trips.length > 0) {
      // Centrar en todos los viajes visibles
      const allPositions = [];
      trips.forEach(trip => {
        if (trip.position_history) {
          allPositions.push(...trip.position_history);
        }
      });
      
      if (allPositions.length > 0) {
        const lats = allPositions.map(p => p.lat);
        const lngs = allPositions.map(p => p.lng);
        
        const bounds = [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)]
        ];
        setMapBounds(bounds);
      }
    }
  }, [selectedTrip, trips]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'planificado': return Clock;
      case 'en_curso': return Play;
      case 'completado': return CheckCircle;
      case 'cancelado': return XCircle;
      default: return Navigation;
    }
  };

  const refreshMap = () => {
    setIsMapReady(false);
    setTimeout(() => {
      setIsMapReady(true);
    }, 100);
  };

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'h-20' : 'h-[calc(100vh-200px)]'}`}>
      <div className={`grid ${isCollapsed ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-6 h-full`}>
        {/* Mapa Principal */}
        <div className={`${isCollapsed ? 'hidden' : 'lg:col-span-3'}`}>
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  {selectedTrip ? 'Trazabilidad del Viaje' : 'Mapa de Viajes'}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshMap}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {isCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </Button>
                  {selectedTrip && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTripSelect(null)}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      Ver Todos
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBackToList}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Lista
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-full pb-6">
              {isMapReady !== false && (
                <div key={`map-${isMapReady}-${trips?.length || 0}`}>
                  <MapContainer 
                    center={center} 
                    zoom={selectedTrip ? 12 : 6}
                    bounds={mapBounds}
                    className="h-full w-full rounded-lg"
                    style={{ height: '500px', minHeight: '400px' }}
                    whenCreated={(mapInstance) => {
                      mapRef.current = mapInstance;
                    }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {trips && trips.map((trip) => {
                      if (!trip) return null;
                      
                      const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
                      const statusConfig = STATUS_COLORS[trip.status] || STATUS_COLORS.planificado;
                      
                      // Mostrar ruta completa si existe historial de posiciones
                      if (trip.position_history && trip.position_history.length > 1) {
                        const routePoints = trip.position_history.map(pos => [pos.lat, pos.lng]);
                        
                        return (
                          <React.Fragment key={`trip-${trip.id}`}>
                            {/* Línea de ruta */}
                            <Polyline
                              positions={routePoints}
                              color={statusConfig.color}
                              weight={selectedTrip?.id === trip.id ? 5 : 3}
                              opacity={selectedTrip?.id === trip.id ? 0.8 : 0.6}
                              dashArray={trip.status === 'planificado' ? '10, 10' : undefined}
                            />
                            
                            {/* Marcador de inicio */}
                            <Marker 
                              position={routePoints[0]}
                              icon={createMarkerIcon('start')}
                            >
                              <Popup>
                                <div className="p-2">
                                  <h4 className="font-semibold text-green-700">Inicio del Viaje</h4>
                                  <p className="text-sm">{trip.origin}</p>
                                  <p className="text-xs text-gray-500">
                                    {format(new Date(trip.start_date), 'dd/MM/yyyy HH:mm')}
                                  </p>
                                </div>
                              </Popup>
                            </Marker>
                            
                            {/* Marcador de fin */}
                            <Marker 
                              position={routePoints[routePoints.length - 1]}
                              icon={createMarkerIcon('end')}
                            >
                              <Popup>
                                <div className="p-2">
                                  <h4 className="font-semibold text-red-700">Final del Viaje</h4>
                                  <p className="text-sm">{trip.destination}</p>
                                  {trip.end_date && (
                                    <p className="text-xs text-gray-500">
                                      {format(new Date(trip.end_date), 'dd/MM/yyyy HH:mm')}
                                    </p>
                                  )}
                                </div>
                              </Popup>
                            </Marker>
                            
                            {/* Posición actual si está en curso */}
                            {trip.status === 'en_curso' && trip.current_position && (
                              <Marker 
                                position={[trip.current_position.lat, trip.current_position.lng]}
                                icon={createCustomIcon(statusConfig.color, 'large')}
                              >
                                <Popup>
                                  <div className="p-2">
                                    <h4 className="font-semibold">{vehicle?.plate || 'Vehículo N/A'}</h4>
                                    <p className="text-sm text-gray-600">{trip.driver_name}</p>
                                    <p className="text-sm">{trip.origin} → {trip.destination}</p>
                                    <Badge className={`mt-1 ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                                      En Curso
                                    </Badge>
                                  </div>
                                </Popup>
                              </Marker>
                            )}
                          </React.Fragment>
                        );
                      }
                      
                      // Fallback: mostrar solo posición actual si existe
                      if (trip.current_position) {
                        return (
                          <Marker 
                            key={`trip-fallback-${trip.id}`}
                            position={[trip.current_position.lat, trip.current_position.lng]}
                            icon={createCustomIcon(statusConfig.color)}
                          >
                            <Popup>
                              <div className="p-2">
                                <h4 className="font-semibold">{vehicle?.plate || 'Vehículo N/A'}</h4>
                                <p className="text-sm text-gray-600">{trip.driver_name}</p>
                                <p className="text-sm">{trip.origin} → {trip.destination}</p>
                                <Badge className={`mt-1 ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                                  {trip.status}
                                </Badge>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      }
                      
                      return null;
                    })}
                  </MapContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Header colapsado */}
        {isCollapsed && (
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Map className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                {selectedTrip ? `Viaje: ${selectedTrip.origin} → ${selectedTrip.destination}` : `${trips?.length || 0} Viajes`}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCollapsed(false)}
                className="hover:bg-gray-50 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
                Expandir Mapa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToList}
                className="hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Lista
              </Button>
            </div>
          </div>
        )}

        {/* Panel lateral */}
        {!isCollapsed && (
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  {selectedTrip ? (
                    <>
                      <Route className="w-5 h-5" />
                      Detalles del Viaje
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" />
                      Viajes Activos
                      <Badge variant="secondary">{trips?.filter(t => t.status === 'en_curso').length || 0}</Badge>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 overflow-y-auto max-h-96">
                {selectedTrip ? (
                  // Vista detallada de un viaje específico
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {vehicles.find(v => v.id === selectedTrip.vehicle_id)?.plate || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">{selectedTrip.driver_name}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{selectedTrip.origin}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span className="text-sm">{selectedTrip.destination}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Estado</span>
                          <Badge className={`${STATUS_COLORS[selectedTrip.status]?.bgColor} ${STATUS_COLORS[selectedTrip.status]?.textColor} ${STATUS_COLORS[selectedTrip.status]?.borderColor} border`}>
                            {selectedTrip.status}
                          </Badge>
                        </div>
                        
                        {selectedTrip.distance_planned && (
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Distancia</span>
                            <span className="text-sm font-medium">
                              {selectedTrip.distance_traveled || 0} / {selectedTrip.distance_planned} km
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Inicio</span>
                          <span className="text-sm font-medium">
                            {format(new Date(selectedTrip.start_date), 'dd/MM HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedTrip.alerts && selectedTrip.alerts.length > 0 && (
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Alertas
                        </h4>
                        <div className="space-y-2">
                          {selectedTrip.alerts.map((alert, idx) => (
                            <div key={idx} className="text-sm text-orange-800">
                              <p className="font-medium">{alert.type}</p>
                              <p>{alert.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Lista de viajes
                  trips && trips.length > 0 ? (
                    trips.slice(0, 10).map((trip) => {
                      if (!trip) return null;
                      
                      const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
                      const statusConfig = STATUS_COLORS[trip.status] || STATUS_COLORS.planificado;
                      const StatusIcon = getStatusIcon(trip.status);
                      
                      return (
                        <div 
                          key={trip.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedTrip?.id === trip.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          onClick={() => onTripSelect(trip)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">{vehicle?.plate || 'N/A'}</h4>
                            <Badge className={`text-xs ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {trip.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600">{trip.driver_name}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-green-500" />
                              <span className="text-xs truncate">{trip.origin}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-500" />
                              <span className="text-xs truncate">{trip.destination}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {format(new Date(trip.start_date), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                          
                          {trip.alerts && trip.alerts.length > 0 && (
                            <div className="mt-2 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-orange-500" />
                              <span className="text-xs text-orange-600">
                                {trip.alerts.length} alertas
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No hay viajes para mostrar</p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}