'use client';

import styles from './skeleton.module.scss';

export default function BlogCardSkeleton() {
  return (
    <div className="blogs__wapper_card" aria-hidden="true">
      {/* Image placeholder - matches card__thumb: 100% x 235px */}
      <div className={`${styles.skeleton} ${styles.shimmer}`} style={{
        width: '100%',
        height: '235px',
        borderRadius: '10px',
        marginBottom: '15px',
      }} />
      {/* Title placeholder */}
      <div>
        <div className={`${styles.skeleton} ${styles.shimmer}`} style={{
          height: '22px',
          width: '80%',
          borderRadius: '4px',
          marginBottom: '5px',
        }} />
      </div>
    </div>
  );
}
