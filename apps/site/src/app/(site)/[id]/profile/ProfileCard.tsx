'use client';

import { useSession } from 'next-auth/react';

export default function ProfileCard() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '15px', overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(135deg, #417972 0%, #356660 100%)', padding: '2rem 1.5rem' }}>
        <div className="text-center">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{
              width: '100px',
              height: '100px',
              fontSize: '2.5rem',
              backgroundColor: '#f2d381',
              color: '#142220',
              fontWeight: '700',
            }}
          >
            {session.user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h4 style={{ fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>{session.user.name}</h4>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.5rem' }}>@{session.user.username}</p>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '1rem' }}>{session.user.email}</p>
          <span
            className="badge"
            style={{
              backgroundColor: '#f2d381',
              color: '#142220',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '600',
            }}
          >
            {session.user.role.name}
          </span>
        </div>
      </div>
    </div>
  );
}
