
import { ReactElement, cloneElement, Children, isValidElement } from 'react';

/**
 * Recursively adds alt text to images that don't have them
 * @param children React children to process
 * @param defaultAlt Default alt text to use if none is provided
 * @returns Children with alt text added to images
 */
export const ensureImageAltText = (children: React.ReactNode, defaultAlt = "Image"): React.ReactNode => {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }

    // If it's an img tag without alt text, add it
    if (child.type === 'img' && !child.props.alt) {
      return cloneElement(child as ReactElement, {
        alt: child.props.title || defaultAlt,
      });
    }

    // If it has children, process them recursively
    if (child.props.children) {
      return cloneElement(child as ReactElement, {
        children: ensureImageAltText(child.props.children, defaultAlt),
      });
    }

    return child;
  });
};

/**
 * Generate descriptive alt text based on image context
 * @param imageName Image filename or path
 * @param context Optional context to include in alt text
 * @returns Descriptive alt text
 */
export const generateAltText = (imageName: string, context?: string): string => {
  // Extract the filename without extension
  const fileName = imageName.split('/').pop()?.split('.')[0] || '';
  
  // Convert kebab-case or snake_case to spaces
  const words = fileName.replace(/[-_]/g, ' ');
  
  // Capitalize each word
  const capitalized = words
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Add context if provided
  return context ? `${capitalized} - ${context}` : capitalized;
};

/**
 * Generate placeholder alt text based on image dimensions and context
 * @param width Image width
 * @param height Image height
 * @param context Optional context to include in alt text
 * @returns Placeholder alt text
 */
export const generatePlaceholderAltText = (
  width: number, 
  height: number, 
  context?: string
): string => {
  const aspectRatio = width / height;
  let orientation = 'square';
  
  if (aspectRatio > 1.2) {
    orientation = 'horizontal';
  } else if (aspectRatio < 0.8) {
    orientation = 'vertical';
  }
  
  const baseAlt = `${orientation} placeholder image (${width}x${height})`;
  return context ? `${baseAlt} - ${context}` : baseAlt;
};
