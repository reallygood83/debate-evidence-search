export interface Citation {
  title: string;
  url: string;
  snippet?: string;
  date?: string;
  type: 'news' | 'academic' | 'statistics' | 'video' | 'other';
}

export interface SearchResponse {
  summary: string;
  citations: Citation[];
  relatedQuestions?: string[];
} 