type MarkProps = {
  size?: number
  className?: string
}

/** Standalone leaf-in-circle brand mark. Used in the nav, the chatbot header, and as a favicon source (public/icon.svg mirrors this shape). */
export function MamaearthMark({ size = 40, className }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="Mamaearth"
      className={className}
    >
      <circle cx="32" cy="32" r="32" fill="#3F6B2E" />
      <path
        d="M32 13c11 3 19 12.5 18 24-1 10.5-9 17-18 17s-17-6.5-18-17c-1-11.5 7-21 18-24Z"
        fill="#F3EFDD"
      />
      <path
        d="M32 19c-3 8-3 20 0 34"
        stroke="#3F6B2E"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 27c4-2.5 7.5-2 10-.5M32 38c-4-2.5-7.5-2-10-.5"
        stroke="#3F6B2E"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
    </svg>
  )
}

type LogoProps = {
  size?: number
  tagline?: boolean
  className?: string
}

/** Full lockup: leaf mark + "mamaearth" wordmark, optionally with the brand tagline underneath. */
export function MamaearthLogo({ size = 40, tagline = false, className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <MamaearthMark size={size} />
      <div className="leading-tight">
        <p className="font-serif text-xl tracking-tight text-[#29422c]">mamaearth</p>
        {tagline && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a9270]">
            Goodness Inside
          </p>
        )}
      </div>
    </div>
  )
}
