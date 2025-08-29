'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar/navbar'
import { Loading } from '@/components/ui/loading'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit2, Save, X } from 'lucide-react'

interface ProfileData {
  id: string
  name: string | null
  avatar_url: string | null
  contact_info: string | null
  location: string | null
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  // Edit mode states
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<ProfileData>>({})

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      fetchProfile()
    }
  }, [user, loading, router])

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <Loading />
  }

  // Handle avatar file upload
  const handleAvatarUpload = async (file: File) => {
    if (!user) return

    setIsUploadingAvatar(true)
    setErrorMsg(null)

    try {
      // Upload image to Supabase Storage bucket "avatars"
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: false })

      if (uploadError) {
        throw new Error(`Avatar upload failed: ${uploadError.message}`)
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const avatarUrl = publicUrlData?.publicUrl
      if (!avatarUrl) {
        throw new Error('Unable to resolve public URL for uploaded avatar')
      }

      // Update profile state with new avatar URL
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null)
      setSuccessMsg('Avatar uploaded successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar'
      setErrorMsg(errorMessage)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Fetch profile data
  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setProfile(data)
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          name: user.email?.split('@')[0] || '',
          avatar_url: null,
          contact_info: null,
          location: null
        }
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile)
        
        if (insertError) throw insertError
        
        setProfile(newProfile)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile'
      setErrorMsg(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile(prev => {
      if (!prev) {
        // If no profile exists yet, create a basic one
        return {
          id: user?.id || '',
          name: '',
          avatar_url: null,
          contact_info: '',
          location: ''
        }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleSave = async () => {
    if (!profile || !user) return

    setIsSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profile.name,
          avatar_url: profile.avatar_url,
          contact_info: profile.contact_info,
          location: profile.location
        })

      if (error) throw error

      setSuccessMsg('Profile updated successfully! Redirecting to home...')
      
      // Try multiple redirect approaches
      try {
        console.log('Attempting to redirect to home...')
        router.push('/')
        console.log('Router.push called successfully')
        
        // Fallback: force navigation after a short delay
        setTimeout(() => {
          console.log('Fallback redirect attempt...')
          window.location.href = '/'
        }, 1000)
      } catch (redirectError) {
        console.error('Router redirect failed:', redirectError)
        // Fallback to window.location
        window.location.href = '/'
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setErrorMsg(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // Edit field functions
  const startEditing = (field: string) => {
    setEditingField(field)
    setEditValues({ [field]: profile?.[field as keyof ProfileData] || '' })
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditValues({})
  }

  const saveFieldEdit = async (field: string) => {
    if (!profile || !user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: editValues[field as keyof ProfileData] })
        .eq('id', user.id)

      if (error) throw error

      // Update local state
      setProfile(prev => prev ? { ...prev, [field]: editValues[field as keyof ProfileData] } : null)
      setEditingField(null)
      setEditValues({})
      setSuccessMsg(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`)
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : `Failed to update ${field}`
      setErrorMsg(errorMessage)
    }
  }

  const renderEditableField = (field: string, label: string, placeholder: string) => {
    const isEditing = editingField === field
    const value = profile?.[field as keyof ProfileData] || ''

    return (
      <div className='flex items-center justify-between'>
        <Label htmlFor={field} className='text-sm font-medium text-gray-700 min-w-20'>
          {label}
        </Label>
        
        <div className='flex-1 ml-4 flex items-center space-x-2'>
          {isEditing ? (
            <>
              <Input
                id={field}
                name={field}
                value={editValues[field as keyof ProfileData] || ''}
                onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                placeholder={placeholder}
                className='flex-1'
              />
              <Button
                size='sm'
                onClick={() => saveFieldEdit(field)}
                className='bg-green-600 hover:bg-green-700'
              >
                <Save className='w-4 h-4' />
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={cancelEditing}
              >
                <X className='w-4 h-4' />
              </Button>
            </>
          ) : (
            <>
              <span className='text-gray-900 flex-1'>
                {value || 'Not set'}
              </span>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => startEditing(field)}
                className='text-gray-400 hover:text-gray-600'
              >
                <Edit2 className='w-4 h-4' />
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />
      
      <main className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Profile</h1>
          <p className='text-gray-600'>Manage your profile information</p>
          {errorMsg && (
            <p className='text-red-600 mt-3'>{errorMsg}</p>
          )}
          {successMsg && (
            <p className='text-green-600 mt-3'>{successMsg}</p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              <div>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  value={user.email || ''}
                  disabled
                  className='bg-gray-50'
                />
                <p className='text-sm text-gray-500 mt-1'>Email cannot be changed</p>
              </div>

              {renderEditableField('name', 'Name', 'Enter your name')}
              {renderEditableField('contact_info', 'Contact Info', 'Phone number or other contact details')}
              {renderEditableField('location', 'Location', 'City or Campus')}

              <div>
                <Label htmlFor='avatar_url'>Avatar</Label>
                <div className='space-y-3'>
                  {profile?.avatar_url && (
                    <div className='flex items-center space-x-3'>
                      <img 
                        src={profile.avatar_url} 
                        alt='Avatar' 
                        className='w-16 h-16 rounded-full object-cover border-2 border-gray-200'
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setProfile(prev => prev ? { ...prev, avatar_url: null } : null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  <Input
                    id='avatar_file'
                    name='avatar_file'
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      if (file) {
                        handleAvatarUpload(file)
                      }
                    }}
                    placeholder='Upload avatar image'
                    disabled={isUploadingAvatar || isSaving}
                  />
                  {isUploadingAvatar && (
                    <p className='text-sm text-blue-600'>Uploading avatar...</p>
                  )}
                  <p className='text-sm text-gray-500'>Upload a profile picture from your device</p>
                </div>
              </div>

              <div className='flex gap-4 pt-4'>
                <Button 
                  onClick={handleSave} 
                  className='flex-1' 
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button 
                  type='button' 
                  variant='outline' 
                  onClick={() => router.push('/')}
                  className='flex-1'
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
