'use client'

import React from 'react'

interface CreateShellProps {
  children: React.ReactNode
  header: React.ReactNode
  footer: React.ReactNode
  className?: string
}

export function CreateShell({ children, header, footer, className = '' }: CreateShellProps) {
  return (
    <div className={`bg-fx-bg min-h-screen ${className}`}>
      {/* Header */}
      {header}

      {/* Main Content */}
      <main className="pb-32">
        <div className="max-w-[768px] mx-auto px-4 sm:px-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      {footer}
    </div>
  )
}
