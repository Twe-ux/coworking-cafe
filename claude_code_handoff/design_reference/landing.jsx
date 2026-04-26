// landing.jsx — 3 versions de la page "/" dans le style du dashboard client
const { useState: lS } = React;

const BRAND = {
  name: 'CoworKing Café',
  city: 'Strasbourg',
  address: '1 rue de la Division Leclerc · 67000 Strasbourg',
  tagline: 'Le café motive · L\'humain relie',
  drinks: '+40 boissons illimitées',
  hours: 'Lun–Ven 9h–20h · Sam–Dim 10h–20h',
  phone: '+33 9 87 33 45 19',
};

// ═════════════════════════════════════════════════════
// V1 — Editorial & chaleureux (serif hero, bento sections)
// ═════════════════════════════════════════════════════
function LandingV1() {
  return (
    <div style={{ width: 1280, background: 'var(--cream)', fontFamily: 'Inter, sans-serif' }}>
      <LandingNav dark={false}/>

      {/* Hero editorial */}
      <section style={{ padding: '40px 48px 56px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div className="tag" style={{ color: 'var(--main)', marginBottom: 16 }}>· Coworking café · Strasbourg centre</div>
            <h1 className="serif" style={{ fontSize: 88, lineHeight: 0.98, color: 'var(--body)', margin: 0, letterSpacing: '-0.03em', fontWeight: 400 }}>
              Un bureau qui sent <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>le café</em>, pas <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>l'openspace</em>.
            </h1>
            <p style={{ fontSize: 17, color: 'var(--gry)', lineHeight: 1.55, marginTop: 22, maxWidth: 500 }}>
              Un lieu pour travailler, se concentrer, et prendre le temps d'un expresso entre deux calls. +40 boissons illimitées, Wi-Fi fibre, salles privatisables à la journée ou à l'heure.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button style={{ padding: '15px 26px', background: 'var(--body)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                Réserver une place <Icon name="chevRight" size={15} stroke="var(--btn)" sw={2}/>
              </button>
              <button style={{ padding: '15px 22px', background: '#fff', color: 'var(--body)', border: '1px solid var(--line)', borderRadius: 14, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="calendar" size={15} stroke="var(--main)"/>Visite des lieux
              </button>
            </div>
            <div style={{ display: 'flex', gap: 26, marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
              {[['4.9', '/5', 'Google · 280 avis'], ['9h', '/20h', 'Ouvert 7/7'], ['4', 'espaces', 'à privatiser']].map(([n, u, l], i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <span className="serif" style={{ fontSize: 28, color: 'var(--body)' }}>{n}</span>
                    <span style={{ fontSize: 13, color: 'var(--gry)' }}>{u}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gry)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image card */}
          <div style={{ position: 'relative', height: 560 }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '85%', height: '75%',
              borderRadius: 28, overflow: 'hidden',
              background: 'linear-gradient(165deg, #5A938B, var(--main) 40%, var(--main-dark) 100%)',
            }}>
              <CafeIllustration/>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(20,34,32,0.3) 100%)' }}/>
              <div style={{ position: 'absolute', bottom: 18, left: 18, color: '#fff' }}>
                <div className="tag" style={{ color: 'rgba(255,255,255,0.7)' }}>Open-space · fibre 1Gb/s</div>
                <div className="serif" style={{ fontSize: 22, marginTop: 4 }}>Rez-de-chaussée</div>
              </div>
            </div>
            {/* Live badge */}
            <div style={{
              position: 'absolute', top: 20, left: 0,
              background: '#fff', borderRadius: 16, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 12px 32px rgba(20,34,32,0.12)',
              border: '1px solid var(--line)', zIndex: 2,
            }}>
              <span className="dot" style={{ background: 'var(--success)' }}/>
              <div>
                <div style={{ fontSize: 11, color: 'var(--gry)' }}>En ce moment</div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--body)' }}>12 places disponibles</div>
              </div>
            </div>
            {/* Small image card */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, width: '55%', height: '38%',
              borderRadius: 22, overflow: 'hidden',
              background: 'var(--btn)',
              border: '6px solid var(--cream)',
              padding: 18, color: 'var(--secondary)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <Icon name="cookie" size={24} stroke="var(--secondary)"/>
              <div>
                <div className="serif" style={{ fontSize: 22, lineHeight: 1.1 }}>{BRAND.drinks}</div>
                <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 4 }}>Café, thés, matcha, chocolats, infusions…</div>
              </div>
            </div>
            {/* Price chip */}
            <div style={{
              position: 'absolute', top: '48%', right: '-4%', background: 'var(--body)', color: '#fff',
              borderRadius: 16, padding: '14px 18px', zIndex: 2,
              boxShadow: '0 12px 32px rgba(20,34,32,0.25)',
            }}>
              <div className="tag" style={{ color: 'rgba(255,255,255,0.55)' }}>Dès</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span className="serif" style={{ fontSize: 26, color: 'var(--btn)' }}>9</span>
                <span style={{ fontSize: 13 }}>€/h</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spaces bento */}
      <section style={{ padding: '32px 48px 56px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <div className="tag" style={{ color: 'var(--main)', marginBottom: 8 }}>— 01 · Nos espaces</div>
            <div className="serif" style={{ fontSize: 44, color: 'var(--body)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              Quatre ambiances, <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>un seul état d'esprit</em>
            </div>
          </div>
          <button style={{ padding: '11px 18px', background: 'transparent', color: 'var(--body)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Voir la tarification →
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gridTemplateRows: '220px 220px', gap: 14 }}>
          <SpaceCard size="lg" {...window.LAND_SPACES[0]}/>
          <SpaceCard {...window.LAND_SPACES[1]}/>
          <SpaceCard {...window.LAND_SPACES[2]}/>
          <SpaceCard size="wide" {...window.LAND_SPACES[3]}/>
        </div>
      </section>

      <ConceptStripe/>
      <TestimonialBlock/>
      <FooterBlock/>
    </div>
  );
}

// ═════════════════════════════════════════════════════
// V2 — Dark & immersif (hero plein vert sauge, magazine)
// ═════════════════════════════════════════════════════
function LandingV2() {
  return (
    <div style={{ width: 1280, background: 'var(--body)', fontFamily: 'Inter, sans-serif' }}>
      <LandingNav dark={true}/>

      {/* Hero dark full-bleed */}
      <section style={{
        padding: '24px 48px 56px',
        background: 'linear-gradient(160deg, var(--body) 0%, var(--main-dark) 60%, var(--main) 110%)',
        color: '#fff', position: 'relative', overflow: 'hidden',
        minHeight: 640,
      }}>
        <div style={{ position: 'absolute', top: -100, right: -80, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,211,129,0.15) 0%, transparent 65%)' }}/>
        <div style={{ position: 'absolute', bottom: -140, left: -100, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)' }}/>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'flex-end', marginTop: 60, position: 'relative' }}>
          <div>
            <span className="chip chip-dark" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <span className="dot" style={{ background: 'var(--btn)' }}/>Ouvert maintenant · {BRAND.city}
            </span>
            <h1 className="serif" style={{ fontSize: 116, lineHeight: 0.92, margin: '20px 0 0', letterSpacing: '-0.035em', fontWeight: 400 }}>
              Travailler <em style={{ color: 'var(--btn)', fontStyle: 'italic' }}>mieux</em>,<br/>
              un café à <em style={{ color: 'var(--btn)', fontStyle: 'italic' }}>la fois</em>.
            </h1>
            <p style={{ fontSize: 18, opacity: 0.75, lineHeight: 1.5, marginTop: 28, maxWidth: 560 }}>
              Espace de coworking chaleureux au cœur de Strasbourg. Boissons illimitées, Wi-Fi fibre, salles privatisables. Pas d'abonnement imposé — payez seulement le temps que vous restez.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 38 }}>
              <button style={{ padding: '17px 28px', background: 'var(--btn)', color: 'var(--secondary)', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                Réserver en ligne <Icon name="chevRight" size={16} stroke="var(--secondary)" sw={2.2}/>
              </button>
              <button style={{ padding: '17px 24px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="building" size={16} stroke="var(--btn)"/>Découvrir le lieu
              </button>
            </div>
          </div>

          {/* Floating info cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(242,211,129,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="cookie" size={17} stroke="var(--btn)"/>
                </div>
                <span className="tag" style={{ color: 'rgba(255,255,255,0.6)' }}>Boissons</span>
              </div>
              <div className="serif" style={{ fontSize: 30, lineHeight: 1 }}>+40</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>à volonté, dans le prix</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(76,160,110,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="sparkle" size={17} stroke="#7FD49A"/>
                </div>
                <span className="tag" style={{ color: 'rgba(255,255,255,0.6)' }}>Wi-Fi</span>
              </div>
              <div className="serif" style={{ fontSize: 30, lineHeight: 1 }}>1 Gb/s</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Fibre dédiée, VPN OK</div>
            </div>
            <div style={{ background: 'var(--btn)', color: 'var(--secondary)', borderRadius: 18, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Icon name="star" size={16} stroke="var(--secondary)" fill="var(--secondary)"/>
                <span className="tag" style={{ color: 'rgba(26,26,26,0.65)' }}>Google</span>
              </div>
              <div className="serif" style={{ fontSize: 30, lineHeight: 1 }}>4.9<span style={{ fontSize: 15, opacity: 0.6 }}>/5</span></div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>280 avis clients</div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div style={{ marginTop: 60, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
          <div style={{ display: 'flex', gap: 40, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            <span>✦ Télétravailleurs</span>
            <span>✦ Indépendants</span>
            <span>✦ Étudiants</span>
            <span>✦ Équipes</span>
            <span>✦ Événements privés</span>
          </div>
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>↓ SCROLL</span>
        </div>
      </section>

      {/* Spaces as magazine spread */}
      <section style={{ background: 'var(--cream)', padding: '64px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 60, marginBottom: 32 }}>
          <div>
            <div className="tag" style={{ color: 'var(--main)', marginBottom: 8 }}>— 01 · Espaces</div>
            <div className="serif" style={{ fontSize: 48, color: 'var(--body)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              Choisissez votre <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>ambiance</em>
            </div>
          </div>
          <div style={{ fontSize: 16, color: 'var(--gry)', lineHeight: 1.6, alignSelf: 'flex-end' }}>
            Quatre espaces pensés pour des usages différents — du deep-work en solo au brainstorm d'équipe. Réservables à l'heure, à la journée, à la semaine ou au mois.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
          {window.LAND_SPACES.map((s, i) => (
            <MagSpaceCard key={i} {...s} number={`0${i+1}`}/>
          ))}
        </div>
      </section>

      <ConceptStripe dark/>
      <TestimonialBlock dark/>
      <FooterBlock dark/>
    </div>
  );
}

// ═════════════════════════════════════════════════════
// V3 — Live & data-driven (dashboard-style landing)
// ═════════════════════════════════════════════════════
function LandingV3() {
  return (
    <div style={{ width: 1280, background: 'var(--cream)', fontFamily: 'Inter, sans-serif' }}>
      <LandingNav dark={false}/>

      {/* Hero live */}
      <section style={{ padding: '36px 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }}>
          {/* Main card */}
          <div style={{
            background: 'var(--body)', color: '#fff', borderRadius: 28,
            padding: 44, position: 'relative', overflow: 'hidden',
            minHeight: 520,
          }}>
            <div style={{ position: 'absolute', top: -60, right: -40, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,211,129,0.18) 0%, transparent 70%)' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, position: 'relative' }}>
              <span className="chip chip-dark" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <span className="dot" style={{ background: 'var(--success)' }}/>Ouvert · 12/40 places prises
              </span>
              <span className="tag" style={{ color: 'rgba(255,255,255,0.5)' }}>22.04 · 10:24</span>
            </div>
            <h1 className="serif" style={{ fontSize: 76, lineHeight: 0.98, margin: 0, letterSpacing: '-0.03em', fontWeight: 400 }}>
              Votre bureau, <em style={{ color: 'var(--btn)', fontStyle: 'italic' }}>à la demande.</em>
            </h1>
            <p style={{ fontSize: 15.5, opacity: 0.75, lineHeight: 1.55, marginTop: 20, maxWidth: 480 }}>
              Réservez une place, une salle ou un espace entier en 2 clics. Comme vous feriez un café — simplement.
            </p>

            {/* Inline quick booking */}
            <div style={{ marginTop: 36, background: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 6, display: 'flex', alignItems: 'center', gap: 0, backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {[
                { tag: 'Espace', v: 'Open-space', i: 'building' },
                { tag: 'Date', v: 'Aujourd\'hui', i: 'calendar' },
                { tag: 'Durée', v: '3h', i: 'clock' },
              ].map((f, i) => (
                <div key={f.tag} style={{ flex: 1, padding: '12px 16px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                  <div className="tag" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9 }}>{f.tag}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Icon name={f.i} size={14} stroke="var(--btn)"/>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{f.v}</span>
                  </div>
                </div>
              ))}
              <button style={{ padding: '14px 20px', margin: 4, background: 'var(--btn)', color: 'var(--secondary)', border: 'none', borderRadius: 14, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                Réserver · 27€ <Icon name="chevRight" size={14} stroke="var(--secondary)" sw={2.2}/>
              </button>
            </div>

            <div style={{ marginTop: 28, display: 'flex', gap: 26, fontSize: 12, opacity: 0.7 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={13} stroke="var(--btn)" sw={2.2}/>Sans engagement</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={13} stroke="var(--btn)" sw={2.2}/>Annulation gratuite J-1</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={13} stroke="var(--btn)" sw={2.2}/>Boissons incluses</span>
            </div>
          </div>

          {/* Right column: live stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 22, padding: 20, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span className="tag" style={{ color: 'var(--main)' }}>Aujourd'hui en direct</span>
                <span className="dot" style={{ background: 'var(--success)', animation: 'none' }}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { v: '12', u: '/40', l: 'Places prises', c: 'var(--main)' },
                  { v: '24', u: '°C', l: 'Ambiance', c: 'var(--btn-dark)' },
                  { v: '1.2', u: 'Gb/s', l: 'Débit Wi-Fi', c: 'var(--success)' },
                  { v: '3', u: '/4', l: 'Salles libres', c: 'var(--main)' },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                      <span className="serif" style={{ fontSize: 32, color: 'var(--body)', lineHeight: 1 }}>{s.v}</span>
                      <span style={{ fontSize: 13, color: s.c, fontWeight: 500 }}>{s.u}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gry)', marginTop: 4 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              {/* Mini chart */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                <div className="tag" style={{ fontSize: 9, marginBottom: 8 }}>Affluence 24h</div>
                <svg width="100%" height="54" viewBox="0 0 280 54" preserveAspectRatio="none">
                  <path d="M0,44 L20,40 L40,36 L60,28 L80,22 L100,18 L120,14 L140,22 L160,16 L180,10 L200,6 L220,12 L240,20 L260,30 L280,38"
                    fill="none" stroke="var(--main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M0,44 L20,40 L40,36 L60,28 L80,22 L100,18 L120,14 L140,22 L160,16 L180,10 L200,6 L220,12 L240,20 L260,30 L280,38 L280,54 L0,54 Z"
                    fill="rgba(65,121,114,0.1)"/>
                  <circle cx="140" cy="22" r="4" fill="var(--btn)" stroke="#fff" strokeWidth="2"/>
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: 'var(--gry)', fontFamily: 'JetBrains Mono, monospace' }}>
                  <span>9h</span><span>12h</span><span>15h</span><span>18h</span><span>20h</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--btn)', color: 'var(--secondary)', borderRadius: 22, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Icon name="gift" size={18} stroke="var(--secondary)"/>
                <span className="tag" style={{ color: 'rgba(26,26,26,0.65)' }}>Offre du jour</span>
              </div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.1 }}>Happy Hour après 17h : -20%</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>Sur tous les open-space, du lundi au jeudi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Spaces horizontal scroll-like */}
      <section style={{ padding: '16px 32px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <span className="tag" style={{ color: 'var(--main)' }}>— 01 · Nos espaces</span>
            <div className="serif" style={{ fontSize: 36, color: 'var(--body)', lineHeight: 1.05, marginTop: 6, letterSpacing: '-0.02em' }}>
              Choisissez, réservez, <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>travaillez.</em>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {window.LAND_SPACES.map((s, i) => (
            <CompactSpaceCard key={i} {...s}/>
          ))}
        </div>
      </section>

      <ConceptStripe/>
      <TestimonialBlock/>
      <FooterBlock/>
    </div>
  );
}

// ─── Shared components
function LandingNav({ dark }) {
  const txt = dark ? '#fff' : 'var(--body)';
  const op = dark ? 0.7 : 0.65;
  return (
    <nav style={{
      padding: '22px 32px', display: 'flex', alignItems: 'center', gap: 30,
      color: txt, borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'var(--line)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--btn)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="building" size={18} stroke="var(--secondary)"/>
        </div>
        <div>
          <div className="serif" style={{ fontSize: 16, letterSpacing: '-0.01em' }}>CoworKing Café</div>
          <div style={{ fontSize: 9, opacity: 0.55, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em' }}>STRASBOURG · EST. 2022</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 26, justifyContent: 'center', fontSize: 13, fontWeight: 500, opacity: op }}>
        <span>Espaces</span><span>Tarifs</span><span>Menu</span><span>Événements</span><span>Concept</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 500, opacity: op }}>Se connecter</span>
        <button style={{
          padding: '10px 18px', borderRadius: 12,
          background: dark ? 'var(--btn)' : 'var(--body)',
          color: dark ? 'var(--secondary)' : '#fff',
          border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>Réserver</button>
      </div>
    </nav>
  );
}

function CafeIllustration() {
  return (
    <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%', opacity: 0.9 }}>
      <defs>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.1)"/>
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#dots)"/>
      {/* stylized cafe scene */}
      <circle cx="320" cy="100" r="60" fill="rgba(242,211,129,0.3)"/>
      <circle cx="80" cy="320" r="90" fill="rgba(255,255,255,0.06)"/>
      {/* coffee cup */}
      <g transform="translate(140 140)">
        <path d="M10 40 L10 100 Q10 120 30 120 L90 120 Q110 120 110 100 L110 40 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
        <path d="M110 60 Q130 60 130 80 Q130 100 110 100" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
        <ellipse cx="60" cy="40" rx="50" ry="8" fill="rgba(26,26,26,0.4)"/>
        {/* steam */}
        <path d="M40 25 Q45 10 40 -5 Q35 -20 40 -35" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M60 20 Q65 5 60 -10 Q55 -25 60 -40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M80 25 Q85 10 80 -5 Q75 -20 80 -35" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function SpaceCard({ name, tag, price, color, bg, emoji, capacity, size }) {
  const spans = size === 'lg' ? { gridRow: 'span 2' } : size === 'wide' ? { gridColumn: 'span 2' } : {};
  return (
    <div style={{
      ...spans, background: '#fff', borderRadius: 20, border: '1px solid var(--line)',
      padding: 20, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 160, height: 160, background: bg, borderRadius: '0 0 0 100%', opacity: 0.5 }}/>
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ fontSize: size === 'lg' ? 52 : 34, marginBottom: 10 }}>{emoji}</div>
        <div className="tag" style={{ color }}>{tag}</div>
        <div className="serif" style={{ fontSize: size === 'lg' ? 32 : 22, color: 'var(--body)', marginTop: 4, lineHeight: 1.05 }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--gry)', marginTop: 6 }}>{capacity}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)', position: 'relative' }}>
        <span className="num" style={{ fontSize: 14, color: 'var(--body)', fontWeight: 500 }}>dès {price}€<span style={{ color: 'var(--gry)', fontWeight: 400 }}>/h</span></span>
        <span style={{ fontSize: 11, color, fontWeight: 500 }}>Réserver →</span>
      </div>
    </div>
  );
}

function MagSpaceCard({ name, tag, price, color, bg, emoji, capacity, number }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--line)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 160, background: `linear-gradient(160deg, ${color}, ${color}dd)`, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 16 }}>
        <span style={{ position: 'absolute', top: 14, left: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.14em' }}>{number}</span>
        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 48, opacity: 0.35 }}>{emoji}</div>
        <div className="serif" style={{ fontSize: 26, color: '#fff', lineHeight: 1.05 }}>{name}</div>
      </div>
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 12, color: 'var(--gry)', flex: 1 }}>{capacity}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span className="num" style={{ fontSize: 14, color: 'var(--body)', fontWeight: 500 }}>dès {price}€/h</span>
          <Icon name="chevRight" size={14} stroke="var(--main)"/>
        </div>
      </div>
    </div>
  );
}

function CompactSpaceCard({ name, tag, price, color, bg, emoji, capacity }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--line)', padding: 16, cursor: 'pointer', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{emoji}</div>
        <span className="chip chip-success" style={{ fontSize: 10 }}>
          <span className="dot" style={{ background: 'var(--success)' }}/>Dispo
        </span>
      </div>
      <div className="serif" style={{ fontSize: 18, color: 'var(--body)' }}>{name}</div>
      <div style={{ fontSize: 11.5, color: 'var(--gry)', marginTop: 4, minHeight: 30 }}>{capacity}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
        <span className="num" style={{ fontSize: 13, color: 'var(--body)', fontWeight: 500 }}>dès {price}€</span>
        <span style={{ fontSize: 11, color, fontWeight: 500 }}>Réserver →</span>
      </div>
    </div>
  );
}

function ConceptStripe({ dark }) {
  return (
    <section style={{
      background: dark ? 'var(--body)' : 'var(--main)',
      color: '#fff', padding: '64px 48px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 60 }}>
        <div>
          <div className="tag" style={{ color: 'var(--btn)', marginBottom: 8 }}>— 02 · Le concept</div>
          <div className="serif" style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Le café <em style={{ color: 'var(--btn)', fontStyle: 'italic' }}>motive</em>.<br/>
            L'humain <em style={{ color: 'var(--btn)', fontStyle: 'italic' }}>relie</em>.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          {[
            { i: 'cookie', t: 'Payez au temps, pas à la conso', d: 'Entrez, travaillez, servez-vous. On compte les heures, pas les cafés.' },
            { i: 'building', t: '4 espaces, un seul lieu', d: 'Open-space, salles, événementiel. Adaptez l\'espace à votre besoin.' },
            { i: 'sparkle', t: 'Fibre + équipement pro', d: 'Écrans, visio, imprimantes, casiers. Le setup d\'un vrai bureau.' },
            { i: 'people', t: 'Une communauté', d: 'Indépendants, startups, étudiants. Des événements chaque mois.' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 14 }}>
              <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: 'rgba(242,211,129,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={f.i} size={20} stroke="var(--btn)"/>
              </div>
              <div>
                <div className="serif" style={{ fontSize: 17 }}>{f.t}</div>
                <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4, lineHeight: 1.5 }}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialBlock({ dark }) {
  const bg = dark ? 'var(--body)' : 'var(--cream)';
  const txt = dark ? '#fff' : 'var(--body)';
  const sub = dark ? 'rgba(255,255,255,0.7)' : 'var(--gry)';
  return (
    <section style={{ background: bg, padding: '64px 48px', color: txt }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <div className="tag" style={{ color: 'var(--main)', marginBottom: 8 }}>— 03 · Témoignages</div>
          <div className="serif" style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Ce qu'ils en <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>disent</em>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ display: 'flex', gap: 2 }}>
            {[...Array(5)].map((_, i) => <Icon key={i} name="star" size={16} fill="var(--btn)" stroke="var(--btn)"/>)}
          </span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>4.9 <span style={{ opacity: 0.6, fontSize: 13 }}>· 280 avis Google</span></span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {[
          { q: 'Mon bureau de secours qui est devenu mon bureau principal. Le cappuccino est incroyable et le Wi-Fi toujours rapide.', n: 'Léa Marchand', r: 'Designer freelance · 2 ans membre' },
          { q: 'On privatise la salle verrière pour nos workshops d\'équipe une fois par mois. Toujours impeccable, toujours accueillant.', n: 'Hugo Petit', r: 'CEO · Studio Hélium' },
          { q: 'Le meilleur rapport qualité/prix du centre-ville. Et les boissons à volonté, c\'est un vrai plus pour les longues sessions.', n: 'Anaïs Dubois', r: 'Étudiante Master 2' },
        ].map((t, i) => (
          <div key={i} style={{
            background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'var(--line)'}`,
            borderRadius: 20, padding: 22,
          }}>
            <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
              {[...Array(5)].map((_, j) => <Icon key={j} name="star" size={13} fill="var(--btn)" stroke="var(--btn)"/>)}
            </div>
            <div className="serif" style={{ fontSize: 17, lineHeight: 1.45 }}>« {t.q} »</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--main)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 14 }}>{t.n.split(' ').map(w => w[0]).slice(0,2).join('')}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.n}</div>
                <div style={{ fontSize: 11, color: sub, marginTop: 1 }}>{t.r}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FooterBlock({ dark }) {
  return (
    <section style={{
      background: dark ? '#0B1513' : 'var(--body)', color: '#fff', padding: '48px 48px 30px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40, marginBottom: 36 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--btn)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="building" size={18} stroke="var(--secondary)"/>
            </div>
            <div className="serif" style={{ fontSize: 18 }}>CoworKing Café</div>
          </div>
          <div style={{ fontSize: 13, opacity: 0.65, lineHeight: 1.55 }}>
            {BRAND.address}<br/>
            {BRAND.hours}<br/>
            {BRAND.phone}
          </div>
        </div>
        {[
          ['Espaces', ['Open-space', 'Salle Verrière', 'Salle Étage', 'Événementiel']],
          ['Le lieu', ['Concept', 'Menu boissons', 'Partenaires', 'Blog']],
          ['Membre', ['Tarifs', 'Connexion', 'Programme fidélité', 'Contact']],
        ].map(([t, items]) => (
          <div key={t}>
            <div className="tag" style={{ color: 'var(--btn)', marginBottom: 12 }}>{t}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, opacity: 0.7 }}>
              {items.map(i => <span key={i}>{i}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 11, opacity: 0.5, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
        <span>© 2026 COWORKING CAFÉ · TOUS DROITS RÉSERVÉS</span>
        <span>{BRAND.tagline.toUpperCase()}</span>
      </div>
    </section>
  );
}

// shared data
window.LAND_SPACES = [
  { name: 'Open-space', tag: 'Flexible', emoji: '💻', price: 9, capacity: 'Jusqu\'à 40 places · ambiance studieuse', color: '#417972', bg: 'rgba(65,121,114,0.14)' },
  { name: 'Salle Verrière', tag: 'Meeting', emoji: '🌿', price: 24, capacity: '6 pers. · lumière naturelle', color: '#5A938B', bg: 'rgba(90,147,139,0.18)' },
  { name: 'Salle Étage', tag: 'Privé', emoji: '🏛️', price: 30, capacity: '10 pers. · salle privatisée', color: '#8A6B1F', bg: 'rgba(242,211,129,0.3)' },
  { name: 'Événementiel', tag: 'Soirées', emoji: '🎉', price: 80, capacity: '40 pers. · privatisation complète', color: '#C0534C', bg: 'rgba(192,83,76,0.14)' },
];

window.LandingV1 = LandingV1;
window.LandingV2 = LandingV2;
window.LandingV3 = LandingV3;
