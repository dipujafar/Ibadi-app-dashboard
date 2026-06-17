const NotificationSkeletonItem = () => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
      {/* Left section */}
      <div className="flex items-center gap-3 flex-1">
        {/* Bell icon skeleton */}
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />

        {/* Text skeletons */}
        <div className="flex-1 space-y-2">
          <div className="h-4 w-64 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-80 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Time */}
        <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />

        {/* Delete button */}
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
};

export default function NotificationContainerSkeleton({ count = 10 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <NotificationSkeletonItem key={index} />
      ))}
    </div>
  );
}
