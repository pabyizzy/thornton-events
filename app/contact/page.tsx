'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import PageLayout from '../components/PageLayout'

type InquiryType = 'general' | 'ads'

export default function ContactPage() {
  const [inquiryType, setInquiryType] = useState<InquiryType>('general')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('contact_messages').insert({
        inquiry_type: inquiryType,
        name,
        email,
        subject: subject || null,
        message
      })
      if (error) throw error
      setSuccess('Thanks! Your message has been received. We will get back to you soon.')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      setInquiryType('general')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageLayout>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#ffffff' }}>Contact Us</h1>
            <p className="mt-2" style={{ color: '#ffffff', opacity: 0.9 }}>We&apos;d love to hear from you.</p>
          </div>

          <div className="p-6 md:p-8">
            {success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inquiry Type */}
              <fieldset>
                <legend className="block text-sm font-semibold text-gray-900 mb-2">Reason for contacting</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition ${inquiryType === 'general' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="inquiry_type"
                      value="general"
                      checked={inquiryType === 'general'}
                      onChange={() => setInquiryType('general')}
                      required
                      className="h-4 w-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">General question</div>
                      <div className="text-sm text-gray-600">Ask about events, site feedback, or anything else.</div>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition ${inquiryType === 'ads' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="inquiry_type"
                      value="ads"
                      checked={inquiryType === 'ads'}
                      onChange={() => setInquiryType('ads')}
                      required
                      className="h-4 w-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Advertising inquiry</div>
                      <div className="text-sm text-gray-600">Promote your business on Thornton Events.</div>
                    </div>
                  </label>
                </div>
              </fieldset>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1" htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="input w-full"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="input w-full"
                  placeholder="you@example.com"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1" htmlFor="subject">Subject (optional)</label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="input w-full"
                  placeholder="What's this about?"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="input w-full"
                  placeholder="Write your message here..."
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-xs text-gray-600">We&apos;ll never share your email. For ads, we&apos;ll reply from thorntoncoevents@gmail.com.</div>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`btn-primary px-6 py-3 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting ? 'Sending…' : 'Send message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
