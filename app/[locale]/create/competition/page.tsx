import React from 'react'
import { Metadata } from 'next'
import CompetitionModePageClient from './page.client'

export const metadata: Metadata = {
  title: 'Create Competition',
  description: 'Create a structured competition tasting with scoring and ranking',
}

interface PageProps {
  params: {
    locale: string
  }
}

export default function CreateCompetitionPage({ params }: PageProps) {
  return <CompetitionModePageClient params={params} />
}
