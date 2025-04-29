'use client'

import React, { useState } from 'react'
import { FaNewspaper, FaGraduationCap, FaChartBar, FaYoutube, FaLink, FaExternalLinkAlt } from 'react-icons/fa'
import { SearchResponse, Citation } from '@/app/types'

interface SearchResultsProps {
  results: SearchResponse
}

export default function SearchResults({ results }: SearchResultsProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  
  // 아이콘 매핑
  const typeIcons = {
    news: <FaNewspaper className="text-blue-500" />,
    academic: <FaGraduationCap className="text-green-600" />,
    statistics: <FaChartBar className="text-purple-600" />,
    video: <FaYoutube className="text-red-600" />,
    other: <FaLink className="text-gray-500" />
  }
  
  // 자료 타입별로 필터링
  const filteredCitations = activeFilter 
    ? results.citations.filter(citation => citation.type === activeFilter)
    : results.citations
    
  // 결과가 비어있는지 확인
  const noResults = filteredCitations.length === 0
  
  // 자료 유형 별 개수
  const typeCount = {
    all: results.citations.length,
    news: results.citations.filter(c => c.type === 'news').length,
    academic: results.citations.filter(c => c.type === 'academic').length,
    statistics: results.citations.filter(c => c.type === 'statistics').length,
    video: results.citations.filter(c => c.type === 'video').length,
    other: results.citations.filter(c => c.type === 'other').length
  }
  
  // 유튜브 URL인지 확인
  const isYoutubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be')
  }
  
  // 유튜브 썸네일 URL 생성
  const getYoutubeThumbnail = (url: string) => {
    let videoId = ''
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]
    }
    
    // URL 파라미터 제거
    if (videoId.includes('&')) {
      videoId = videoId.split('&')[0]
    }
    
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">검색 결과</h2>
      
      {/* 요약 정보 */}
      <div className="mb-6 p-4 bg-secondary-light rounded-lg">
        <h3 className="font-bold mb-2">AI 요약</h3>
        <p className="text-gray-700 whitespace-pre-line">{results.summary}</p>
      </div>
      
      {/* 필터 버튼 */}
      <div className="mb-6">
        <h3 className="font-bold mb-3">근거 자료 {results.citations.length}개</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-3 py-1 text-sm rounded-full ${activeFilter === null ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveFilter(null)}
          >
            전체 ({typeCount.all})
          </button>
          
          {typeCount.news > 0 && (
            <button 
              className={`px-3 py-1 text-sm rounded-full flex items-center ${activeFilter === 'news' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('news')}
            >
              <FaNewspaper className="mr-1" /> 뉴스 ({typeCount.news})
            </button>
          )}
          
          {typeCount.academic > 0 && (
            <button 
              className={`px-3 py-1 text-sm rounded-full flex items-center ${activeFilter === 'academic' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('academic')}
            >
              <FaGraduationCap className="mr-1" /> 학술 ({typeCount.academic})
            </button>
          )}
          
          {typeCount.statistics > 0 && (
            <button 
              className={`px-3 py-1 text-sm rounded-full flex items-center ${activeFilter === 'statistics' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('statistics')}
            >
              <FaChartBar className="mr-1" /> 통계 ({typeCount.statistics})
            </button>
          )}
          
          {typeCount.video > 0 && (
            <button 
              className={`px-3 py-1 text-sm rounded-full flex items-center ${activeFilter === 'video' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('video')}
            >
              <FaYoutube className="mr-1" /> 영상 ({typeCount.video})
            </button>
          )}
        </div>
      </div>
      
      {/* 검색 결과 목록 */}
      {noResults ? (
        <div className="text-center py-8 text-gray-500">
          {activeFilter ? `'${activeFilter}' 유형의 근거 자료를 찾을 수 없습니다.` : '근거 자료를 찾을 수 없습니다.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCitations.map((citation, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  {typeIcons[citation.type] || typeIcons.other}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 line-clamp-2">
                    <a 
                      href={citation.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      {citation.title}
                    </a>
                  </h3>
                  
                  {citation.snippet && (
                    <p className="text-gray-700 mb-3 line-clamp-3">{citation.snippet}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <a 
                        href={citation.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark text-sm flex items-center"
                      >
                        {new URL(citation.url).hostname.replace('www.', '')}
                        <FaExternalLinkAlt className="ml-1 text-xs" />
                      </a>
                      {citation.date && (
                        <span className="text-gray-500 text-xs ml-2">{citation.date}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 유튜브 영상 썸네일 */}
              {citation.type === 'video' && isYoutubeUrl(citation.url) && getYoutubeThumbnail(citation.url) && (
                <div className="mt-3">
                  <a 
                    href={citation.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative">
                      <img 
                        src={getYoutubeThumbnail(citation.url) || ''} 
                        alt={citation.title} 
                        className="w-full h-auto rounded-md"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 text-white rounded-full p-3 opacity-90">
                          <FaYoutube className="text-xl" />
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* 관련 질문 */}
      {results.relatedQuestions && results.relatedQuestions.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold mb-3">더 탐색해 보세요:</h3>
          <div className="flex flex-wrap gap-2">
            {results.relatedQuestions.map((question, index) => (
              <div key={index} className="bg-secondary p-3 rounded-lg text-sm text-gray-700 hover:bg-secondary-dark cursor-pointer">
                {question}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}