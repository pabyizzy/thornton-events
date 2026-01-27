import PageLayout from '../components/PageLayout'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | Thornton Events',
  description: 'Terms of service for using Thornton Events website and services.',
}

export default function TermsOfService() {
  const lastUpdated = 'January 2025'

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-lg max-w-none">
            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using Thornton Events (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>

            <h2>Description of Service</h2>
            <p>
              Thornton Events is a community website that provides information about local events,
              deals, and activities in the Thornton, Colorado area. We aggregate event information
              from various sources and allow local businesses to submit deals and promotions.
            </p>

            <h2>User Accounts</h2>
            <p>When you create an account, you agree to:</p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update any changes to your information</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h2>Acceptable Use</h2>
            <p>You agree NOT to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose</li>
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Harvest or collect user information without consent</li>
            </ul>

            <h2>Event Information</h2>
            <p>
              We strive to provide accurate event information, but we do not guarantee the accuracy,
              completeness, or timeliness of any event listings. Event details are subject to change
              by the event organizers. Always verify event information with the official source before attending.
            </p>

            <h2>Deals and Promotions</h2>
            <p>
              Deals and promotions listed on our site are provided by third-party businesses.
              We do not guarantee the validity, availability, or terms of any deal.
              Please verify all deal terms directly with the business before attempting to redeem.
            </p>

            <h2>User-Submitted Content</h2>
            <p>
              When you submit content (such as deal submissions or comments), you grant us a
              non-exclusive, royalty-free license to use, display, and distribute that content
              on our Service. You represent that you have the right to submit such content.
            </p>

            <h2>Third-Party Links</h2>
            <p>
              Our Service may contain links to third-party websites, including event venues,
              ticket sellers, and business websites. We are not responsible for the content,
              terms, or practices of these external sites.
            </p>

            <h2>Intellectual Property</h2>
            <p>
              The Service and its original content (excluding user-submitted content) are owned
              by Thornton Events and are protected by copyright, trademark, and other laws.
              You may not copy, modify, or distribute our content without permission.
            </p>

            <h2>Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              ERROR-FREE, OR COMPLETELY SECURE.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, THORNTON EVENTS SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR
              USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>Loss of profits, data, or goodwill</li>
              <li>Errors in event information</li>
              <li>Invalid or expired deals</li>
              <li>Actions of third-party event organizers or businesses</li>
            </ul>

            <h2>Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Thornton Events and its operators from any
              claims, damages, or expenses arising from your use of the Service or violation of
              these Terms.
            </p>

            <h2>Termination</h2>
            <p>
              We may terminate or suspend your access to the Service at any time, without prior
              notice, for conduct that we believe violates these Terms or is harmful to other
              users, us, or third parties.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of
              significant changes by posting a notice on our website. Your continued use of the
              Service after changes constitutes acceptance of the new Terms.
            </p>

            <h2>Governing Law</h2>
            <p>
              These Terms shall be governed by the laws of the State of Colorado, United States,
              without regard to its conflict of law provisions.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <ul>
              <li>Email: <a href="mailto:thorntoncoevents@gmail.com">thorntoncoevents@gmail.com</a></li>
            </ul>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 flex gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
              ← Back to Home
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-700">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
