'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar/navbar'
import { Loading } from '@/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Clock, MapPin, User } from 'lucide-react'
import Link from 'next/link'

interface MyListing {
  id: string
  title: string
  price: number
  description: string
  category: string
  location: string
  created_at: string
  owner_name: string
  image_url?: string
}

export default function MyListingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<MyListing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchMyListings()
    }
  }, [user])

  const fetchMyListings = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Fetching listings for user:', user?.id)
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Fetched listings data:', data)
      console.log('First listing sample:', data?.[0])
      console.log('Available fields:', data?.[0] ? Object.keys(data[0]) : 'No data')
      
      setListings(data || [])
    } catch (err) {
      console.error('Error in fetchMyListings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch listings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return
    }

    setDeletingId(listingId)
    
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('owner_id', user?.id) // Extra security check

      if (error) {
        throw error
      }

      // Remove from local state
      setListings(prev => prev.filter(listing => listing.id !== listingId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing')
    } finally {
      setDeletingId(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <Loading />
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />
      
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>My Listings</h1>
          <p className='text-gray-600'>Manage your posted listings</p>
          {error && (
            <p className='text-red-600 mt-2'>Error: {error}</p>
          )}
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <>
            {/* Listings Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {listings.map((listing) => {
                console.log('Rendering listing:', listing.id, 'image_url:', listing.image_url)
                return (
                <Card key={listing.id} className='group hover:shadow-lg transition-all duration-200'>
                  <CardHeader className='p-0'>
                    <div className='relative aspect-square overflow-hidden rounded-t-lg bg-gray-100'>
                      {listing.image_url && listing.image_url.trim() !== '' ? (
                        <img
                          src={listing.image_url}
                          alt={listing.title}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
                          onError={(e) => {
                            console.log('Image failed to load:', listing.image_url)
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`flex items-center justify-center h-full ${listing.image_url && listing.image_url.trim() !== '' ? 'hidden' : ''}`}>
                        <div className='text-center'>
                          <svg className='w-12 h-12 text-gray-400 mx-auto mb-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          <p className='text-sm text-gray-500'>No Image</p>
                        </div>
                      </div>
                      <div className='absolute top-2 left-2'>
                        <Badge variant='secondary' className='bg-white/90 text-gray-700'>
                          {listing.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className='p-4'>
                    <CardTitle className='text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2'>
                      {listing.title}
                    </CardTitle>
                    
                    <p className='text-gray-600 text-sm line-clamp-3 mb-4'>
                      {listing.description}
                    </p>
                    
                    <div className='space-y-3 mb-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-xl font-bold text-blue-600'>
                          {formatPrice(listing.price)}
                        </span>
                        <div className='flex items-center text-sm text-gray-500'>
                          <Clock className='w-4 h-4 mr-1' />
                          {formatDate(listing.created_at)}
                        </div>
                      </div>
                      
                      <div className='flex items-center justify-between text-sm text-gray-600'>
                        <div className='flex items-center'>
                          <User className='w-4 h-4 mr-1' />
                          {listing.owner_name}
                        </div>
                        <div className='flex items-center'>
                          <MapPin className='w-4 h-4 mr-1' />
                          {listing.location}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-2'>
                      <Button
                        asChild
                        variant='outline'
                        size='sm'
                        className='flex-1'
                      >
                        <Link href={`/edit-listing/${listing.id}`}>
                          <Edit className='w-4 h-4 mr-2' />
                          Update
                        </Link>
                      </Button>
                      
                      <Button
                        asChild
                        variant='outline'
                        size='sm'
                        className='flex-1'
                      >
                        <Link href={`/listing/${listing.id}`}>
                          <svg className='w-4 h-4 mr-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                          </svg>
                          View
                        </Link>
                      </Button>
                      
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => handleDelete(listing.id)}
                        disabled={deletingId === listing.id}
                        className='px-3'
                      >
                        {deletingId === listing.id ? (
                          <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        ) : (
                          <>
                            <Trash2 className='w-4 h-4 mr-1' />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>

            {/* Empty State */}
            {listings.length === 0 && (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-4'>
                  <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>No listings yet</h3>
                <p className='text-gray-500 mb-4'>Start selling by creating your first listing</p>
                <Button asChild>
                  <Link href='/add-listing'>
                    Create Your First Listing
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
