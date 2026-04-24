'use client'

import { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-black/20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
            <span className="text-neon-cyan/50 text-xs font-mono tracking-widest">
              LOADING 3D...
            </span>
          </div>
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}
