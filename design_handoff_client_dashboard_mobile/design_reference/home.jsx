// home.jsx — Dashboard home screen
const { useState: hS } = React;

function StatusBar({ dark = false, time = '9:41' }) {
  return (
    <div className={`statusbar ${dark ? 'dark' : 'light'}`}>
      <span>{time}</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="16" height="10" viewBox="0 0 16 10"><rect x="0" y="6" width="2.5" height="4" rx="0.5" fill="currentColor"/><rect x="4" y="4" width="2.5" height="6" rx="0.5" fill="currentColor"/><rect x="8" y="2" width="2.5" height="8" rx="0.5" fill="currentColor"/><rect x="12" y="0" width="2.5" height="10" rx="0.5" fill="currentColor"/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="18" height="10" rx="3" stroke="currentColor" fill="none" opacity="0.4"/><rect x="2" y="2" width="15" height="7" rx="1.5" fill="currentColor"/></svg>
      </div>
    </div>
  );
}

function HomeScreen({ onNav, variant = 'hero' }) {
  const u = window.MOCK.user;
  const s = window.MOCK.stats;
  const next = window.MOCK.upcoming[0];
  const sp = window.MOCK.spaces[next.spaceKey];

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Dark hero with welcome + next booking */}
      {variant === 'hero' && (
        <div style={{
          background: 'linear-gradient(160deg, var(--main) 0%, var(--main-dark) 60%, var(--body) 100%)',
          borderRadius: '0 0 34px 34px',
          padding: '72px 22px 28px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* decorative arc */}
          <div style={{ position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(242,211,129,0.14)' }}/>
          <div style={{ position: 'absolute', bottom: -50, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, position: 'relative' }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Mardi 22 avril</div>
              <div className="serif" style={{ fontSize: 28, marginTop: 4, lineHeight: 1.1 }}>
                Bonjour, <em style={{ fontStyle: 'italic', color: 'var(--btn)' }}>{u.name.split(' ')[0]}</em>
              </div>
            </div>
            <div className="ic-btn on-dark" onClick={() => onNav('notifications')} style={{ position: 'relative' }}>
              <Icon name="bell" size={18}/>
              <span className="ic-dot" style={{ borderColor: 'var(--main-dark)' }}/>
            </div>
          </div>

          {/* Next booking hero card */}
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 22, padding: 18,
            position: 'relative',
          }} onClick={() => onNav('bookingDetail', next)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="chip chip-dark"><span className="dot" style={{ background: 'var(--btn)' }}/>Prochaine réservation</span>
              <Icon name="chevRight" size={16} stroke="rgba(255,255,255,0.6)"/>
            </div>
            <div className="serif" style={{ fontSize: 22, lineHeight: 1.15, marginBottom: 10 }}>{next.space}</div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="calendar" size={14} stroke="var(--btn)"/> {next.dateShort}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="clock" size={14} stroke="var(--btn)"/> {next.time}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="people" size={14} stroke="var(--btn)"/> {next.people}</span>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '14px -18px' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0' }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>{next.status === 'confirmed' ? '✓ Validée · Payée' : 'En attente'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: 'var(--btn)' }}>
                QR check-in <Icon name="qr" size={14} stroke="var(--btn)"/>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ padding: '22px 20px 0' }}>
        <div className="tag" style={{ marginBottom: 12 }}>Actions rapides</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="card" onClick={() => onNav('booking')} style={{
            background: 'var(--btn)', border: 'none', padding: 18,
            display: 'flex', flexDirection: 'column', gap: 18, cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -10, right: -10, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }}/>
            <Icon name="plus" size={22} stroke="var(--secondary)" sw={2}/>
            <div>
              <div className="serif" style={{ fontSize: 17, color: 'var(--secondary)' }}>Nouvelle réservation</div>
              <div style={{ fontSize: 11, color: 'rgba(26,26,26,0.6)', marginTop: 2 }}>Open-space, salles, events</div>
            </div>
          </div>
          <div className="card" onClick={() => onNav('reservations')} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 18, cursor: 'pointer' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(65,121,114,0.1)', color: 'var(--main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="calendar" size={20}/>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 17, color: 'var(--body)' }}>Mes réservations</div>
              <div style={{ fontSize: 11, color: 'var(--gry)', marginTop: 2 }}>{s.active} actives · {s.completed} passées</div>
            </div>
          </div>
        </div>
      </div>

      {/* Member card */}
      <div style={{ padding: '22px 20px 0' }}>
        <div className="card card-dark" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,211,129,0.22) 0%, transparent 70%)' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, position: 'relative' }}>
            <span className="tag" style={{ color: 'rgba(227,236,231,0.7)' }}>Programme fidélité</span>
            <Icon name="sparkle" size={16} stroke="var(--btn)" fill="var(--btn)"/>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="num" style={{ fontSize: 38, color: 'var(--btn)' }}>{s.memberPoints}</span>
            <span style={{ fontSize: 13, opacity: 0.6 }}>/ {s.nextReward} pts</span>
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Prochaine récompense : boisson offerte</div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 14, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(s.memberPoints/s.nextReward)*100}%`, background: 'var(--btn)', borderRadius: 3 }}/>
          </div>
        </div>
      </div>

      {/* Upcoming list */}
      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="tag">Prochaines · {window.MOCK.upcoming.length}</span>
          <span style={{ fontSize: 12, color: 'var(--main)', fontWeight: 500 }} onClick={() => onNav('reservations')}>Tout voir</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {window.MOCK.upcoming.map(b => <BookingRow key={b.id} b={b} onClick={() => onNav('bookingDetail', b)}/>)}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ padding: '22px 20px 0' }}>
        <div className="tag" style={{ marginBottom: 12 }}>Mes statistiques</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(65,121,114,0.12)', color: 'var(--main)' }}>
              <Icon name="calendar" size={18}/>
            </div>
            <div>
              <div className="stat-value">{s.active}</div>
              <div className="stat-label">Actives</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(242,211,129,0.22)', color: '#8A6B1F' }}>
              <Icon name="clock" size={18}/>
            </div>
            <div>
              <div className="stat-value">{s.hoursBooked}<span style={{ fontSize: 14, color: 'var(--gry)' }}>h</span></div>
              <div className="stat-label">Réservées</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(76,160,110,0.14)', color: 'var(--success)' }}>
              <Icon name="checkCircle" size={18}/>
            </div>
            <div>
              <div className="stat-value">{s.completed}</div>
              <div className="stat-label">Complétées</div>
            </div>
          </div>
        </div>
      </div>

      {/* Promo rail */}
      <div style={{ padding: '22px 0 0' }}>
        <div className="tag" style={{ marginBottom: 12, padding: '0 20px' }}>Pour vous</div>
        <div style={{ display: 'flex', gap: 10, padding: '0 20px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {window.MOCK.promos.map(p => (
            <div key={p.id} style={{
              flexShrink: 0, width: 220,
              background: p.color, color: 'var(--secondary)',
              borderRadius: 18, padding: 16,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <Icon name={p.id === 1 ? 'gift' : 'ticket'} size={20} stroke="var(--secondary)"/>
              <div className="serif" style={{ fontSize: 18, lineHeight: 1.2 }}>{p.title}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>{p.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingRow({ b, onClick, minimal = false }) {
  const sp = window.MOCK.spaces[b.spaceKey];
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 16, border: '1px solid var(--line)',
      padding: 14, display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer',
    }}>
      <div style={{
        width: 50, height: 54, borderRadius: 12, flexShrink: 0,
        background: sp.bg, color: sp.color,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="num" style={{ fontSize: 18, lineHeight: 1 }}>{b.day}</span>
        <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{b.month.slice(0,3)}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, color: 'var(--body)', fontWeight: 500 }}>{b.space}</div>
        <div style={{ fontSize: 12, color: 'var(--gry)', marginTop: 2, display: 'flex', gap: 10 }}>
          <span>{b.time}</span>
          <span>·</span>
          <span>{b.people} pers.</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <span className={`chip ${b.status === 'confirmed' ? 'chip-success' : 'chip-warn'}`} style={{ fontSize: 10, padding: '3px 8px' }}>
          {b.status === 'confirmed' ? 'Validée' : 'En attente'}
        </span>
        <span className="num" style={{ fontSize: 14, color: 'var(--body)' }}>{b.price}€</span>
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
window.BookingRow = BookingRow;
window.StatusBar = StatusBar;
