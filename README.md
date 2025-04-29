# 토론 메이트: AI 근거 자료 검색

토론 주제와 자신의 주장을 입력하면 관련성 높은 근거 자료를 검색해주는 웹 애플리케이션입니다. Perplexity API를 활용하여 토론 준비에 필요한 다양한 자료(뉴스 기사, 학술 자료, 통계, 관련 영상 링크 등)를 효율적으로 찾을 수 있습니다.

## 주요 기능

- **토론 주제 및 주장 입력**: 사용자가 토론 주제와 자신의 주장/입장을 입력합니다.
- **자료 유형 선택**: 원하는 근거 자료 유형(뉴스, 학술, 통계, 영상 등)을 선택할 수 있습니다.
- **AI 검색**: Perplexity API를 활용하여 관련성 높은 근거 자료를 검색합니다.
- **결과 표시**: 검색된 근거 자료를 요약 정보 및 원문 출처 링크와 함께 명확하게 표시합니다.
- **자료 필터링**: 자료 유형별로 필터링하여 볼 수 있습니다.
- **유튜브 영상 통합**: 유튜브 영상 링크를 썸네일과 함께 표시합니다.

## 기술 스택

- **프론트엔드**: Next.js, React, TypeScript, Tailwind CSS
- **API**: Perplexity API (Sonar-pro 모델)
- **배포**: Vercel

## 설치 및 실행 방법

1. 저장소를 클론합니다:
   ```
   git clone https://github.com/yourusername/debate-evidence-search.git
   cd debate-evidence-search
   ```

2. 필요한 패키지를 설치합니다:
   ```
   npm install
   ```

3. `.env.local` 파일을 생성하고 Perplexity API 키를 설정합니다:
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   ```

4. 개발 서버를 실행합니다:
   ```
   npm run dev
   ```

5. 브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 사용합니다.

## API 키 발급 방법

1. [Perplexity](https://www.perplexity.ai/) 계정을 생성합니다.
2. API 섹션에서 API 키를 발급받습니다.
3. 발급받은 키를 `.env.local` 파일에 설정합니다.

## 사용 유의사항

- AI가 생성한 정보는 부정확하거나 편향될 수 있습니다. 반드시 원문 출처를 통해 내용을 직접 확인하고 비판적으로 검토하세요.
- 제시된 내용을 그대로 사용하는 것은 표절에 해당할 수 있으니, 올바른 인용 규칙을 준수해야 합니다.
- Perplexity API 사용량에 따라 비용이 발생할 수 있습니다. API 사용량을 모니터링하세요.

## 라이선스

MIT 라이선스 