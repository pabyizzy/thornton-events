import Link from 'next/link'
import PageLayout from '../components/PageLayout'

export default function DealsPage() {
  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>

          {/* Content */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Deals & Discounts Coming Soon!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            We&apos;re partnering with local businesses to bring you exclusive deals and
            discounts on activities, restaurants, classes, and more.
          </p>

          {/* Features List */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">What to Expect:</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">
                  <strong>Local Business Deals:</strong> Special offers from Thornton businesses
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">
                  <strong>Family-Friendly Discounts:</strong> Savings on activities and entertainment
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">
                  <strong>Restaurant Specials:</strong> Exclusive deals at local eateries
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">
                  <strong>Class & Lesson Discounts:</strong> Special rates on kids&apos; classes and programs
                </span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <p className="text-gray-600">
              Get notified when we launch our deals section!
            </p>
            <Link href="/subscribe" className="btn-primary inline-block">
              Subscribe to Newsletter
            </Link>
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
