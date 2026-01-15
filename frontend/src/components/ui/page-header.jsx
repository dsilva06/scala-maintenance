import { cn } from '@/lib/utils';

export default function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn('flex flex-col md:flex-row justify-between items-start md:items-center gap-4', className)}>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h1>
        {subtitle ? <p className="text-gray-600">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  );
}
