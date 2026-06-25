interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 bg-[var(--color-border)] rounded-full" />
        <div className="h-4 w-16 bg-[var(--color-border)] rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-[var(--color-border)] rounded mt-3" />
      <div className="h-4 w-full bg-[var(--color-border)] rounded mt-2" />
      <div className="h-4 w-2/3 bg-[var(--color-border)] rounded mt-1" />
      <div className="border-t border-[var(--color-border)] mt-4 pt-3 flex items-center justify-between">
        <div className="h-4 w-24 bg-[var(--color-border)] rounded-full" />
        <div className="h-4 w-16 bg-[var(--color-border)] rounded-full" />
      </div>
    </div>
  );
}
