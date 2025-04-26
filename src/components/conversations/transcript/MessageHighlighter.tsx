
import React from 'react';
import { highlightText } from '@/lib/textUtils';

interface MessageHighlighterProps {
  text: string;
  searchQuery: string;
  highlights?: { type: string; text: string; confidence: number }[];
}

export const MessageHighlighter: React.FC<MessageHighlighterProps> = ({ text, searchQuery, highlights = [] }) => {
  if (!searchQuery && (!highlights || highlights.length === 0)) {
    return <>{text}</>;
  }

  // First highlight search query if present
  let highlightedContent = text;
  if (searchQuery) {
    highlightedContent = highlightText(text, searchQuery, (match, index) => (
      <span key={`search-${index}`} className="bg-yellow-200 dark:bg-yellow-900 font-medium">
        {match}
      </span>
    ));
  }

  // Then apply content highlights if any
  if (highlights && highlights.length > 0) {
    // Convert the content to string if it's an array of React nodes
    const contentAsString = typeof highlightedContent === 'string' 
      ? highlightedContent 
      : Array.isArray(highlightedContent)
        ? highlightedContent.map(node => typeof node === 'string' ? node : '').join('')
        : '';
    
    highlightedContent = highlightText(contentAsString, highlights.map(h => h.text), (match, index) => {
      const highlight = highlights.find(h => h.text === match);
      if (!highlight) return match;

      return getHighlightSpan(match, highlight.type, index);
    });
  }

  return <>{highlightedContent}</>;
};

const getHighlightSpan = (text: string, type: string, index: number) => {
  const highlightStyles: Record<string, string> = {
    'important': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 font-medium',
    'refinance_goal': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 font-medium',
    'property_type': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 font-medium',
    'timeline': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 font-medium',
    'budget': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 font-medium',
    'contact': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 font-medium',
    'personal': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100 font-medium',
  };

  const style = highlightStyles[type.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';

  return (
    <span key={`highlight-${type}-${index}`} className={style} title={`Type: ${type}`}>
      {text}
    </span>
  );
};
