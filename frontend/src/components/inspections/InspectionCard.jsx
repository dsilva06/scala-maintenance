import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, User, Calendar, Edit, Trash2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function InspectionCard({ inspection, vehicle, onEdit, onDelete }) {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'disponible':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Disponible' };
      case 'limitado':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, label: 'Limitado' };
      case 'no_disponible':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'No Disponible' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertTriangle, label: 'Desconocido' };
    }
  };

  const statusInfo = getStatusInfo(inspection.overall_status);

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
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
          <Button variant="outline" size="sm" onClick={() => onEdit(inspection)}>
            <Edit className="w-3.5 h-3.5 mr-1" />
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(inspection.id)}>
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}