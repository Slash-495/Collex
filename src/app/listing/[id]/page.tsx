'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar/navbar'
import { Loading } from '@/components/ui/loading'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, User, ArrowLeft, Calendar, Phone } from 'lucide-react'

interface ListingDetail {
  id: string
  title: string
  description: string
  price: number
  image_url: string
  location: string | null
  category: string | null
  owner_id: string
  owner_name: string | null
  created_at: string
}

interface OwnerProfile {
  name: string | null
  contact_info: string | null
  location: string | null
}

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showContactInfo, setShowContactInfo] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      if (!params?.id) return
      setIsFetching(true)
      setError(null)

      try {
        // Fetch listing details
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', params.id)
          .single()

        if (listingError) {
          setError(listingError.message)
          setIsFetching(false)
          return
        }

        setListing(listingData as unknown as ListingDetail)

        // Fetch owner profile information
        if (listingData.owner_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, contact_info, location')
            .eq('id', listingData.owner_id)
            .single()

          if (!profileError && profileData) {
            setOwnerProfile(profileData)
          }
        }

        setIsFetching(false)
      } catch (err) {
        setError('Failed to fetch listing details')
        setIsFetching(false)
      }
    }

    fetchListing()
  }, [params?.id])

  if (isFetching) return <Loading />
  if (error || !listing) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Navbar />
        <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
          <Button variant='outline' onClick={() => router.back()} className='mb-6'>
            <ArrowLeft className='w-4 h-4 mr-2' /> Back
          </Button>
          <div className='text-center py-12'>
            <p className='text-red-600 text-lg'>Failed to load listing: {error || 'Not found'}</p>
          </div>
        </main>
      </div>
    )
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCallSeller = () => {
    setShowContactInfo(!showContactInfo)
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />
      <main className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Back Button */}
        <Button variant='outline' onClick={() => router.back()} className='mb-6'>
          <ArrowLeft className='w-4 h-4 mr-2' /> Back to Listings
        </Button>

        <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
          {/* Left Column - Image and Basic Info */}
          <div className='xl:col-span-2 space-y-6'>
            {/* Image Card */}
            <Card className='overflow-hidden'>
              <div className='relative aspect-[4/3] max-h-80 w-full max-w-md mx-auto'>
                <Image
                  src={listing.image_url}
                  alt={listing.title}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px'
                  priority
                />
              </div>
            </Card>

            {/* Description Card */}
            <Card>
              <CardHeader>
                <CardTitle className='text-xl font-semibold text-gray-900'>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-700 leading-relaxed text-base whitespace-pre-wrap'>
                    {listing.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details and Contact */}
          <div className='space-y-6'>
            {/* Main Details Card */}
            <Card>
              <CardContent className='p-6 space-y-4'>
                <div className='space-y-3'>
                  <h1 className='text-2xl font-bold text-gray-900 leading-tight'>{listing.title}</h1>
                  {listing.category && (
                    <Badge variant='secondary' className='bg-blue-100 text-blue-800 border-blue-200'>
                      {listing.category}
                    </Badge>
                  )}
                </div>

                <div className='text-3xl font-bold text-blue-600'>
                  {formatPrice(Number(listing.price))}
                </div>

                <div className='flex items-center text-sm text-gray-500'>
                  <Calendar className='w-4 h-4 mr-2' />
                  Listed on {formatDate(listing.created_at)}
                </div>
              </CardContent>
            </Card>

            {/* Seller Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg font-semibold text-gray-900 flex items-center'>
                  <User className='w-5 h-5 mr-2' />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Name:</span>
                  <span className='font-medium text-gray-900'>{listing.owner_name || 'Seller'}</span>
                </div>
                
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Location:</span>
                  <span className='font-medium text-gray-900 flex items-center'>
                    <MapPin className='w-4 h-4 mr-1' />
                    {ownerProfile?.location || listing.location || 'Not specified'}
                  </span>
                </div>

                <div className='pt-4 border-t border-gray-200'>
                  <h4 className='font-medium text-gray-900 mb-3'>Contact Seller</h4>
                  <div className='space-y-3'>
                    <Button 
                      variant='outline' 
                      className='w-full'
                      onClick={handleCallSeller}
                    >
                      <Phone className='w-4 h-4 mr-2' />
                      {showContactInfo ? 'Hide Contact Info' : 'Show Contact Info'}
                    </Button>
                    
                    {showContactInfo && ownerProfile?.contact_info && (
                      <div className='bg-gray-50 p-3 rounded-lg border'>
                        <p className='text-sm text-gray-600 mb-1'>Contact Information:</p>
                        <p className='text-gray-900 font-medium'>{ownerProfile.contact_info}</p>
                      </div>
                    )}
                    
                    {showContactInfo && !ownerProfile?.contact_info && (
                      <div className='bg-gray-50 p-3 rounded-lg border'>
                        <p className='text-sm text-gray-500 text-center'>No contact information available</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
