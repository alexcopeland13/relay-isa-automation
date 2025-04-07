
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  className?: string;
}

export const StatCard = ({ title, value, icon, trend, className }: StatCardProps) => {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        {icon && (
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={cn(
            "flex items-center",
            trend.positive ? "text-green-600" : "text-red-600"
          )}>
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="ml-2 text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
};
