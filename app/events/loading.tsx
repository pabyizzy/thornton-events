export default function Loading() {
    return (
      <div className="min-h-screen theme-bg">
        <main className="max-w-6xl mx-auto p-6">
          <h1 className="mb-4 text-2xl font-bold theme-text-primary">Events</h1>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse theme-card-sm p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-purple-200 to-pink-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-2/3 rounded bg-gradient-to-r from-purple-200 to-pink-200" />
                    <div className="h-4 w-1/2 rounded bg-gradient-to-r from-purple-200 to-pink-200" />
                    <div className="h-4 w-1/3 rounded bg-gradient-to-r from-purple-200 to-pink-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }
  