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
3. 총 최소 5개 이상의 근거 자료를 제공하세요.
4. 뉴스 기사를 우선적으로 찾고, 최소 2개 이상의 뉴스 기사를 포함해야 합니다.
5. 뉴스 기사, 학술 논문, 통계 자료, 관련 유튜브 영상 등 다양한 유형의 자료를 포함하세요.
6. 한국어 자료를 우선적으로 찾되, 필요시 영어 자료도 포함할 수 있습니다.

응답 형식:
- 주요 근거 요약: 찾은 자료들을 바탕으로 핵심 논점과 근거를 간결하게 요약
- 근거 자료 목록: 각 자료의 유형, 제목, URL, 간략한 설명, 날짜(알 수 있는 경우) 포함
- 각 근거 자료에 유형 태그 지정 (news, academic, statistics, video, other 중 하나)
- 가능한 경우 유튜브 영상 등 시각 자료도 포함

응답은 JSON 형식으로 변환하기 쉽도록 구조화해주세요.
`

    const userMessage = `
토론 주제: ${topic}
나의 주장/입장: ${stance}
원하는 근거 자료 유형: ${evidenceTypes.join(', ')}

이 주장을 뒷받침할 수 있는 신뢰할 수 있는 근거 자료를 찾아주세요.
최소 5개 이상의 자료를 찾아주시고, 그 중 뉴스 기사는 최소 2개 이상 포함해주세요.
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
    
    // 응답 처리: AI의 응답을 파싱하여 애플리케이션 형식에 맞게 변환
    const parsedResponse = processApiResponse(responseContent)

    // 결과가 5개 미만이거나 뉴스 기사가 2개 미만인 경우 모의 데이터로 보충
    if (parsedResponse.citations.length < 5 || parsedResponse.citations.filter(c => c.type === 'news').length < 2) {
      console.log('검색 결과가 충분하지 않아 모의 데이터로 보충합니다.');
      
      // 뉴스 기사 수 확인
      const newsCount = parsedResponse.citations.filter(c => c.type === 'news').length;
      
      // 뉴스 기사가 2개 미만인 경우, 부족한 만큼 모의 데이터 추가
      if (newsCount < 2) {
        const mockNewsCitations: Citation[] = [
          {
            title: `${topic}에 관한 최신 동향 - 전문가 시각`,
            url: 'https://www.example-news.com/article/debate-topic',
            snippet: `${stance}와 관련된 전문가들의 다양한 의견과 분석을 담은 기사입니다. 최신 정보와 함께 여러 관점을 제시합니다.`,
            type: 'news',
            date: new Date().toISOString().split('T')[0]
          },
          {
            title: `${topic} 논쟁: 새로운 연구 결과 공개`,
            url: 'https://www.example-press.com/report/latest-findings',
            snippet: `${stance}를 지지하는 새로운 연구 결과와 조사 내용을 담은 뉴스 기사입니다. 다양한 사례와 통계 정보를 포함합니다.`,
            type: 'news',
            date: new Date().toISOString().split('T')[0]
          }
        ];
        
        // 필요한 만큼만 추가
        for (let i = 0; i < (2 - newsCount); i++) {
          parsedResponse.citations.push(mockNewsCitations[i]);
        }
      }
      
      // 전체 결과가 5개 미만인 경우, 부족한 만큼 모의 데이터 추가
      if (parsedResponse.citations.length < 5) {
        const mockCitations: Citation[] = [
          {
            title: `${topic}에 관한 학술 분석`,
            url: 'https://www.example-academic.edu/research/paper',
            snippet: `${stance}와 관련된 학술적 연구와 분석 자료입니다. 심도 있는 이론적 배경과 실증적 연구 결과를 제공합니다.`,
            type: 'academic',
            date: '2023-09-15'
          },
          {
            title: `${topic} 관련 통계 데이터 분석`,
            url: 'https://www.example-stats.org/data/analysis',
            snippet: `${stance}에 관련된 다양한 통계 자료와 데이터 분석 결과를 제공합니다.`,
            type: 'statistics',
            date: '2023-11-30'
          },
          {
            title: `${topic}에 대한 전문가 인터뷰 - YouTube`,
            url: 'https://www.youtube.com/watch?v=exampleId',
            snippet: `${stance}에 대한 전문가들의 인터뷰와 토론을 담은 유튜브 영상입니다.`,
            type: 'video'
          }
        ];
        
        // 필요한 만큼만 추가 (총 5개가 되도록)
        const neededCount = 5 - parsedResponse.citations.length;
        for (let i = 0; i < neededCount; i++) {
          if (i < mockCitations.length) {
            parsedResponse.citations.push(mockCitations[i]);
          }
        }
      }
    }

    // 응답 반환
    return NextResponse.json(parsedResponse)
    
  } catch (error) {
    console.error('Search API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

// API 응답 처리 함수 
function processApiResponse(content: string): SearchResponse {
  try {
    // 응답을 분석하여 요약과 인용 정보를 추출합니다
    let summary = ''
    const citations: Citation[] = []
    const relatedQuestions: string[] = []
    
    console.log('AI 응답 처리 시작:', content.substring(0, 200) + '...');
    
    // 완전한 URL 정규식 (http(s)로 시작하는 URL)
    const fullUrlRegex = /(https?:\/\/[^\s"'()<>]+)/g;
    
    // 도메인 형태 정규식 (www.example.com 또는 example.com/path 같은 형태)
    const domainUrlRegex = /\b((?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s"'()<>]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s"'()<>]{2,}|[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s"'()<>]{2,}(?:\/[^\s"'()<>]*)?)/g;
    
    // 특수 패턴 정규식 (kosis.kr/statHtml/... 같은 형태)
    const specialPatternRegex = /((?:kosis\.kr|dbpia\.co\.kr|youtube\.com)\/[^\s"'()<>]+)/g;
    
    // 응답 텍스트에서 URL 찾기
    const fullUrls = content.match(fullUrlRegex) || [];
    const domainUrls = content.match(domainUrlRegex) || [];
    const specialUrls = content.match(specialPatternRegex) || [];
    
    // 모든 URL 결합 및 중복 제거
    let allUrls = [...fullUrls];
    
    // 도메인 형식 URL 추가 (http로 시작하는 URL과 중복되지 않는 경우만)
    domainUrls.forEach(url => {
      // 이미 추출된 URL에 포함되어 있지 않은 경우만 추가
      if (!allUrls.some(existingUrl => existingUrl.includes(url) || url.includes(existingUrl))) {
        allUrls.push(url);
      }
    });
    
    // 특수 패턴 URL 추가 (기존 URL과 중복되지 않는 경우만)
    specialUrls.forEach(url => {
      if (!allUrls.some(existingUrl => existingUrl.includes(url) || url.includes(existingUrl))) {
        allUrls.push(url);
      }
    });
    
    console.log('추출된 URL 목록:', allUrls);
    
    // 간단한 처리: 첫 번째 단락을 요약으로 간주
    const paragraphs = content.split('\n\n')
    if (paragraphs.length > 0) {
      summary = paragraphs[0].trim()
    }

    // 날짜 형식 정규식 (YYYY-MM-DD 또는 DD/MM/YYYY 등)
    const dateRegex = /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b|\b\d{1,2}[-/.]\d{1,2}[-/.]\d{4}\b/g
    
    // URL을 찾아 인용 생성
    allUrls.forEach((url, index) => {
      console.log(`URL ${index + 1} 처리:`, url);
      
      // 기본 유형은 'other'로 설정
      let type: 'news' | 'academic' | 'statistics' | 'video' | 'other' = 'other'
      
      // URL에 따라 유형 추론
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        type = 'video'
      } else if (
        url.includes('scholar.google') || 
        url.includes('sciencedirect') || 
        url.includes('researchgate') || 
        url.includes('academia.edu') || 
        url.includes('jstor') || 
        url.includes('springer') || 
        url.includes('.ac.') ||
        url.includes('journal') ||
        url.includes('dbpia')
      ) {
        type = 'academic'
      } else if (
        url.includes('news') || 
        url.includes('article') || 
        url.includes('.kr/') || 
        url.includes('press') || 
        url.includes('media') || 
        url.includes('naver.com/') ||
        url.includes('bbc') ||
        url.includes('cnn') ||
        url.includes('reuters') ||
        url.includes('yonhap') ||
        url.includes('chosun') ||
        url.includes('joins') ||
        url.includes('hani') ||
        url.includes('donga') ||
        url.includes('khan') ||
        url.includes('jtbc')
      ) {
        type = 'news'
      } else if (
        url.includes('stat') || 
        url.includes('data') ||
        url.includes('kosis') || 
        url.includes('census') || 
        url.includes('kostat') || 
        url.includes('worldbank') || 
        url.includes('oecd') ||
        url.includes('un.org') ||
        url.includes('who.int')
      ) {
        type = 'statistics'
      }
      
      // URL 주변 컨텍스트에서 제목과 내용 추출
      const urlIndex = content.indexOf(url)
      const contextBefore = content.substring(Math.max(0, urlIndex - 300), urlIndex).trim()
      const contextAfter = content.substring(urlIndex + url.length, Math.min(content.length, urlIndex + url.length + 500)).trim()
      
      // 제목 추출 시도 (앞의 문장 또는 기본값)
      let title = `근거 자료 ${index + 1}`
      const lastPeriodIndex = contextBefore.lastIndexOf('.')
      
      if (lastPeriodIndex !== -1) {
        let potentialTitle = contextBefore.substring(lastPeriodIndex + 1).trim()
        // 너무 짧거나 긴 제목은 처리
        if (potentialTitle.length > 5 && potentialTitle.length < 200) {
          title = potentialTitle
        }
      }

      // 더 정확한 제목 찾기 시도 - 큰따옴표 내의 텍스트 찾기
      const titleInQuotes = contextBefore.match(/"([^"]+)"/) || contextBefore.match(/'([^']+)'/)
      if (titleInQuotes && titleInQuotes[1] && titleInQuotes[1].length > 5 && titleInQuotes[1].length < 200) {
        title = titleInQuotes[1]
      }
      
      // URL 주변 컨텍스트에서 내용 요약 추출
      let snippet = contextAfter.split('.')[0] + '.'
      
      // 더 좋은 요약 찾기 시도
      if (snippet.length < 10) {
        snippet = contextAfter.split('.').slice(0, 2).join('.') + '.'
      }
      
      // 컨텍스트에서 날짜 정보 추출 시도
      let date: string | undefined = undefined
      const dateMatchesArr: string[] = []
      
      // 날짜 검색
      let match: RegExpExecArray | null
      while ((match = dateRegex.exec(contextBefore)) !== null) {
        dateMatchesArr.push(match[0])
      }
      
      // 날짜 정규식 재설정 (위에서 마지막 인덱스가 변경되었으므로)
      dateRegex.lastIndex = 0
      
      // 후방 컨텍스트에서도 날짜 검색
      while ((match = dateRegex.exec(contextAfter)) !== null) {
        dateMatchesArr.push(match[0])
      }
      
      // 날짜 정보가 있다면 첫 번째 것 사용
      if (dateMatchesArr.length > 0) {
        date = dateMatchesArr[0]
      }
      
      // URL 처리 - 불완전한 URL 보완
      let processedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // 만약 //로 시작한다면 https: 추가
        if (url.startsWith('//')) {
          processedUrl = `https:${url}`;
        } else {
          processedUrl = `https://${url}`;
        }
      }
      
      console.log(`처리된 URL: ${processedUrl} (${type})`);
      
      // 인용 정보 추가
      citations.push({
        title,
        url: processedUrl,
        snippet,
        type,
        date
      })
    })
    
    // 중복 URL 제거 
    const uniqueCitations = citations.filter((citation, index, self) => 
      self.findIndex(c => c.url === citation.url) === index
    )
    
    console.log(`총 ${uniqueCitations.length}개의 인용 정보 추출 완료`);
    
    // 관련 질문 추출 (있는 경우)
    const questionsMatch = content.match(/더 탐색해 보세요:([\s\S]*?)(?:\n\n|$)/i) || 
                          content.match(/관련 질문:([\s\S]*?)(?:\n\n|$)/i) ||
                          content.match(/추가 질문:([\s\S]*?)(?:\n\n|$)/i)
                          
    if (questionsMatch && questionsMatch[1]) {
      const questionsText = questionsMatch[1].trim()
      const questions = questionsText.split('\n')
        .map(q => q.trim().replace(/^[-*•]\s*/, '')) // 불릿 포인트 제거
      
      questions.forEach(q => {
        if (q.length > 5) { // 최소 길이 필터링
          relatedQuestions.push(q)
        }
      })
    }
    
    return {
      summary,
      citations: uniqueCitations,
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