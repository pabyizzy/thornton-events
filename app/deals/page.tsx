import PageLayout from '../components/PageLayout'
import DealsClient from './DealsClient'

export const metadata = {
  title: 'Local Deals & Discounts | Thornton Events',
  description: 'Save money at Thornton-area businesses with exclusive deals, coupons, and promotions.',
}

export default function DealsPage() {
  return (
    <PageLayout>
      <DealsClient />
    </PageLayout>
  )
}
