'use client'

import React, { useState } from 'react'
import SearchForm from '@/app/components/SearchForm'
import SearchResults from '@/app/components/SearchResults'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { SearchResponse } from '@/app/types'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (topic: string, stance: string, selectedTypes: string[]) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, stance, selectedTypes }),
      })
      
      if (!response.ok) {
        throw new Error('검색에 실패했습니다. 다시 시도해주세요.')
      }
      
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Header />
      
      <div className="my-8">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">근거 자료를 검색 중입니다...</p>
        </div>
      )}
      
      {!isLoading && results && (
        <SearchResults results={results} />
      )}
      
      <Footer />
    </main>
  )
} 