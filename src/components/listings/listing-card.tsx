'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User, MapPin, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearch } from '@/lib/contexts/search-context'

interface ListingCardProps {
  id: string
  title: string
  price: number
  image?: string
  sellerName: string
  location: string
  createdAt: string
  category: string
}

export function ListingCard({
  id,
  title,
  price,
  image,
  sellerName,
  location,
  createdAt,
  category
}: ListingCardProps) {
  const { searchQuery } = useSearch()

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

  // Function to highlight search matches
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  return (
    <Link href={`/listing/${id}`}>
      <Card className='group hover:shadow-lg transition-all duration-200 cursor-pointer bg-white'>
        <CardHeader className='p-0'>
          <div className='relative aspect-square overflow-hidden rounded-t-lg bg-gray-100'>
            {image ? (
              <Image
                src={image}
                alt={title}
                fill
                className='object-cover group-hover:scale-105 transition-transform duration-200'
              />
            ) : (
              <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                  <ImageIcon className='w-12 h-12 text-gray-400 mx-auto mb-2' />
                  <p className='text-sm text-gray-500'>No Image</p>
                </div>
              </div>
            )}
            <div className='absolute top-2 left-2'>
              <Badge variant='secondary' className='bg-white/90 text-gray-700'>
                {highlightText(category, searchQuery)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-4'>
          <h3 className='font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors'>
            {highlightText(title, searchQuery)}
          </h3>
          
          <div className='flex items-center justify-between mb-3'>
            <span className='text-xl font-bold text-blue-600'>
              {formatPrice(price)}
            </span>
            <div className='flex items-center text-sm text-gray-500'>
              <Clock className='w-4 h-4 mr-1' />
              {formatDate(createdAt)}
            </div>
          </div>
          
          <div className='flex items-center justify-between text-sm text-gray-600'>
            <div className='flex items-center'>
              <User className='w-4 h-4 mr-1' />
              {highlightText(sellerName, searchQuery)}
            </div>
            <div className='flex items-center'>
              <MapPin className='w-4 h-4 mr-1' />
              {highlightText(location, searchQuery)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
