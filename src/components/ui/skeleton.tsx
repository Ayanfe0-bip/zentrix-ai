interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
}

export default function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const variants = {
    text: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-gradient-to-r from-white/[0.04] via-white/[0.10] to-white/[0.04] ${variants[variant]} ${className}`}
      style={{
        width: width || "100%",
        height: height || (variant === "text" ? "14px" : "48px"),
      }}
    />
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex w-full gap-3 py-5">
      <Skeleton variant="circular" width="36px" height="36px" />

      <div className="flex flex-1 flex-col gap-3 pt-1">
        <Skeleton width="110px" height="13px" variant="text" />
        <Skeleton width="95%" height="13px" variant="text" />
        <Skeleton width="75%" height="13px" variant="text" />
        <Skeleton width="55%" height="13px" variant="text" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <Skeleton width="42px" height="42px" />
      <Skeleton className="mt-5" width="65%" height="18px" variant="text" />
      <Skeleton className="mt-3" width="90%" height="12px" variant="text" />
      <Skeleton className="mt-2" width="75%" height="12px" variant="text" />
    </div>
  );
}
