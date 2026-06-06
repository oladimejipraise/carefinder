import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

const sizes = {
  sm:  { box: 'w-6 h-6',  icon: 'w-3 h-3',  text: 'text-base' },
  md:  { box: 'w-8 h-8',  icon: 'w-4 h-4',  text: 'text-lg'   },
  lg:  { box: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-xl'   },
}

export default function Logo({ size = 'md', href = '/' }: LogoProps) {
  const s = sizes[size]

  return (
    <Link href={href} className="flex items-center gap-2">
      <div className={`${s.box} bg-brand-700 rounded-lg flex items-center
                       justify-center shrink-0`}>
        <svg className={`${s.icon} text-white`} fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0
                   01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <span className={`font-bold text-brand-900 dark:text-white
                        ${s.text} tracking-tight`}>
        Care<span className="text-brand-700">finder</span>
      </span>
    </Link>
  )
}