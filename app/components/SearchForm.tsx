'use client'

import React, { useState } from 'react'
import { FaSearch } from 'react-icons/fa'

interface SearchFormProps {
  onSearch: (topic: string, stance: string, selectedTypes: string[]) => void
  isLoading: boolean
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [topic, setTopic] = useState('')
  const [stance, setStance] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['news', 'academic', 'statistics', 'video'])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || !stance.trim()) return
    onSearch(topic, stance, selectedTypes)
  }

  const handleTypeChange = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type))
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  const handleSelectAll = () => {
    setSelectedTypes(['news', 'academic', 'statistics', 'video'])
  }

  const handleDeselectAll = () => {
    setSelectedTypes([])
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="topic" className="block text-gray-700 font-medium mb-2">
            토론 주제
          </label>
          <input
            type="text"
            id="topic"
            className="input-field"
            placeholder="예: 인공지능(AI) 발전은 인류에게 위협인가, 기회인가?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="stance" className="block text-gray-700 font-medium mb-2">
            나의 주장/입장
          </label>
          <textarea
            id="stance"
            className="input-field min-h-[120px]"
            placeholder="자신의 주장이나 궁금한 점을 구체적으로 입력하세요. 예: AI 발전은 일자리 감소, 통제 불능 등 심각한 위협을 초래할 수 있다고 생각합니다. 이를 뒷받침할 근거를 찾아주세요."
            value={stance}
            onChange={(e) => setStance(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            원하는 근거 자료 유형 (선택)
          </label>
          <div className="flex flex-wrap gap-3">
            <button 
              type="button" 
              className="text-xs bg-secondary py-1 px-3 rounded text-gray-600 hover:bg-secondary-dark"
              onClick={handleSelectAll}
              disabled={isLoading}
            >
              전체 선택
            </button>
            <button 
              type="button" 
              className="text-xs bg-secondary py-1 px-3 rounded text-gray-600 hover:bg-secondary-dark"
              onClick={handleDeselectAll}
              disabled={isLoading}
            >
              전체 해제
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-primary"
                checked={selectedTypes.includes('news')}
                onChange={() => handleTypeChange('news')}
                disabled={isLoading}
              />
              <span className="ml-2">뉴스 기사</span>
            </label>
            
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-primary"
                checked={selectedTypes.includes('academic')}
                onChange={() => handleTypeChange('academic')}
                disabled={isLoading}
              />
              <span className="ml-2">학술 자료</span>
            </label>
            
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-primary"
                checked={selectedTypes.includes('statistics')}
                onChange={() => handleTypeChange('statistics')}
                disabled={isLoading}
              />
              <span className="ml-2">통계 자료</span>
            </label>
            
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-primary"
                checked={selectedTypes.includes('video')}
                onChange={() => handleTypeChange('video')}
                disabled={isLoading}
              />
              <span className="ml-2">유튜브 영상</span>
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full btn-primary flex items-center justify-center"
          disabled={isLoading || !topic.trim() || !stance.trim() || selectedTypes.length === 0}
        >
          {isLoading ? (
            <span className="inline-block animate-pulse">근거 자료 검색 중...</span>
          ) : (
            <>
              <FaSearch className="mr-2" />
              근거 자료 검색하기
            </>
          )}
        </button>
      </form>
    </div>
  )
} 