
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  User, 
  Truck, 
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  Route,
  Calendar,
  Timer,
  Package
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
  planificado: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Clock,
    dotColor: 'bg-blue-500'
  },
  en_curso: { 
    color: 'bg-orange-100 text-orange-800 border-orange-200', 
    icon: Navigation,
    dotColor: 'bg-orange-500'
  },
  completado: { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle,
    dotColor: 'bg-green-500'
  },
  cancelado: { 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    icon: AlertTriangle,
    dotColor: 'bg-gray-500'
  }
};

export default function TripCard({ trip, vehicle, onEdit, onViewMap }) {
  const statusInfo = statusConfig[trip.status];
  const StatusIcon = statusInfo.icon;
  
  const progressPercentage = trip.distance_planned > 0 
    ? Math.min((trip.distance_traveled / trip.distance_planned) * 100, 100)
    : 0;

  const getTimeInfo = () => {
    const startDate = new Date(trip.start_date);
    
    if (trip.status === 'completado' && trip.end_date) {
      return {
        label: 'Completado',
        value: formatDistanceToNow(new Date(trip.end_date), { addSuffix: true, locale: es })
      };
    } else if (trip.status === 'en_curso') {
      return {
        label: 'Iniciado',
        value: formatDistanceToNow(startDate, { addSuffix: true, locale: es })
      };
    } else {
      return {
        label: 'Programado',
        value: format(startDate, 'dd/MM HH:mm')
      };
    }
  };

  const timeInfo = getTimeInfo();

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 bg-white border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center relative">
              <Truck className="w-6 h-6 text-gray-600" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 ${statusInfo.dotColor} rounded-full border-2 border-white`}></div>
            </div>
            <div>
              <CardTitle className="text-lg mb-1">
                {vehicle?.plate || 'Vehículo N/A'}
              </CardTitle>
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-gray-500" />
                <span className="text-sm text-gray-600">{trip.driver_name}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewMap(trip)}
              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(trip)}
              className="h-8 w-8 hover:bg-gray-50 hover:text-gray-600 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estado y Alertas */}
        <div className="flex items-center justify-between">
          <Badge className={`border ${statusInfo.color} font-medium flex items-center gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {trip.status.replace('_', ' ')}
          </Badge>
          {trip.alerts && trip.alerts.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {trip.alerts.length} alertas
            </Badge>
          )}
        </div>

        {/* Ruta */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">Origen:</span>
            <span className="text-sm text-gray-600 truncate">{trip.origin}</span>
          </div>
          <div className="ml-1 w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">Destino:</span>
            <span className="text-sm text-gray-600 truncate">{trip.destination}</span>
          </div>
        </div>

        {/* Progreso - Solo para viajes en curso */}
        {trip.status === 'en_curso' && trip.distance_planned > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progreso</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-gray-200" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{trip.distance_traveled || 0} km</span>
              <span>{trip.distance_planned} km</span>
            </div>
          </div>
        )}

        {/* Información de tiempo y distancia */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-600">{timeInfo.label}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{timeInfo.value}</p>
          </div>
          
          {trip.distance_planned && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Route className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600">Distancia</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {trip.distance_planned} km
              </p>
            </div>
          )}
        </div>

        {/* Carga - si existe */}
        {trip.cargo_description && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-600">Carga</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{trip.cargo_description}</p>
            {trip.cargo_weight && (
              <p className="text-xs text-gray-500">{trip.cargo_weight} kg</p>
            )}
          </div>
        )}

        {/* ETA - solo para viajes en curso */}
        {trip.status === 'en_curso' && trip.estimated_arrival && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                ETA: {format(new Date(trip.estimated_arrival), 'dd/MM HH:mm')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
