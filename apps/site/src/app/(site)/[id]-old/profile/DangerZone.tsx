'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DangerZone() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmText !== 'SUPPRIMER') {
      setError('Veuillez taper "SUPPRIMER" pour confirmer');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        // Déconnexion et redirection
        await signOut({ callbackUrl: '/' });
      } else {
        setError(data.error || 'Erreur lors de la suppression du compte');
        setLoading(false);
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="pb-5">
        <div className="mb-4">
          <h2
            className="section-title"
            style={{ borderBottomColor: '#dc3545', color: '#dc3545' }}
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            Zone de danger
          </h2>
        </div>
        <div
          className="card shadow-sm border-0 mb-4"
          style={{ borderRadius: '12px' }}
        >
          <div className="card-body p-4">
            <div
              className="border-start border-3 border-danger p-3 rounded"
              style={{ backgroundColor: 'rgba(220, 53, 69, 0.05)' }}
            >
              <h6 className="fw-semibold mb-2">Supprimer le compte</h6>
              <p className="text-muted mb-3">
                Une fois votre compte supprimé, toutes vos données seront
                définitivement effacées. Cette action est irréversible.
              </p>
              <button
                type="button"
                className="btn btn-danger"
                style={{ borderRadius: '8px', padding: '10px 24px' }}
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-trash me-2"></i>
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: '12px', backgroundColor: '#fff' }}>
                <div className="modal-header border-0 pb-0 justify-content-center position-relative">
                  <h4 className="modal-title fw-bold" style={{ color: '#fff', fontSize: '1.5rem' }}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Confirmer la suppression
                  </h4>
                  <button
                    type="button"
                    className="btn-close position-absolute"
                    style={{ right: '1rem', top: '1rem' }}
                    onClick={() => {
                      setShowModal(false);
                      setConfirmText('');
                      setError('');
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#721c24' }}>
                    <strong>Attention !</strong> Cette action est irréversible.
                  </div>
                  <p className="mb-3" style={{ color: '#142220' }}>
                    Toutes vos données seront définitivement supprimées :
                  </p>
                  <ul className="mb-3" style={{ color: '#142220' }}>
                    <li>Informations personnelles</li>
                    <li>Historique des réservations</li>
                    <li>Paramètres du compte</li>
                  </ul>
                  <p className="mb-3" style={{ color: '#142220' }}>
                    Pour confirmer, tapez <strong>SUPPRIMER</strong> ci-dessous :
                  </p>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tapez SUPPRIMER"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #dc3545',
                      padding: '12px',
                      color: '#142220',
                      backgroundColor: '#fff',
                    }}
                  />
                  {error && (
                    <div className="alert alert-danger mt-3 mb-0" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#721c24' }}>
                      {error}
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setConfirmText('');
                      setError('');
                    }}
                    style={{ borderRadius: '8px' }}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={loading || confirmText !== 'SUPPRIMER'}
                    style={{ borderRadius: '8px' }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Suppression...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash me-2"></i>
                        Supprimer définitivement
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
