import React from 'react'

export default function Header() {
  return (
    <header className="text-center py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
        토론 메이트: <span className="text-primary">토론 근거 자료 검색</span>
      </h1>
      <p className="mt-3 text-lg text-gray-600">
        토론 주제와 자신의 주장을 입력하면, 관련성 높은 근거 자료를 찾아드립니다.
      </p>
    </header>
  )
} 