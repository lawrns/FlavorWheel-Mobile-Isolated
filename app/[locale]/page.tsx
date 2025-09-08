import { redirect } from 'next/navigation'

interface LocaleRootPageProps {
  params: Promise<{
    locale: string
  }>
}

export default async function LocaleRootPage({ params }: LocaleRootPageProps) {
  const { locale } = await params

  // Redirect to the landing page for the current locale
  redirect(`/${locale}/landing`)
}
