// app.jsx
const { useState: aS, useEffect: aE } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "view": "all",
  "device": 3
} /*EDITMODE-END*/;

function App() {
  const [tweaks, setTweaks] = aS(TWEAK_DEFAULTS);
  const [editMode, setEditMode] = aS(false);

  aE(() => {
    const handler = (ev) => {
      if (ev.data?.type === '__activate_edit_mode') setEditMode(true);
      if (ev.data?.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const setKey = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };

  const nDevices = tweaks.device === 1 ? 1 : tweaks.device === 2 ? 2 : 3;
  const mobileInitials = ['home', 'reservations', 'profile'];
  const showDesktop = tweaks.view === 'desktop' || tweaks.view === 'all';
  const showMobile = tweaks.view === 'mobile' || tweaks.view === 'all';
  const showBooking = tweaks.view === 'booking' || tweaks.view === 'all';

  return (
    <div className="stage">
      <div className="stage-header">
        <h1>Dashboard client <em>coworking café</em></h1>
        <p>Refonte de l'espace membre — palette existante conservée (vert sauge + jaune miel), extension desktop et flow de nouvelle réservation. Palette : <span className="num">#417972</span> · <span className="num">#F2D381</span> · <span className="num">#142220</span>.</p>
      </div>

      {showDesktop &&
      <section style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <SectionLabel num="01" title="Dashboard Desktop" subtitle="Vue member area — sidebar navigation, bento hero, table des réservations" />
          <DesktopDashboard />
        </section>
      }

      {showMobile &&
      <section style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 32 }}>
          <SectionLabel num="02" title="Dashboard Mobile" subtitle="PWA iOS — tab bar bottom, gestes swipe, navigation contextuelle" />
          <div className="devices-row">
            {Array.from({ length: nDevices }).map((_, i) =>
          <Device key={i} startScreen={mobileInitials[i] || 'home'} />
          )}
          </div>
        </section>
      }

      {showBooking &&
      <section style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 32 }}>
          <SectionLabel num="03" title="Flow Nouvelle Réservation" subtitle="4 étapes — espace, date & type, options, confirmation & paiement" />
          <div className="devices-row">
            <BookingDevice step={0} />
            <BookingDevice step={1} />
            <BookingDevice step={2} />
            <BookingDevice step={3} />
          </div>
        </section>
      }

      <TweaksPanel visible={editMode} tweaks={tweaks} setKey={setKey} />
    </div>);

}

function SectionLabel({ num, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 640, padding: '0 16px', marginBottom: 4 }}>
      <div className="tag" style={{ color: 'var(--main)', marginBottom: 6 }}>— {num} —</div>
      <div className="serif" style={{ fontSize: 26, color: 'var(--body)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--gry)', marginTop: 6 }}>{subtitle}</div>
    </div>);

}

function BookingDevice({ step }) {
  const [s, setS] = aS(step);
  const labels = ['Espace', 'Date', 'Options', 'Confirmation'];
  return (
    <div>
      <div className="iphone">
        <div className="island" />
        <div className="screen screen-bg-cream" style={{ background: 'var(--cream)' }}>
          <StatusBar dark={false} />
          <BookingFlowStandalone initialStep={s} onStepChange={setS} />
        </div>
      </div>
      <div className="device-label">STEP {s + 1}/4 · {labels[s].toUpperCase()}</div>
    </div>);

}

function BookingFlowStandalone({ initialStep, onStepChange }) {
  const [step, setStep] = aS(initialStep);
  const update = (ns) => {setStep(ns);onStepChange?.(ns);};
  aE(() => {setStep(initialStep);}, [initialStep]);
  return <BookingFlowScreen key={step} initialStep={step} onStepChange={update} />;
}

function TweaksPanel({ visible, tweaks, setKey }) {
  return (
    <div className={`tweaks-panel ${visible ? 'visible' : ''}`}>
      <h3 className="tweaks-title">Tweaks</h3>
      <div className="tweaks-group">
        <div className="tweaks-label">Section visible</div>
        <div className="tweaks-options">
          {[['all', 'Tout'], ['desktop', 'Desktop'], ['mobile', 'Mobile'], ['booking', 'Booking flow']].map(([k, l]) =>
          <div key={k} className={`tweaks-opt ${tweaks.view === k ? 'active' : ''}`} onClick={() => setKey('view', k)}>{l}</div>
          )}
        </div>
      </div>
      <div className="tweaks-group">
        <div className="tweaks-label">Mobile · écrans</div>
        <div className="tweaks-options">
          {[[1, '1'], [2, '2'], [3, '3']].map(([k, l]) =>
          <div key={k} className={`tweaks-opt ${tweaks.device === k ? 'active' : ''}`} onClick={() => setKey('device', k)}>{l}</div>
          )}
        </div>
      </div>
    </div>);

}

function Device({ startScreen = 'home' }) {
  const [screen, setScreen] = aS(startScreen);
  const [stack, setStack] = aS([]);
  const [bookingDetail, setBookingDetail] = aS(null);

  const go = (s, payload) => {
    setStack([...stack, screen]);
    if (s === 'bookingDetail') setBookingDetail(payload);
    setScreen(s);
  };
  const back = () => {
    const prev = stack[stack.length - 1] || 'home';
    setStack(stack.slice(0, -1));
    setScreen(prev);
  };

  const activeTab = ['home'].includes(screen) ? 'home' :
  ['reservations', 'bookingDetail'].includes(screen) ? 'reservations' :
  ['profile', 'settings'].includes(screen) ? 'profile' :
  '';

  const isRoot = ['home', 'reservations', 'profile'].includes(screen);
  const darkTop = screen === 'home' || screen === 'bookingDetail';

  const titles = {
    home: '',
    reservations: '',
    bookingDetail: '',
    profile: '',
    settings: ''
  };

  const showFab = screen === 'home' || screen === 'reservations';
  const bgCream = !(screen === 'home' || screen === 'bookingDetail');

  return (
    <div>
      <div className="iphone">
        <div className="island" />
        <div className={`screen ${bgCream ? 'screen-bg-cream' : ''}`} style={{ background: bgCream ? 'var(--cream)' : 'var(--body)' }}>
          <StatusBar dark={darkTop} />

          {/* topbar only for non-home root */}
          {!darkTop &&
          <div style={{ height: 54, flexShrink: 0 }} />
          }
          {!darkTop &&
          <div className="topbar">
              {!isRoot ?
            <div className="ic-btn" onClick={back}><Icon name="chevLeft" size={18} /></div> :

            <div style={{ width: 40 }} />
            }
              <div className="topbar-title">{titles[screen]}</div>
              <div className="ic-btn" style={{ position: 'relative' }}>
                <Icon name="bell" size={18} />
                <span className="ic-dot" />
              </div>
            </div>
          }

          {/* detail top bar over dark bg */}
          {screen === 'bookingDetail' &&
          <>
              <div style={{ height: 54, flexShrink: 0 }} />
              <div className="topbar" style={{ position: 'absolute', top: 54, left: 0, right: 0, zIndex: 10 }}>
                <div className="ic-btn on-dark" onClick={back}><Icon name="chevLeft" size={18} stroke="#fff" /></div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>Détail réservation</div>
                <div className="ic-btn on-dark"><Icon name="edit" size={16} stroke="#fff" /></div>
              </div>
            </>
          }

          <div className="screen-scroll" key={screen}>
            <div className="screen-enter">
              {screen === 'home' && <HomeScreen onNav={go} />}
              {screen === 'reservations' && <ReservationsScreen onNav={go} />}
              {screen === 'bookingDetail' && <BookingDetailScreen booking={bookingDetail} />}
              {screen === 'profile' && <ProfileScreen onNav={go} />}
              {screen === 'settings' && <SettingsScreen />}
              {screen === 'notifications' && <NotifScreen />}
            </div>
          </div>

          {showFab &&
          <div className="fab">
              <Icon name="plus" size={24} stroke="var(--secondary)" sw={2.3} />
            </div>
          }

          {/* tab bar */}
          <div className="tabbar" style={{ opacity: "1", backgroundColor: "rgb(20, 34, 32)" }}>
            {[
            { k: 'home', label: 'Accueil', i: 'home' },
            { k: 'reservations', label: 'Résas', i: 'calendar' },
            { k: 'profile', label: 'Profil', i: 'user' }].
            map((t) =>
            <div key={t.k} className={`tabbar-item ${activeTab === t.k ? 'active' : ''}`} onClick={() => {setStack([]);setScreen(t.k);}}>
                <div className="tabbar-icon-wrap">
                  <Icon name={t.i} size={18} stroke={activeTab === t.k ? 'var(--secondary)' : '#fff'} sw={activeTab === t.k ? 2 : 1.6} />
                </div>
                <span>{t.label}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="device-label">{screen.replace('bookingDetail', 'Booking détail').toUpperCase()}</div>
    </div>);

}

function NotifScreen() {
  const items = [
  { title: 'Réservation validée', body: 'Salle Verrière · Mar 22 avril à 9h', time: 'il y a 12 min', new: true },
  { title: 'Rappel J-1', body: 'N\'oubliez pas votre réservation de demain', time: 'il y a 2 h', new: true },
  { title: 'Nouvelle offre', body: 'Happy Hour sur les open-space après 17h', time: 'Hier' },
  { title: 'Facture disponible', body: 'Janvier 2026 · 124 €', time: 'Il y a 3 jours' }];

  return (
    <div style={{ padding: '0 20px 120px' }}>
      <div style={{ padding: '4px 0 18px' }}>
        <div className="tag">Vos dernières activités</div>
        <div className="serif" style={{ fontSize: 30, color: 'var(--body)', lineHeight: 1.1, marginTop: 4 }}>Notifications</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((n, i) =>
        <div key={i} className="card" style={{ padding: 14, display: 'flex', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: n.new ? 'rgba(242,211,129,0.22)' : 'rgba(65,121,114,0.08)', color: n.new ? '#8A6B1F' : 'var(--main)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="bell" size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: 'var(--body)', fontWeight: 500 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: 'var(--gry)', marginTop: 3 }}>{n.body}</div>
              <div className="num" style={{ fontSize: 10, color: 'var(--gry)', marginTop: 6 }}>{n.time}</div>
            </div>
            {n.new && <span className="dot" style={{ background: 'var(--btn)', marginTop: 6 }} />}
          </div>
        )}
      </div>
    </div>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);