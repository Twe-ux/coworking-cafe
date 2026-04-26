// booking-desktop.jsx — Desktop version of the Nouvelle Réservation flow
const { useState: bdS } = React;

const SPACES_D = [
  { key: 'open-space', label: 'Open-space', desc: 'Bureau partagé, ambiance studieuse · jusqu\'à 40 places', price: 9, priceUnit: '/h', max: 40, color: '#417972', bg: 'rgba(65,121,114,0.1)', emoji: '💻', features: ['Wi-Fi fibre 1Gb/s', 'Boissons illimitées', 'Casier sécurisé'] },
  { key: 'salle-verriere', label: 'Salle Verrière', desc: 'Salle de réunion lumineuse, idéale pour les ateliers', price: 24, priceUnit: '/h', max: 6, color: '#5A938B', bg: 'rgba(90,147,139,0.14)', emoji: '🌿', features: ['Lumière naturelle', 'Écran 55"', 'Visio intégrée'] },
  { key: 'salle-etage', label: 'Salle Étage', desc: 'Espace privatisé à l\'étage, ambiance cosy', price: 30, priceUnit: '/h', max: 10, color: '#8A6B1F', bg: 'rgba(242,211,129,0.22)', emoji: '🏛️', features: ['Privatisé', 'Tableau blanc', 'Boissons incluses'] },
  { key: 'evenementiel', label: 'Événementiel', desc: 'Privatisation complète pour événements privés', price: 80, priceUnit: '/h', max: 40, color: '#C0534C', bg: 'rgba(192,83,76,0.1)', emoji: '🎉', features: ['Privatisation totale', 'Sono + lumières', 'Service traiteur'] },
];

const TYPES_D = [
  { key: 'hourly', label: 'À l\'heure', desc: 'Flexible, par tranche de 1h', icon: 'clock' },
  { key: 'daily', label: 'Journée', desc: '9h – 19h · tarif dégressif', icon: 'sparkle' },
  { key: 'weekly', label: 'Semaine', desc: '7 jours consécutifs · -15%', icon: 'calendar' },
  { key: 'monthly', label: 'Mois', desc: '30 jours · -40%', icon: 'building' },
];

const SERVICES_D = [
  { key: 'coffee', label: 'Café premium illimité', desc: 'Barista + sélection de spécialités', price: 5, icon: 'cookie' },
  { key: 'lunch', label: 'Pause déjeuner', desc: 'Plat chaud + dessert du jour', price: 14, icon: 'gift' },
  { key: 'parking', label: 'Parking privé', desc: 'Place réservée en sous-sol', price: 8, icon: 'tag' },
  { key: 'screen', label: 'Écran + setup visio', desc: '55" 4K, caméra, micro conférence', price: 10, icon: 'building' },
];

function BookingDesktop() {
  const [step, setStep] = bdS(0);
  const [data, setData] = bdS({
    space: 'salle-verriere',
    type: 'hourly',
    date: 22,
    startTime: '09:00',
    endTime: '12:00',
    people: 4,
    services: { coffee: 1 },
    notes: '',
  });
  const set = (k, v) => setData({ ...data, [k]: v });

  const space = SPACES_D.find(s => s.key === data.space);
  const hours = data.type === 'hourly' ? 3 : data.type === 'daily' ? 10 : data.type === 'weekly' ? 70 : 300;
  const multiplier = data.type === 'weekly' ? 0.85 : data.type === 'monthly' ? 0.6 : 1;
  const basePrice = space.price * hours * multiplier;
  const servicesTotal = Object.entries(data.services).reduce((t, [k, q]) => {
    const sv = SERVICES_D.find(s => s.key === k); return t + (sv?.price || 0) * (q || 0);
  }, 0);
  const total = Math.round(basePrice + servicesTotal);

  const stepLabels = ['Espace', 'Date & horaires', 'Options', 'Confirmation'];

  return (
    <div style={{
      width: 1280, minHeight: 820,
      background: 'var(--cream)', display: 'grid',
      gridTemplateColumns: '240px 1fr 380px',
      fontFamily: 'Inter, sans-serif',
      borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line)',
    }}>
      {/* Left — sidebar with progress */}
      <aside style={{
        background: 'var(--body)', color: '#fff', padding: '28px 22px',
        display: 'flex', flexDirection: 'column', gap: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--btn)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="building" size={16} stroke="var(--secondary)"/>
          </div>
          <div>
            <div className="serif" style={{ fontSize: 15 }}>CoworKing Café</div>
            <div style={{ fontSize: 9, opacity: 0.5, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em' }}>ESPACE MEMBRE</div>
          </div>
        </div>

        <div>
          <div className="tag" style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>Progression</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {stepLabels.map((label, i) => {
              const isActive = step === i;
              const isDone = step > i;
              return (
                <div key={i} onClick={() => i <= step && setStep(i)} style={{
                  display: 'flex', gap: 12, padding: '12px 10px',
                  borderRadius: 10,
                  background: isActive ? 'rgba(242,211,129,0.12)' : 'transparent',
                  cursor: i <= step ? 'pointer' : 'default',
                  alignItems: 'center',
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: isDone ? 'var(--btn)' : isActive ? 'rgba(242,211,129,0.22)' : 'rgba(255,255,255,0.06)',
                    color: isDone ? 'var(--secondary)' : isActive ? 'var(--btn)' : 'rgba(255,255,255,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600,
                    border: isActive ? '1px solid var(--btn)' : 'none',
                  }}>
                    {isDone ? <Icon name="check" size={12} sw={2.5} stroke="var(--secondary)"/> : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: isActive ? 500 : 400, color: isActive ? '#fff' : isDone ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)' }}>{label}</div>
                    <div style={{ fontSize: 10, opacity: 0.5, marginTop: 1, fontFamily: 'JetBrains Mono, monospace' }}>Étape {i + 1}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 'auto', padding: 14, background: 'rgba(242,211,129,0.1)', borderRadius: 14, border: '1px solid rgba(242,211,129,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon name="sparkle" size={14} stroke="var(--btn)" fill="var(--btn)"/>
            <span className="tag" style={{ color: 'var(--btn)', fontSize: 9 }}>Astuce</span>
          </div>
          <div style={{ fontSize: 11.5, lineHeight: 1.45, opacity: 0.85 }}>
            Réservez à la semaine pour économiser 15 %, ou au mois pour 40 %.
          </div>
        </div>
      </aside>

      {/* Center — main content */}
      <main style={{ padding: '36px 40px', overflowY: 'auto', maxHeight: 820 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <div className="tag" style={{ color: 'var(--main)', marginBottom: 6 }}>Étape {step + 1} / 4 · Nouvelle réservation</div>
            <h1 className="serif" style={{ fontSize: 38, color: 'var(--body)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              {step === 0 && <>Quel <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>espace</em> souhaitez-vous ?</>}
              {step === 1 && <>Choisissez la <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>date</em> et l'horaire</>}
              {step === 2 && <>Ajoutez des <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>options</em></>}
              {step === 3 && <>Confirmez votre <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>réservation</em></>}
            </h1>
          </div>
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{
            padding: '10px 16px', background: 'transparent', color: step === 0 ? 'var(--gry)' : 'var(--body)',
            border: '1px solid var(--line)', borderRadius: 12, fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: step === 0 ? 'default' : 'pointer', opacity: step === 0 ? 0.4 : 1,
          }}>
            <Icon name="chevLeft" size={14} stroke={step === 0 ? 'var(--gry)' : 'var(--body)'}/> Étape précédente
          </button>
        </div>

        {step === 0 && <DStep1 data={data} set={set}/>}
        {step === 1 && <DStep2 data={data} set={set} space={space}/>}
        {step === 2 && <DStep3 data={data} set={set}/>}
        {step === 3 && <DStep4 data={data} space={space} hours={hours} basePrice={basePrice} servicesTotal={servicesTotal} total={total}/>}
      </main>

      {/* Right — live summary */}
      <aside style={{ background: '#fff', borderLeft: '1px solid var(--line)', padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
        <div className="tag" style={{ color: 'var(--main)', marginBottom: 10 }}>Récapitulatif</div>
        <h3 className="serif" style={{ fontSize: 22, color: 'var(--body)', margin: '0 0 22px', letterSpacing: '-0.01em' }}>Votre réservation</h3>

        <div style={{
          background: space.bg, borderRadius: 16, padding: 16, marginBottom: 16,
          display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <div style={{ fontSize: 32 }}>{space.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--body)' }}>{space.label}</div>
            <div style={{ fontSize: 11, color: 'var(--gry)', marginTop: 2 }}>dès {space.price}€{space.priceUnit}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 18, borderBottom: '1px solid var(--line)' }}>
          {[
            ['Date', `${data.date} avril 2026`, 'calendar'],
            ['Type', TYPES_D.find(t => t.key === data.type)?.label, 'clock'],
            ['Horaire', data.type === 'hourly' ? `${data.startTime} – ${data.endTime}` : 'Forfait complet', 'clock'],
            ['Personnes', `${data.people} pers.`, 'people'],
          ].map(([k, v, i]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--gry)' }}>
                <Icon name={i} size={13} stroke="var(--main)"/>{k}
              </span>
              <span style={{ fontSize: 13, color: 'var(--body)', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Services */}
        {Object.keys(data.services).length > 0 && (
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
            <div className="tag" style={{ fontSize: 9, marginBottom: 8 }}>Services · {Object.keys(data.services).length}</div>
            {Object.keys(data.services).map(k => {
              const sv = SERVICES_D.find(s => s.key === k);
              return (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                  <span style={{ color: 'var(--gry)' }}>{sv.label}</span>
                  <span className="num" style={{ color: 'var(--body)' }}>+{sv.price}€</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Price breakdown */}
        <div style={{ padding: '14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
            <span style={{ color: 'var(--gry)' }}>{space.label} · {hours}h</span>
            <span className="num" style={{ color: 'var(--body)' }}>{basePrice.toFixed(2)}€</span>
          </div>
          {servicesTotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
              <span style={{ color: 'var(--gry)' }}>Services</span>
              <span className="num" style={{ color: 'var(--body)' }}>{servicesTotal.toFixed(2)}€</span>
            </div>
          )}
          {multiplier < 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
              <span style={{ color: 'var(--success)' }}>Remise forfait</span>
              <span className="num" style={{ color: 'var(--success)' }}>-{((1-multiplier)*100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        <div style={{
          marginTop: 'auto', padding: 16, borderRadius: 14,
          background: 'var(--body)', color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <span className="tag" style={{ color: 'rgba(255,255,255,0.55)' }}>Total TTC</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span className="serif" style={{ fontSize: 32, color: 'var(--btn)' }}>{total}</span>
              <span style={{ fontSize: 14, color: 'var(--btn)' }}>€</span>
            </div>
          </div>
          <button onClick={() => setStep(Math.min(3, step + 1))} style={{
            width: '100%', padding: 13,
            background: step === 3 ? 'var(--btn)' : '#fff',
            color: 'var(--secondary)',
            border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {step === 3 ? <><Icon name="check" size={15} stroke="var(--secondary)" sw={2.3}/> Payer maintenant</> : <>Continuer <Icon name="chevRight" size={14} stroke="var(--secondary)" sw={2.2}/></>}
          </button>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, opacity: 0.55, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
            PAIEMENT SÉCURISÉ · ANNULATION J-1
          </div>
        </div>
      </aside>
    </div>
  );
}

// ─── Step 1: Space selection (grid 2 cols)
function DStep1({ data, set }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {SPACES_D.map(s => {
        const active = data.space === s.key;
        return (
          <div key={s.key} onClick={() => set('space', s.key)} style={{
            background: '#fff', border: `2px solid ${active ? s.color : 'var(--line)'}`,
            borderRadius: 18, padding: 22, cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: active ? `0 8px 24px ${s.bg}` : 'none',
            position: 'relative', overflow: 'hidden',
          }}>
            {active && (
              <div style={{
                position: 'absolute', top: 14, right: 14,
                width: 24, height: 24, borderRadius: '50%',
                background: s.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="check" size={13} sw={2.5} stroke="#fff"/>
              </div>
            )}
            <div style={{
              width: 60, height: 60, borderRadius: 16, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, marginBottom: 14,
            }}>{s.emoji}</div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--body)', marginBottom: 4, letterSpacing: '-0.01em' }}>{s.label}</div>
            <div style={{ fontSize: 12.5, color: 'var(--gry)', marginBottom: 14, minHeight: 32 }}>{s.desc}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {s.features.map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, fontSize: 11.5, color: 'var(--body)', alignItems: 'center' }}>
                  <Icon name="check" size={11} stroke={s.color} sw={2.5}/>
                  {f}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
              <span className="num" style={{ fontSize: 16, color: 'var(--body)', fontWeight: 500 }}>dès {s.price}€<span style={{ color: 'var(--gry)', fontWeight: 400, fontSize: 12 }}>{s.priceUnit}</span></span>
              <span style={{ fontSize: 11, color: 'var(--gry)' }}>jusqu'à {s.max} pers.</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 2: Date + horaires
function DStep2({ data, set, space }) {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const today = 22;
  const monthDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      {/* Left: type + people */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div className="tag" style={{ marginBottom: 10 }}>Type de réservation</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TYPES_D.map(t => (
              <div key={t.key} onClick={() => set('type', t.key)} style={{
                background: data.type === t.key ? 'var(--main)' : '#fff',
                color: data.type === t.key ? '#fff' : 'var(--body)',
                border: `2px solid ${data.type === t.key ? 'var(--main)' : 'var(--line)'}`,
                borderRadius: 14, padding: 16, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <Icon name={t.icon} size={20} stroke={data.type === t.key ? 'var(--btn)' : 'var(--main)'}/>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{t.label}</div>
                <div style={{ fontSize: 11, opacity: data.type === t.key ? 0.75 : 0.6 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="tag" style={{ marginBottom: 10 }}>Nombre de personnes</div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, color: 'var(--body)', fontWeight: 500 }}>Participants</div>
              <div style={{ fontSize: 11, color: 'var(--gry)', marginTop: 2 }}>Jusqu'à {space.max} personnes</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => set('people', Math.max(1, data.people - 1))} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--line)', background: '#fff', fontSize: 18, color: 'var(--body)', cursor: 'pointer' }}>–</button>
              <span className="num" style={{ fontSize: 18, color: 'var(--body)', minWidth: 24, textAlign: 'center' }}>{data.people}</span>
              <button onClick={() => set('people', Math.min(space.max, data.people + 1))} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--body)', fontSize: 18, color: '#fff', cursor: 'pointer' }}>+</button>
            </div>
          </div>
        </div>

        {/* Time slots */}
        {data.type === 'hourly' && (
          <div>
            <div className="tag" style={{ marginBottom: 10 }}>Créneau horaire</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(t => {
                const active = data.startTime === t;
                return (
                  <div key={t} onClick={() => set('startTime', t)} style={{
                    padding: '11px 0', textAlign: 'center',
                    background: active ? 'var(--main)' : '#fff',
                    color: active ? '#fff' : 'var(--body)',
                    border: `1px solid ${active ? 'var(--main)' : 'var(--line)'}`,
                    borderRadius: 10, fontSize: 13, cursor: 'pointer',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{t}</div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: calendar */}
      <div>
        <div className="tag" style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span>Date</span>
          <span style={{ color: 'var(--main)' }}>Avril 2026 →</span>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
            {days.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--gry)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', padding: 6 }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {/* padding days (April 1 = Wednesday) */}
            {[...Array(2)].map((_, i) => <div key={'p'+i}/>)}
            {monthDays.map(d => {
              const active = data.date === d;
              const isPast = d < today;
              const isToday = d === today;
              return (
                <div key={d} onClick={() => !isPast && set('date', d)} style={{
                  aspectRatio: '1', borderRadius: 10,
                  background: active ? 'var(--body)' : isToday ? 'rgba(242,211,129,0.18)' : 'transparent',
                  color: active ? '#fff' : isPast ? 'rgba(110,111,117,0.35)' : 'var(--body)',
                  border: isToday && !active ? '1px solid var(--btn)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isPast ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  fontFamily: 'JetBrains Mono, monospace',
                  position: 'relative',
                  transition: 'all 0.15s',
                }}>
                  {d}
                  {active && <span style={{ position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: '50%', background: 'var(--btn)' }}/>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gry)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--btn)' }}/>Aujourd'hui
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--body)' }}/>Sélection
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Services
function DStep3({ data, set }) {
  const toggle = (key) => {
    const svs = { ...data.services };
    if (svs[key]) delete svs[key]; else svs[key] = 1;
    set('services', svs);
  };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {SERVICES_D.map(s => {
          const active = !!data.services[s.key];
          return (
            <div key={s.key} onClick={() => toggle(s.key)} style={{
              background: '#fff',
              border: `2px solid ${active ? 'var(--main)' : 'var(--line)'}`,
              borderRadius: 16, padding: 18,
              display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer',
              boxShadow: active ? '0 6px 18px rgba(65,121,114,0.08)' : 'none',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: active ? 'var(--main)' : 'rgba(65,121,114,0.08)',
                color: active ? 'var(--btn)' : 'var(--main)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name={s.icon} size={22}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: 'var(--body)', fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: 'var(--gry)', marginTop: 2 }}>{s.desc}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="num" style={{ fontSize: 15, color: 'var(--body)', fontWeight: 500 }}>+{s.price}€</div>
                <div style={{
                  marginTop: 6, width: 22, height: 22, borderRadius: 7,
                  border: `1.5px solid ${active ? 'var(--main)' : 'var(--line)'}`,
                  background: active ? 'var(--main)' : 'transparent',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {active && <Icon name="check" size={12} sw={3} stroke="#fff"/>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="tag" style={{ marginBottom: 10 }}>Demande particulière (optionnel)</div>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: 16 }}>
          <textarea placeholder="Précisez vos besoins : installation, accès, équipement, traiteur…" style={{
            width: '100%', minHeight: 100, border: 'none', outline: 'none',
            fontSize: 13, fontFamily: 'inherit', color: 'var(--body)',
            background: 'transparent', resize: 'vertical',
          }}/>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Confirmation
function DStep4({ data, space, hours, basePrice, servicesTotal, total }) {
  const activeSvs = Object.entries(data.services).filter(([, q]) => q > 0).map(([k]) => SERVICES_D.find(s => s.key === k));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* Left: review */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px', background: space.bg, display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ fontSize: 44 }}>{space.emoji}</div>
            <div style={{ flex: 1 }}>
              <div className="tag" style={{ color: space.color }}>Espace réservé</div>
              <div className="serif" style={{ fontSize: 24, color: 'var(--body)', marginTop: 2, letterSpacing: '-0.01em' }}>{space.label}</div>
            </div>
          </div>
          <div style={{ padding: '18px 20px' }}>
            {[
              ['Date', `${data.date} avril 2026`],
              ['Horaire', data.type === 'hourly' ? `${data.startTime} – ${data.endTime} · ${hours}h` : `Forfait ${data.type}`],
              ['Personnes', `${data.people} personne${data.people > 1 ? 's' : ''}`],
              ['Type', TYPES_D.find(t => t.key === data.type)?.label],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <span style={{ fontSize: 13, color: 'var(--gry)' }}>{k}</span>
                <span style={{ fontSize: 14, color: 'var(--body)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 18 }}>
          <div className="tag" style={{ marginBottom: 12 }}>Moyen de paiement</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, background: 'var(--body)', color: '#fff', borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(242,211,129,0.14)' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ width: 28, height: 20, borderRadius: 4, background: 'var(--btn)', marginBottom: 10 }}/>
                  <div className="num" style={{ fontSize: 14, letterSpacing: '0.1em' }}>•• •• •• 4242</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 10, opacity: 0.65 }}>
                    <span>09/27</span>
                    <span>Claire D.</span>
                  </div>
                </div>
                <Icon name="check" size={18} stroke="var(--btn)" sw={2.5}/>
              </div>
            </div>
          </div>
          <button style={{ width: '100%', padding: 10, background: 'transparent', border: '1px dashed var(--line)', borderRadius: 10, fontSize: 12.5, color: 'var(--gry)', cursor: 'pointer' }}>+ Ajouter un moyen de paiement</button>
        </div>
      </div>

      {/* Right: invoice + fidelity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 20 }}>
          <div className="tag" style={{ marginBottom: 14 }}>Détail tarifaire</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13.5 }}>
            <span style={{ color: 'var(--gry)' }}>{space.label} · {hours}h</span>
            <span className="num" style={{ color: 'var(--body)' }}>{basePrice.toFixed(2)}€</span>
          </div>
          {activeSvs.map(s => (
            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13.5 }}>
              <span style={{ color: 'var(--gry)' }}>{s.label}</span>
              <span className="num" style={{ color: 'var(--body)' }}>+{s.price.toFixed(2)}€</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--line)', marginTop: 10, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="serif" style={{ fontSize: 18, color: 'var(--body)' }}>Total TTC</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span className="serif" style={{ fontSize: 32, color: 'var(--main)' }}>{total}</span>
              <span className="serif" style={{ fontSize: 18, color: 'var(--main)' }}>,00 €</span>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(242,211,129,0.18)', borderRadius: 16, padding: 18, display: 'flex', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--btn)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="sparkle" size={20} stroke="var(--secondary)" fill="var(--secondary)"/>
          </div>
          <div>
            <div className="serif" style={{ fontSize: 17, color: 'var(--body)' }}>+{Math.floor(total / 2)} points fidélité</div>
            <div style={{ fontSize: 12, color: 'rgba(107,85,24,0.85)', marginTop: 3, lineHeight: 1.5 }}>
              Avec cette réservation, vous passez à <strong>{340 + Math.floor(total / 2)}/500 pts</strong>. Plus que {500 - 340 - Math.floor(total / 2)} pts pour une boisson offerte.
            </div>
          </div>
        </div>

        <div style={{ padding: 14, border: '1px solid var(--line)', borderRadius: 14, fontSize: 11.5, color: 'var(--gry)', lineHeight: 1.55 }}>
          En confirmant, vous acceptez les <span style={{ color: 'var(--main)', textDecoration: 'underline' }}>CGU</span> et la <span style={{ color: 'var(--main)', textDecoration: 'underline' }}>politique d'annulation</span>. Annulation gratuite jusqu'à 24h avant le créneau.
        </div>
      </div>
    </div>
  );
}

window.BookingDesktop = BookingDesktop;
