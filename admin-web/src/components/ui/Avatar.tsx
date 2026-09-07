import { useState } from 'react'

interface AvatarProps {
  url?: string | null
  initials: string
  size: number
  className?: string
}

// Falls back to the initials circle if the image URL 404s/is unreachable —
// otherwise a broken/stale avatarUrl renders as a blank or broken-image icon
// forever instead of the identity cue initials were already providing.
export function Avatar({ url, initials, size, className = '' }: AvatarProps) {
  const [broken, setBroken] = useState(false)
  const dimension = `${size}px`

  if (url && !broken) {
    return (
      <img
        src={url}
        alt=""
        onError={() => setBroken(true)}
        style={{ width: dimension, height: dimension }}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <span
      style={{ width: dimension, height: dimension }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-rose-500 font-semibold text-white ${className}`}
    >
      {initials}
    </span>
  )
}
