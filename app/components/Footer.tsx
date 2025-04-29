import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
          <h3 className="font-bold mb-2">⚠️ 유의사항</h3>
          <p className="text-sm">
            AI가 생성한 정보는 부정확하거나 편향될 수 있습니다. 반드시 원문 출처를 통해 내용을 직접 확인하고 
            비판적으로 검토하세요. 제시된 내용을 그대로 사용하는 것은 표절에 해당할 수 있으니, 
            올바른 인용 규칙을 준수해야 합니다.
          </p>
        </div>
        <p className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} 토론 메이트: AI 근거 자료 검색 | 
          Powered by Perplexity API
        </p>
      </div>
    </footer>
  )
} 