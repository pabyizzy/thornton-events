#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)

async function checkEvents() {
  const now = new Date().toISOString()
  console.log('Current date:', now)
  console.log('=' .repeat(80))

  // Get future events
  const { data, error } = await supabase
    .from('events')
    .select('id,title,start_time,source,source_name')
    .gte('start_time', now)
    .order('start_time', { ascending: true })
    .limit(30)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`\nFuture events: ${data.length}`)
  console.log('=' .repeat(80))

  data.forEach(e => {
    const date = new Date(e.start_time)
    const title = e.title.substring(0, 50).padEnd(50)
    const dateStr = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    const source = (e.source || 'null').padEnd(15)
    const sourceName = (e.source_name || 'null')
    console.log(`${title} | ${dateStr} | ${source} | ${sourceName}`)
  })

  // Also get City of Thornton events specifically
  const { data: thorntonData } = await supabase
    .from('events')
    .select('id,title,start_time,source,source_name')
    .eq('source', 'city-thornton')
    .order('start_time', { ascending: true })

  console.log(`\n\nCity of Thornton events: ${thorntonData?.length || 0}`)
  console.log('=' .repeat(80))

  thorntonData?.forEach(e => {
    const date = new Date(e.start_time)
    console.log(`- ${e.title} (${date.toLocaleDateString()})`)
  })
}

checkEvents()
