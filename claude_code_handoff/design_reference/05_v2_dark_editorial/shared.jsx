// shared.jsx — Nav + Footer + page header for v2_dark_editorial
const { useState: _uS } = React;

const BRAND = {
  name: 'CoworKing Café',
  city: 'Strasbourg',
  address: '1 rue de la Division Leclerc · 67000 Strasbourg',
  tagline: 'Le café motive · L\'humain relie',
  hours: 'Lun–Ven 9h–20h · Sam–Dim 10h–20h',
  phone: '+33 9 87 33 45 19',
};

const NAV_LINKS = [
  { key: 'landing', label: 'Accueil', href: 'landing.html' },
  { key: 'espaces', label: 'Espaces', href: 'espaces.html' },
  { key: 'concept', label: 'Concept', href: 'concept.html' },
  { key: 'tarifs', label: 'Tarifs', href: 'tarifs.html' },
  { key: 'menu', label: 'Menu', href: 'menu.html' },
  { key: 'evenements', label: 'Événements', href: 'evenements.html' },
];

function Nav({ active, dark = false }) {
  const [open, setOpen] = _uS(false);
  return (
    <nav className={`nav ${dark ? 'dark' : ''}`}>
      <div className="nav-inner">
        <a href="landing.html" className="nav-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="nav-logo-mark">
            <Icon name="building" size={18} stroke="#1A1A1A"/>
          </div>
          <div>
            <div className="nav-logo-name">CoworKing Café</div>
            <div className="nav-logo-sub">STRASBOURG · EST. 2022</div>
          </div>
        </a>
        <div className={`nav-links ${open ? 'open' : ''}`}>
          {NAV_LINKS.map(l => (
            <a key={l.key} href={l.href} className={active === l.key ? 'active' : ''}>{l.label}</a>
          ))}
        </div>
        <div className="nav-cta">
          <a href="auth.html" className="ghost" style={{ textDecoration: 'none', color: 'inherit' }}>Se connecter</a>
          <a href="booking.html" style={{ textDecoration: 'none' }}><button className="primary">Réserver</button></a>
        </div>
        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
          <Icon name={open ? 'x' : 'menu'} size={22} stroke="currentColor"/>
        </button>
      </div>
    </nav>
  );
}

function PageHeader({ num, eyebrow, title, titleAccent, lead }) {
  return (
    <header className="page-header">
      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="num">— {num} · {eyebrow}</div>
        <h1 className="h1" style={{ fontSize: 'clamp(40px, 7vw, 84px)' }}>
          {title} <em style={{ color: 'var(--btn)', fontStyle: 'italic' }}>{titleAccent}</em>
        </h1>
        {lead && <p className="lead" style={{ maxWidth: 640, marginTop: 24, color: 'rgba(255,255,255,0.78)' }}>{lead}</p>}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--btn)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="building" size={18} stroke="#1A1A1A"/>
              </div>
              <div className="serif" style={{ fontSize: 18 }}>CoworKing Café</div>
            </div>
            <div style={{ fontSize: 13, opacity: 0.65, lineHeight: 1.55 }}>
              {BRAND.address}<br/>{BRAND.hours}<br/>{BRAND.phone}
            </div>
          </div>
          {[
            ['Espaces', ['Open-space', 'Salle Verrière', 'Salle Étage', 'Événementiel']],
            ['Le lieu', ['Concept', 'Menu boissons', 'Partenaires', 'Blog']],
            ['Membre', ['Tarifs', 'Connexion', 'Programme fidélité', 'Contact']],
          ].map(([t, items]) => (
            <div key={t}>
              <div className="tag footer-col-title">{t}</div>
              <div className="footer-col-items">
                {items.map(i => <span key={i} style={{ cursor: 'pointer' }}>{i}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2026 COWORKING CAFÉ · TOUS DROITS RÉSERVÉS</span>
          <span>{BRAND.tagline.toUpperCase()}</span>
        </div>
      </div>
    </footer>
  );
}

const SPACES = [
  { key: 'open', name: 'Open-space', tag: 'Flexible', emoji: '💻', price: 9, cap: '40 places', desc: 'Ambiance studieuse, tables partagées, parfait pour le deep-work en solo.', color: '#417972', bg: 'rgba(65,121,114,0.14)' },
  { key: 'verriere', name: 'Salle Verrière', tag: 'Meeting', emoji: '🌿', price: 24, cap: '6 pers.', desc: 'Lumière naturelle traversante, écran 55", visio intégrée — pour vos workshops.', color: '#5A938B', bg: 'rgba(90,147,139,0.18)' },
  { key: 'etage', name: 'Salle Étage', tag: 'Privé', emoji: '🏛️', price: 30, cap: '10 pers.', desc: 'Cosy, privatisée à l\'étage, tableau blanc et boissons incluses.', color: '#8A6B1F', bg: 'rgba(242,211,129,0.3)' },
  { key: 'event', name: 'Événementiel', tag: 'Soirées', emoji: '🎉', price: 80, cap: '40 pers.', desc: 'Privatisation totale avec sono, lumières et service traiteur possible.', color: '#C0534C', bg: 'rgba(192,83,76,0.14)' },
];

Object.assign(window, { Nav, PageHeader, Footer, BRAND, NAV_LINKS, SPACES });
