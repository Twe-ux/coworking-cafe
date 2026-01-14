'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTopbarContext } from '@/context/useTopbarContext';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Badge,
  Table,
  ProgressBar
} from 'react-bootstrap';
import IconifyIcon from '@/components/dashboard/wrappers/IconifyIcon';
import { PromoCode, MarketingContent, ScanStats, PromoHistory } from '@/types/promo';

interface PromoData {
  current: PromoCode;
  history: PromoHistory[];
  stats: {
    total_views: number;
    total_copies: number;
    views_today: number;
    copies_today: number;
  };
  scan_stats: ScanStats;
  marketing: MarketingContent;
  weekly_stats: { date: string; scans: number }[];
  top_hours: { hour: string; count: number; percentage: number }[];
}

export default function PromoDashboardPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role?.slug;
  const isStaff = userRole === 'staff';
  const { setPageTitle, setPageActions } = useTopbarContext();

  const [data, setData] = useState<PromoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // États pour le formulaire marketing
  const [marketingForm, setMarketingForm] = useState<MarketingContent>({
    title: '',
    message: '',
    image_url: '',
    cta_text: ''
  });
  const [savingMarketing, setSavingMarketing] = useState(false);

  // États pour le formulaire nouveau code
  const [promoForm, setPromoForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed' | 'free_item',
    discount_value: 0,
    valid_until: '',
    max_uses: 0
  });
  const [savingPromo, setSavingPromo] = useState(false);

  useEffect(() => {
    setPageTitle(isStaff ? 'Code Promo en cours' : 'Codes Promo');
    setPageActions(null);

    return () => {
      setPageTitle('Dashboard');
      setPageActions(null);
    };
  }, [isStaff, setPageTitle, setPageActions]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/promo');
      if (!res.ok) throw new Error('Erreur lors du chargement');

      const promoData = await res.json();
      setData(promoData);

      // Initialiser le formulaire marketing
      setMarketingForm(promoData.marketing);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMarketing = async () => {
    setSavingMarketing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/promo/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(marketingForm)
      });

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde');

      setMessage({ type: 'success', text: 'Contenu marketing mis à jour !' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      setSavingMarketing(false);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPromo(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoForm)
      });

      if (!res.ok) throw new Error('Erreur lors de la création');

      setMessage({ type: 'success', text: 'Code promo créé avec succès !' });
      setPromoForm({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        valid_until: '',
        max_uses: 0
      });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      setSavingPromo(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="danger">{error || 'Erreur de chargement'}</Alert>
    );
  }

  const { scan_stats, weekly_stats, top_hours } = data;

  // Vue simplifiée pour le staff
  if (isStaff) {
    return (
      <>
        <Row className="justify-content-center">
          <Col lg={6}>
            <Card className="mb-4">
              <CardHeader className="text-center">
                <CardTitle as="h4">Code promo actuel</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="text-center p-4 bg-light rounded mb-3">
                  <code className="fs-1 fw-bold text-primary">{data.current.code}</code>
                </div>
                <p className="text-muted text-center mb-4">{data.current.description}</p>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Réduction :</span>
                  <Badge bg="success" className="fs-6">
                    {data.current.discount_type === 'percentage'
                      ? `-${data.current.discount_value}%`
                      : data.current.discount_type === 'fixed'
                        ? `-${data.current.discount_value}€`
                        : `${data.current.discount_value}€ offerts`}
                  </Badge>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Utilisations :</span>
                  <span className="fw-bold">
                    {data.current.current_uses} / {data.current.max_uses || '∞'}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Valide jusqu'au :</span>
                  <span className="fw-bold">
                    {new Date(data.current.valid_until).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Statut :</span>
                  <Badge bg={data.current.is_active ? 'success' : 'danger'}>
                    {data.current.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </CardBody>
            </Card>

            {/* Stats simples */}
            <Card>
              <CardHeader>
                <CardTitle as="h4">Statistiques</CardTitle>
              </CardHeader>
              <CardBody>
                <Row className="text-center">
                  <Col xs={4}>
                    <h3 className="mb-0 text-primary">{scan_stats.total_scans}</h3>
                    <small className="text-muted">Scans</small>
                  </Col>
                  <Col xs={4}>
                    <h3 className="mb-0 text-info">{scan_stats.total_reveals}</h3>
                    <small className="text-muted">Révélations</small>
                  </Col>
                  <Col xs={4}>
                    <h3 className="mb-0 text-success">{scan_stats.total_copies}</h3>
                    <small className="text-muted">Copies</small>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  // Vue complète pour admin/dev
  return (
    <>
      {message && (
        <Alert
          variant={message.type === 'success' ? 'success' : 'danger'}
          dismissible
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* Stats principales */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <IconifyIcon icon="ri:qr-scan-line" className="text-primary" width={32} height={32} />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h4 className="mb-0">{scan_stats.total_scans}</h4>
                  <p className="text-muted mb-0">Scans QR</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <IconifyIcon icon="ri:eye-line" className="text-info" width={32} height={32} />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h4 className="mb-0">
                    {scan_stats.total_reveals}
                    <small className="text-success ms-1">({scan_stats.conversion_rate_reveal}%)</small>
                  </h4>
                  <p className="text-muted mb-0">Révélations</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <IconifyIcon icon="ri:file-copy-line" className="text-success" width={32} height={32} />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h4 className="mb-0">
                    {scan_stats.total_copies}
                    <small className="text-success ms-1">({scan_stats.conversion_rate_copy}%)</small>
                  </h4>
                  <p className="text-muted mb-0">Copies</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <IconifyIcon icon="ri:time-line" className="text-warning" width={32} height={32} />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h4 className="mb-0">{scan_stats.average_time_to_reveal}s</h4>
                  <p className="text-muted mb-0">Temps moyen</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Graphique des scans */}
        <Col lg={8}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h4">Scans par jour (7 derniers jours)</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex align-items-end" style={{ height: '200px' }}>
                {weekly_stats.map((day, index) => {
                  const maxScans = Math.max(...weekly_stats.map(d => d.scans), 1);
                  const height = (day.scans / maxScans) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-fill text-center mx-1"
                      style={{ height: '100%' }}
                    >
                      <div
                        className="bg-primary rounded-top mx-auto"
                        style={{
                          width: '60%',
                          height: `${height}%`,
                          minHeight: day.scans > 0 ? '10px' : '2px',
                          marginTop: `${100 - height}%`
                        }}
                      />
                      <small className="d-block mt-2 text-muted">
                        {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </small>
                      <small className="d-block fw-bold">{day.scans}</small>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Top heures */}
        <Col lg={4}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h4">Top heures de scan</CardTitle>
            </CardHeader>
            <CardBody>
              {top_hours.length === 0 ? (
                <p className="text-muted">Pas encore de données</p>
              ) : (
                top_hours.map((hour, index) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>{hour.hour}</span>
                      <span>{hour.percentage}%</span>
                    </div>
                    <ProgressBar now={hour.percentage} variant="primary" />
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Code actuel */}
        <Col lg={6}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h4">Code promo actuel</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-center p-4 bg-light rounded mb-3">
                <code className="fs-2 fw-bold text-primary">{data.current.code}</code>
              </div>
              <p className="text-muted">{data.current.description}</p>
              <div className="d-flex justify-content-between">
                <span>
                  <Badge bg="success">
                    {data.current.discount_type === 'percentage'
                      ? `-${data.current.discount_value}%`
                      : data.current.discount_type === 'fixed'
                        ? `-${data.current.discount_value}€`
                        : `${data.current.discount_value}€ offerts`}
                  </Badge>
                </span>
                <span className="text-muted small">
                  {data.current.current_uses} / {data.current.max_uses || '∞'} utilisations
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Nouveau code */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h4">Créer un nouveau code</CardTitle>
            </CardHeader>
            <CardBody>
              <Form onSubmit={handleCreatePromo}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Code *</Form.Label>
                      <Form.Control
                        type="text"
                        value={promoForm.code}
                        onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                        placeholder="BIENVENUE2024"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type de réduction</Form.Label>
                      <Form.Select
                        value={promoForm.discount_type}
                        onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value as any })}
                      >
                        <option value="percentage">Pourcentage</option>
                        <option value="fixed">Montant fixe</option>
                        <option value="free_item">Article offert</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    type="text"
                    value={promoForm.description}
                    onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                    placeholder="1ère heure offerte pour les nouveaux clients"
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Valeur *</Form.Label>
                      <Form.Control
                        type="number"
                        value={promoForm.discount_value}
                        onChange={(e) => setPromoForm({ ...promoForm, discount_value: Number(e.target.value) })}
                        min="0"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Utilisations max</Form.Label>
                      <Form.Control
                        type="number"
                        value={promoForm.max_uses}
                        onChange={(e) => setPromoForm({ ...promoForm, max_uses: Number(e.target.value) })}
                        min="0"
                        placeholder="0 = illimité"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expire le</Form.Label>
                      <Form.Control
                        type="date"
                        value={promoForm.valid_until}
                        onChange={(e) => setPromoForm({ ...promoForm, valid_until: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" variant="primary" disabled={savingPromo}>
                  {savingPromo ? 'Création...' : 'Créer le code'}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* Éditeur marketing */}
        <Col lg={6}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h4">Contenu de la page Scan</CardTitle>
            </CardHeader>
            <CardBody>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Titre</Form.Label>
                  <Form.Control
                    type="text"
                    value={marketingForm.title}
                    onChange={(e) => setMarketingForm({ ...marketingForm, title: e.target.value })}
                    maxLength={100}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Message (HTML autorisé)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={marketingForm.message}
                    onChange={(e) => setMarketingForm({ ...marketingForm, message: e.target.value })}
                    maxLength={1000}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>URL de l'image (optionnel)</Form.Label>
                  <Form.Control
                    type="url"
                    value={marketingForm.image_url || ''}
                    onChange={(e) => setMarketingForm({ ...marketingForm, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Texte du bouton</Form.Label>
                  <Form.Control
                    type="text"
                    value={marketingForm.cta_text}
                    onChange={(e) => setMarketingForm({ ...marketingForm, cta_text: e.target.value })}
                    maxLength={50}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  onClick={handleSaveMarketing}
                  disabled={savingMarketing}
                >
                  {savingMarketing ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </Form>
            </CardBody>
          </Card>

          {/* Historique */}
          {data.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle as="h4">Historique des codes</CardTitle>
              </CardHeader>
              <CardBody>
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Utilisations</th>
                      <th>Désactivé le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.history.slice(0, 5).map((promo, index) => (
                      <tr key={index}>
                        <td><code>{promo.code}</code></td>
                        <td>{promo.total_uses}</td>
                        <td>{new Date(promo.deactivated_at).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
}
