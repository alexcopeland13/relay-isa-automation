
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
  
  // Convert width and height to numbers if they are strings
  const width = props.width ? Number(props.width) : 100;
  const height = props.height ? Number(props.height) : 100;
  
  // Generate alt text if not provided
  const generatedAlt = alt || (
    src ? 
      generateAltText(src, contextDescription) : 
      generatePlaceholderAltText(width, height, contextDescription)
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
