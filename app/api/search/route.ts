import { NextResponse } from 'next/server'
import { SearchResponse, Citation } from '@/app/types'

// 퍼플렉시티 API URL과 모델 설정
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'
const PERPLEXITY_MODEL = 'sonar-pro'

// API 타입 정의
interface PerplexityRequestBody {
  model: string
  messages: {
    role: string
    content: string
  }[]
  temperature: number
}

// 요청 핸들러 함수
export async function POST(request: Request) {
  try {
    // 환경변수에서 API 키 가져오기
    const apiKey = process.env.PERPLEXITY_API_KEY
    
    // API 키가 없는 경우 에러 반환
    if (!apiKey) {
      console.error('Perplexity API 키가 설정되지 않았습니다.')
      return NextResponse.json(
        { error: 'API 키가 구성되지 않았습니다. 관리자에게 문의하세요.' }, 
        { status: 500 }
      )
    }
    
    // 요청 데이터 파싱
    const { topic, stance, selectedTypes } = await request.json()
    
    // 필수 데이터 확인
    if (!topic || !stance) {
      return NextResponse.json(
        { error: '토론 주제와 주장을 모두 입력해주세요.' },
        { status: 400 }
      )
    }
    
    // 선택된 근거 유형이 없는 경우 기본값 설정
    const evidenceTypes = selectedTypes?.length > 0 
      ? selectedTypes 
      : ['news', 'academic', 'statistics', 'video']
    
    // 프롬프트 구성
    const systemMessage = `
당신은 학생의 토론 준비를 돕는 AI 연구 보조원입니다. 
주어진 토론 주제와 학생의 주장/입장을 바탕으로 신뢰할 수 있는 근거 자료를 찾아 제공하세요.
각 근거 자료는 제목, URL, 요약 또는 핵심 내용, 가능한 경우 날짜 정보를 포함해야 합니다.
다음 근거 자료 유형에 집중하세요: ${evidenceTypes.join(', ')}

근거 자료를 찾을 때 다음 사항을 고려하세요:
1. 학생의 주장을 뒷받침하는 다양하고 신뢰할 수 있는 자료를 찾으세요.
2. 최신 정보를 우선으로 하되, 주제에 따라 역사적 맥락이 중요한 경우 관련 자료도 포함하세요.
3. 뉴스 기사, 학술 논문, 통계 자료, 관련 유튜브 영상 등 다양한 유형의 자료를 포함하세요.
4. 한국어 자료를 우선적으로 찾되, 필요시 영어 자료도 포함할 수 있습니다.

응답 형식:
- 주요 근거 요약: 찾은 자료들을 바탕으로 핵심 논점과 근거를 간결하게 요약
- 근거 자료 목록: 각 자료의 유형, 제목, URL, 간략한 설명 포함
- 각 근거 자료에 유형 태그 지정 (news, academic, statistics, video, other 중 하나)
- 가능한 경우 유튜브 영상 등 시각 자료도 포함

응답은 JSON 형식으로 변환하기 쉽도록 구조화해주세요.
`

    const userMessage = `
토론 주제: ${topic}
나의 주장/입장: ${stance}
원하는 근거 자료 유형: ${evidenceTypes.join(', ')}

이 주장을 뒷받침할 수 있는 신뢰할 수 있는 근거 자료를 찾아주세요.
`
    
    // API 요청 데이터 구성
    const requestBody: PerplexityRequestBody = {
      model: PERPLEXITY_MODEL,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3 // 낮은 temperature로 일관성 있는 결과 유도
    }
    
    // 퍼플렉시티 API 호출
    const perplexityResponse = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })
    
    // API 응답 확인
    if (!perplexityResponse.ok) {
      const errorData = await perplexityResponse.json()
      console.error('Perplexity API 오류:', errorData)
      
      // 오류 응답 반환
      return NextResponse.json(
        { error: '검색 중 오류가 발생했습니다. 다시 시도해주세요.' },
        { status: perplexityResponse.status }
      )
    }
    
    // API 응답 데이터 처리
    const apiResponseData = await perplexityResponse.json()
    const responseContent = apiResponseData.choices[0]?.message?.content
    
    if (!responseContent) {
      return NextResponse.json(
        { error: '유효한 검색 결과를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    // 응답 처리: 여기서는 AI의 응답을 파싱하여 우리의 애플리케이션 형식에 맞게 변환합니다
    // 이 부분은 실제 API 응답 구조에 따라 조정 필요
    
    // 샘플 응답 구조 (실제 퍼플렉시티 API 구현 시 이 부분을 API 응답에 맞게 수정)
    const mockResponse: SearchResponse = processApiResponse(responseContent)
    
    return NextResponse.json(mockResponse)
    
  } catch (error) {
    console.error('Search API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

// API 응답 처리 함수 - 실제 API 응답 형식에 맞게 수정 필요
function processApiResponse(content: string): SearchResponse {
  try {
    // 응답을 분석하여 요약과 인용 정보를 추출합니다
    // 현재는 간단하게 텍스트에서 추출하는 방식이지만
    // 실제로는 퍼플렉시티 API의 구체적인 응답 구조를 분석해야 합니다
    
    let summary = ''
    const citations: Citation[] = []
    const relatedQuestions: string[] = []
    
    // 텍스트에서 URL 추출 정규식
    const urlRegex = /(https?:\/\/[^\s]+)/g
    
    // 응답 텍스트에서 URL 찾기
    const urls = content.match(urlRegex) || []
    
    // 간단한 처리: 첫 번째 단락을 요약으로 간주
    const paragraphs = content.split('\n\n')
    if (paragraphs.length > 0) {
      summary = paragraphs[0].trim()
    }
    
    // URL을 찾아 인용 생성
    urls.forEach((url, index) => {
      // URL이 어떤 유형인지 결정
      let type: 'news' | 'academic' | 'statistics' | 'video' | 'other' = 'other'
      
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        type = 'video'
      } else if (url.includes('scholar.google') || url.includes('sciencedirect') || url.includes('researchgate')) {
        type = 'academic'
      } else if (url.includes('news') || url.includes('article') || url.includes('.kr/')) {
        type = 'news'
      }
      
      // URL 주변 컨텍스트에서 제목 추출 시도
      const urlIndex = content.indexOf(url)
      const contextBefore = content.substring(Math.max(0, urlIndex - 200), urlIndex)
      
      // 제목 추출 추정 (가장 가까운 문장 또는 기본값)
      let title = `근거 자료 ${index + 1}`
      const lastPeriodIndex = contextBefore.lastIndexOf('.')
      
      if (lastPeriodIndex !== -1) {
        title = contextBefore.substring(lastPeriodIndex + 1).trim()
      }
      
      // URL 주변 컨텍스트에서 요약 추출 시도
      const contextAfter = content.substring(urlIndex + url.length, Math.min(content.length, urlIndex + url.length + 300))
      const snippet = contextAfter.split('.')[0] + '.'
      
      citations.push({
        title,
        url,
        snippet,
        type
      })
    })
    
    // 관련 질문 추출 (있는 경우)
    const questionsMatch = content.match(/더 탐색해 보세요:([\s\S]*?)(?:\n\n|$)/i)
    if (questionsMatch && questionsMatch[1]) {
      const questionsText = questionsMatch[1].trim()
      const questions = questionsText.split('\n').map(q => q.trim().replace(/^-\s*/, ''))
      
      questions.forEach(q => {
        if (q.length > 5) { // 최소 길이 필터링
          relatedQuestions.push(q)
        }
      })
    }
    
    return {
      summary,
      citations,
      relatedQuestions: relatedQuestions.length > 0 ? relatedQuestions : undefined
    }
  } catch (error) {
    console.error('API 응답 처리 오류:', error)
    
    // 오류 발생 시 기본 응답
    return {
      summary: '근거 자료 검색 결과를 처리하는 과정에서 오류가 발생했습니다.',
      citations: []
    }
  }
} 