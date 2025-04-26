type HighlightRenderer = (match: string, index: number) => React.ReactNode;

// Highlight function to avoid unnecessary React.Fragment creation
export const highlightText = (
  text: string, 
  query: string | string[], 
  renderHighlight: HighlightRenderer
): React.ReactNode[] => {
  if (!query || (Array.isArray(query) && query.length === 0)) {
    return [text];
  }

  const queries = Array.isArray(query) ? query : [query];
  const parts: React.ReactNode[] = [text];

  // Process each query term
  queries.forEach((term, queryIndex) => {
    if (!term) return;

    // For each part in the current result
    const newParts: React.ReactNode[] = [];
    
    parts.forEach((part) => {
      // Skip if this part is already a React element (from a previous highlight)
      if (typeof part !== 'string') {
        newParts.push(part);
        return;
      }

      // Split the text part by the current term
      const splitParts = part.split(new RegExp(`(${term})`, 'gi'));
      
      // Create React nodes for each part
      splitParts.forEach((textPart, index) => {
        if (textPart === '') return;
        
        if (textPart.toLowerCase() === term.toLowerCase()) {
          // This part matches the term, highlight it
          newParts.push(renderHighlight(textPart, queryIndex * 1000 + index));
        } else {
          // This part doesn't match, keep it as text
          newParts.push(textPart);
        }
      });
    });

    // Update parts for the next iteration
    parts.length = 0;
    parts.push(...newParts);
  });

  return parts;
};
