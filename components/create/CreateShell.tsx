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
    <div className={`bg-fx-bg ${className}`}>
      {/* Header */}
      {header}

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      {footer}
    </div>
  )
}
