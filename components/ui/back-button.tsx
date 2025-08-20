interface BackButtonProps {
  href: string
  children?: React.ReactNode
}

export function BackButton({ href, children = "Retour" }: BackButtonProps) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {children}
    </a>
  )
}
