#!/usr/bin/env node

/**
 * Multi-Source Event Aggregator
 * Runs all event ingestion scripts in parallel
 * Run: node scripts/ingest-all-sources.mjs
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Event sources to ingest from
const SOURCES = [
  {
    name: 'Ticketmaster',
    script: 'ingest-ticketmaster.mjs',
    enabled: !!process.env.TICKETMASTER_API_KEY,
  },
  {
    name: 'City of Thornton',
    script: 'ingest-thornton-city.mjs',
    enabled: !!process.env.OPENAI_API_KEY, // Uses AI to scrape
  },
  {
    name: 'Adams County',
    script: 'ingest-adams-county.mjs',
    enabled: !!process.env.OPENAI_API_KEY, // Uses AI to scrape
  },
  {
    name: 'Eventbrite',
    script: 'ingest-eventbrite.mjs',
    enabled: !!process.env.EVENTBRITE_API_KEY, // Note: API deprecated, will not run
  },
  {
    name: 'Anythink Libraries',
    script: 'ingest-anythink.mjs',
    enabled: true, // Uses RSS feed - no API key needed
  },
  // Westminster has data quality issues - events were not accurate
  // {
  //   name: 'Westminster',
  //   script: 'ingest-westminster.mjs',
  //   enabled: !!process.env.OPENAI_API_KEY,
  // },
]

/**
 * Run a single ingestion script
 */
function runScript(source) {
  return new Promise((resolve, reject) => {
    const scriptPath = join(__dirname, source.script)
    const startTime = Date.now()

    console.log(`\n📡 Starting ${source.name} ingestion...`)

    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      env: process.env,
    })

    child.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)

      if (code === 0) {
        console.log(`✅ ${source.name} completed in ${duration}s`)
        resolve({ source: source.name, success: true, duration })
      } else {
        console.error(`❌ ${source.name} failed with code ${code}`)
        resolve({ source: source.name, success: false, duration, code })
      }
    })

    child.on('error', (error) => {
      console.error(`❌ ${source.name} error:`, error.message)
      reject({ source: source.name, error: error.message })
    })
  })
}

/**
 * Run all enabled sources in parallel
 */
async function runAllSources() {
  const enabledSources = SOURCES.filter((s) => s.enabled)
  const disabledSources = SOURCES.filter((s) => !s.enabled)

  console.log('🚀 Multi-Source Event Aggregator')
  console.log('=' .repeat(50))
  console.log(`\n📊 Enabled sources: ${enabledSources.map((s) => s.name).join(', ')}`)

  if (disabledSources.length > 0) {
    console.log(`⚠️  Disabled sources (missing API keys): ${disabledSources.map((s) => s.name).join(', ')}`)
  }

  if (enabledSources.length === 0) {
    console.error('\n❌ No event sources enabled. Please configure API keys in .env.local')
    process.exit(1)
  }

  const startTime = Date.now()

  try {
    // Run all sources in parallel
    const results = await Promise.all(enabledSources.map(runScript))

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2)
    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    console.log('\n' + '=' .repeat(50))
    console.log('📈 Aggregation Summary')
    console.log('=' .repeat(50))
    console.log(`✅ Successful: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`⏱️  Total time: ${totalDuration}s`)
    console.log('\n✨ Event aggregation complete!')

    if (failCount > 0) {
      console.log('\n⚠️  Some sources failed. Check logs above for details.')
    }
  } catch (error) {
    console.error('\n❌ Fatal error during aggregation:', error)
    process.exit(1)
  }
}

// Run the aggregator
runAllSources()
