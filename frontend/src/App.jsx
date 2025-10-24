import { useState, useMemo, useEffect } from 'react'
import './App.css'

const CATEGORIES = ['All', 'Pricing', 'Partnership', 'Regulation', 'M&A']
const IMPACT = ['High', 'Medium', 'Low']
const IMPACT_COLORS = {
  High: '#ef4444',   // red
  Medium: '#f59e0b', // amber
  Low: '#10b981',    // green
}

const MOCK_NEWS = [
  {
    id: 1,
    source: 'gov.pl',
    title: 'EU Data Act: telco data-sharing rules finalized',
    snippet: 'New obligations on data portability; assess compliance cost and timelines.',
    date: '01.10.25 12:42',
    impact: 'High',
    tags: ['Regulation'],
  },
  {
    id: 2,
    source: 'play.pl',
    title: 'Play launches AI care bot across channels',
    snippet: 'Target: 25% deflection; expect shorter AHT and lower care OPEX.',
    date: '24.10.25 08:10',
    impact: 'Medium',
    tags: ['Partnership'],
  },
  {
    id: 3,
    source: 'orange.pl',
    title: 'Orange drops 5G premium on entry plan',
    snippet: 'Downward pressure on ARPU; review pricing ladders this quarter.',
    date: '23.10.25 16:20',
    impact: 'High',
    tags: ['Pricing'],
  },
  {
    id: 4,
    source: 'uar.gov.pl',
    title: 'UKE consults MVNO access guidelines',
    snippet: 'Potential wholesale rate changes; MVNO negotiations may accelerate.',
    date: '22.10.25 10:05',
    impact: 'Medium',
    tags: ['Regulation'],
  },
  {
    id: 5,
    source: 'press.t-mobile.pl',
    title: 'T‑Mobile pilots family bundle with Netflix',
    snippet: 'Content bundle arms race; assess parity options with partners.',
    date: '21.10.25 09:32',
    impact: 'Medium',
    tags: ['Partnership','Pricing'],
  },
  {
    id: 6,
    source: 'reuters.com',
    title: 'Vodafone–Three UK merger gets CMA nod',
    snippet: 'Regional consolidation momentum; watch spectrum and tower impacts.',
    date: '20.10.25 14:11',
    impact: 'High',
    tags: ['M&A'],
  },
  {
    id: 7,
    source: 'gsma.com',
    title: 'Open RAN trials expand across CEE',
    snippet: 'Capex deferral opportunity; vendor diversification risks.',
    date: '19.10.25 12:45',
    impact: 'Low',
    tags: ['Partnership'],
  },
  {
    id: 8,
    source: 'benchmarking.telecom',
    title: 'Postpaid churn ticks up Q3',
    snippet: 'Early churn signals in youth segment; action needed on retention.',
    date: '18.10.25 17:20',
    impact: 'High',
    tags: ['Pricing'],
  },
]

function Header({ onMenuClick, onAvatarClick }) {
  return (
    <header className="app-header">
      <button className="icon-button" aria-label="Open menu" onClick={onMenuClick}>☰</button>
      <div style={{ flex: 1 }} />
      <button className="avatar" aria-label="Profile" onClick={onAvatarClick}>🙂</button>
    </header>
  )
}

function Greeting() {
  return (
    <section className="greeting">
      <div className="hello">Hey Jan Kowalski!</div>
      <h1>Here is your news feed</h1>
    </section>
  )
}

function Drawer({ open, onClose, onProfile, onSettings, onLogout }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div className={`backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <button className="drawer-close" aria-label="Close menu" onClick={onClose}>✕</button>
        <div className="menu">
          <div className="menu-header">
            <div className="mock-logo">logo</div>
          </div>
          <nav className="menu-items menu-box">
            <button className="menu-item" onClick={() => { onProfile(); onClose(); }}>Profile</button>
            <button className="menu-item" onClick={() => { onSettings(); onClose(); }}>Settings</button>
          </nav>
          <nav className="menu-footer">
            <div className="menu-items menu-box">
              <button className="menu-item danger" onClick={() => { onLogout(); onClose(); }}>Logout</button>
            </div>
          </nav>
        </div>
      </aside>
    </>
  )
}

function CategoryChips({ active, onSelect }) {
  return (
    <div className="chips">
      {CATEGORIES.map((c) => (
        <button
          key={c}
          className={`chip ${active === c ? 'active' : ''}`}
          onClick={() => onSelect(c)}
        >
          {c}
        </button>
      ))}
    </div>
  )
}

function NewsItem({ item, onDismiss }) {
  const [isDismissing, setIsDismissing] = useState(false)

  function handleDismissClick() {
    if (isDismissing) return
    setIsDismissing(true)
    // Remove after slide-out animation completes
    setTimeout(() => onDismiss(item.id), 300)
  }

  return (
    <article className={`news-card ${isDismissing ? 'dismissing' : ''}`}>
      <div className="accent" style={{ backgroundColor: IMPACT_COLORS[item.impact] || '#9ca3af' }} />
      <div className="meta">
        <div className="row">
          <span className="date">{item.date}</span>
        </div>
        <div className="row">
          <span className="label">Source:</span>
          <span className="value source">{item.source}</span>
        </div>
      </div>
      <h3 className="title">{item.title}</h3>
      <div className="tags">
        {item.tags && item.tags.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
      <p className="snippet">{item.snippet}</p>
      <div className="actions">
        <button className="link">Read more</button>
        <button className="link danger" onClick={handleDismissClick}>
          Dismiss
        </button>
      </div>
    </article>
  )
}

function EmptyState({ onSend }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-title">Youre up to date</div>
      <h3 className="empty-subtitle">If you want we can send summary to your email</h3>
      <button className="primary-button" onClick={onSend}>Send Summary</button>
    </div>
  )
}

function NewsFeed({ items, onDismiss, onSend, showEmpty }) {
  return (
    <section className="feed">
      {showEmpty ? (
        <EmptyState onSend={onSend} />
      ) : (
        items.map((n) => (
          <NewsItem key={n.id} item={n} onDismiss={onDismiss} />
        ))
      )}
    </section>
  )
}

function App() {
  const [active, setActive] = useState(CATEGORIES[0])
  const [dismissed, setDismissed] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(() =>
    MOCK_NEWS.filter((n) => (active === 'All' || (n.tags && n.tags.includes(active))) && !dismissed.includes(n.id)),
  [active, dismissed])

  // Compute globally remaining items (across all categories)
  const globalRemaining = useMemo(() =>
    MOCK_NEWS.filter((n) => !dismissed.includes(n.id)).length,
  [dismissed])
  const showEmpty = globalRemaining === 0

  function handleDismiss(id) {
    setDismissed((d) => [...d, id])
  }

  function handleSendSummary() {
    alert('Summary will be sent to your email!')
  }

  function openMenu() { setDrawerOpen(true) }
  function closeMenu() { setDrawerOpen(false) }

  function goProfile() { alert('Profile page coming soon'); }
  function goSettings() { alert('Settings page coming soon'); }
  function doLogout() { alert('Logged out (placeholder)'); }

  return (
    <div className="app">
        <Header onMenuClick={openMenu} onAvatarClick={() => { goProfile(); }} />
        <Drawer open={drawerOpen} onClose={closeMenu} onProfile={goProfile} onSettings={goSettings} onLogout={doLogout} />
        <CategoryChips active={active} onSelect={setActive} />
        <Greeting />
        <NewsFeed items={filtered} onDismiss={handleDismiss} onSend={handleSendSummary} showEmpty={showEmpty} />
    </div>
  )
}

export default App
