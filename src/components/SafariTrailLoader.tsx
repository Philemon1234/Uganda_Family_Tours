import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type SafariTrailLoaderProps = {
  className?: string
}

export function SafariLoaderOverlay({ className = '' }: SafariTrailLoaderProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const overlay = (
    <div
      className={`safari-loader-overlay fixed inset-0 z-[9999] grid h-screen w-screen place-items-center overflow-hidden bg-[#fffdf9] px-0 font-sans ${className}`}
      role="status"
      aria-label="Loading"
    >
      <svg
        className="h-28 w-28 overflow-visible sm:h-32 sm:w-32"
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="60" cy="60" r="38" stroke="#E8DED4" strokeWidth="1.6" />
        <circle cx="60" cy="60" r="31" stroke="#E8DED4" strokeDasharray="1.5 5" strokeLinecap="round" strokeWidth="1.8" />
        <path
          d="M60 14v7M60 99v7M14 60h7M99 60h7"
          stroke="#263238"
          strokeLinecap="round"
          strokeWidth="1.5"
          opacity="0.48"
        />
        <path
          d="M78.7 21.5 75.2 28M41.3 98.5 44.8 92M21.5 41.3 28 44.8M98.5 78.7 92 75.2"
          stroke="#E8DED4"
          strokeLinecap="round"
          strokeWidth="1.4"
        />
        <text x="60" y="10.5" fill="#263238" fontSize="8" fontWeight="700" textAnchor="middle">N</text>
        <text x="109" y="63" fill="#263238" fontSize="8" fontWeight="700" textAnchor="middle">E</text>
        <text x="60" y="116" fill="#263238" fontSize="8" fontWeight="700" textAnchor="middle">S</text>
        <text x="11" y="63" fill="#263238" fontSize="8" fontWeight="700" textAnchor="middle">W</text>
        <path
          d="M60 22c5.8.1 11.4 1.5 16.4 4M84.4 32.5A38 38 0 0 1 98 60"
          stroke="#FFA460"
          strokeDasharray="1.6 3.8"
          strokeLinecap="round"
          strokeWidth="2.4"
        />
        <g className="compass-needle">
          <path d="M60 58 75.8 30.8 64.3 62.4Z" fill="#FFA460" />
          <path d="M60 62 44.2 89.2 55.7 57.6Z" fill="#E8DED4" />
          <circle cx="60" cy="60" r="6.2" fill="#FFA460" />
          <circle cx="60" cy="60" r="2.2" fill="#FFFDF9" opacity="0.78" />
        </g>
      </svg>
    </div>
  )

  return createPortal(overlay, document.body)
}

export function SafariTrailLoader(props: SafariTrailLoaderProps) {
  return <SafariLoaderOverlay {...props} />
}
