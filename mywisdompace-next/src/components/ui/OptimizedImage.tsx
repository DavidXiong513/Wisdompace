'use client';

/**
 * OptimizedImage.tsx
 *
 * A thin wrapper around Next.js <Image> with Wisdompace defaults.
 * Always uses the warm-theme color scheme for the placeholder.
 *
 * Usage:
 *   <OptimizedImage src="/hero.jpg" alt="描述" fill className="object-cover" />
 */
import NextImage from 'next/image';
import type { ImageProps } from 'next/image';
import { forwardRef } from 'react';

type OptimizedImageProps = ImageProps;

export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ src, alt, className, ...rest }, ref) => {
    return (
      <NextImage
        ref={ref}
        src={src}
        alt={alt}
        className={className}
        placeholder="empty"
        {...rest}
      />
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';
