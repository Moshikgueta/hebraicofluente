import { Skeleton } from '@/components/ui/Card';

export default function Loading() {
  return (
    <div className="grid gap-5">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-[140px] rounded-[var(--r-lg)]" />
      <Skeleton className="h-[96px] rounded-[var(--r-lg)]" />
    </div>
  );
}
