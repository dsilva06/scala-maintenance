import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, User, Calendar, Edit, Trash2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function InspectionCard({ inspection, vehicle, onEdit, onDelete, onView }) {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'disponible':
        status = 'ok';
        break;
      case 'limitado':
      case 'revision':
        status = 'mantenimiento';
        break;
      case 'no_disponible':
        status = 'mantenimiento';
        break;
      default:
        break;
    }

    switch (status) {
      case 'ok':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'OK' };
      case 'mantenimiento':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Hacer mantenimiento' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertTriangle, label: 'Desconocido' };
    }
  };

  const statusInfo = getStatusInfo(inspection.overall_status);

  const handleCardClick = () => {
    if (onView) {
      onView(inspection);
    }
  };

  const handleCardKeyDown = (event) => {
    if (!onView) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onView(inspection);
    }
  };

  return (
    <Card
      className="shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={onView ? "button" : undefined}
      tabIndex={onView ? 0 : undefined}
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg mb-1">{vehicle?.plate || 'Placa no encontrada'}</CardTitle>
            <p className="text-sm text-gray-500">{vehicle?.brand} {vehicle?.model}</p>
          </div>
          <Badge className={`flex items-center gap-1.5 ${statusInfo.color}`}>
            <statusInfo.icon className="w-3.5 h-3.5" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <span>Inspector: <span className="font-medium text-gray-800">{inspection.inspector}</span></span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>Fecha: <span className="font-medium text-gray-800">{format(new Date(inspection.inspection_date), 'dd/MM/yyyy')}</span></span>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(inspection);
            }}
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(inspection.id);
            }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
