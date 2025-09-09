import React from 'react'
import { Metadata } from 'next'
import CompetitionModePageClient from './page.client'

export const metadata: Metadata = {
  title: 'Create Competition',
  description: 'Create a structured competition tasting with scoring and ranking',
}

interface PageProps {
  params: Promise<{
    locale: string
  }>
}

export default async function CreateCompetitionPage({ params }: PageProps) {
  const resolvedParams = await params
  return <CompetitionModePageClient />
}
