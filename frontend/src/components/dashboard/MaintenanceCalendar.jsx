
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";

export default function MaintenanceCalendar({ orders }) {
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

  const upcomingOrders = orders
    .filter(order => 
      order.status === 'pendiente' && 
      order.scheduled_date &&
      new Date(order.scheduled_date) >= new Date()
    )
    .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
    .slice(0, 5);

  if (upcomingOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No hay mantenimientos programados</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingOrders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {order.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {getDateLabel(order.scheduled_date)}
                </span>
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
            <p className="text-xs text-gray-500">#{order.order_number}</p>
            {order.priority === 'critica' && (
              <AlertTriangle className="w-4 h-4 text-red-500 ml-auto mt-1" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
