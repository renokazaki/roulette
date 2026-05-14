import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { Navigation } from '@/components/layout/Navigation'

const Home            = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })))
const LivePlay        = lazy(() => import('@/pages/LivePlay').then(m => ({ default: m.LivePlay })))
const PatternAnalyzer = lazy(() => import('@/pages/PatternAnalyzer').then(m => ({ default: m.PatternAnalyzer })))
const StrategyGuide   = lazy(() => import('@/pages/StrategyGuide').then(m => ({ default: m.StrategyGuide })))

function Layout() {
  return (
    <div className="min-h-svh bg-casino-bg">
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
      <Navigation />
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-svh bg-casino-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-spin-slow inline-block">🎰</div>
        <div className="text-casino-gold font-mono text-sm animate-pulse">Loading...</div>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,      element: <Home /> },
      { path: 'play',     element: <LivePlay /> },
      { path: 'patterns', element: <PatternAnalyzer /> },
      { path: 'guide',    element: <StrategyGuide /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
