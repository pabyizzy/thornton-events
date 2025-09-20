import { supabase } from '../lib/supabaseClient'

export default async function Home() {
  const { data: events, error } = await supabase
    .from('events')
    .select('id,title,city,state,start_time,url')
    .order('start_time', { ascending: true })
    .limit(10)

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Error loading events: {error.message}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-xl p-8">
        <h1 className="text-3xl font-bold mb-4">Thornton CO Events</h1>
        {!events || events.length === 0 ? (
          <p className="text-gray-600">No events found.</p>
        ) : (
          <ul className="space-y-4">
            {events.map((e) => (
              <li key={e.id} className="border-b pb-3">
                <h2 className="text-xl font-semibold">{e.title}</h2>
                <p className="text-gray-600">
                  {e.city}, {e.state} — {new Date(e.start_time).toLocaleString()}
                </p>
                {e.url && (
                  <a href={e.url} className="text-blue-600 underline" target="_blank">
                    More info
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
