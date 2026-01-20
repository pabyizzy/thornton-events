interface LoadingSkeletonProps {
  viewMode: 'list' | 'grid' | 'calendar';
}

export default function LoadingSkeleton({ viewMode }: LoadingSkeletonProps) {
  const skeletonItems = Array.from({ length: viewMode === 'grid' ? 6 : 4 });

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {skeletonItems.map((_, index) => (
          <div 
            key={index} 
            className="theme-card-subtle overflow-hidden animate-pulse"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Image Skeleton */}
            <div className="h-48 bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 animate-pulse" />
            
            {/* Content Skeleton */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
              
              {/* Date & Location */}
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3 animate-pulse" />
              </div>
              
              {/* Tags */}
              <div className="flex gap-2">
                <div className="h-6 bg-gradient-to-r from-purple-200 to-purple-300 rounded-full w-20 animate-pulse" />
                <div className="h-6 bg-gradient-to-r from-green-200 to-green-300 rounded-full w-16 animate-pulse" />
              </div>
              
              {/* Buttons */}
              <div className="flex gap-2">
                <div className="h-8 bg-gradient-to-r from-blue-200 to-blue-300 rounded flex-1 animate-pulse" />
                <div className="h-8 bg-gradient-to-r from-green-200 to-green-300 rounded flex-1 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (viewMode === 'calendar') {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, dayIndex) => (
          <div 
            key={dayIndex} 
            className="theme-card-subtle p-6 animate-pulse"
            style={{ animationDelay: `${dayIndex * 0.2}s` }}
          >
            {/* Date Header Skeleton */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
              <div className="text-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-200 to-blue-300 rounded mb-1 animate-pulse" />
                <div className="w-8 h-4 bg-gradient-to-r from-blue-200 to-blue-300 rounded animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 mb-2 animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 animate-pulse" />
              </div>
            </div>

            {/* Events Skeleton */}
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, eventIndex) => (
                <div 
                  key={eventIndex} 
                  className="p-4 bg-white/50 rounded-lg animate-pulse"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-6 bg-gradient-to-r from-purple-200 to-purple-300 rounded w-16 animate-pulse" />
                        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 animate-pulse" />
                      </div>
                      <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mb-1 animate-pulse" />
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 animate-pulse" />
                    </div>
                    <div className="h-5 bg-gradient-to-r from-green-200 to-green-300 rounded w-16 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // List view skeleton
  return (
    <div className="space-y-4">
      {skeletonItems.map((_, index) => (
        <div 
          key={index} 
          className="theme-card-subtle p-6 animate-pulse"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex gap-6">
            {/* Image Skeleton */}
            <div className="flex-shrink-0">
              <div className="h-32 w-32 bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200 rounded-2xl animate-pulse" />
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 space-y-3">
              {/* Title */}
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 animate-pulse" />
              
              {/* Date & Location */}
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3 animate-pulse" />
              </div>
              
              {/* Tags */}
              <div className="flex gap-2">
                <div className="h-6 bg-gradient-to-r from-purple-200 to-purple-300 rounded-full w-24 animate-pulse" />
                <div className="h-6 bg-gradient-to-r from-green-200 to-green-300 rounded-full w-20 animate-pulse" />
              </div>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <div className="h-10 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-32 animate-pulse" />
                <div className="h-10 bg-gradient-to-r from-green-200 to-green-300 rounded w-32 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
