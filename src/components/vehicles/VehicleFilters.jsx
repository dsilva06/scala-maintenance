import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function VehicleFilters({ selectedFilter, onFilterChange }) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-gray-500" />
      <Select value={selectedFilter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filtrar por..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los vehículos</SelectItem>
          <SelectItem value="activo">Activos</SelectItem>
          <SelectItem value="mantenimiento">En mantenimiento</SelectItem>
          <SelectItem value="fuera_servicio">Fuera de servicio</SelectItem>
          <SelectItem value="carga">Tipo: Carga</SelectItem>
          <SelectItem value="pasajeros">Tipo: Pasajeros</SelectItem>
          <SelectItem value="especial">Tipo: Especial</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}