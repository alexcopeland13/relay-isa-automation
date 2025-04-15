
import { useState } from 'react';
import { generateAltText, generatePlaceholderAltText } from '@/lib/accessibility';

interface AccessibleImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  contextDescription?: string;
}

export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  src,
  alt,
  contextDescription,
  onError,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  
  // Generate alt text if not provided
  const generatedAlt = alt || (
    src ? 
      generateAltText(src, contextDescription) : 
      generatePlaceholderAltText(props.width || 100, props.height || 100, contextDescription)
  );
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };
  
  return (
    <img
      src={src}
      alt={generatedAlt}
      onError={handleError}
      {...props}
      aria-hidden={hasError}
    />
  );
};

export default AccessibleImage;
