import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardStats({ title, value, icon: Icon, color, subtitle }) {
  const getColorClasses = (color) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'orange': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'red': return 'bg-red-50 text-red-600 border-red-200';
      case 'green': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-slate-700">{title}</p>
            <p className="text-3xl font-semibold text-slate-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-2">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl border ${getColorClasses(color)}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
