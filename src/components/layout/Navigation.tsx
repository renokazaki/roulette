import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'

const ROUTES = [
  { path: '/',         label: 'ホーム',   icon: '🎰' },
  { path: '/play',     label: 'ライブ',   icon: '▶' },
  { path: '/patterns', label: 'パターン', icon: '🔀' },
  { path: '/guide',    label: 'ガイド',   icon: '📖' },
]

export function Navigation() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-casino-surface/90 backdrop-blur-md border-t border-casino-border safe-bottom">
      <div className="flex items-stretch">
        {ROUTES.map(({ path, label, icon }) => {
          const active = pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center py-2 text-xs transition-colors',
                active
                  ? 'text-casino-gold'
                  : 'text-casino-border hover:text-white'
              )}
            >
              <span className="text-lg leading-none mb-0.5">{icon}</span>
              <span className={clsx('font-mono text-[10px]', active && 'text-casino-gold')}>
                {label}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-casino-gold rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
