'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

function StudioContent() {
  return <NextStudio config={config} />
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px' }}>Loading Sanity Studio...</div>}>
      <StudioContent />
    </Suspense>
  )
}
