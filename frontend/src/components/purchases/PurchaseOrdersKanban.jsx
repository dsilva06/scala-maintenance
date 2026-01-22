import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, GripVertical, Package, Truck, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

const columns = [
  { id: "pending", title: "Pendiente", color: "border-yellow-500" },
  { id: "sent", title: "Enviada", color: "border-blue-500" },
  { id: "received", title: "Recibida", color: "border-green-500" },
  { id: "closed", title: "Cerrada", color: "border-gray-500" },
  { id: "cancelled", title: "Cancelada", color: "border-red-500" },
];

const priorityColors = {
  baja: "bg-green-100 text-green-800 border-green-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  alta: "bg-red-100 text-red-800 border-red-200",
};

const formatDate = (value) => {
  if (!value) return null;
  try {
    return format(new Date(value), "dd/MM/yyyy");
  } catch (error) {
    return null;
  }
};

const OrderCard = ({ order, sparePartMap, onEdit, onDelete, index }) => {
  const draggableId = order.id?.toString() ?? `order-${index}`;
  const sparePartName = order.spare_part_id
    ? sparePartMap?.get(order.spare_part_id)?.name || `#${order.spare_part_id}`
    : null;

  const expectedDate = formatDate(order.expected_date);
  const receivedDate = formatDate(order.received_at);
  const cost = Number(order.total_cost ?? 0);
  const itemsCount = Number(order.items_count ?? 0);

  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} className="mb-3">
          <Card
            className={`bg-white shadow-sm transition-shadow duration-200 ${
              snapshot.isDragging ? "shadow-lg ring-2 ring-blue-500" : ""
            }`}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.order_number || "Orden sin numero"}</p>
                  <p className="text-xs text-gray-500">{order.supplier || "Sin proveedor"}</p>
                </div>
                <div className="flex items-center gap-1">
                  {order.priority && (
                    <Badge variant="outline" className={`text-xs ${priorityColors[order.priority] || ""}`}>
                      {order.priority}
                    </Badge>
                  )}
                  <div {...provided.dragHandleProps} className="cursor-grab p-1 text-gray-400">
                    <GripVertical className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-700">{order.product_name || "Producto sin especificar"}</p>
                {sparePartName && (
                  <p className="text-xs text-gray-500">Repuesto: {sparePartName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  <span>{itemsCount} items</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>${cost.toLocaleString()}</span>
                </div>
                {expectedDate && (
                  <div className="flex items-center gap-1 col-span-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Entrega esperada: {expectedDate}</span>
                  </div>
                )}
                {receivedDate && (
                  <div className="flex items-center gap-1 col-span-2">
                    <Truck className="h-3.5 w-3.5" />
                    <span>Recibida: {receivedDate}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(order)}>
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(order.id)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default function PurchaseOrdersKanban({
  orders,
  sparePartMap,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
}) {
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
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnOrders = orders.filter((order) => order.status === column.id);
          return (
            <div
              key={column.id}
              className="bg-gray-100 rounded-lg w-full md:w-1/6 min-w-[240px] flex-shrink-0 flex flex-col"
            >
              <div className={`p-3 border-t-4 ${column.color} rounded-t-lg`}>
                <h3 className="font-semibold text-gray-800">
                  {column.title} <Badge variant="secondary">{columnOrders.length}</Badge>
                </h3>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-2 flex-grow transition-colors ${
                      snapshot.isDraggingOver ? "bg-blue-50" : ""
                    }`}
                  >
                    {columnOrders.map((order, index) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        sparePartMap={sparePartMap}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        index={index}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
