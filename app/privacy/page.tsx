import PageLayout from '../components/PageLayout'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | Thornton Events',
  description: 'Privacy policy for Thornton Events - how we collect, use, and protect your information.',
}

export default function PrivacyPolicy() {
  const lastUpdated = 'January 2025'

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-lg max-w-none">
            <h2>Introduction</h2>
            <p>
              Welcome to Thornton Events (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy
              and ensuring the security of your personal information. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you visit our website or use our services.
            </p>

            <h2>Information We Collect</h2>
            <h3>Information You Provide</h3>
            <p>We may collect information you voluntarily provide, including:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
              <li><strong>Newsletter Subscriptions:</strong> Email address and name when you subscribe to our newsletter</li>
              <li><strong>Contact Forms:</strong> Name, email, and message content when you contact us</li>
              <li><strong>Deal Submissions:</strong> Business information when you submit a deal for consideration</li>
              <li><strong>Event RSVPs:</strong> Your attendance preferences for events</li>
            </ul>

            <h3>Information Collected Automatically</h3>
            <p>When you visit our website, we may automatically collect:</p>
            <ul>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent</li>
              <li>Referring website</li>
              <li>IP address (anonymized)</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Send you newsletters and event updates (with your consent)</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Improve our website and user experience</li>
              <li>Analyze usage patterns and trends</li>
              <li>Protect against fraudulent or unauthorized activity</li>
            </ul>

            <h2>Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Third-party services that help us operate our website (e.g., email services, hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>

            <h2>Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to improve your experience, analyze traffic, and for
              authentication purposes. You can control cookies through your browser settings.
            </p>

            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no
              method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent where applicable</li>
            </ul>

            <h2>Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to children under 13. We do not knowingly collect personal
              information from children under 13. If you believe we have collected such information,
              please contact us immediately.
            </p>

            <h2>Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites (such as event venues or ticket sellers).
              We are not responsible for the privacy practices of these external sites.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <ul>
              <li>Email: <a href="mailto:thorntoncoevents@gmail.com">thorntoncoevents@gmail.com</a></li>
            </ul>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
