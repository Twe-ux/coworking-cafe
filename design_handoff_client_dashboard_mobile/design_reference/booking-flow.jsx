// booking-flow.jsx — Mobile "Nouvelle réservation" flow
const { useState: fS } = React;

const SPACES = [
  {
    key: 'open-space', label: 'Open-space',
    desc: 'Bureau partagé, ambiance studieuse',
    price: 9, priceUnit: '/h', max: 1, perPerson: false,
    color: '#417972', bg: 'rgba(65,121,114,0.1)',
    emoji: '💻',
  },
  {
    key: 'salle-verriere', label: 'Salle Verrière',
    desc: 'Salle de réunion lumineuse, 6 pers.',
    price: 24, priceUnit: '/h', max: 6, perPerson: false,
    color: '#5A938B', bg: 'rgba(90,147,139,0.14)',
    emoji: '🌿',
  },
  {
    key: 'salle-etage', label: 'Salle Étage',
    desc: 'Espace privatisé, 10 pers. max',
    price: 30, priceUnit: '/h', max: 10, perPerson: false,
    color: '#8A6B1F', bg: 'rgba(242,211,129,0.22)',
    emoji: '🏛️',
  },
  {
    key: 'evenementiel', label: 'Événementiel',
    desc: 'Privatisation pour soirées & ateliers',
    price: 80, priceUnit: '/h', max: 40, perPerson: false,
    color: '#C0534C', bg: 'rgba(192,83,76,0.1)',
    emoji: '🎉',
  },
];

const TYPES = [
  { key: 'hourly', label: 'À l\'heure', desc: 'Flexible, par tranche de 1h', icon: 'clock' },
  { key: 'daily', label: 'Journée', desc: '9h – 19h, tarif dégressif', icon: 'sparkle' },
  { key: 'weekly', label: 'Semaine', desc: '7 jours consécutifs', icon: 'calendar' },
  { key: 'monthly', label: 'Mois', desc: '30 jours, -25% sur le mensuel', icon: 'building' },
];

const SERVICES = [
  { key: 'coffee', label: 'Café illimité', price: 5, icon: 'cookie', desc: 'Barista maison' },
  { key: 'lunch', label: 'Pause déjeuner', price: 14, icon: 'gift', desc: 'Plat + dessert' },
  { key: 'parking', label: 'Parking privé', price: 8, icon: 'tag', desc: 'Place réservée' },
  { key: 'screen', label: 'Écran + visio', price: 10, icon: 'building', desc: 'Setup salle de réunion' },
];

function BookingFlowScreen({ onClose, initialStep = 0, onStepChange }) {
  const [step, setStep] = fS(initialStep); // 0..3
  const [data, setData] = fS({
    space: 'salle-verriere',
    type: 'hourly',
    date: 22,
    startTime: '09:00',
    endTime: '12:00',
    people: 4,
    services: {},
  });
  const set = (k, v) => setData({ ...data, [k]: v });

  const space = SPACES.find(s => s.key === data.space);
  const hours = data.type === 'hourly' ? 3 : data.type === 'daily' ? 10 : data.type === 'weekly' ? 70 : 300;
  const servicesTotal = Object.entries(data.services).reduce((t, [k, q]) => {
    const sv = SERVICES.find(s => s.key === k); return t + (sv?.price || 0) * (q || 0);
  }, 0);
  const basePrice = space.price * hours * (data.type === 'weekly' ? 0.85 : data.type === 'monthly' ? 0.6 : 1);
  const total = Math.round(basePrice + servicesTotal);

  const steps = ['Espace', 'Date', 'Options', 'Confirmer'];

  const next = () => { const ns = Math.min(3, step + 1); setStep(ns); onStepChange?.(ns); };
  const back = () => { if (step === 0) return onClose?.(); const ns = step - 1; setStep(ns); onStepChange?.(ns); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Progress header */}
      <div style={{ padding: '64px 20px 12px', background: '#fff', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="ic-btn" onClick={back}><Icon name={step === 0 ? 'x' : 'chevLeft'} size={18}/></div>
          <div style={{ flex: 1 }}>
            <div className="tag">Étape {step + 1} sur 4</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--body)', marginTop: 1 }}>{steps[step]}</div>
          </div>
          <div className="num" style={{ fontSize: 12, color: 'var(--gry)' }}>
            {step === 3 ? `${total}€` : `${total}€ est.`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= step ? 'var(--main)' : 'var(--grayWhite)',
              transition: 'background 0.3s',
            }}/>
          ))}
        </div>
      </div>

      <div className="screen-scroll" style={{ padding: '20px 20px 160px' }}>
        {step === 0 && <Step1Space data={data} set={set}/>}
        {step === 1 && <Step2Date data={data} set={set} space={space}/>}
        {step === 2 && <Step3Options data={data} set={set}/>}
        {step === 3 && <Step4Confirm data={data} space={space} hours={hours} basePrice={basePrice} servicesTotal={servicesTotal} total={total}/>}
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', bottom: 100, left: 14, right: 14,
        background: '#fff', borderRadius: 18,
        border: '1px solid var(--line)', padding: 14,
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 8px 24px rgba(20,34,32,0.08)',
      }}>
        <div style={{ flex: 1 }}>
          <div className="tag" style={{ fontSize: 9 }}>Total estimé</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="serif" style={{ fontSize: 22, color: 'var(--body)' }}>{total}</span>
            <span style={{ fontSize: 13, color: 'var(--gry)' }}>€</span>
            <span style={{ fontSize: 10, color: 'var(--gry)', marginLeft: 4 }}>TTC</span>
          </div>
        </div>
        <button onClick={next} style={{
          padding: '14px 22px',
          background: step === 3 ? 'var(--btn)' : 'var(--body)',
          color: step === 3 ? 'var(--secondary)' : '#fff',
          border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        }}>
          {step === 3 ? <><Icon name="check" size={16} stroke="var(--secondary)" sw={2.2}/> Payer</> : <>Continuer <Icon name="chevRight" size={15} stroke="#fff" sw={2}/></>}
        </button>
      </div>
    </div>
  );
}

// ─── Step 1: Space selection
function Step1Space({ data, set }) {
  return (
    <>
      <div className="serif" style={{ fontSize: 26, color: 'var(--body)', lineHeight: 1.15, marginBottom: 6 }}>
        Quel <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>espace</em> souhaitez-vous réserver ?
      </div>
      <div style={{ fontSize: 13, color: 'var(--gry)', marginBottom: 20 }}>Choisissez parmi nos 4 espaces disponibles aujourd'hui.</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SPACES.map(s => (
          <div key={s.key} onClick={() => set('space', s.key)} style={{
            background: '#fff', border: `2px solid ${data.space === s.key ? s.color : 'var(--line)'}`,
            borderRadius: 18, padding: 16, cursor: 'pointer',
            display: 'flex', gap: 14, alignItems: 'center',
            transition: 'all 0.2s',
            boxShadow: data.space === s.key ? `0 6px 18px ${s.bg}` : 'none',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>
              {s.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--body)' }}>{s.label}</span>
                {data.space === s.key && (
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: s.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={11} sw={3} stroke="#fff"/>
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gry)', marginTop: 3 }}>{s.desc}</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <span className="num" style={{ fontSize: 13, color: 'var(--body)', fontWeight: 500 }}>
                  dès {s.price}€<span style={{ color: 'var(--gry)', fontWeight: 400, fontSize: 11 }}>{s.priceUnit}</span>
                </span>
                <span style={{ fontSize: 11, color: 'var(--gry)' }}>·</span>
                <span style={{ fontSize: 11, color: 'var(--gry)' }}>jusqu'à {s.max} pers.</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Step 2: Date + type + time + people
function Step2Date({ data, set, space }) {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const today = 22;
  const dates = Array.from({ length: 14 }, (_, i) => today + i).filter(d => d <= 30);

  return (
    <>
      <div className="serif" style={{ fontSize: 26, color: 'var(--body)', lineHeight: 1.15, marginBottom: 6 }}>
        Quand <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>voulez-vous</em> venir ?
      </div>
      <div style={{ fontSize: 13, color: 'var(--gry)', marginBottom: 20 }}>Choisissez le type de réservation et la date.</div>

      {/* Type */}
      <div className="tag" style={{ marginBottom: 10 }}>Type de réservation</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22 }}>
        {TYPES.map(t => (
          <div key={t.key} onClick={() => set('type', t.key)} style={{
            background: data.type === t.key ? 'var(--main)' : '#fff',
            color: data.type === t.key ? '#fff' : 'var(--body)',
            border: `1px solid ${data.type === t.key ? 'var(--main)' : 'var(--line)'}`,
            borderRadius: 14, padding: 12, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <Icon name={t.icon} size={17} stroke={data.type === t.key ? 'var(--btn)' : 'var(--main)'}/>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{t.label}</span>
            <span style={{ fontSize: 10.5, opacity: data.type === t.key ? 0.75 : 0.6 }}>{t.desc}</span>
          </div>
        ))}
      </div>

      {/* Date picker horizontal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div className="tag">Date</div>
        <span style={{ fontSize: 11, color: 'var(--main)', fontWeight: 500 }}>Avril 2026 →</span>
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '2px 0 12px', scrollbarWidth: 'none' }}>
        {dates.map(d => {
          const dayIdx = (d - 1) % 7;
          const active = data.date === d;
          return (
            <div key={d} onClick={() => set('date', d)} style={{
              flexShrink: 0, width: 54, height: 70, borderRadius: 14,
              background: active ? 'var(--body)' : '#fff',
              color: active ? '#fff' : 'var(--body)',
              border: `1px solid ${active ? 'var(--body)' : 'var(--line)'}`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: 10, opacity: active ? 0.7 : 0.5, textTransform: 'uppercase' }}>{days[dayIdx]}</span>
              <span className="num" style={{ fontSize: 18, color: active ? 'var(--btn)' : 'inherit' }}>{d}</span>
              {d === today && <span style={{ width: 4, height: 4, borderRadius: '50%', background: active ? 'var(--btn)' : 'var(--main)' }}/>}
            </div>
          );
        })}
      </div>

      {/* Time (only hourly) */}
      {data.type === 'hourly' && (
        <>
          <div className="tag" style={{ marginTop: 18, marginBottom: 10 }}>Créneau horaire</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {['08:00', '09:00', '10:00', '11:00', '14:00'].map(t => {
              const active = data.startTime === t;
              return (
                <div key={t} onClick={() => set('startTime', t)} style={{
                  flex: 1, padding: '10px 0', textAlign: 'center',
                  background: active ? 'var(--main)' : '#fff',
                  color: active ? '#fff' : 'var(--body)',
                  border: `1px solid ${active ? 'var(--main)' : 'var(--line)'}`,
                  borderRadius: 10, fontSize: 13, cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>{t}</div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: 'var(--gry)', marginBottom: 18 }}>
            Durée : {data.startTime} → {data.endTime} · 3h
          </div>
        </>
      )}

      {data.type === 'daily' && (
        <>
          <div className="tag" style={{ marginTop: 18, marginBottom: 10 }}>Arrivée souhaitée</div>
          <div className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: 'var(--body)' }}>Journée complète (9h – 19h)</span>
            <span className="num" style={{ fontSize: 14, color: 'var(--main)', fontWeight: 500 }}>{data.startTime}</span>
          </div>
        </>
      )}

      {/* People stepper */}
      <div className="tag" style={{ marginTop: 4, marginBottom: 10 }}>Nombre de personnes</div>
      <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, color: 'var(--body)', fontWeight: 500 }}>Participants</div>
          <div style={{ fontSize: 11, color: 'var(--gry)', marginTop: 2 }}>Jusqu'à {space.max} personnes</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => set('people', Math.max(1, data.people - 1))} style={{
            width: 32, height: 32, borderRadius: 10, border: '1px solid var(--line)',
            background: '#fff', fontSize: 18, color: 'var(--body)', cursor: 'pointer',
          }}>–</button>
          <span className="num" style={{ fontSize: 18, color: 'var(--body)', minWidth: 22, textAlign: 'center' }}>{data.people}</span>
          <button onClick={() => set('people', Math.min(space.max, data.people + 1))} style={{
            width: 32, height: 32, borderRadius: 10, border: 'none',
            background: 'var(--body)', fontSize: 18, color: '#fff', cursor: 'pointer',
          }}>+</button>
        </div>
      </div>
    </>
  );
}

// ─── Step 3: Services + special requests
function Step3Options({ data, set }) {
  const toggle = (key) => {
    const svs = { ...data.services };
    if (svs[key]) delete svs[key]; else svs[key] = 1;
    set('services', svs);
  };
  return (
    <>
      <div className="serif" style={{ fontSize: 26, color: 'var(--body)', lineHeight: 1.15, marginBottom: 6 }}>
        Ajoutez des <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>options</em>
      </div>
      <div style={{ fontSize: 13, color: 'var(--gry)', marginBottom: 20 }}>
        Services additionnels pour compléter votre réservation. Tous optionnels.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SERVICES.map(s => {
          const active = !!data.services[s.key];
          return (
            <div key={s.key} onClick={() => toggle(s.key)} style={{
              background: '#fff',
              border: `2px solid ${active ? 'var(--main)' : 'var(--line)'}`,
              borderRadius: 16, padding: 14,
              display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: active ? 'var(--main)' : 'rgba(65,121,114,0.08)',
                color: active ? 'var(--btn)' : 'var(--main)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={s.icon} size={18}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--body)', fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--gry)', marginTop: 2 }}>{s.desc}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="num" style={{ fontSize: 14, color: 'var(--body)', fontWeight: 500 }}>+{s.price}€</div>
                <div style={{
                  marginTop: 4, width: 22, height: 22, borderRadius: 7,
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

      <div className="tag" style={{ marginTop: 22, marginBottom: 10 }}>Demande particulière (optionnel)</div>
      <div className="card" style={{ padding: 14 }}>
        <textarea placeholder="Précisez vos besoins : installation, accès, équipement..." style={{
          width: '100%', minHeight: 90, border: 'none', outline: 'none',
          fontSize: 13, fontFamily: 'inherit', color: 'var(--body)',
          background: 'transparent', resize: 'none',
        }}/>
      </div>
    </>
  );
}

// ─── Step 4: Confirm
function Step4Confirm({ data, space, hours, basePrice, servicesTotal, total }) {
  const activeSvs = Object.entries(data.services).filter(([, q]) => q > 0).map(([k]) => SERVICES.find(s => s.key === k));
  return (
    <>
      <div className="serif" style={{ fontSize: 26, color: 'var(--body)', lineHeight: 1.15, marginBottom: 6 }}>
        Confirmez votre <em style={{ color: 'var(--main)', fontStyle: 'italic' }}>réservation</em>
      </div>
      <div style={{ fontSize: 13, color: 'var(--gry)', marginBottom: 20 }}>Vérifiez les détails avant paiement.</div>

      {/* Summary */}
      <div className="card" style={{ padding: 0, marginBottom: 14 }}>
        <div style={{ padding: '18px 16px 14px', background: space.bg, borderRadius: '18px 18px 0 0', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 34 }}>{space.emoji}</div>
          <div style={{ flex: 1 }}>
            <div className="tag" style={{ color: space.color }}>Espace réservé</div>
            <div className="serif" style={{ fontSize: 20, color: 'var(--body)', marginTop: 2 }}>{space.label}</div>
          </div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          {[
            ['Date', `${data.date} avril 2026`],
            ['Horaire', data.type === 'hourly' ? `${data.startTime} – ${data.endTime}` : data.type === 'daily' ? `Journée dès ${data.startTime}` : `Forfait ${data.type}`],
            ['Personnes', `${data.people} personne${data.people > 1 ? 's' : ''}`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ fontSize: 12.5, color: 'var(--gry)' }}>{k}</span>
              <span style={{ fontSize: 13, color: 'var(--body)', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price breakdown */}
      <div className="card" style={{ padding: 16, marginBottom: 14 }}>
        <div className="tag" style={{ marginBottom: 10 }}>Détail tarifaire</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
          <span style={{ color: 'var(--gry)' }}>{space.label} · {hours}h</span>
          <span className="num" style={{ color: 'var(--body)' }}>{basePrice.toFixed(2)}€</span>
        </div>
        {activeSvs.map(s => (
          <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
            <span style={{ color: 'var(--gry)' }}>{s.label}</span>
            <span className="num" style={{ color: 'var(--body)' }}>{s.price.toFixed(2)}€</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--line)', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span className="serif" style={{ fontSize: 17, color: 'var(--body)' }}>Total TTC</span>
          <span className="serif" style={{ fontSize: 22, color: 'var(--main)' }}>{total},00 €</span>
        </div>
      </div>

      {/* Payment method */}
      <div className="tag" style={{ marginBottom: 10 }}>Moyen de paiement</div>
      <div className="card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 44, height: 32, borderRadius: 6, background: 'linear-gradient(135deg, #1a1a1a, #3a3a3a)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: 6, left: 6, width: 14, height: 10, borderRadius: 2, background: 'var(--btn)' }}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, color: 'var(--body)', fontWeight: 500 }}>Visa •• 4242</div>
          <div style={{ fontSize: 11, color: 'var(--gry)', marginTop: 1 }}>Expire 09/27</div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--main)', fontWeight: 500 }}>Changer</span>
      </div>

      <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: 'rgba(242,211,129,0.18)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Icon name="sparkle" size={16} stroke="#8A6B1F" fill="var(--btn)"/>
        <div style={{ flex: 1, fontSize: 11.5, color: '#6B5518', lineHeight: 1.5 }}>
          Vous gagnerez <strong>{Math.floor(total / 2)} pts fidélité</strong> avec cette réservation.
        </div>
      </div>
    </>
  );
}

window.BookingFlowScreen = BookingFlowScreen;
