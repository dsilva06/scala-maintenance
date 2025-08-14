
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, ImageOff, Package } from 'lucide-react'; // Added Package import

export default function InventoryTable({ parts, isLoading, onEdit }) {
  const getStockStatus = (part) => {
    if (part.current_stock <= part.minimum_stock) {
      return <Badge variant="destructive">Bajo</Badge>;
    }
    if (part.current_stock >= part.maximum_stock) {
      return <Badge className="bg-yellow-100 text-yellow-800">Alto</Badge>;
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800">OK</Badge>;
  };

  if (isLoading) return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">Cargando repuestos...</p>
    </div>
  );

  if (parts.length === 0) return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay repuestos registrados</h3>
      <p className="text-gray-600">Comienza agregando tu primer repuesto al inventario.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[80px]">Foto</TableHead>
            <TableHead>Repuesto</TableHead>
            <TableHead>SKU</TableHead> {/* Added SKU header */}
            <TableHead>Categoría</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            <TableHead className="text-center">Mínimo</TableHead>
            <TableHead className="text-right">Costo Unit.</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map(part => (
            <TableRow key={part.id} className="hover:bg-gray-50"> {/* Added hover class */}
              <TableCell>
                {part.photo_url ? (
                  <img src={part.photo_url} alt={part.name} className="w-16 h-16 object-cover rounded-md" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                    <ImageOff className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div> {/* Wrapped part name and details in a div */}
                  <p className="font-medium">{part.name}</p>
                  {part.part_number && <p className="text-xs text-gray-500">PN: {part.part_number}</p>} {/* Added Part Number */}
                  {part.brand && <p className="text-xs text-gray-500">{part.brand}</p>} {/* Added Brand */}
                </div>
              </TableCell>
              <TableCell> {/* New Cell for SKU */}
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{part.sku}</code>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">{part.category}</Badge> {/* Changed Category to Badge */}
              </TableCell>
              <TableCell className="text-center">
                <span className="font-semibold text-lg">{part.current_stock}</span> {/* Styled Stock */}
              </TableCell>
              <TableCell className="text-center text-gray-600">{part.minimum_stock}</TableCell> {/* Added text-gray-600 */}
              <TableCell className="text-right font-medium"> {/* Added font-medium */}
                ${part.unit_cost?.toLocaleString('en-US', { minimumFractionDigits: 2 })} {/* Updated toLocaleString */}
              </TableCell>
              <TableCell className="text-center">{getStockStatus(part)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(part)} className="hover:bg-blue-50"> {/* Added hover class to button */}
                  <Edit className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
