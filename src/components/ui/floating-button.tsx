'use client'

import { Plus } from 'lucide-react'
import { Button } from './button'
import Link from 'next/link'

export function FloatingButton() {
  return (
    <Link href='/add-listing'>
      <Button
        size='lg'
        className='fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 z-50'
      >
        <Plus className='w-6 h-6' />
      </Button>
    </Link>
  )
}
