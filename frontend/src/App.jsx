import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import './App.css'

// ==============================================
// CONSTANTS & DATA
// ==============================================

const CATEGORIES = ['All', 'Regulatory', 'Competition', 'Technology', 'Market']
const ALL_TAGS = ['EU Policy', 'Data Privacy', 'Compliance', 'AI', 'Customer Service', 'Automation', 'Pricing', '5G', 'Market Share', 'MVNO', 'Wholesale', 'UKE', 'Bundling', 'Streaming', 'Family Plans', 'M&A', 'UK Market', 'Consolidation', 'Open RAN', 'Infrastructure', 'Innovation', 'Churn', 'Youth Segment', 'Retention']

const IMPACT_ORDER = { High: 3, Medium: 2, Low: 1 }

const IMPACT_ICONS = {
    High: highImpactIcon,
    Medium: mediumImpactIcon,
    Low: lowImpactIcon,
}

const IMPACT_LABELS = {
    High: 'High Impact',
    Medium: 'Medium',
    Low: 'Low',
}

const MOCK_NEWS = [
    {
        id: 1,
        source: 'gov.pl',
        link: 'https://ec.europa.eu/commission/presscorner/detail/en/ip_2024_data_act',
        category: 'Regulatory',
        title: 'EU Data Act: telco data-sharing rules finalized',
        snippet: 'New obligations on data portability; assess compliance cost and timelines.',
        summary: 'The European Commission has finalized implementing regulations under the Data Act, establishing mandatory data-sharing frameworks for telecommunications providers. New obligations require telcos to provide standardized APIs for customer data portability within 30 days of request. Compliance timeline set for Q2 2026, with significant penalties for non-compliance. Legal and technical teams should assess infrastructure readiness and budget implications immediately.',
        date: '01.10.25 12:42',
        impact: 'High',
        tags: ['EU Policy', 'Data Privacy', 'Compliance'],
    },
    {
        id: 2,
        source: 'play.pl',
        link: 'https://www.play.pl/o-firmie/aktualnosci/ai-chatbot-launch',
        category: 'Technology',
        title: 'Play launches AI care bot across channels',
        snippet: 'Target: 25% deflection; expect shorter AHT and lower care OPEX.',
        summary: 'Play has deployed an advanced AI-powered customer service bot across web, mobile app, and messaging platforms. The operator targets 25% call deflection rate within six months, projecting significant reductions in average handle time (AHT) and overall customer care operating expenses. Initial tests show 30% faster resolution for routine inquiries. Competitive pressure mounting for similar automation investments.',
        date: '24.10.25 08:10',
        impact: 'Medium',
        tags: ['AI', 'Customer Service', 'Automation'],
    },
    {
        id: 3,
        source: 'orange.pl',
        link: 'https://www.orange.pl/news/5g-pricing-update',
        category: 'Competition',
        title: 'Orange drops 5G premium on entry plan',
        snippet: 'Downward pressure on ARPU; review pricing ladders this quarter.',
        summary: 'Orange Poland has eliminated the 5G premium surcharge on its entry-level postpaid plan, now offering 5G access at base price point of 39 PLN. This aggressive move creates downward ARPU pressure across the market and forces competitors to reconsider pricing strategies. The decision follows market share losses in the youth segment. Immediate review of pricing ladders and promotional strategies recommended.',
        date: '23.10.25 16:20',
        impact: 'High',
        tags: ['Pricing', '5G', 'Market Share'],
    },
    {
        id: 4,
        source: 'uar.gov.pl',
        link: 'https://www.uke.gov.pl/consultations/mvno-access-2025',
        category: 'Regulatory',
        title: 'UKE consults MVNO access guidelines',
        snippet: 'Potential wholesale rate changes; MVNO negotiations may accelerate.',
        summary: 'Polish telecom regulator UKE has opened public consultation on updated MVNO (Mobile Virtual Network Operator) wholesale access guidelines. Proposed changes include mandatory cost-oriented wholesale rates and shortened negotiation timelines. If adopted, expect accelerated MVNO market entry and potential wholesale revenue pressure. MNOs should prepare position papers and engage in consultation process before February deadline.',
        date: '22.10.25 10:05',
        impact: 'Medium',
        tags: ['MVNO', 'Wholesale', 'UKE'],
    },
    {
        id: 5,
        source: 'press.t-mobile.pl',
        link: 'https://www.t-mobile.pl/en/news/netflix-bundle-family-plans',
        category: 'Competition',
        title: 'T‑Mobile pilots family bundle with Netflix',
        snippet: 'Content bundle arms race; assess parity options with partners.',
        summary: 'T-Mobile Poland is piloting a family plan bundle including Netflix Standard subscription at no additional cost for customers on 99 PLN+ plans. This marks escalation in content bundling wars and threatens competitive positioning for players without similar partnerships. Early customer response shows strong interest in converged entertainment offerings. Strategic review of content partnership options and pricing parity measures urgently needed.',
        date: '21.10.25 09:32',
        impact: 'Medium',
        tags: ['Bundling', 'Streaming', 'Family Plans'],
    },
    {
        id: 6,
        source: 'reuters.com',
        link: 'https://www.reuters.com/business/media-telecom/vodafone-three-uk-merger-approved-2025-10-20',
        category: 'Market',
        title: 'Vodafone–Three UK merger gets CMA nod',
        snippet: 'Regional consolidation momentum; watch spectrum and tower impacts.',
        summary: 'UK Competition and Markets Authority (CMA) has conditionally approved the Vodafone-Three UK merger, creating Britain\'s largest mobile operator with 27M customers. Conditions include network investment commitments and temporary wholesale pricing caps. This approval signals regulatory openness to consolidation in mature European markets. Monitor implications for spectrum redistribution, tower sharing agreements, and potential M&A scenarios in Polish market.',
        date: '20.10.25 14:11',
        impact: 'High',
        tags: ['M&A', 'UK Market', 'Consolidation'],
    },
    {
        id: 7,
        source: 'gsma.com',
        link: 'https://www.gsma.com/futurenetworks/open-ran-cee-deployments',
        category: 'Technology',
        title: 'Open RAN trials expand across CEE',
        snippet: 'Capex deferral opportunity; vendor diversification risks.',
        summary: 'Multiple Central and Eastern European operators are expanding Open RAN trials, with deployments now covering over 1,500 sites across the region. Open RAN architecture promises 30-40% capex reduction and multi-vendor flexibility, but introduces integration complexity and potential performance trade-offs. Technology maturity improving rapidly with major vendors entering the space. Network planning teams should evaluate pilot opportunities for 2026 network expansion.',
        date: '19.10.25 12:45',
        impact: 'Low',
        tags: ['Open RAN', 'Infrastructure', 'Innovation'],
    },
    {
        id: 8,
        source: 'benchmarking.telecom',
        link: 'https://benchmarking.telecom/reports/q3-2025-churn-analysis',
        category: 'Market',
        title: 'Postpaid churn ticks up Q3',
        snippet: 'Early churn signals in youth segment; action needed on retention.',
        summary: 'Industry benchmarking data reveals postpaid churn increased 0.4 percentage points to 1.8% in Q3 2025, with youth segment (18-25) showing highest volatility at 2.3%. Primary drivers include aggressive promotional activity and improved digital switching processes. Operators with outdated value propositions for younger customers seeing disproportionate losses. Retention teams should prioritize youth segment analysis and targeted intervention campaigns.',
        date: '18.10.25 17:20',
        impact: 'High',
        tags: ['Churn', 'Youth Segment', 'Retention'],
    },
]

import savedIcon from './assets/saved.svg'
import savedOnIcon from './assets/saved_on.svg'
import logo from './assets/logo.svg'
import highImpactIcon from './assets/impact/high.svg'
import mediumImpactIcon from './assets/impact/medium.svg'
import lowImpactIcon from './assets/impact/low.svg'
import homeIcon from './assets/home.svg'
import homeOnIcon from './assets/home_on.svg'

// ==============================================
// HEADER COMPONENT
// ==============================================

/**
 * App header with logo and menu button
 */
function Header({ onMenuClick, onLogoClick }) {
    return (
        <header className="app-header">
            <img
                src={logo}
                alt="Company logo"
                className="header-logo"
                onClick={onLogoClick}
                style={{ cursor: 'pointer' }}
            />
            <button className="icon-button" aria-label="Open menu" onClick={onMenuClick}>☰</button>
        </header>
    )
}

// ==============================================
// BOTTOM NAVIGATION COMPONENT
// ==============================================

/**
 * Bottom navigation bar with Home and Saved tabs
 */
function BottomNav({ activeView, onNavigate }) {
    return (
        <nav className="bottom-nav">
            <button
                className={`nav-item ${activeView === 'main' ? 'active' : ''}`}
                onClick={() => onNavigate('main')}
                aria-label="Home"
            >
                <img
                    src={activeView === 'main' ? homeOnIcon : homeIcon}
                    alt="Home"
                    className="nav-icon"
                />
                <span className="nav-label">Home</span>
            </button>
            <button
                className={`nav-item ${activeView === 'saved' ? 'active' : ''}`}
                onClick={() => onNavigate('saved')}
                aria-label="Saved"
            >
                <img
                    src={activeView === 'saved' ? savedOnIcon : savedIcon}
                    alt="Saved"
                    className="nav-icon"
                />
                <span className="nav-label">Saved</span>
            </button>
        </nav>
    )
}

// ==============================================
// DRAWER COMPONENT
// ==============================================

/**
 * Slide-in navigation drawer with menu items
 */
function Drawer({ open, onClose, onProfile, onHistory, onSettings, onLogout }) {
    // Close drawer on Escape key press
    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape') onClose()
        }
        if (open) document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open, onClose])

    return (
        <>
            {/* Backdrop overlay */}
            <div className={`backdrop ${open ? 'show' : ''}`} onClick={onClose} />

            {/* Drawer panel */}
            <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
                <button className="drawer-close" aria-label="Close menu" onClick={onClose}>✕</button>
                <div className="menu">
                    {/* Main menu items */}
                    <nav className="menu-items menu-box">
                        <button className="menu-item" onClick={() => { onProfile(); onClose(); }}>Profile</button>
                        <button className="menu-item" onClick={() => { onHistory(); onClose(); }}>History</button>
                        <button className="menu-item" onClick={() => { onSettings(); onClose(); }}>Settings</button>
                    </nav>

                    {/* Footer with logout */}
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

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Parse date string in format "DD.MM.YY HH:MM" to Date object
 */
function parseDate(dateStr) {
    const [datePart, timePart] = dateStr.split(' ')
    const [day, month, year] = datePart.split('.')
    const [hour, minute] = timePart.split(':')
    return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
}

/**
 * Filter and sort news items based on criteria
 */
function filterAndSortItems(items, { search, category, selectedTags, sortBy, excludeSaved = false, onlySaved = false, dismissed = [], saved = [] }) {
    let filtered = items.filter((n) => {
        // Filter by dismissed/saved status
        if (excludeSaved && (dismissed.includes(n.id) || saved.includes(n.id))) return false
        if (onlySaved && (!saved.includes(n.id) || dismissed.includes(n.id))) return false
        if (!onlySaved && !excludeSaved && dismissed.includes(n.id)) return false

        // Filter by search text (title)
        if (search.trim()) {
            const searchLower = search.toLowerCase()
            if (!n.title.toLowerCase().includes(searchLower)) return false
        }

        // Filter by category
        if (category !== 'All' && n.category !== category) return false

        // Filter by selected tags
        if (selectedTags.length > 0) {
            if (!n.tags || !n.tags.some(tag => selectedTags.includes(tag))) return false
        }

        return true
    })

    // Sort items
    if (sortBy.startsWith('date')) {
        const ascending = sortBy === 'date-asc'
        filtered.sort((a, b) => {
            const diff = parseDate(a.date) - parseDate(b.date)
            return ascending ? diff : -diff
        })
    } else if (sortBy.startsWith('impact')) {
        const ascending = sortBy === 'impact-asc'
        filtered.sort((a, b) => {
            const diff = IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]
            return ascending ? diff : -diff
        })
    }

    return filtered
}

// ==============================================
// FILTER BAR COMPONENT
// ==============================================

/**
 * Filter bar with search, category, tags, and sort controls
 */
function FilterBar({ search, onSearchChange, category, onCategoryChange, selectedTags, onTagsChange, sortBy, onSortChange }) {
    const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false)
    const tagsRef = useRef(null)

    // Close tags dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (tagsRef.current && !tagsRef.current.contains(e.target)) {
                setTagsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleTag = useCallback((tag) => {
        onTagsChange(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }, [onTagsChange])

    const clearAllTags = useCallback(() => {
        onTagsChange([])
    }, [onTagsChange])

    return (
        <div className="filter-bar">
            {/* Search input */}
            <div className="filter-search">
                <input
                    type="text"
                    placeholder="Search news..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Filter controls row */}
            <div className="filter-controls">
                {/* Category dropdown */}
                <select
                    value={category}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="filter-select"
                >
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                {/* Tags multi-select dropdown */}
                <div className="filter-tags-wrapper" ref={tagsRef}>
                    <button
                        className="filter-select tags-toggle"
                        onClick={() => setTagsDropdownOpen(!tagsDropdownOpen)}
                    >
                        Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                    </button>
                    {tagsDropdownOpen && (
                        <div className="tags-dropdown">
                            <div className="tags-dropdown-header">
                                <span className="tags-dropdown-title">Select Tags</span>
                                {selectedTags.length > 0 && (
                                    <button className="tags-clear" onClick={clearAllTags}>
                                        Clear all
                                    </button>
                                )}
                            </div>
                            <div className="tags-dropdown-list">
                                {ALL_TAGS.map(tag => (
                                    <label key={tag} className="tag-checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedTags.includes(tag)}
                                            onChange={() => toggleTag(tag)}
                                        />
                                        <span>{tag}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sort dropdown */}
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="filter-select"
                >
                    <option value="date-desc">Date ↓</option>
                    <option value="date-asc">Date ↑</option>
                    <option value="impact-desc">Impact ↓</option>
                    <option value="impact-asc">Impact ↑</option>
                </select>
            </div>
        </div>
    )
}

// ==============================================
// NEWS ITEM COMPONENT
// ==============================================

/**
 * Individual news card with swipe gestures and expandable content
 */
function NewsItem({ item, onDismiss, onSave, isSaved, showSavedBadge }) {
    // Animation states
    const [isDismissing, setIsDismissing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Drag tracking
    const [dragX, setDragX] = useState(0)
    const [dragging, setDragging] = useState(false)

    // Visual feedback
    const [savedFlash, setSavedFlash] = useState(false)

    // Expanded state for read more
    const [isExpanded, setIsExpanded] = useState(false)

    const startRef = useRef({ x: 0, y: 0 })

    // Memoize computed values
    const impactIcon = IMPACT_ICONS[item.impact]
    const impactLabel = IMPACT_LABELS[item.impact]

    const absDrag = Math.abs(dragX)
    const gestureThreshold = 80
    const overlayVisible = dragging && absDrag > 5
    const overlayOpacity = overlayVisible ? Math.min(1, absDrag / gestureThreshold) : 0

    const isRightSwipe = dragX > 0
    const showSaveOverlay = isRightSwipe && !isSaved
    const overlayText = isRightSwipe ? (isSaved ? 'SAVED' : 'SAVE') : 'DISMISS'
    const overlayColor = showSaveOverlay ? 'var(--brand-blue)' : (isRightSwipe ? '#9ca3af' : '#ef4444')

    // Gesture handlers
    const onPointerDown = useCallback((e) => {
        const x = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0
        const y = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0
        startRef.current.x = x
        startRef.current.y = y
        setDragging(true)
    }, [])

    const onPointerMove = useCallback((e) => {
        if (!dragging) return
        const x = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0
        const dx = x - startRef.current.x
        setDragX(dx)
    }, [dragging])

    const onPointerUp = useCallback(() => {
        if (!dragging) return
        const dx = dragX
        const threshold = 80
        setDragging(false)

        if (dx <= -threshold) {
            setIsDismissing(true)
            setTimeout(() => onDismiss(item.id), 300)
        } else if (dx >= threshold && !isSaved) {
            setIsSaving(true)
            setTimeout(() => {
                onSave(item.id)
                setSavedFlash(true)
                setTimeout(() => setSavedFlash(false), 1000)
            }, 300)
            setDragX(0)
        } else {
            setDragX(0)
        }
    }, [dragging, dragX, isSaved, item.id, onDismiss, onSave])

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev)
    }, [])

    const style = dragging || dragX !== 0 ? { transform: `translateX(${dragX}px)` } : undefined

    return (
        <article
            className={`news-card ${isDismissing ? 'dismissing' : ''} ${isSaving ? 'saving' : ''} ${dragging ? 'dragging' : ''} ${isExpanded ? 'expanded' : ''}`}
            style={style}
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onDragStart={(e) => e.preventDefault()}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
            onTouchCancel={onPointerUp}
        >
            {/* Impact icon and label */}
            <div className="impact-indicator">
                <img src={impactIcon} alt={`${item.impact} impact`} className="impact-icon" />
                <span className="impact-label">{impactLabel}</span>
            </div>

            {/* Category badge */}
            <div className="category-badge">{item.category}</div>

            {/* Content wrapper for smooth height transition */}
            <div className="news-content">
                <h3 className="title">{item.title}</h3>

                {/* Tags with # prefix */}
                <div className="tags">
                    {item.tags && item.tags.map((t) => (
                        <span key={t} className="tag"># {t}</span>
                    ))}
                </div>

                <p className="snippet">{isExpanded ? item.summary : item.snippet}</p>

                {/* Metadata - only show when expanded */}
                {isExpanded && (
                    <div className="meta-expanded">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="source">
                            src: {item.source}
                        </a>
                        <span className="date">{item.date}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="actions">
                <button className="link" onClick={toggleExpanded}>
                    {isExpanded ? 'Show less' : 'Read more'}
                </button>
            </div>

            {/* Swipe gesture overlay */}
            {overlayVisible && (
                <div
                    className="swipe-overlay"
                    aria-hidden="true"
                    style={{
                        backgroundColor: overlayColor,
                        opacity: overlayOpacity,
                    }}
                >
                    {overlayText}
                </div>
            )}

            {/* Saved badge indicator */}
            {showSavedBadge && (isSaved || savedFlash) && (
                <div className="saved-badge" aria-hidden="true">Saved</div>
            )}
        </article>
    )
}

// ==============================================
// EMPTY STATE COMPONENT
// ==============================================

/**
 * Shows when user has reviewed all items in current category
 */
function EmptyState({ onSend }) {
    return (
        <div className="empty-state" role="status" aria-live="polite">
            <div className="empty-title">You're up to date</div>
            <h3 className="empty-subtitle">If you want we can send summary to your email</h3>
            <button className="primary-button" onClick={onSend}>Send Summary</button>
        </div>
    )
}

// ==============================================
// FEED COMPONENTS
// ==============================================

/**
 * Main news feed - shows active (not dismissed, not saved) items
 */
function NewsFeed({ items, onDismiss, onSave, saved, onSend, showEmpty }) {
    return (
        <section className="feed">
            {showEmpty ? (
                <EmptyState onSend={onSend} />
            ) : (
                items.map((n) => (
                    <NewsItem
                        key={n.id}
                        item={n}
                        onDismiss={onDismiss}
                        onSave={onSave}
                        isSaved={saved.includes(n.id)}
                        showSavedBadge={true}
                    />
                ))
            )}
        </section>
    )
}

/**
 * Saved items feed - shows user's saved articles
 */
function SavedFeed({ items, onDismiss, onSave, saved }) {
    const hasAny = items.length > 0
    return (
        <section className="feed">
            {hasAny ? (
                items.map((n) => (
                    <NewsItem
                        key={n.id}
                        item={n}
                        onDismiss={onDismiss}
                        onSave={onSave}
                        isSaved={saved.includes(n.id)}
                        showSavedBadge={false}
                    />
                ))
            ) : (
                <div className="empty-state" role="status" aria-live="polite">
                    <div className="empty-title">No saved items</div>
                    <h3 className="empty-subtitle">Swipe right on a news card to save it for later</h3>
                </div>
            )}
        </section>
    )
}

// ==============================================
// MAIN APP COMPONENT
// ==============================================

function App() {
    // Filter state
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [selectedTags, setSelectedTags] = useState([])
    const [sortBy, setSortBy] = useState('date-desc')

    // Item state tracking
    const [dismissed, setDismissed] = useState([])
    const [saved, setSaved] = useState([])

    // UI state
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [view, setView] = useState('main')

    // Memoize filter criteria object
    const filterCriteria = useMemo(() => ({
        search,
        category,
        selectedTags,
        sortBy,
        dismissed,
        saved
    }), [search, category, selectedTags, sortBy, dismissed, saved])

    // Filter and sort items for main feed
    const filtered = useMemo(() =>
        filterAndSortItems(MOCK_NEWS, { ...filterCriteria, excludeSaved: true }),
        [filterCriteria]
    )

    // Filter and sort saved items
    const savedItems = useMemo(() =>
        filterAndSortItems(MOCK_NEWS, { ...filterCriteria, onlySaved: true }),
        [filterCriteria]
    )

    const showEmpty = filtered.length === 0

    // Memoize callbacks to prevent unnecessary re-renders
    const handleDismiss = useCallback((id) => {
        setDismissed((d) => [...d, id])
    }, [])

    const handleSave = useCallback((id) => {
        setSaved((prev) => (prev.includes(id) ? prev : [...prev, id]))
    }, [])

    const handleSendSummary = useCallback(() => {
        alert('Summary will be sent to your email!')
    }, [])

    const openMenu = useCallback(() => setDrawerOpen(true), [])
    const closeMenu = useCallback(() => setDrawerOpen(false), [])

    const handleNavigate = useCallback((newView) => {
        setView(newView)
    }, [])

    const handleLogoClick = useCallback(() => {
        setView('main')
    }, [])

    const goProfile = useCallback(() => alert('Profile page coming soon'), [])
    const goHistory = useCallback(() => alert('History page coming soon'), [])
    const goSettings = useCallback(() => alert('Settings page coming soon'), [])
    const doLogout = useCallback(() => alert('Logged out (placeholder)'), [])

    return (
        <div className={`app ${view === 'saved' ? 'saved-view' : ''}`}>
            <Header onMenuClick={openMenu} onLogoClick={handleLogoClick} />

            <Drawer
                open={drawerOpen}
                onClose={closeMenu}
                onProfile={goProfile}
                onSettings={goSettings}
                onHistory={goHistory}
                onLogout={doLogout}
            />

            <div className="app-content">
                {view === 'main' ? (
                    <>
                        <FilterBar
                            search={search}
                            onSearchChange={setSearch}
                            category={category}
                            onCategoryChange={setCategory}
                            selectedTags={selectedTags}
                            onTagsChange={setSelectedTags}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                        />

                        <div className="feed-scroll">
                            <NewsFeed
                                items={filtered}
                                onDismiss={handleDismiss}
                                onSave={handleSave}
                                saved={saved}
                                onSend={handleSendSummary}
                                showEmpty={showEmpty}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <FilterBar
                            search={search}
                            onSearchChange={setSearch}
                            category={category}
                            onCategoryChange={setCategory}
                            selectedTags={selectedTags}
                            onTagsChange={setSelectedTags}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                        />

                        <div className="feed-scroll">
                            <SavedFeed
                                items={savedItems}
                                onDismiss={handleDismiss}
                                onSave={handleSave}
                                saved={saved}
                            />
                        </div>
                    </>
                )}
            </div>

            <BottomNav activeView={view} onNavigate={handleNavigate} />
        </div>
    )
}

export default App
