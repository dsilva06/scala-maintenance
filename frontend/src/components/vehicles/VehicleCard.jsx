import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Car, 
  Calendar,
  Gauge,
  Fuel
} from "lucide-react";
import { format } from "date-fns";

export default function VehicleCard({ vehicle, onEdit, onDelete, getStatusColor, getTypeColor }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-white border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {vehicle.plate}
              </h3>
              <p className="text-sm text-gray-600">
                {vehicle.brand} {vehicle.model}
              </p>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(vehicle)}
              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(vehicle.id)}
              className="h-8 w-8 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={`border ${getStatusColor(vehicle.status)} font-medium`}>
              {vehicle.status}
            </Badge>
            <Badge variant="outline" className={`border ${getTypeColor(vehicle.vehicle_type)} font-medium`}>
              {vehicle.vehicle_type}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{vehicle.year}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Gauge className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {vehicle.current_mileage?.toLocaleString() || '0'} km
              </span>
            </div>
          </div>

          {vehicle.color && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: vehicle.color }}
              />
              <span className="text-sm font-medium text-gray-700">{vehicle.color}</span>
            </div>
          )}

          {vehicle.fuel_type && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Fuel className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{vehicle.fuel_type}</span>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Registrado: {format(new Date(vehicle.created_date), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}