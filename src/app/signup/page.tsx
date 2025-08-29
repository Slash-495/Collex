'use client'

import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4'>
      <div className='max-w-md mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>Create Account</h1>
          <p className='text-xl text-gray-600'>Join Collex today</p>
        </div>
        
        <SignupForm />
        
        <div className='text-center mt-6'>
          <p className='text-gray-600'>
            Already have an account?{' '}
            <Link href='/login' className='text-blue-600 hover:text-blue-700 font-medium'>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
