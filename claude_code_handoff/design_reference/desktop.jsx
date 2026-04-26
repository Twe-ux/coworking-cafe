// desktop.jsx — Desktop dashboard view
const { useState: dS } = React;

function DesktopDashboard() {
  const [active, setActive] = dS('home');
  const u = window.MOCK.user;
  const s = window.MOCK.stats;
  const next = window.MOCK.upcoming[0];

  return (
    <div style={{
      width: 1280, height: 800, background: 'var(--cream)',
      borderRadius: 20, overflow: 'hidden', display: 'flex',
      border: '1px solid var(--line)',
      boxShadow: '0 30px 60px rgba(20,34,32,0.18)',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* sidebar */}
      <aside style={{
        width: 260, background: 'var(--body)', color: '#fff',
        padding: '28px 18px', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 28px' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--btn)', color: 'var(--secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="building" size={20} stroke="var(--secondary)"/>
          </div>
          <div>
            <div className="serif" style={{ fontSize: 17, letterSpacing: '-0.01em' }}>CoworKing</div>
            <div style={{ fontSize: 10, opacity: 0.5, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>CAFÉ · MEMBRE</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[
            { k: 'home', l: 'Tableau de bord', i: 'home' },
            { k: 'reservations', l: 'Mes réservations', i: 'calendar', badge: '3' },
            { k: 'new', l: 'Nouvelle réservation', i: 'plus' },
            { k: 'invoices', l: 'Factures', i: 'tag' },
            { k: 'loyalty', l: 'Fidélité', i: 'sparkle', badge: '340' },
            { k: 'messages', l: 'Messages', i: 'mail' },
          ].map(n => (
            <div key={n.k} onClick={() => setActive(n.k)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 12, cursor: 'pointer',
              background: active === n.k ? 'rgba(242,211,129,0.12)' : 'transparent',
              color: active === n.k ? 'var(--btn)' : 'rgba(255,255,255,0.75)',
              fontSize: 13.5, fontWeight: active === n.k ? 500 : 400,
              transition: 'background 0.15s',
            }}>
              <Icon name={n.i} size={17} stroke={active === n.k ? 'var(--btn)' : 'rgba(255,255,255,0.75)'}/>
              <span style={{ flex: 1 }}>{n.l}</span>
              {n.badge && <span style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 8,
                background: active === n.k ? 'var(--btn)' : 'rgba(255,255,255,0.08)',
                color: active === n.k ? 'var(--secondary)' : 'rgba(255,255,255,0.7)',
                fontFamily: 'JetBrains Mono, monospace',
              }}>{n.badge}</span>}
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              { k: 'profile', l: 'Profil', i: 'user' },
              { k: 'settings', l: 'Réglages', i: 'gear' },
              { k: 'help', l: 'Aide & support', i: 'cookie' },
            ].map(n => (
              <div key={n.k} onClick={() => setActive(n.k)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                color: active === n.k ? 'var(--btn)' : 'rgba(255,255,255,0.55)',
                fontSize: 13, background: active === n.k ? 'rgba(242,211,129,0.12)' : 'transparent',
              }}>
                <Icon name={n.i} size={16} stroke={active === n.k ? 'var(--btn)' : 'rgba(255,255,255,0.55)'}/>
                <span>{n.l}</span>
              </div>
            ))}
          </div>

          {/* user pill */}
          <div style={{
            marginTop: 14, padding: 10,
            background: 'rgba(255,255,255,0.04)', borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div className="avatar" style={{ width: 38, height: 38, fontSize: 14 }}>{u.initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
              <div style={{ fontSize: 10, opacity: 0.55, fontFamily: 'JetBrains Mono, monospace' }}>{u.plan.toUpperCase()}</div>
            </div>
            <Icon name="logout" size={15} stroke="rgba(255,255,255,0.45)"/>
          </div>
        </div>
      </aside>

      {/* main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* topbar */}
        <div style={{
          padding: '20px 32px', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 20, background: '#fff',
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gry)' }}>
              <Icon name="search" size={16}/>
            </div>
            <input placeholder="Rechercher une réservation, espace, facture..." style={{
              width: '100%', padding: '11px 14px 11px 40px',
              borderRadius: 12, border: '1px solid var(--line)',
              background: 'var(--cream)', fontSize: 13, color: 'var(--body)',
              outline: 'none', fontFamily: 'inherit',
            }}/>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              padding: '10px 16px', borderRadius: 12, border: '1px solid var(--line)',
              background: '#fff', color: 'var(--body)', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            }}>
              <Icon name="calendar" size={15} stroke="var(--main)"/>
              Mar 22 avril
            </button>
            <button style={{
              width: 42, height: 42, borderRadius: 12, border: '1px solid var(--line)',
              background: '#fff', color: 'var(--body)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer',
            }}>
              <Icon name="bell" size={17}/>
              <span style={{ position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: '50%', background: 'var(--btn)', border: '1.5px solid #fff' }}/>
            </button>
            <button style={{
              padding: '10px 18px', borderRadius: 12, border: 'none',
              background: 'var(--main)', color: '#fff', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            }}>
              <Icon name="plus" size={15} stroke="#fff" sw={2}/>
              Nouvelle réservation
            </button>
          </div>
        </div>

        {/* content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 32px' }}>
          {/* header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
            <div>
              <div className="tag">Mardi 22 avril · Bon retour</div>
              <div className="serif" style={{ fontSize: 34, color: 'var(--body)', lineHeight: 1.1, marginTop: 4 }}>
                Bonjour, <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>{u.name.split(' ')[0]}</em>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div className="tag">Prochaine session</div>
                <div style={{ fontSize: 14, color: 'var(--body)', fontWeight: 500, marginTop: 2 }}>Dans 2h 14min</div>
              </div>
              <div style={{ width: 1, height: 36, background: 'var(--line)' }}/>
              <div style={{ textAlign: 'right' }}>
                <div className="tag">Solde fidélité</div>
                <div style={{ fontSize: 14, color: 'var(--body)', fontWeight: 500, marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>{s.memberPoints} pts</div>
              </div>
            </div>
          </div>

          {/* bento */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            {/* Hero: next booking */}
            <div style={{
              gridColumn: 'span 2', gridRow: 'span 2',
              background: 'linear-gradient(145deg, var(--main) 0%, var(--main-dark) 65%, var(--body) 110%)',
              color: '#fff', borderRadius: 20, padding: 26,
              position: 'relative', overflow: 'hidden', minHeight: 240,
            }}>
              <div style={{ position: 'absolute', top: -80, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,211,129,0.16) 0%, transparent 70%)' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <span className="chip chip-dark" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <span className="dot" style={{ background: 'var(--btn)' }}/>Votre prochaine réservation
                </span>
                <span className="tag" style={{ color: 'rgba(255,255,255,0.55)' }}>#{next.id.toUpperCase()}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'flex-end' }}>
                <div>
                  <div className="serif" style={{ fontSize: 42, lineHeight: 1.05, marginBottom: 10 }}>{next.space}</div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, opacity: 0.85 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="calendar" size={14} stroke="var(--btn)"/> {next.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="clock" size={14} stroke="var(--btn)"/> {next.time}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="people" size={14} stroke="var(--btn)"/> {next.people} personnes</span>
                  </div>
                  <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
                    <button style={{ padding: '11px 18px', background: 'var(--btn)', color: 'var(--secondary)', border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name="qr" size={15} stroke="var(--secondary)"/>Voir le QR check-in
                    </button>
                    <button style={{ padding: '11px 18px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 11, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                      Modifier
                    </button>
                  </div>
                </div>
                <div style={{
                  width: 100, height: 100, background: '#fff',
                  borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 10,
                }}>
                  <QRPattern/>
                </div>
              </div>
            </div>

            {/* Stat: hours */}
            <StatBig icon="clock" color="var(--main)" bg="rgba(65,121,114,0.1)" value={s.hoursBooked} unit="h" label="Heures réservées" sub="+12h ce mois" trend="up"/>

            {/* Stat: savings */}
            <StatBig icon="tag" color="var(--success)" bg="rgba(76,160,110,0.12)" value={s.savings} unit="€" label="Économies fidélité" sub="+18€ ce mois" trend="up"/>
          </div>

          {/* second row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
            {/* upcoming table */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--line)', padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div className="serif" style={{ fontSize: 20, color: 'var(--body)' }}>Vos réservations à venir</div>
                  <div style={{ fontSize: 12, color: 'var(--gry)', marginTop: 2 }}>{window.MOCK.upcoming.length} prochaines sessions</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ padding: '7px 12px', borderRadius: 9, background: 'rgba(65,121,114,0.08)', color: 'var(--main)', fontSize: 12, border: 'none', fontWeight: 500 }}>Toutes</button>
                  <button style={{ padding: '7px 12px', borderRadius: 9, background: 'transparent', color: 'var(--gry)', fontSize: 12, border: 'none' }}>Cette semaine</button>
                </div>
              </div>
              <div>
                {[['Espace', 'Date', 'Horaire', 'Pers.', 'Statut', 'Prix'].map((h, i) => (
                  <span key={h} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, color: 'var(--gry)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{h}</span>
                ))].flat()}
                <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr 0.6fr 1fr 0.8fr', gap: 10, padding: '0 12px 10px', borderBottom: '1px solid var(--line)' }}>
                  {['Espace', 'Date', 'Horaire', 'Pers.', 'Statut', 'Prix'].map(h => (
                    <span key={h} className="tag" style={{ fontSize: 9.5 }}>{h}</span>
                  ))}
                </div>
                {window.MOCK.upcoming.map((b, i) => {
                  const sp = window.MOCK.spaces[b.spaceKey];
                  return (
                    <div key={b.id} style={{
                      display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr 0.6fr 1fr 0.8fr', gap: 10,
                      padding: '14px 12px', alignItems: 'center',
                      borderBottom: i < window.MOCK.upcoming.length - 1 ? '1px solid var(--line)' : 'none',
                      fontSize: 13, cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: sp.color }}/>
                        <span style={{ color: 'var(--body)', fontWeight: 500 }}>{b.space}</span>
                      </div>
                      <span style={{ color: 'var(--body)' }}>{b.dateShort}</span>
                      <span className="num" style={{ fontSize: 12, color: 'var(--body)' }}>{b.time}</span>
                      <span className="num" style={{ fontSize: 12, color: 'var(--gry)' }}>{b.people}</span>
                      <span className={`chip ${b.status === 'confirmed' ? 'chip-success' : 'chip-warn'}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                        {b.status === 'confirmed' ? 'Validée' : 'En attente'}
                      </span>
                      <span className="num" style={{ textAlign: 'right', color: 'var(--body)', fontWeight: 500 }}>{b.price}€</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* loyalty + promo stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: 'var(--body)', color: '#fff', borderRadius: 20,
                padding: 22, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,211,129,0.22) 0%, transparent 70%)' }}/>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span className="tag" style={{ color: 'rgba(255,255,255,0.55)' }}>Fidélité</span>
                  <Icon name="sparkle" size={16} stroke="var(--btn)" fill="var(--btn)"/>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span className="num" style={{ fontSize: 40, color: 'var(--btn)' }}>{s.memberPoints}</span>
                  <span style={{ fontSize: 13, opacity: 0.6 }}>/ {s.nextReward} pts</span>
                </div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Plus que {s.nextReward - s.memberPoints} pts pour une boisson offerte</div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 16, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(s.memberPoints/s.nextReward)*100}%`, background: 'var(--btn)', borderRadius: 3 }}/>
                </div>
              </div>

              <div style={{
                background: 'var(--btn)', borderRadius: 20, padding: 22,
                position: 'relative', overflow: 'hidden',
              }}>
                <Icon name="gift" size={22} stroke="var(--secondary)"/>
                <div className="serif" style={{ fontSize: 22, color: 'var(--secondary)', marginTop: 10, lineHeight: 1.15 }}>Happy Hour</div>
                <div style={{ fontSize: 12, color: 'rgba(26,26,26,0.7)', marginTop: 4, marginBottom: 14 }}>-20% sur les open-space après 17h, du lundi au jeudi</div>
                <button style={{ padding: '9px 14px', background: 'var(--body)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                  En profiter →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatBig({ icon, color, bg, value, unit, label, sub, trend }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 22, border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={20}/>
        </div>
        {trend === 'up' && (
          <span style={{ fontSize: 10, color: 'var(--success)', fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center', gap: 3 }}>
            ↗ +12%
          </span>
        )}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span className="serif" style={{ fontSize: 38, color: 'var(--body)', lineHeight: 1 }}>{value}</span>
          <span style={{ fontSize: 18, color: 'var(--gry)' }}>{unit}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--gry)', marginTop: 4 }}>{label}</div>
        {sub && <div className="num" style={{ fontSize: 10, color: 'var(--main)', marginTop: 6 }}>{sub}</div>}
      </div>
    </div>
  );
}

window.DesktopDashboard = DesktopDashboard;
