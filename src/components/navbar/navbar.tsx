'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useSearch } from '@/lib/contexts/search-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, User, LogOut, ChevronDown, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { SearchSuggestions } from './search-suggestions'

export function Navbar() {
  const { user, signOut } = useAuth()
  const { searchQuery, setSearchQuery, isSearching, setIsSearching } = useSearch()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()
        
        if (!error && data?.avatar_url) {
          setProfileImage(data.avatar_url)
        }
      } catch (error) {
        console.log('No profile image found')
      }
    }

    fetchProfileImage()
  }, [user])

  if (!user) return null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setIsSearchFocused(false)
    // Search is handled in real-time, so we just prevent form submission
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    setIsSearching(query.length > 0)
  }

  const handleSearchFocus = () => {
    setIsSearchFocused(true)
  }

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setIsSearchFocused(false), 200)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setIsSearching(true)
    setIsSearchFocused(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setIsProfileOpen(false)
  }

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3" aria-label="Go to home">
              <div className="relative w-10 h-10">
                {/* Shopping Bag Body - Teal */}
                <div className="absolute inset-0 bg-[#00A896] rounded-lg rounded-b-xl w-full h-full"></div>
                
                {/* Shopping Bag Handle - Charcoal */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-3 border-2 border-[#2D2D2D] border-b-0 rounded-t-full"></div>
                
                {/* Letter C - White */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
              </div>
              <span className="text-xl font-semibold text-[#2D2D2D] hidden sm:block">Collex</span>
            </Link>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-2xl mx-4 sm:mx-8 relative">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search collections, items..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="pl-10 pr-4 py-2 w-full bg-background border-border rounded-full focus:ring-2 focus:ring-[--ring] focus:border-transparent transition-all duration-200 hover:bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setIsSearching(false)
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
            
            {/* Search Suggestions */}
            <SearchSuggestions 
              isVisible={isSearchFocused}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>

          {/* Profile Section - Right */}
          <div className="flex items-center space-x-3">
            {/* Profile Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-[color:var(--accent)]/20 transition-colors duration-200"
              >
                {profileImage ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-border">
                    <Image
                      src={profileImage}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[--primary]">
                    <User className="w-4 h-4 text-[--primary-foreground]" />
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-foreground/80">
                  {user.email?.split('@')[0]}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </Button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background rounded-xl shadow-lg border border-border backdrop-blur-sm py-2 z-50">
                  {/* Profile Header */}
                  <div className="px-4 py-3 border-b border-border/60">
                    <p className="text-sm font-medium text-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">IIITDMJ Student</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm text-foreground hover:bg-[color:var(--accent)]/20 rounded-lg mx-2"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Link href="/profile">
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                    </Button>
                    
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-sm text-foreground hover:bg-[color:var(--accent)]/20 rounded-lg mx-2"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Link href="/my-listings">
                        <Package className="w-4 h-4 mr-3" />
                        My Listings
                      </Link>
                    </Button>
                  </div>

                  {/* Logout Section */}
                  <div className="border-t border-border/60 pt-1">
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mx-2"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
