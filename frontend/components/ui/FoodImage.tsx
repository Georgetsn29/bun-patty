'use client';

import React, { useState } from 'react';
import styles from './FoodImage.module.scss';
import { asset } from '@/lib/basePath';

const FALLBACK_SRC = asset('/images/hero-burger-table.jpg');

interface FoodImageProps {
  src: string;
  alt: string;
  slotLabel?: string;
  aspectRatio?: string;
  className?: string;
}

export const FoodImage: React.FC<FoodImageProps> = ({
  src,
  alt,
  aspectRatio = 'aspect-[16/9]',
  className = '',
}) => {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_SRC);

  // Map aspect ratio string to SCSS module class
  let ratioClass = styles.aspect169;
  if (aspectRatio.includes('4/3') || aspectRatio.includes('4:3')) {
    ratioClass = styles.aspect43;
  } else if (aspectRatio.includes('16/10') || aspectRatio.includes('16:10')) {
    ratioClass = styles.aspect1610;
  } else if (aspectRatio.includes('21/9') || aspectRatio.includes('21:9')) {
    ratioClass = styles.aspect219;
  }

  const handleError = () => {
    // If specific file fails, gracefully fallback to primary real smash burger hero photo
    if (imgSrc !== FALLBACK_SRC) {
      setImgSrc(FALLBACK_SRC);
    }
  };

  return (
    <div className={`${styles.wrapper} ${ratioClass} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        className={styles.image}
        loading="lazy"
      />
    </div>
  );
};
