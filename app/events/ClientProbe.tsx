'use client'

import { useEffect } from 'react'

export default function ClientProbe() {
  useEffect(() => {
    const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const hasKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    if (!hasUrl || !hasKey) {
      console.warn(
        'ClientProbe: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY at build time.'
      )
    } else {
      console.log('ClientProbe: public Supabase envs are present.')
    }
  }, [])

  return null
}
