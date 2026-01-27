import { supabase } from './supabaseClient'
import { type UserProfile } from './AuthContext'

/**
 * Check if the current user is an admin
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return data?.role === 'admin'
  } catch {
    return false
  }
}

/**
 * Get the current user's profile
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data as UserProfile
  } catch {
    return null
  }
}

/**
 * Check if content is favorited by the current user
 */
export async function isFavorited(contentType: 'event' | 'article' | 'deal', contentId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single()

    return !!data
  } catch {
    return false
  }
}

/**
 * Add content to favorites
 */
export async function addFavorite(contentType: 'event' | 'article' | 'deal', contentId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be logged in')

  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      content_type: contentType,
      content_id: contentId,
    })

  if (error) throw error
}

/**
 * Remove content from favorites
 */
export async function removeFavorite(contentType: 'event' | 'article' | 'deal', contentId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be logged in')

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('content_type', contentType)
    .eq('content_id', contentId)

  if (error) throw error
}

/**
 * Get user's RSVP status for an event
 */
export async function getEventRsvpStatus(eventId: string): Promise<'attending' | 'maybe' | 'not_attending' | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from('event_rsvps')
      .select('status')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .single()

    return data?.status || null
  } catch {
    return null
  }
}

/**
 * RSVP to an event
 */
export async function rsvpToEvent(
  eventId: string,
  status: 'attending' | 'maybe' | 'not_attending',
  guestsCount: number = 1
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be logged in')

  const { error } = await supabase
    .from('event_rsvps')
    .upsert(
      {
        event_id: eventId,
        user_id: user.id,
        status,
        guests_count: guestsCount,
      },
      {
        onConflict: 'event_id,user_id',
      }
    )

  if (error) throw error
}

/**
 * Cancel RSVP to an event
 */
export async function cancelRsvp(eventId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be logged in')

  const { error } = await supabase
    .from('event_rsvps')
    .delete()
    .eq('user_id', user.id)
    .eq('event_id', eventId)

  if (error) throw error
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  return { valid: true, message: 'Password is strong' }
}

/**
 * Format display name from email
 */
export function getDisplayNameFromEmail(email: string): string {
  const username = email.split('@')[0]
  return username
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
