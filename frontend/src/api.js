// API service for fetching news data from backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Fetch all articles from the API
 */
export async function fetchArticles() {
    try {
        const response = await fetch(`${API_BASE_URL}/all`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching articles:', error)
        throw error
    }
}

/**
 * Fetch filtered articles from the API
 */
export async function fetchFilteredArticles({ lang, source, days, text_contains, limit = 50 }) {
    try {
        const params = new URLSearchParams()
        if (lang) params.append('lang', lang)
        if (source) params.append('source', source)
        if (days) params.append('days', days)
        if (text_contains) params.append('text_contains', text_contains)
        if (limit) params.append('limit', limit)

        const response = await fetch(`${API_BASE_URL}/articles/filter?${params}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data.results || []
    } catch (error) {
        console.error('Error fetching filtered articles:', error)
        throw error
    }
}

/**
 * Transform API data to match the app's expected format
 */
export function transformArticleData(apiArticles) {
    return apiArticles.map((article, index) => {
        // Parse date and format it as DD.MM.YY HH:MM
        const date = new Date(article.date_published || article.published || Date.now())
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getFullYear()).slice(2)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

        // Map category to our predefined categories
        const categoryMap = {
            'Regulation': 'Regulatory',
            'Regulatory': 'Regulatory',
            '5G': 'Technology',
            'Technology': 'Technology',
            'Investment': 'Market',
            'Market': 'Market',
            'Competition': 'Competition',
        }
        const category = categoryMap[article.category] || 'Market'

        // Determine impact based on importance_score
        let impact = 'Low'
        if (article.importance_score >= 8) {
            impact = 'High'
        } else if (article.importance_score >= 5) {
            impact = 'Medium'
        }

        // Extract source domain from URL or use source field
        const sourceUrl = article.url || article.link || ''
        let sourceDomain = article.source || 'unknown'
        try {
            if (sourceUrl) {
                const url = new URL(sourceUrl)
                sourceDomain = url.hostname.replace('www.', '')
            }
        } catch (e) {
            // Use source field if URL parsing fails
        }

        // Create snippet from text or summary
        const snippet = article.text || article.summary || 'No description available.'
        const summary = article.content || article.summary || article.text || snippet

        return {
            id: article._id || `article-${index}`,
            source: sourceDomain,
            link: article.url || article.link || '#',
            category: category,
            title: article.title || 'Untitled',
            snippet: snippet.length > 150 ? snippet.substring(0, 147) + '...' : snippet,
            summary: summary,
            date: formattedDate,
            impact: impact,
            tags: article.tags || article.keywords || [],
        }
    })
}

