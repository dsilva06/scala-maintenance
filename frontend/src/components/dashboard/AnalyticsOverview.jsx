import { useQuery } from '@tanstack/react-query';
import { Activity, Clock, DollarSign, Target } from 'lucide-react';
import { fetchAnalyticsMetrics } from '@/api/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getErrorMessage } from '@/lib/errors';

const formatNumber = (value, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'N/D';
  }
  return Number(value).toFixed(digits);
};

export default function AnalyticsOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'metrics'],
    queryFn: () => fetchAnalyticsMetrics(),
  });

  const metrics = data?.metrics ?? {};
  const costPerMile = metrics.cost_per_mile?.value;
  const downtimeAvg = metrics.downtime_hours?.average;
  const etaError = metrics.eta_accuracy?.average_error_minutes;
  const etaOnTime = metrics.eta_accuracy?.within_15_min_rate;
  const etaOnTimeDisplay =
    etaOnTime === null || etaOnTime === undefined ? 'N/D' : `${formatNumber(etaOnTime, 2)}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Indicadores Operativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-red-600">{getErrorMessage(error, 'Error al cargar métricas')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-gray-200 p-4 bg-white">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <DollarSign className="w-4 h-4" />
                Costo por milla
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {isLoading ? '...' : formatNumber(costPerMile, 4)}
              </div>
              <div className="text-xs text-gray-500">Costo mantenimiento / distancia planificada</div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 bg-white">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                Downtime promedio (hrs)
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {isLoading ? '...' : formatNumber(downtimeAvg, 2)}
              </div>
              <div className="text-xs text-gray-500">Ordenes completadas</div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 bg-white">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Target className="w-4 h-4" />
                Error ETA (min)
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {isLoading ? '...' : formatNumber(etaError, 2)}
              </div>
              <div className="text-xs text-gray-500">Promedio de diferencia estimado vs real</div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 bg-white">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Target className="w-4 h-4" />
                ETA ≤ 15 min
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {isLoading ? '...' : etaOnTimeDisplay}
              </div>
              <div className="text-xs text-gray-500">Porcentaje de viajes a tiempo</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
