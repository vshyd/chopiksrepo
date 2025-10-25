import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import './App.css'
import { fetchArticles, transformArticleData } from './api'
import Register from './Register'

// ==============================================
// CONSTANTS & DATA
// ==============================================

const CATEGORIES = ['All', 'Regulatory', 'Competition', 'Technology', 'Market']

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
function Drawer({ open, onClose, onProfile, onHistory, onSettings, onRegister, onLogout }) {
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
                        <button className="menu-item" onClick={() => { onRegister(); onClose(); }}>Register New Account</button>
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
function FilterBar({ search, onSearchChange, category, onCategoryChange, selectedTags, onTagsChange, sortBy, onSortChange, allTags = [] }) {
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
                                {allTags.map(tag => (
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
                        <a href={item.source} target="_blank" rel="noopener noreferrer" className="source">
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
    // Data state
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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
    const [showRegister, setShowRegister] = useState(false)

    // Fetch articles from API on mount
    useEffect(() => {
        async function loadArticles() {
            try {
                setLoading(true)
                const apiData = await fetchArticles()
                const transformedData = transformArticleData(apiData)
                setArticles(transformedData)
                setError(null)
            } catch (err) {
                console.error('Failed to load articles:', err)
                setError('Failed to load news. Please try again later.')
            } finally {
                setLoading(false)
            }
        }
        loadArticles()
    }, [])

    // Extract all unique tags from articles
    const allTags = useMemo(() => {
        const tagsSet = new Set()
        articles.forEach(article => {
            if (article.tags && Array.isArray(article.tags)) {
                article.tags.forEach(tag => tagsSet.add(tag))
            }
        })
        return Array.from(tagsSet).sort()
    }, [articles])

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
        filterAndSortItems(articles, { ...filterCriteria, excludeSaved: true }),
        [articles, filterCriteria]
    )

    // Filter and sort saved items
    const savedItems = useMemo(() =>
        filterAndSortItems(articles, { ...filterCriteria, onlySaved: true }),
        [articles, filterCriteria]
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
    const goRegister = useCallback(() => setShowRegister(true), [])
    const handleRegister = useCallback((formData) => {
        console.log('User registered:', formData)
        setShowRegister(false)
    }, [])
    const handleBackToApp = useCallback(() => setShowRegister(false), [])
    const doLogout = useCallback(() => alert('Logged out (placeholder)'), [])

    // Show registration page if requested
    if (showRegister) {
        return <Register onRegister={handleRegister} onBackToLogin={handleBackToApp} />
    }

    return (
        <div className={`app ${view === 'saved' ? 'saved-view' : ''}`}>
            <Header onMenuClick={openMenu} onLogoClick={handleLogoClick} />

            <Drawer
                open={drawerOpen}
                onClose={closeMenu}
                onProfile={goProfile}
                onSettings={goSettings}
                onHistory={goHistory}
                onRegister={goRegister}
                onLogout={doLogout}
            />

            <div className="app-content">
                {loading ? (
                    <div className="loading-state" role="status" aria-live="polite">
                        <div>Loading news...</div>
                    </div>
                ) : error ? (
                    <div className="error-state" role="alert">
                        <div className="error-title">Error</div>
                        <div className="error-message">{error}</div>
                        <button
                            className="primary-button"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                ) : view === 'main' ? (
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
                            allTags={allTags}
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
                            allTags={allTags}
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
