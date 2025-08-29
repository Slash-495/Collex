'use client'

import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4'>
      <div className='max-w-md mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>Welcome Back</h1>
          <p className='text-xl text-gray-600'>Sign in to your account</p>
        </div>
        
        <LoginForm />
        
        <div className='text-center mt-6'>
          <p className='text-gray-600'>
            Don&apos;t have an account?{' '}
            <Link href='/signup' className='text-blue-600 hover:text-blue-700 font-medium'>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
