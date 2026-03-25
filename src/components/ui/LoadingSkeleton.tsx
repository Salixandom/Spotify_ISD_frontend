export const LoadingSkeleton: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div
      className={`animate-pulse bg-spotify-elevated rounded ${className}`}
    />
  );
};

export const PlaylistCardSkeleton = () => (
  <div className="p-4 rounded-md bg-spotify-surface">
    <LoadingSkeleton className="w-full aspect-square mb-3" />
    <LoadingSkeleton className="h-4 w-3/4 mb-2" />
    <LoadingSkeleton className="h-3 w-1/2" />
  </div>
);

export const TrackRowSkeleton = () => (
  <div className="flex items-center gap-4 px-4 py-2">
    <LoadingSkeleton className="w-4 h-4" />
    <LoadingSkeleton className="w-10 h-10" />
    <div className="flex-1">
      <LoadingSkeleton className="h-4 w-1/3 mb-2" />
      <LoadingSkeleton className="h-3 w-1/4" />
    </div>
    <LoadingSkeleton className="h-3 w-10" />
  </div>
);
