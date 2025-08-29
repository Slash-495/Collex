'use client'

import { useState, useEffect } from 'react'
import { Search, Clock, TrendingUp } from 'lucide-react'
import { useSearch } from '@/lib/contexts/search-context'
import { supabase } from '@/lib/supabase'

interface SearchSuggestionsProps {
  isVisible: boolean
  onSuggestionClick: (suggestion: string) => void
}

export function SearchSuggestions({ isVisible, onSuggestionClick }: SearchSuggestionsProps) {
  const { searchQuery } = useSearch()
  const [popularCategories, setPopularCategories] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    const fetchPopularCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('category')
          .not('category', 'is', null)
        
        if (!error && data) {
          const categoryCounts = data.reduce((acc: Record<string, number>, item) => {
            if (item.category) {
              acc[item.category] = (acc[item.category] || 0) + 1
            }
            return acc
          }, {})
          
          const sortedCategories = Object.entries(categoryCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([category]) => category)
          
          setPopularCategories(sortedCategories)
        }
      } catch (error) {
        console.log('Failed to fetch popular categories')
      }
    }

    fetchPopularCategories()
  }, [])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch {
        setRecentSearches([])
      }
    }
  }, [])

  const addToRecentSearches = (search: string) => {
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSuggestionClick = (suggestion: string) => {
    addToRecentSearches(suggestion)
    onSuggestionClick(suggestion)
  }

  if (!isVisible || (!searchQuery && popularCategories.length === 0 && recentSearches.length === 0)) {
    return null
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200/60 backdrop-blur-sm py-3 z-50">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="px-4 py-2">
          <div className="flex items-center text-xs font-medium text-gray-500 mb-2">
            <Clock className="w-3 h-3 mr-2" />
            Recent Searches
          </div>
          <div className="space-y-1">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(search)}
                className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Categories */}
      {popularCategories.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex items-center text-xs font-medium text-gray-500 mb-2">
            <TrendingUp className="w-3 h-3 mr-2" />
            Popular Categories
          </div>
          <div className="flex flex-wrap gap-2">
            {popularCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(category)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Query Suggestions */}
      {searchQuery && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex items-center text-xs font-medium text-gray-500 mb-2">
            <Search className="w-3 h-3 mr-2" />
            Search Suggestions
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleSuggestionClick(searchQuery)}
              className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              Search for "{searchQuery}"
            </button>
            {popularCategories.filter(cat => 
              cat.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((category, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(category)}
                className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
