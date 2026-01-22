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
    refetchInterval: 30000,
  });

  const metrics = data?.metrics ?? {};
  const costPerMile = metrics.cost_per_mile?.value;
  const downtimeAvg = metrics.downtime_hours?.average;
  const etaError = metrics.eta_accuracy?.average_error_minutes;
  const etaOnTime = metrics.eta_accuracy?.within_15_min_rate;
  const etaOnTimeDisplay =
    etaOnTime === null || etaOnTime === undefined ? 'N/D' : `${formatNumber(etaOnTime, 2)}%`;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-slate-600" />
          Indicadores Operativos
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white">
        {error ? (
          <div className="text-sm text-red-600">{getErrorMessage(error, 'Error al cargar métricas')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 p-5 bg-white">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <DollarSign className="w-4 h-4" />
                Costo por milla
              </div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">
                {isLoading ? '...' : formatNumber(costPerMile, 4)}
              </div>
              <div className="text-sm text-slate-500 mt-1">Costo mantenimiento / distancia planificada</div>
            </div>

            <div className="rounded-xl border border-slate-200 p-5 bg-white">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Clock className="w-4 h-4" />
                Downtime promedio
              </div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">
                {isLoading ? '...' : formatNumber(downtimeAvg, 2)}
              </div>
              <div className="text-sm text-slate-500 mt-1">Horas por orden completada</div>
            </div>

            <div className="rounded-xl border border-slate-200 p-5 bg-white">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Target className="w-4 h-4" />
                Error ETA
              </div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">
                {isLoading ? '...' : formatNumber(etaError, 2)}
              </div>
              <div className="text-sm text-slate-500 mt-1">Minutos entre estimado y real</div>
            </div>

            <div className="rounded-xl border border-slate-200 p-5 bg-white">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Target className="w-4 h-4" />
                ETA ≤ 15 min
              </div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">
                {isLoading ? '...' : etaOnTimeDisplay}
              </div>
              <div className="text-sm text-slate-500 mt-1">Porcentaje de viajes a tiempo</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
