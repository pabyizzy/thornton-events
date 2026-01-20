'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
      <p className="theme-text-secondary">{error.message}</p>
      <button
        onClick={reset}
        className="theme-btn-outline mt-4"
      >
        Try again
      </button>
    </main>
  )
}
