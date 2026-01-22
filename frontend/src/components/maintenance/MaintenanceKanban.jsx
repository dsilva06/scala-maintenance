import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Edit, Car, User, Calendar, Gauge, ClipboardCheck, BookOpen, Wrench } from 'lucide-react';
import { format } from 'date-fns';

const columns = [
  { id: 'pendiente', title: 'Pendiente' },
  { id: 'en_progreso', title: 'En Progreso' },
  { id: 'completada', title: 'Completada' },
  { id: 'cancelada', title: 'Cancelada' },
];

const priorityColors = {
    baja: 'bg-green-100 text-green-800 border-green-200',
    media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    alta: 'bg-orange-100 text-orange-800 border-orange-200',
    critica: 'bg-red-100 text-red-800 border-red-200',
};

const columnColors = {
  pendiente: 'border-yellow-500',
  en_progreso: 'border-blue-500',
  completada: 'border-green-500',
  cancelada: 'border-gray-500',
};


const OrderCard = ({ order, vehicle, onEdit, onSelect, index }) => {
  const draggableId = order.id?.toString() ?? `order-${index}`;
  const tasks = Array.isArray(order.tasks) ? order.tasks : [];
  const taskDescriptions = tasks
    .map((task) => task?.description || task?.fault || task?.task || "")
    .filter(Boolean);
  const displayTitle = order.title || order.description || 'Orden de mantenimiento';
  const metadata = order.metadata || {};
  const origin = metadata.source
    ? metadata.source
    : metadata.inspection_id
    ? 'inspection'
    : metadata.guide_id
    ? 'guide'
    : 'manual';
  const originConfig = {
    inspection: {
      label: 'Inspeccion',
      className: 'bg-gradient-to-r from-amber-50 to-rose-50 text-amber-700 border-amber-200',
      icon: ClipboardCheck,
    },
    guide: {
      label: 'Guia',
      className: 'bg-gradient-to-r from-sky-50 to-indigo-50 text-sky-700 border-sky-200',
      icon: BookOpen,
    },
    manual: {
      label: 'Directa',
      className: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200',
      icon: Wrench,
    },
  };
  const originInfo = originConfig[origin] ?? originConfig.manual;
  const OriginIcon = originInfo.icon;
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="mb-3"
        >
          <Card
            className={`bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}`}
            onClick={() => onSelect?.(order)}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className={`text-xs ${priorityColors[order.priority]}`}>{order.priority}</Badge>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(order);
                    }}
                    className="h-6 w-6 p-0 mr-1"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <div {...provided.dragHandleProps} className="cursor-grab p-1">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              <p className="font-semibold text-sm my-2 text-gray-800">{displayTitle}</p>
              {taskDescriptions.length > 0 && order.title && (
                <div className="space-y-1 text-xs text-gray-500">
                  {taskDescriptions.slice(0, 2).map((task, idx) => (
                    <p key={`${task}-${idx}`}>{task}</p>
                  ))}
                  {taskDescriptions.length > 2 && (
                    <p>+{taskDescriptions.length - 2} trabajos más</p>
                  )}
                </div>
              )}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${originInfo.className}`}
                  >
                    <OriginIcon className="h-3 w-3" />
                    {originInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-3 h-3" />
                  <span>{vehicle?.plate || 'Vehículo no encontrado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>{order.mechanic || 'No asignado'}</span>
                </div>
                {order.scheduled_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(order.scheduled_date), 'dd/MM/yyyy')}</span>
                  </div>
                )}
                {order.status === 'completada' && order.completion_mileage && (
                  <div className="flex items-center gap-2">
                    <Gauge className="w-3 h-3" />
                    <span>{Number(order.completion_mileage).toLocaleString()} km</span>
                  </div>
                )}
                {order.status === 'completada' && order.completion_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Cierre: {format(new Date(order.completion_date), 'dd/MM/yyyy')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};


export default function MaintenanceKanban({ orders, vehicles, isLoading, onEdit, onStatusChange, onSelect }) {
  
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId !== destination.droppableId) {
      onStatusChange(draggableId, destination.droppableId);
    }
  };

  if (isLoading) {
    return <div className="text-center p-12">Cargando órdenes...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row gap-4 h-full overflow-x-auto pb-4">
        {columns.map(column => (
          <div key={column.id} className="bg-gray-100 rounded-lg w-full md:w-1/4 flex-shrink-0 flex flex-col min-h-[300px]">
            <div className={`p-3 border-t-4 ${columnColors[column.id]} rounded-t-lg`}>
              <h3 className="font-semibold text-gray-800 capitalize">{column.title} <Badge variant="secondary">{orders.filter(o => o.status === column.id).length}</Badge></h3>
            </div>
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-2 flex-grow transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                >
                  {orders
                    .filter(o => o.status === column.id)
                    .sort((a, b) => new Date(a.created_at ?? 0) - new Date(b.created_at ?? 0))
                    .map((order, index) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        vehicle={vehicles.find(v => v.id === order.vehicle_id)}
                        onEdit={onEdit}
                        onSelect={onSelect}
                        index={index}
                      />
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
