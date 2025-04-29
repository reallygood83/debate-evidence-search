'use client'

import React, { useState, useRef } from 'react'
import { 
  FaNewspaper, 
  FaGraduationCap, 
  FaChartBar, 
  FaYoutube, 
  FaLink, 
  FaExternalLinkAlt, 
  FaCopy, 
  FaCheck,
  FaBookmark,
  FaRegBookmark
} from 'react-icons/fa'
import { SearchResponse, Citation } from '@/app/types'

interface SearchResultsProps {
  results: SearchResponse
}

export default function SearchResults({ results }: SearchResultsProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([])
  
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
  
  // URL을 완전한 형태로 보정하는 함수
  const getCompleteUrl = (url: string): string => {
    if (!url) return '';
    
    console.log('원본 URL:', url);
    
    // URL이 이미 http:// 또는 https://로 시작하는 경우
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('완전한 URL 반환:', url);
      return url;
    }
    
    // 절대 URL 경로인지 확인 (/로 시작하는 경우)
    if (url.startsWith('/')) {
      // 첫 번째 슬래시 다음에 두 번째 슬래시가 있는지 확인 (//example.com 형태)
      if (url.startsWith('//')) {
        const completeUrl = `https:${url}`;
        console.log('//로 시작하는 URL 보정:', completeUrl);
        return completeUrl;
      }
    }
    
    // 특정 도메인 케이스 처리
    if (url.includes('dbpia.co.kr') || url.includes('kosis.kr') || url.includes('youtube.com')) {
      const completeUrl = `https://${url}`;
      console.log('특정 도메인 URL 보정:', completeUrl);
      return completeUrl;
    }
    
    // URL에 쿼리 파라미터나 경로가 포함되는지 확인
    if (url.includes('?') || url.includes('/')) {
      // 도메인 추출 시도
      const domainPart = url.split('/')[0];
      if (domainPart.includes('.')) {
        const completeUrl = `https://${url}`;
        console.log('경로 포함 URL 보정:', completeUrl);
        return completeUrl;
      }
    }
    
    // 도메인만 있는 경우 (예: example.com)
    if (url.includes('.') && !url.startsWith('www.')) {
      const completeUrl = `https://${url}`;
      console.log('도메인만 있는 URL 보정:', completeUrl);
      return completeUrl;
    }
    
    // www.로 시작하는 경우
    if (url.startsWith('www.')) {
      const completeUrl = `https://${url}`;
      console.log('www로 시작하는 URL 보정:', completeUrl);
      return completeUrl;
    }
    
    // 상대 경로인 경우 또는 기타 케이스
    const completeUrl = `https://${url}`;
    console.log('기타 URL 보정:', completeUrl);
    return completeUrl;
  }
  
  // URL 복사 함수
  const handleCopyUrl = (url: string) => {
    const completeUrl = getCompleteUrl(url);
    navigator.clipboard.writeText(completeUrl).then(() => {
      setCopiedUrl(url);
      // 3초 후 복사 상태 초기화
      setTimeout(() => {
        setCopiedUrl(null);
      }, 3000);
    });
  };

  // 북마크 토글 함수
  const toggleBookmark = (url: string) => {
    if (bookmarkedItems.includes(url)) {
      setBookmarkedItems(bookmarkedItems.filter(item => item !== url));
    } else {
      setBookmarkedItems([...bookmarkedItems, url]);
    }
  };
  
  // 유튜브 URL인지 확인
  const isYoutubeUrl = (url: string) => {
    const completeUrl = getCompleteUrl(url);
    return completeUrl.includes('youtube.com') || completeUrl.includes('youtu.be');
  }
  
  // 유튜브 썸네일 URL 생성
  const getYoutubeThumbnail = (url: string) => {
    const completeUrl = getCompleteUrl(url);
    let videoId = '';
    
    if (completeUrl.includes('youtube.com/watch?v=')) {
      videoId = completeUrl.split('v=')[1];
    } else if (completeUrl.includes('youtu.be/')) {
      videoId = completeUrl.split('youtu.be/')[1];
    }
    
    // URL 파라미터 제거
    if (videoId && videoId.includes('&')) {
      videoId = videoId.split('&')[0];
    }
    
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  }

  // URL 형식 간소화 (표시용)
  const formatUrlForDisplay = (url: string) => {
    try {
      // 먼저 URL 보정
      const completeUrl = getCompleteUrl(url);
      console.log('표시용 변환 전 URL:', completeUrl);
      
      // 유효한 URL 객체로 변환
      const urlObj = new URL(completeUrl);
      let displayUrl = urlObj.hostname.replace('www.', '');
      
      // 전체 경로 표시 (생략하지 않음)
      if (urlObj.pathname !== '/') {
        displayUrl += urlObj.pathname;
      }
      
      // 쿼리 파라미터가 있는 경우 추가
      if (urlObj.search) {
        displayUrl += urlObj.search;
      }
      
      console.log('표시용 변환 후 URL:', displayUrl);
      return displayUrl;
    } catch (e) {
      console.error('URL 포맷 에러:', e, url);
      return url;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <span className="border-b-2 border-primary pb-1">검색 결과</span>
        <span className="ml-2 text-base font-normal text-gray-500">
          {results.citations.length}개의 근거 자료를 찾았습니다
        </span>
      </h2>
      
      {/* 요약 정보 */}
      <div className="mb-6 p-5 bg-secondary-light rounded-lg border border-secondary">
        <h3 className="font-bold mb-2 text-lg flex items-center">
          <span className="inline-block w-1 h-5 bg-primary mr-2"></span>
          AI 요약
        </h3>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{results.summary}</p>
      </div>
      
      {/* 필터 버튼 */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 text-lg flex items-center">
          <span className="inline-block w-1 h-5 bg-primary mr-2"></span>
          근거 자료 목록
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button 
            className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 ${activeFilter === null ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setActiveFilter(null)}
          >
            전체 ({typeCount.all})
          </button>
          
          {typeCount.news > 0 && (
            <button 
              className={`px-4 py-2 text-sm rounded-md flex items-center transition-colors duration-200 ${activeFilter === 'news' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('news')}
            >
              <FaNewspaper className="mr-1" /> 뉴스 ({typeCount.news})
            </button>
          )}
          
          {typeCount.academic > 0 && (
            <button 
              className={`px-4 py-2 text-sm rounded-md flex items-center transition-colors duration-200 ${activeFilter === 'academic' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('academic')}
            >
              <FaGraduationCap className="mr-1" /> 학술 ({typeCount.academic})
            </button>
          )}
          
          {typeCount.statistics > 0 && (
            <button 
              className={`px-4 py-2 text-sm rounded-md flex items-center transition-colors duration-200 ${activeFilter === 'statistics' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('statistics')}
            >
              <FaChartBar className="mr-1" /> 통계 ({typeCount.statistics})
            </button>
          )}
          
          {typeCount.video > 0 && (
            <button 
              className={`px-4 py-2 text-sm rounded-md flex items-center transition-colors duration-200 ${activeFilter === 'video' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('video')}
            >
              <FaYoutube className="mr-1" /> 영상 ({typeCount.video})
            </button>
          )}
        </div>
      </div>
      
      {/* 검색 결과 목록 */}
      {noResults ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          {activeFilter ? `'${activeFilter}' 유형의 근거 자료를 찾을 수 없습니다.` : '근거 자료를 찾을 수 없습니다.'}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredCitations.map((citation, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow duration-300 bg-white relative overflow-hidden"
            >
              {/* 자료 유형 표시 배지 */}
              <div className={`absolute top-0 right-0 ${
                citation.type === 'news' ? 'bg-blue-500' : 
                citation.type === 'academic' ? 'bg-green-600' : 
                citation.type === 'statistics' ? 'bg-purple-600' : 
                citation.type === 'video' ? 'bg-red-600' : 
                'bg-gray-500'
              } text-white text-xs font-bold px-3 py-1 rounded-bl-lg`}>
                {citation.type === 'news' ? '뉴스' : 
                 citation.type === 'academic' ? '학술' : 
                 citation.type === 'statistics' ? '통계' : 
                 citation.type === 'video' ? '영상' : '기타'}
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 mt-1 text-xl">
                  {typeIcons[citation.type] || typeIcons.other}
                </div>
                <div className="flex-1">
                  {/* 제목 */}
                  <h3 className="font-bold text-lg mb-2 pr-16 line-clamp-2">
                    <a 
                      href={getCompleteUrl(citation.url)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors duration-200"
                    >
                      {citation.title}
                    </a>
                  </h3>
                  
                  {/* 날짜 정보 */}
                  {citation.date && (
                    <div className="text-gray-500 text-xs mb-2 flex items-center">
                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      {citation.date}
                    </div>
                  )}
                  
                  {/* 요약 내용 */}
                  {citation.snippet && (
                    <p className="text-gray-700 mb-4 line-clamp-3 text-sm">{citation.snippet}</p>
                  )}
                  
                  {/* URL 및 액션 버튼 */}
                  <div className="flex items-center justify-between mt-3 border-t pt-3 border-gray-100">
                    <div className="flex flex-col space-y-1 text-sm">
                      <a 
                        href={getCompleteUrl(citation.url)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark flex items-center mr-2 underline"
                      >
                        {formatUrlForDisplay(citation.url)}
                        <FaExternalLinkAlt className="ml-1 text-xs" />
                      </a>
                      <div className="text-xs text-gray-500">원본: {citation.url}</div>
                      <div className="text-xs text-gray-500">변환: {getCompleteUrl(citation.url)}</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* 북마크 버튼 */}
                      <button 
                        onClick={() => toggleBookmark(citation.url)}
                        className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100 transition-colors"
                        title={bookmarkedItems.includes(citation.url) ? "북마크 해제" : "북마크 추가"}
                      >
                        {bookmarkedItems.includes(citation.url) ? 
                          <FaBookmark className="text-primary" /> : 
                          <FaRegBookmark />
                        }
                      </button>
                      
                      {/* 복사 버튼 */}
                      <button 
                        onClick={() => handleCopyUrl(citation.url)}
                        className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100 transition-colors"
                        title="URL 복사"
                      >
                        {copiedUrl === citation.url ? 
                          <FaCheck className="text-green-500" /> : 
                          <FaCopy />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 유튜브 영상 썸네일 */}
              {citation.type === 'video' && isYoutubeUrl(citation.url) && getYoutubeThumbnail(citation.url) && (
                <div className="mt-4">
                  <a 
                    href={getCompleteUrl(citation.url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative rounded-md overflow-hidden">
                      <img 
                        src={getYoutubeThumbnail(citation.url) || ''} 
                        alt={citation.title} 
                        className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 text-white rounded-full p-3 opacity-90 shadow-lg">
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
        <div className="mt-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-bold mb-3 text-lg flex items-center">
            <span className="inline-block w-1 h-5 bg-primary mr-2"></span>
            더 탐색해 보세요
          </h3>
          <div className="flex flex-wrap gap-3">
            {results.relatedQuestions.map((question, index) => (
              <div 
                key={index} 
                className="bg-white p-3 rounded-lg text-sm text-gray-700 hover:bg-secondary-light cursor-pointer border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {question}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 북마크된 항목들 */}
      {bookmarkedItems.length > 0 && (
        <div className="mt-8 p-5 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-bold mb-3 text-lg flex items-center">
            <FaBookmark className="text-primary mr-2" />
            북마크된 자료 ({bookmarkedItems.length}개)
          </h3>
          <div className="space-y-2">
            {bookmarkedItems.map((url, index) => {
              const citation = results.citations.find(c => c.url === url);
              if (!citation) return null;
              
              return (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <span className="mr-2">{typeIcons[citation.type]}</span>
                    <a 
                      href={getCompleteUrl(citation.url)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary truncate max-w-md"
                    >
                      {citation.title}
                    </a>
                  </div>
                  <button 
                    onClick={() => toggleBookmark(url)}
                    className="text-primary hover:text-red-500"
                    title="북마크 해제"
                  >
                    <FaBookmark />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}