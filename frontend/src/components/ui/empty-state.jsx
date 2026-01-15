import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export default function EmptyState({ title, description, icon, action, className }) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="text-center py-12">
        {icon ? <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">{icon}</div> : null}
        {title ? <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3> : null}
        {description ? <p className="text-gray-600 mb-4">{description}</p> : null}
        {action ? <div className="flex justify-center">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
