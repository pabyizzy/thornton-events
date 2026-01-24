import Link from 'next/link'
import PageLayout from '../components/PageLayout'

export default function SubscribePage() {
  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Content */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Stay in the Loop!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Our weekly newsletter will keep you updated on the best events,
            articles, and deals happening in Thornton and the surrounding area.
          </p>

          {/* Newsletter Benefits */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What You&apos;ll Get:
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Weekly Event Roundup</h3>
                  <p className="text-gray-600 text-sm">
                    Top events happening this week, delivered every Sunday
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Latest Articles</h3>
                  <p className="text-gray-600 text-sm">
                    New blog posts about family activities and local tips
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Exclusive Deals</h3>
                  <p className="text-gray-600 text-sm">
                    Special discounts and offers from local businesses
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Event Reminders</h3>
                  <p className="text-gray-600 text-sm">
                    Never miss out on popular events happening soon
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Newsletter System Coming Soon!
            </h3>
            <p className="text-gray-700">
              We&apos;re currently building our newsletter subscription system.
              Check back soon to sign up, or create an account to save your preferences now.
            </p>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="btn-primary">
                Create Account
              </Link>
              <Link href="/" className="btn-secondary">
                Browse Events
              </Link>
            </div>
            <div className="pt-4">
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
