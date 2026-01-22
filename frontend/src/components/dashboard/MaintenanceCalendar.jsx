
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, Car } from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek, startOfDay } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MaintenanceCalendar({ orders, vehicles = [] }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDateLabel = (date) => {
    const scheduleDate = new Date(date);
    if (isToday(scheduleDate)) return "Hoy";
    if (isTomorrow(scheduleDate)) return "Mañana";
    if (isThisWeek(scheduleDate)) return format(scheduleDate, 'EEEE');
    return format(scheduleDate, 'dd/MM');
  };

  const parseScheduledDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  };

  const today = startOfDay(new Date());

  const scheduledOrders = orders
    .filter(order => 
      (order.status === 'pendiente' || order.status === 'en_progreso') &&
      parseScheduledDate(order.scheduled_date)
    )
    .map((order) => {
      const scheduledDate = parseScheduledDate(order.scheduled_date);
      const normalizedDate = startOfDay(scheduledDate);
      return {
        order,
        scheduledDate,
        normalizedDate,
        isOverdue: normalizedDate < today,
      };
    })
    .sort((a, b) => a.normalizedDate - b.normalizedDate)
    .slice(0, 6);

  const unscheduledCount = orders.filter(
    (order) =>
      (order.status === 'pendiente' || order.status === 'en_progreso') &&
      !parseScheduledDate(order.scheduled_date)
  ).length;

  if (scheduledOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 text-base font-semibold">No hay mantenimientos programados</p>
        {unscheduledCount > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            {unscheduledCount} orden{unscheduledCount > 1 ? "es" : ""} sin fecha programada.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scheduledOrders.map(({ order, scheduledDate, isOverdue }) => {
        const vehicle = vehicles.find((item) => item.id === order.vehicle_id);
        return (
          <Link
            key={order.id}
            to={`${createPageUrl("Maintenance")}?order=${order.id}`}
            className={`flex items-center justify-between p-5 rounded-2xl border transition-colors ${
              isOverdue ? "bg-red-50 hover:bg-red-100 border-red-200" : "bg-white hover:bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-11 h-11 rounded-2xl ${
                isOverdue ? "bg-red-100" : "bg-blue-100"
              }`}>
                <Calendar className={`w-5 h-5 ${isOverdue ? "text-red-600" : "text-blue-600"}`} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base">
                  {order.title || order.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {isOverdue ? `Atrasado · ${format(scheduledDate, 'dd/MM')}` : getDateLabel(scheduledDate)}
                  </span>
                  {vehicle?.plate && (
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Car className="w-3 h-3" />
                      {vehicle.plate}
                    </span>
                  )}
                  {isOverdue && (
                    <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-200">
                      Atrasado
                    </Badge>
                  )}
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPriorityColor(order.priority)}`}
                  >
                    {order.priority}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">#{order.order_number}</p>
              {order.priority === 'critica' && (
                <AlertTriangle className="w-4 h-4 text-red-500 ml-auto mt-1" />
              )}
            </div>
          </Link>
      );
      })}
      {unscheduledCount > 0 && (
        <p className="text-sm text-gray-400 text-right">
          {unscheduledCount} orden{unscheduledCount > 1 ? "es" : ""} sin fecha programada.
        </p>
      )}
    </div>
  );
}
