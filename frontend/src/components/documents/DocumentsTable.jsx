
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function DocumentsTable({ documents, vehicles, isLoading, onEdit, onDelete }) {
  const documentLabels = {
    seguro: 'Póliza de Seguro',
    tarjeta_operacion: 'Tarjeta de Operación',
    revision_tecnica: 'Revisión Técnica',
    soat: 'SOAT',
    permiso_especial: 'Permiso Especial',
    daex: 'DAEX',
    roct: 'ROCT',
    resquimc: 'RESQUIMC',
    racda: 'RACDA',
  };

  const formatDocumentType = (type) => {
    if (!type) return 'Documento';
    return documentLabels[type] || type.replace(/_/g, ' ').toUpperCase();
  };

  const getStatus = (expirationDate) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const daysDiff = differenceInDays(expDate, today);

    if (daysDiff < 0) return <Badge variant="destructive">Vencido</Badge>;
    if (daysDiff <= 30) return <Badge className="bg-orange-100 text-orange-800">Por Vencer</Badge>;
    return <Badge variant="secondary" className="bg-green-100 text-green-800">Vigente</Badge>;
  };

  if (isLoading) return <div>Cargando documentos...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Documento</TableHead>
            <TableHead>Vehículo</TableHead>
            <TableHead>Entidad Emisora</TableHead>
            <TableHead>Fecha Vencimiento</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map(doc => {
            const vehicle = vehicles.find(v => v.id === doc.vehicle_id);
            return (
                <TableRow key={doc.id}>
                  <TableCell>
                  <p className="font-medium">{formatDocumentType(doc.document_type)}</p>
                  <p className="text-xs text-gray-500">{doc.document_number}</p>
                </TableCell>
                <TableCell>{vehicle ? `${vehicle.plate} - ${vehicle.brand}` : 'N/A'}</TableCell>
                <TableCell>{doc.issuing_entity}</TableCell>
                <TableCell>{format(new Date(doc.expiration_date), 'dd MMMM, yyyy')}</TableCell>
                <TableCell className="text-center">{getStatus(doc.expiration_date)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(doc)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(doc.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
