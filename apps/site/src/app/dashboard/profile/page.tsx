'use client';

import { useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Page Mon Profil
 * Affichage et édition du profil utilisateur
 * GET /api/user/profile + PUT /api/user/profile
 */
export default function ProfilePage() {
  const { profile, loading, error, updating, fetchProfile, updateProfile } = useProfile();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <main className="page-dashboard-profile">
        <div className="page-dashboard-profile__loading">
          <Spinner size="lg" />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="page-dashboard-profile">
        <Card>
          <Card.Body>
            <div className="page-dashboard-profile__error">
              <p>{error || 'Impossible de charger le profil'}</p>
              <button onClick={fetchProfile} className="btn btn-primary">
                Réessayer
              </button>
            </div>
          </Card.Body>
        </Card>
      </main>
    );
  }

  return (
    <main className="page-dashboard-profile">
      <div className="page-dashboard-profile__header">
        <h1 className="page-dashboard-profile__title">Mon Profil</h1>
        <p className="page-dashboard-profile__subtitle">
          Gérez vos informations personnelles
        </p>
      </div>

      <div className="page-dashboard-profile__content">
        <Card className="page-dashboard-profile__card">
          <Card.Header>
            <h2 className="page-dashboard-profile__card-title">Informations personnelles</h2>
          </Card.Header>
          <Card.Body>
            <ProfileForm
              profile={profile}
              onUpdate={updateProfile}
              updating={updating}
            />
          </Card.Body>
        </Card>

        <Card className="page-dashboard-profile__stats-card">
          <Card.Header>
            <h2 className="page-dashboard-profile__card-title">Statistiques</h2>
          </Card.Header>
          <Card.Body>
            <div className="page-dashboard-profile__stats">
              <div className="page-dashboard-profile__stat">
                <span className="page-dashboard-profile__stat-label">Membre depuis</span>
                <span className="page-dashboard-profile__stat-value">
                  {new Date(profile.stats.memberSince).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>

              <div className="page-dashboard-profile__stat">
                <span className="page-dashboard-profile__stat-label">Total réservations</span>
                <span className="page-dashboard-profile__stat-value">
                  {profile.stats.totalBookings}
                </span>
              </div>

              <div className="page-dashboard-profile__stat">
                <span className="page-dashboard-profile__stat-label">Total dépensé</span>
                <span className="page-dashboard-profile__stat-value">
                  {profile.stats.totalSpent.toFixed(2)}€
                </span>
              </div>

              <div className="page-dashboard-profile__stat">
                <span className="page-dashboard-profile__stat-label">Points fidélité</span>
                <span className="page-dashboard-profile__stat-value">
                  {profile.stats.loyaltyPoints}
                </span>
              </div>

              {profile.stats.favoriteSpace && (
                <div className="page-dashboard-profile__stat">
                  <span className="page-dashboard-profile__stat-label">Espace favori</span>
                  <span className="page-dashboard-profile__stat-value">
                    {profile.stats.favoriteSpace}
                  </span>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </main>
  );
}
