'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar/navbar'
import { Loading } from '@/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ListingData {
  id: string
  title: string
  owner_name: string
  description: string
  price: number
  category: string
  location: string
  owner_id: string
  image_url?: string
}

export default function EditListingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  const [listing, setListing] = useState<ListingData | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<{ full_name: string; location: string } | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && listingId) {
      fetchListing()
      fetchUserProfile()
    }
  }, [user, listingId])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, location')
        .eq('id', user?.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setUserProfile(data)
    } catch (err) {
      console.error('Error in fetchUserProfile:', err)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file')
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size should be less than 5MB')
        return
      }

      setImageFile(file)
      setErrorMsg(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    setIsUploadingImage(true)
    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('listings')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('listings')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (err) {
      console.error('Error uploading image:', err)
      setErrorMsg('Failed to upload image. Please try again.')
      return null
    } finally {
      setIsUploadingImage(false)
    }
  }

  const fetchListing = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .eq('owner_id', user?.id) // Security: only owner can edit
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setErrorMsg('Listing not found or you do not have permission to edit it.')
        } else {
          setErrorMsg(error.message)
        }
        return
      }

      if (!data) {
        setErrorMsg('Listing not found.')
        return
      }

      setListing(data)
      setTitle(data.title)
      setDescription(data.description)
      setPrice(data.price.toString())
      setCategory(data.category || '')
      
      // Set current image if it exists
      if (data.image_url) {
        setImagePreview(data.image_url)
      }
      
      // Note: owner_name and location will be fetched from userProfile, not from the listing data
    } catch (err) {
      setErrorMsg('Failed to fetch listing details.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    const parsedPrice = Number(price)
    if (!title || !description || !price || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMsg('Please provide the title, description, and valid price.')
      setIsSubmitting(false)
      return
    }

    if (!userProfile?.full_name || !userProfile?.location) {
      setErrorMsg('Please complete your profile with full name and location before updating the listing.')
      setIsSubmitting(false)
      return
    }

    try {
      let imageUrl = listing?.image_url || null
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage()
        if (!imageUrl) {
          setIsSubmitting(false)
          return
        }
      }

      const { error } = await supabase
        .from('listings')
        .update({
          title,
          owner_name: userProfile.full_name,
          description,
          price: parsedPrice,
          category: category || 'Misc',
          location: userProfile.location,
          image_url: imageUrl,
        })
        .eq('id', listingId)
        .eq('owner_id', user?.id) // Extra security check

      if (error) {
        throw new Error(error.message)
      }

      router.push('/my-listings')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update listing'
      setErrorMsg(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || isLoading) {
    return <Loading />
  }

  if (!user) {
    return <Loading />
  }

  if (errorMsg && !listing) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Navbar />
        <main className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-red-600 mb-4'>Error</h1>
            <p className='text-gray-600 mb-6'>{errorMsg}</p>
            <Button onClick={() => router.push('/my-listings')}>
              Back to My Listings
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!listing) {
    return <Loading />
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />

      <main className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Edit Listing</h1>
          <p className='text-gray-600'>Update your listing details</p>
          {errorMsg && <p className='text-red-600 mt-3'>{errorMsg}</p>}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-5'>
                             {!userProfile?.full_name || !userProfile?.location ? (
                 <div className='bg-yellow-50 border border-yellow-200 rounded-md p-4'>
                   <p className='text-yellow-800 text-sm'>
                     Please complete your profile with full name and location before updating the listing.
                   </p>
                 </div>
               ) : (
                 <div className='bg-green-50 border border-green-200 rounded-md p-4'>
                   <p className='text-green-800 text-sm'>
                     Current Profile: <strong>{userProfile.full_name}</strong> • <strong>{userProfile.location}</strong>
                     <br />
                     <span className='text-xs text-green-700'>
                       This will update the listing with your current profile information
                     </span>
                   </p>
                   {listing && (
                     <div className='mt-3 pt-3 border-t border-green-200'>
                       <p className='text-xs text-green-600'>
                         Current listing shows: <strong>{listing.owner_name}</strong> • <strong>{listing.location}</strong>
                       </p>
                     </div>
                   )}
                 </div>
               )}
              
              <div>
                <Label htmlFor='title'>Title</Label>
                <Input
                  id='title'
                  name='title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='e.g., Mechanical Keyboard, Great Condition'
                  required
                />
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <textarea
                  id='description'
                  name='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Describe the item, its condition, and any other relevant details...'
                  required
                  rows={4}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                />
              </div>

              <div>
                <Label htmlFor='price'>Price</Label>
                <Input
                  id='price'
                  name='price'
                  type='number'
                  inputMode='numeric'
                  min='1'
                  step='1'
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder='e.g., 1000'
                  required
                />
              </div>

                             <div>
                 <Label htmlFor='category'>Category</Label>
                 <Input
                   id='category'
                   name='category'
                   value={category}
                   onChange={(e) => setCategory(e.target.value)}
                   placeholder='e.g., Electronics, Books, Furniture'
                 />
               </div>

               <div>
                 <Label htmlFor='image'>Product Image</Label>
                 <div className='space-y-3'>
                   <Input
                     id='image'
                     name='image'
                     type='file'
                     accept='image/*'
                     onChange={handleImageChange}
                     className='cursor-pointer'
                   />
                   <p className='text-xs text-gray-500'>
                     Supported formats: JPG, PNG, GIF. Max size: 5MB
                   </p>
                   
                   {imagePreview && (
                     <div className='relative'>
                       <img
                         src={imagePreview}
                         alt='Preview'
                         className='w-32 h-32 object-cover rounded-lg border border-gray-300'
                       />
                       <button
                         type='button'
                         onClick={() => {
                           setImageFile(null)
                           setImagePreview(null)
                         }}
                         className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600'
                       >
                         ×
                       </button>
                     </div>
                   )}
                 </div>
               </div>



              <div className='flex gap-4 pt-2'>
                <Button type='submit' className='flex-1' disabled={isSubmitting}>
                  {isSubmitting ? 'Updating…' : 'Update Listing'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='flex-1'
                  onClick={() => router.push('/my-listings')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
