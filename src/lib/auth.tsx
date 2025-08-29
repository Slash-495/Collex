'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  signUp: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef<typeof supabase | null>(null)

  useEffect(() => {
    // Create single Supabase instance
    supabaseRef.current = supabase
    
    // Get initial session
    supabaseRef.current.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseRef.current.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      // Only update state for specific events to avoid duplicates
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    // Check if email is from @iiitdmj.ac.in domain
    if (!email.endsWith('@iiitdmj.ac.in')) {
      return { error: { message: 'Only @iiitdmj.ac.in emails are allowed' } }
    }

    try {
      if (!supabaseRef.current) {
        return { error: { message: 'Authentication not initialized' } }
      }

      const { error } = await supabaseRef.current.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: { message: error.message } }
      }

      // Don't manually update state here - let onAuthStateChange handle it
      return { error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  const signUp = async (email: string, password: string) => {
    // Check if email is from @iiitdmj.ac.in domain
    if (!email.endsWith('@iiitdmj.ac.in')) {
      return { error: { message: 'Only @iiitdmj.ac.in emails are allowed' } }
    }

    try {
      if (!supabaseRef.current) {
        return { error: { message: 'Authentication not initialized' } }
      }

      const { error } = await supabaseRef.current.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error: { message: error.message } }
      }

      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  const signOut = async () => {
    try {
      if (supabaseRef.current) {
        await supabaseRef.current.auth.signOut()
        // State will be updated by onAuthStateChange
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
