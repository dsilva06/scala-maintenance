import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Edit, Car, User, Calendar } from 'lucide-react';
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


const OrderCard = ({ order, vehicle, onEdit, index }) => {
  const draggableId = order.id?.toString() ?? `order-${index}`;
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="mb-3"
        >
          <Card className={`bg-white hover:shadow-md transition-shadow duration-200 ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}`}>
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className={`text-xs ${priorityColors[order.priority]}`}>{order.priority}</Badge>
                <div className="flex items-center">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(order)} className="h-6 w-6 p-0 mr-1">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <div {...provided.dragHandleProps} className="cursor-grab p-1">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              <p className="font-semibold text-sm my-2 text-gray-800">{order.description}</p>
              <div className="space-y-1.5 text-xs text-gray-600">
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};


export default function MaintenanceKanban({ orders, vehicles, isLoading, onEdit, onStatusChange }) {
  
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
