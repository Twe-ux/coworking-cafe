'use client';

import styles from './skeleton.module.scss';

export default function MenuItemSkeleton() {
  return (
    <div className="menu__drink-item" aria-hidden="true">
      <div className="menu__drink-card" style={{ pointerEvents: 'none' }}>
        {/* Image placeholder - matches menu__drink-image: 100% x 200px */}
        <div className={`${styles.skeleton} ${styles.shimmer}`} style={{
          width: '100%',
          height: '200px',
        }} />
        {/* Content placeholder - matches menu__drink-content padding */}
        <div style={{ padding: '20px' }}>
          {/* Name placeholder */}
          <div className={`${styles.skeleton} ${styles.shimmer}`} style={{
            height: '16px',
            width: '70%',
            borderRadius: '4px',
            marginBottom: '8px',
          }} />
          {/* Description placeholder - 2 lines */}
          <div className={`${styles.skeleton} ${styles.shimmer}`} style={{
            height: '12px',
            width: '90%',
            borderRadius: '4px',
            marginBottom: '6px',
          }} />
          <div className={`${styles.skeleton} ${styles.shimmer}`} style={{
            height: '12px',
            width: '60%',
            borderRadius: '4px',
          }} />
        </div>
      </div>
    </div>
  );
}
