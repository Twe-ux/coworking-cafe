/**
 * UI Components Examples
 * Fichier d'exemples pour tester les composants UI
 * NE PAS UTILISER EN PRODUCTION
 */

'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { Select } from './Select';
import { Modal } from './Modal';
import { Spinner } from './Spinner';

/**
 * Page d'exemples des composants UI
 * URL: /ui-examples (à créer pour tester)
 */
export function UIExamplesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectOptions = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Formulaire soumis !');
    }, 2000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>UI Components Examples</h1>

      {/* Button Examples */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Buttons</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      {/* Card Examples */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Cards</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <Card variant="default">
            <Card.Header>
              <h3>Card Default</h3>
            </Card.Header>
            <Card.Body>
              <p>Contenu de la card avec variant default</p>
            </Card.Body>
            <Card.Footer>
              <Button size="sm">Action</Button>
            </Card.Footer>
          </Card>

          <Card variant="outlined">
            <Card.Header>
              <h3>Card Outlined</h3>
            </Card.Header>
            <Card.Body>
              <p>Contenu de la card avec variant outlined</p>
            </Card.Body>
          </Card>

          <Card variant="elevated">
            <Card.Body>
              <h3>Card Elevated</h3>
              <p>Contenu de la card avec variant elevated</p>
            </Card.Body>
          </Card>
        </div>
      </section>

      {/* Form Examples */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Form Components</h2>
        <Card variant="outlined" style={{ maxWidth: '500px' }}>
          <Card.Header>
            <h3>Formulaire Exemple</h3>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Nom complet"
                type="text"
                placeholder="Entrez votre nom"
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="votre@email.com"
                required
              />

              <Input
                label="Mot de passe"
                type="password"
                error="Le mot de passe doit contenir au moins 8 caractères"
              />

              <Select
                label="Catégorie"
                options={selectOptions}
                placeholder="Sélectionnez une option"
                required
              />

              <Button type="submit" variant="primary" loading={loading}>
                Soumettre
              </Button>
            </form>
          </Card.Body>
        </Card>
      </section>

      {/* Modal Example */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Modal</h2>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Ouvrir la modal
        </Button>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Modal Exemple"
        >
          <p>Ceci est le contenu de la modal.</p>
          <p>Vous pouvez fermer la modal en cliquant sur le X, en appuyant sur ESC, ou en cliquant sur le backdrop.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirmer
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
          </div>
        </Modal>
      </section>

      {/* Spinner Examples */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Spinners</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '1rem' }}>
          <div>
            <p>Small</p>
            <Spinner size="sm" />
          </div>
          <div>
            <p>Medium</p>
            <Spinner size="md" />
          </div>
          <div>
            <p>Large</p>
            <Spinner size="lg" />
          </div>
        </div>
      </section>
    </div>
  );
}
