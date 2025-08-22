import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, AlertTriangle, Package, FileText, Settings } from 'lucide-react';
import { Alert, MaintenanceOrder, SparePart, Document } from '@/api/entities';
import { toast } from 'sonner';

export default function AlertCard({ alert, onUpdate }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'stock': return Package;
      case 'maintenance': return Settings;
      case 'document': return FileText;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critica': return 'text-red-600 bg-red-50 border-red-200';
      case 'alta': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'media': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const handleApply = async () => {
    setIsProcessing(true);
    try {
      let success = false;
      let message = '';

      switch (alert.type) {
        case 'stock':
          if (alert.action_data?.part_id) {
            await SparePart.update(alert.related_entity_id, {
              current_stock: alert.action_data.suggested_quantity || 50
            });
            success = true;
            message = `Stock actualizado para ${alert.action_data.part_name}`;
          }
          break;

        case 'maintenance':
          if (alert.action_data?.vehicle_id) {
            await MaintenanceOrder.create({
              vehicle_id: alert.action_data.vehicle_id,
              order_number: `MNT-AI-${Date.now()}`,
              type: 'correctivo',
              priority: 'alta',
              status: 'pendiente',
              description: alert.title,
              notes: `Generado automáticamente por alerta crítica: ${alert.description}`
            });
            success = true;
            message = 'Orden de mantenimiento creada';
          }
          break;

        case 'document':
          if (alert.related_entity_id) {
            await Document.update(alert.related_entity_id, {
              status: 'en_tramite',
              notes: `Renovación iniciada automáticamente - ${new Date().toISOString()}`
            });
            success = true;
            message = 'Proceso de renovación iniciado';
          }
          break;

        default:
          success = true;
          message = 'Acción aplicada correctamente';
      }

      if (success) {
        await Alert.update(alert.id, { 
          status: 'resolved', 
          resolved_by: 'current_user',
          resolved_at: new Date().toISOString() 
        });
        toast.success(message);
        onUpdate(alert.id, 'resolved');
      }
    } catch (error) {
      console.error('Error applying alert action:', error);
      toast.error('Error al aplicar la acción');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIgnore = async () => {
    try {
      await Alert.update(alert.id, { 
        status: 'ignored',
        resolved_by: 'current_user',
        resolved_at: new Date().toISOString()
      });
      toast.success('Alerta ignorada');
      onUpdate(alert.id, 'ignored');
    } catch (error) {
      console.error('Error ignoring alert:', error);
      toast.error('Error al ignorar la alerta');
    }
  };

  const AlertIcon = getAlertIcon(alert.type);

  return (
    <Card className="border border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <AlertIcon className="w-4 h-4 text-gray-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-gray-900 text-sm leading-tight">{alert.title}</h4>
              <Badge 
                variant="outline" 
                className={`text-xs border ${getSeverityColor(alert.severity)} font-medium`}
              >
                {alert.severity}
              </Badge>
            </div>
            
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">{alert.description}</p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleApply}
                disabled={isProcessing}
                className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white border-0 transition-colors duration-200"
              >
                {isProcessing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Aplicar
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleIgnore}
                className="h-7 px-3 text-xs border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                <X className="w-3 h-3 mr-1" />
                Ignorar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}