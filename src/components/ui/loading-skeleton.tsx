
import { Skeleton } from '@/components/ui/skeleton';

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border shadow-sm bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border shadow-sm bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="mt-6">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex space-x-4 items-center py-3">
      {Array(cols).fill(null).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === 0 ? 'w-1/6' : i === cols - 1 ? 'w-1/12' : 'w-1/4'}`} 
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex space-x-4 items-center">
        {Array(cols).fill(null).map((_, i) => (
          <Skeleton 
            key={i} 
            className={`h-5 ${i === 0 ? 'w-1/6' : i === cols - 1 ? 'w-1/12' : 'w-1/4'}`} 
          />
        ))}
      </div>
      
      <div className="space-y-3">
        {Array(rows).fill(null).map((_, i) => (
          <TableRowSkeleton key={i} cols={cols} />
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/5" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
      
      <div className="flex justify-end">
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      <div className="grid gap-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
