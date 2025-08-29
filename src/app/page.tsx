'use client'

import { useAuth } from '@/lib/auth'
import { useSearch } from '@/lib/contexts/search-context'
import { Navbar } from '@/components/navbar/navbar'
import { FloatingButton } from '@/components/ui/floating-button'
import { ListingCard } from '@/components/listings/listing-card'
import { Loading } from '@/components/ui/loading'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface ListingRow {
  id: string
  title: string
  price: number
  image_url: string
  owner_id: string
  owner_name?: string
  location?: string
  created_at: string
  category?: string
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const { searchQuery, isSearching, setSearchQuery, setIsSearching } = useSearch()
  const router = useRouter()
  const [isFetching, setIsFetching] = useState(false)
  const [listings, setListings] = useState<ListingRow[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchListings = async () => {
      setIsFetching(true)
      setFetchError(null)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setFetchError(error.message)
        setIsFetching(false)
        return
      }

      setListings(data ?? [])
      setIsFetching(false)
    }

    if (user) {
      fetchListings()
    }
  }, [user])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('')
        setIsSearching(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchQuery, setSearchQuery, setIsSearching])

  // Filter listings based on search query
  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) {
      return listings
    }

    const query = searchQuery.toLowerCase().trim()
    return listings.filter(listing => {
      const titleMatch = listing.title.toLowerCase().includes(query)
      const categoryMatch = listing.category?.toLowerCase().includes(query)
      const locationMatch = listing.location?.toLowerCase().includes(query)
      const sellerMatch = listing.owner_name?.toLowerCase().includes(query)
      
      return titleMatch || categoryMatch || locationMatch || sellerMatch
    })
  }, [listings, searchQuery])

  const clearSearch = () => {
    setSearchQuery('')
    setIsSearching(false)
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
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                {isSearching ? `Search Results for "${searchQuery}"` : 'Recent Listings'}
              </h1>
              <p className='text-gray-600'>
                {isSearching 
                  ? `Found ${filteredListings.length} result${filteredListings.length !== 1 ? 's' : ''}`
                  : 'Discover amazing deals from your fellow students'
                }
              </p>
            </div>
            
            {isSearching && (
              <button
                onClick={clearSearch}
                className='px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
                <span>Clear Search</span>
              </button>
            )}
          </div>
          
          {fetchError && (
            <p className='text-red-600 mt-2'>Failed to load listings: {fetchError}</p>
          )}
        </div>

        {isFetching ? (
          <Loading />
        ) : (
          <>
            {/* Grid Layout */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {filteredListings.map((row) => (
                <ListingCard
                  key={row.id}
                  id={row.id}
                  title={row.title}
                  price={Number(row.price)}
                  image={row.image_url || undefined}
                  sellerName={row.owner_name ?? 'User'}
                  location={row.location || '—'}
                  createdAt={row.created_at}
                  category={row.category || 'Misc'}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredListings.length === 0 && (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-4'>
                  {isSearching ? (
                    <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                  ) : (
                    <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
                    </svg>
                  )}
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  {isSearching ? 'No results found' : 'No listings yet'}
                </h3>
                <p className='text-gray-500'>
                  {isSearching 
                    ? `Try adjusting your search terms or browse all listings`
                    : 'Be the first to add a listing!'
                  }
                </p>
                {isSearching && (
                  <button
                    onClick={clearSearch}
                    className='mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    Browse All Listings
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <FloatingButton />
    </div>
  )
}
