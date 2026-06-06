interface OwnershipBadgeProps {
  ownership: 'public' | 'private' | string
  variant?: 'solid' | 'soft'
}

export default function OwnershipBadge({
  ownership,
  variant = 'soft',
}: OwnershipBadgeProps) {
  const isPublic = ownership === 'public'

  if (variant === 'solid') {
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                        text-white backdrop-blur-sm ${
        isPublic
          ? 'bg-brand-700/90'
          : 'bg-blue-600/90'
      }`}>
        {isPublic ? 'Public' : 'Private'}
      </span>
    )
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                      capitalize ${
      isPublic
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }`}>
      {ownership}
    </span>
  )
}