'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'
import { Navbar } from '@/components/navbar/navbar'

export function Dashboard() {
  const { user } = useAuth()

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />
      <div className='py-8 px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Dashboard</h1>
            <p className='text-gray-600'>Welcome back, {user?.email?.split('@')[0]}!</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <Card className='bg-white hover:shadow-lg transition-shadow'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>Total Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900'>12</div>
                <p className='text-xs text-gray-500 mt-1'>+2 from last month</p>
              </CardContent>
            </Card>

            <Card className='bg-white hover:shadow-lg transition-shadow'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>Active Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900'>156</div>
                <p className='text-xs text-gray-500 mt-1'>+12 from last week</p>
              </CardContent>
            </Card>

            <Card className='bg-white hover:shadow-lg transition-shadow'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900'>8</div>
                <p className='text-xs text-gray-500 mt-1'>Well organized</p>
              </CardContent>
            </Card>

            <Card className='bg-white hover:shadow-lg transition-shadow'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>Storage Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900'>2.4 GB</div>
                <p className='text-xs text-gray-500 mt-1'>of 10 GB available</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
