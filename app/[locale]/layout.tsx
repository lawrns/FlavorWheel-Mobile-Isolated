import type React from 'react'

export default function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="locale-layout">
      {children}
    </div>
  )
}