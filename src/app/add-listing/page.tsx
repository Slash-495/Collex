'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar/navbar'
import { Loading } from '@/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AddListingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [owner_name, setOwner_name] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <Loading />
  }

  const handleImageUpload = async (file: File) => {
    if (!user) return

    setIsUploadingImage(true)
    setErrorMsg(null)

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, file, { upsert: false })

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`)
      }

      const { data: publicUrlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath)

      const publicUrl = publicUrlData?.publicUrl
      if (!publicUrl) {
        throw new Error('Unable to resolve public URL for uploaded image')
      }

      setImageUrl(publicUrl)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload image'
      setErrorMsg(message)
    } finally {
      setIsUploadingImage(false)

    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    const parsedPrice = Number(price)
    if (! owner_name || !title || !description || !price || Number.isNaN(parsedPrice) || parsedPrice <= 0 || !imageUrl || !location) {
      setErrorMsg('Please provide the owner name, title, description, valid price, image, and location.')
      setIsSubmitting(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('listings')
        .insert({
          title,
          owner_name,
          description,
          price: parsedPrice,
          image_url: imageUrl,
          owner_id: user.id,
          category: category || 'Misc',
          location: location,
        })
        .select('id')
        .single()

      if (error) {
        throw new Error(error.message)
      }

      router.push('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create listing'
      setErrorMsg(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />

      <main className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Add Listing</h1>
          <p className='text-gray-600'>Provide details about the item you want to sell</p>
          {errorMsg && <p className='text-red-600 mt-3'>{errorMsg}</p>}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div>
                <Label htmlFor='owner_name'>Owner Name</Label>
                <Input
                  id='owner_name'
                  name='owner_name'
                  value={owner_name}
                  onChange={(e) => setOwner_name(e.target.value)}
                  placeholder='e.g., Slash Jain'
                  required
                />
              </div>
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
                <Label htmlFor='image_file'>Product Image</Label>
                <div className='space-y-3'>
                  {imageUrl && (
                    <div className='flex items-center space-x-3'>
                      <img
                        src={imageUrl}
                        alt='Listing preview'
                        className='w-20 h-20 rounded-lg object-cover border border-gray-200'
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setImageUrl('')}
                        disabled={isUploadingImage || isSubmitting}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  <Input
                    id='image_file'
                    name='image_file'
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      if (file) handleImageUpload(file)
                    }}
                    placeholder='Upload listing image'
                    disabled={isUploadingImage || isSubmitting}
                  />
                  {isUploadingImage && (
                    <p className='text-sm text-blue-600'>Uploading image...</p>
                  )}
                  <p className='text-sm text-gray-500'>Upload a photo from your device.</p>
                </div>
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
                 <Label htmlFor='location'>Location</Label>
                 <Input
                   id='location'
                   name='location'
                   value={location}
                   onChange={(e) => setLocation(e.target.value)}
                   placeholder='e.g., Hall No. 4'
                   required
                 />
               </div>

              <div className='flex gap-4 pt-2'>
                <Button type='submit' className='flex-1' disabled={isSubmitting}>
                  {isSubmitting ? 'Adding…' : 'Add Listing'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='flex-1'
                  onClick={() => router.back()}
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



