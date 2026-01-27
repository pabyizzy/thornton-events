import EventsClient from './EventsClient'
import ClientProbe from './ClientProbe'
import PageLayout from '../components/PageLayout'

export default function EventsPage() {
  return (
    <PageLayout>
      <ClientProbe />
      <EventsClient />
    </PageLayout>
  )
}
