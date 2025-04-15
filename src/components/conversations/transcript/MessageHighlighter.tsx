
import React from 'react';

interface HighlightInfo {
  type: string;
  text: string;
  confidence: number;
}

interface MessageHighlighterProps {
  text: string;
  searchQuery: string;
  highlights?: HighlightInfo[];
}

export const MessageHighlighter = ({ text, searchQuery, highlights }: MessageHighlighterProps) => {
  // Function to highlight search matches
  const highlightSearchMatches = (content: string | React.ReactNode) => {
    if (typeof content !== 'string' || searchQuery.trim() === '') return content;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = content.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} className="bg-yellow-200 text-black">{part}</span> : part
    );
  };
  
  // Function to highlight extracted information
  const highlightExtractedInfo = () => {
    if (!highlights || highlights.length === 0) return highlightSearchMatches(text);
    
    const highlightStyles: Record<string, string> = {
      interest: 'bg-blue-100 text-blue-800',
      mortgage_info: 'bg-purple-100 text-purple-800',
      property_value: 'bg-green-100 text-green-800',
      purchase_info: 'bg-teal-100 text-teal-800',
      refinance_goal: 'bg-indigo-100 text-indigo-800',
      location: 'bg-pink-100 text-pink-800',
      timeline: 'bg-orange-100 text-orange-800',
      credit_score: 'bg-lime-100 text-lime-800',
      debt: 'bg-amber-100 text-amber-800',
      contact_preference: 'bg-cyan-100 text-cyan-800',
      availability: 'bg-violet-100 text-violet-800',
    };
    
    // Sort highlights by their position in the text (to avoid overlap issues)
    const sortedHighlights = [...highlights].sort((a, b) => 
      text.indexOf(a.text) - text.indexOf(b.text)
    );
    
    // Split text into parts to highlight
    let parts: Array<{ text: string; highlight?: { type: string; confidence: number } }> = [{ text }];
    
    // Apply each highlight
    sortedHighlights.forEach(highlight => {
      const newParts: typeof parts = [];
      
      parts.forEach(part => {
        if (!part.highlight) {
          const index = part.text.indexOf(highlight.text);
          if (index !== -1) {
            // Text before the highlight
            if (index > 0) {
              newParts.push({ text: part.text.substring(0, index) });
            }
            
            // The highlighted part
            newParts.push({ 
              text: highlight.text, 
              highlight: { type: highlight.type, confidence: highlight.confidence } 
            });
            
            // Text after the highlight
            if (index + highlight.text.length < part.text.length) {
              newParts.push({ text: part.text.substring(index + highlight.text.length) });
            }
          } else {
            newParts.push(part);
          }
        } else {
          newParts.push(part);
        }
      });
      
      parts = newParts;
    });
    
    // Render each part with appropriate styling
    return parts.map((part, index) => {
      if (part.highlight) {
        const style = highlightStyles[part.highlight.type] || 'bg-gray-100 text-gray-800';
        return (
          <span 
            key={index} 
            className={`${style} rounded px-1 relative group cursor-help`}
            title={`${part.highlight.type.replace('_', ' ')} (${Math.round(part.highlight.confidence * 100)}% confidence)`}
          >
            {highlightSearchMatches(part.text)}
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
              {part.highlight.type.replace('_', ' ')} ({Math.round(part.highlight.confidence * 100)}%)
            </span>
          </span>
        );
      }
      return <span key={index}>{highlightSearchMatches(part.text)}</span>;
    });
  };

  return <>{highlightExtractedInfo()}</>;
};
