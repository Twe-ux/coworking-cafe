// pages.jsx — Reservations list, detail, profile, settings
const { useState: pS, useRef: pR } = React;

// ───────── Reservations list
function ReservationsScreen({ onNav }) {
  const [filter, setFilter] = pS('upcoming');
  const list = filter === 'upcoming' ? window.MOCK.upcoming : window.MOCK.past;
  return (
    <div style={{ padding: '0 20px 120px' }}>
      <div style={{ padding: '4px 0 18px' }}>
        <div className="tag">Historique complet</div>
        <div className="serif" style={{ fontSize: 30, color: 'var(--body)', lineHeight: 1.1, marginTop: 4 }}>
          Mes <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>réservations</em>
        </div>
      </div>

      <div className="segmented" style={{ marginBottom: 18 }}>
        <div className={`seg-item ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>
          À venir · {window.MOCK.upcoming.length}
        </div>
        <div className={`seg-item ${filter === 'past' ? 'active' : ''}`} onClick={() => setFilter('past')}>
          Passées · {window.MOCK.past.length}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map(b => (
          <SwipeRow key={b.id} b={b} onClick={() => onNav('bookingDetail', b)} cancellable={filter === 'upcoming'}/>
        ))}
      </div>

      {list.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Icon name="calendar" size={40} stroke="var(--gry)"/>
          <div className="serif" style={{ fontSize: 18, marginTop: 10, color: 'var(--body)' }}>Aucune réservation</div>
        </div>
      )}
    </div>
  );
}

function SwipeRow({ b, onClick, cancellable }) {
  const [offset, setOffset] = pS(0);
  const startX = pR(0);
  const moved = pR(false);
  const sp = window.MOCK.spaces[b.spaceKey];

  const handleStart = (e) => { startX.current = (e.touches?.[0] || e).clientX; moved.current = false; };
  const handleMove = (e) => {
    const x = (e.touches?.[0] || e).clientX;
    const delta = Math.min(0, Math.max(-140, x - startX.current));
    if (Math.abs(delta) > 8) moved.current = true;
    setOffset(delta);
  };
  const handleEnd = () => { setOffset(offset < -60 ? -140 : 0); };

  return (
    <div className="swipe-wrap">
      {cancellable && (
        <div className="swipe-actions">
          <div className="swipe-btn swipe-btn-view" onClick={onClick}>
            <Icon name="edit" size={16} stroke="#fff"/>Détail
          </div>
          <div className="swipe-btn swipe-btn-cancel">
            <Icon name="trash" size={16} stroke="#fff"/>Annuler
          </div>
        </div>
      )}
      <div
        onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
        onMouseDown={handleStart} onMouseMove={(e) => e.buttons && handleMove(e)} onMouseUp={handleEnd}
        onClick={() => !moved.current && onClick()}
        style={{
          background: '#fff', borderRadius: 16, border: '1px solid var(--line)',
          padding: '16px 14px', display: 'flex', gap: 14, alignItems: 'center',
          transform: `translateX(${offset}px)`,
          transition: offset === 0 || offset === -140 ? 'transform 0.25s' : 'none',
          cursor: 'pointer', position: 'relative', zIndex: 1,
        }}>
        <div style={{
          width: 54, height: 60, borderRadius: 12, flexShrink: 0,
          background: sp.bg, color: sp.color,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="num" style={{ fontSize: 20, lineHeight: 1 }}>
            {b.day || (b.date || '').split(' ')[1] || '—'}
          </span>
          <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>
            {(b.month || (b.date || '').split(' ')[2] || '').slice(0, 3)}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, color: 'var(--body)', fontWeight: 500 }}>{b.space}</div>
          <div style={{ fontSize: 12, color: 'var(--gry)', marginTop: 3 }}>{b.time}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <span className={`chip ${b.status === 'confirmed' ? 'chip-success' : b.status === 'completed' ? 'chip' : 'chip-warn'}`} style={{ fontSize: 10, padding: '2px 7px' }}>
              {b.status === 'confirmed' ? 'Validée' : b.status === 'completed' ? 'Terminée' : 'En attente'}
            </span>
            <span className="num" style={{ fontSize: 11, color: 'var(--gry)' }}>{b.price}€</span>
          </div>
        </div>
        <Icon name="chevRight" size={16} stroke="var(--gry)"/>
      </div>
    </div>
  );
}

// ───────── Booking detail
function BookingDetailScreen({ booking }) {
  const b = booking || window.MOCK.upcoming[0];
  const sp = window.MOCK.spaces[b.spaceKey];
  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(165deg, ${sp.color} 0%, var(--body) 120%)`,
        color: '#fff', padding: '20px 22px 28px',
        borderRadius: '0 0 28px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(242,211,129,0.1)' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <span className="chip chip-dark" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <span className="dot" style={{ background: 'var(--btn)' }}/>{b.status === 'confirmed' ? 'Validée' : 'En attente'}
          </span>
        </div>
        <div className="serif" style={{ fontSize: 30, lineHeight: 1.1 }}>{b.space}</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>{b.date} · {b.time}</div>
      </div>

      {/* QR ticket */}
      <div style={{ padding: '18px 20px 0' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 14px', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{
              width: 74, height: 74, borderRadius: 12, background: '#fff',
              border: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <QRPattern/>
            </div>
            <div style={{ flex: 1 }}>
              <div className="tag">Ticket d'entrée</div>
              <div className="serif" style={{ fontSize: 19, color: 'var(--body)', marginTop: 2 }}>#{b.id.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: 'var(--gry)', marginTop: 4 }}>Présentez à l'accueil</div>
            </div>
          </div>
          <div style={{ position: 'relative', height: 20 }}>
            <div style={{ position: 'absolute', top: 10, left: 0, right: 0, borderTop: '2px dashed var(--line)' }}/>
            <div style={{ position: 'absolute', top: 0, left: -10, width: 20, height: 20, borderRadius: '50%', background: 'var(--cream)' }}/>
            <div style={{ position: 'absolute', top: 0, right: -10, width: 20, height: 20, borderRadius: '50%', background: 'var(--cream)' }}/>
          </div>
          <div style={{ padding: '12px 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div className="tag" style={{ fontSize: 9 }}>Durée</div>
              <div style={{ fontSize: 14, color: 'var(--body)', marginTop: 2 }}>{b.duration}</div>
            </div>
            <div>
              <div className="tag" style={{ fontSize: 9 }}>Personnes</div>
              <div style={{ fontSize: 14, color: 'var(--body)', marginTop: 2 }}>{b.people} pers.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '12px 20px 0' }}>
        <div className="card" style={{ padding: 0 }}>
          {[
            { label: 'Espace', val: b.space, icon: 'building' },
            { label: 'Date', val: b.date, icon: 'calendar' },
            { label: 'Horaire', val: b.time, icon: 'clock' },
            { label: 'Participants', val: `${b.people} personne${b.people > 1 ? 's' : ''}`, icon: 'people' },
            { label: 'Paiement', val: b.payment === 'paid' ? 'Payée' : 'En attente', icon: 'tag' },
          ].map((r, i, arr) => (
            <div key={i} style={{ padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(65,121,114,0.08)', color: 'var(--main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={r.icon} size={16}/>
              </div>
              <div style={{ flex: 1 }}>
                <div className="tag" style={{ fontSize: 10 }}>{r.label}</div>
                <div style={{ fontSize: 14, color: 'var(--body)', marginTop: 2 }}>{r.val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div style={{ padding: '12px 20px 0' }}>
        <div className="card card-main" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="tag" style={{ color: 'rgba(255,255,255,0.7)' }}>Total</div>
            <div className="serif" style={{ fontSize: 24, marginTop: 2 }}>{b.price},00 €</div>
          </div>
          <button style={{ background: 'var(--btn)', color: 'var(--secondary)', border: 'none', padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
            Voir facture
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 10 }}>
        <button style={{ flex: 1, padding: 16, borderRadius: 14, background: '#fff', color: 'var(--body)', border: '1px solid var(--line)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          Modifier
        </button>
        <button style={{ flex: 1, padding: 16, borderRadius: 14, background: '#fff', color: 'var(--danger)', border: '1px solid var(--line)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          Annuler
        </button>
      </div>
    </div>
  );
}

function QRPattern() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      {[...Array(12)].map((_, r) =>
        [...Array(12)].map((_, c) => {
          const fill = Math.random() > 0.5;
          return fill ? <rect key={r+'-'+c} x={c*5} y={r*5} width={4.5} height={4.5} fill="var(--body)"/> : null;
        })
      )}
      {[[0,0],[0,7],[7,0]].map(([x,y], i) => (
        <g key={i}>
          <rect x={x*5} y={y*5} width={22} height={22} fill="#fff" stroke="none"/>
          <rect x={x*5} y={y*5} width={22} height={22} fill="none" stroke="var(--body)" strokeWidth="2.5"/>
          <rect x={x*5+7} y={y*5+7} width={8} height={8} fill="var(--body)"/>
        </g>
      ))}
    </svg>
  );
}

// ───────── Profile
function ProfileScreen({ onNav }) {
  const u = window.MOCK.user;
  const s = window.MOCK.stats;
  return (
    <div style={{ paddingBottom: 120 }}>
      {/* avatar header */}
      <div style={{ padding: '10px 20px 24px', textAlign: 'center' }}>
        <div className="avatar lg" style={{ margin: '0 auto 14px', background: 'linear-gradient(135deg, var(--main), var(--main-dark))' }}>
          {u.initial}
        </div>
        <div className="serif" style={{ fontSize: 26, color: 'var(--body)', lineHeight: 1.1 }}>{u.name}</div>
        <div style={{ fontSize: 13, color: 'var(--gry)', marginTop: 4 }}>Membre depuis {u.memberSince}</div>
        <span className="chip chip-btn" style={{ marginTop: 10 }}>
          <Icon name="star" size={12} fill="var(--btn-dark)" stroke="var(--btn-dark)"/>
          {u.plan}
        </span>
      </div>

      {/* info cards */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="card" style={{ padding: 0 }}>
          {[
            { k: 'Email', v: u.email, i: 'mail' },
            { k: 'Téléphone', v: u.phone, i: 'phone' },
            { k: 'Entreprise', v: u.company, i: 'building' },
          ].map((r, i, arr) => (
            <div key={i} style={{ padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(65,121,114,0.08)', color: 'var(--main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={r.i} size={16}/>
              </div>
              <div style={{ flex: 1 }}>
                <div className="tag" style={{ fontSize: 10 }}>{r.k}</div>
                <div style={{ fontSize: 14, color: 'var(--body)', marginTop: 2 }}>{r.v}</div>
              </div>
              <Icon name="edit" size={15} stroke="var(--gry)"/>
            </div>
          ))}
        </div>

        {/* stats bento */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="card" style={{ padding: 14 }}>
            <Icon name="clock" size={18} stroke="var(--main)"/>
            <div className="stat-value" style={{ marginTop: 8 }}>{s.hoursBooked}<span style={{ fontSize: 14, color: 'var(--gry)' }}>h</span></div>
            <div className="stat-label">Heures réservées</div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <Icon name="tag" size={18} stroke="var(--success)"/>
            <div className="stat-value" style={{ marginTop: 8 }}>{s.savings}<span style={{ fontSize: 14, color: 'var(--gry)' }}>€</span></div>
            <div className="stat-label">Économisés (fidélité)</div>
          </div>
        </div>

        {/* menu list */}
        <div className="card" style={{ padding: 0, marginTop: 4 }}>
          {[
            { k: 'Notifications', i: 'bell' },
            { k: 'Sécurité & mot de passe', i: 'shield' },
            { k: 'Préférences', i: 'gear' },
            { k: 'Aide & support', i: 'cookie' },
          ].map((r, i, arr) => (
            <div key={i} style={{ padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none', display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }} onClick={() => onNav('settings')}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(65,121,114,0.08)', color: 'var(--main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={r.i} size={16}/>
              </div>
              <span style={{ flex: 1, fontSize: 14.5, color: 'var(--body)' }}>{r.k}</span>
              <Icon name="chevRight" size={14} stroke="var(--gry)"/>
            </div>
          ))}
        </div>

        <button style={{
          marginTop: 6, padding: 16, borderRadius: 14,
          background: 'rgba(192,83,76,0.08)', color: 'var(--danger)',
          border: 'none', fontSize: 14, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon name="logout" size={16}/> Se déconnecter
        </button>
      </div>
    </div>
  );
}

// ───────── Settings
function SettingsScreen() {
  const [t1, setT1] = pS(true);
  const [t2, setT2] = pS(true);
  const [t3, setT3] = pS(false);
  const [t4, setT4] = pS(false);

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div className="tag" style={{ margin: '0 6px 8px' }}>{title}</div>
      <div className="card" style={{ padding: 0 }}>{children}</div>
    </div>
  );

  const Row = ({ icon, title, sub, on, onToggle, isLast }) => (
    <div style={{ padding: '14px 16px', borderBottom: isLast ? 'none' : '1px solid var(--line)', display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(65,121,114,0.08)', color: 'var(--main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, color: 'var(--body)' }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--gry)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div className={`toggle ${on ? 'on' : ''}`} onClick={onToggle}><div className="toggle-knob"/></div>
    </div>
  );

  return (
    <div style={{ padding: '0 20px 120px' }}>
      <div style={{ padding: '4px 0 18px' }}>
        <div className="tag">Gérer mon compte</div>
        <div className="serif" style={{ fontSize: 30, color: 'var(--body)', lineHeight: 1.1, marginTop: 4 }}>Réglages</div>
      </div>

      <Section title="Notifications">
        <Row icon="bell" title="Push" sub="Rappels avant réservation" on={t1} onToggle={() => setT1(!t1)}/>
        <Row icon="mail" title="Email" sub="Confirmations & factures" on={t2} onToggle={() => setT2(!t2)}/>
        <Row icon="gift" title="Offres & promos" sub="Actualités du café" on={t3} onToggle={() => setT3(!t3)} isLast/>
      </Section>

      <Section title="Confidentialité">
        <Row icon="user" title="Profil public" sub="Visible des autres membres" on={t4} onToggle={() => setT4(!t4)} isLast/>
      </Section>

      <Section title="Sécurité">
        <div className="list-row" style={{ borderRadius: 0, border: 'none' }}>
          <div className="list-row-icon"><Icon name="lock" size={16}/></div>
          <div className="list-row-main">
            <div className="list-row-title">Mot de passe</div>
            <div className="list-row-sub">Modifié il y a 3 mois</div>
          </div>
          <Icon name="chevRight" size={14} stroke="var(--gry)"/>
        </div>
        <div style={{ height: 1, background: 'var(--line)' }}/>
        <div className="list-row" style={{ borderRadius: 0, border: 'none' }}>
          <div className="list-row-icon"><Icon name="shield" size={16}/></div>
          <div className="list-row-main">
            <div className="list-row-title">Sessions actives</div>
            <div className="list-row-sub">2 appareils connectés</div>
          </div>
          <Icon name="chevRight" size={14} stroke="var(--gry)"/>
        </div>
      </Section>

      <Section title="Zone sensible">
        <div className="list-row" style={{ borderRadius: 0, border: 'none' }}>
          <div className="list-row-icon" style={{ background: 'rgba(192,83,76,0.1)', color: 'var(--danger)' }}>
            <Icon name="trash" size={16}/>
          </div>
          <div className="list-row-main">
            <div className="list-row-title" style={{ color: 'var(--danger)' }}>Supprimer mon compte</div>
            <div className="list-row-sub">Action définitive</div>
          </div>
          <Icon name="chevRight" size={14} stroke="var(--gry)"/>
        </div>
      </Section>
    </div>
  );
}

window.ReservationsScreen = ReservationsScreen;
window.BookingDetailScreen = BookingDetailScreen;
window.ProfileScreen = ProfileScreen;
window.SettingsScreen = SettingsScreen;
