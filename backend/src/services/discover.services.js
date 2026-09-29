
const BASE = 'https://api.jamendo.com/v3.0/tracks/'

async function fetchTracks({ q = '', tag = '', page = 1, limit = 20 } = {}) {
    const clientId = process.env.JAMENDO_CLIENT_ID
    if (!clientId) {
        const err = new Error('JAMENDO_CLIENT_ID is missing in backend/.env')
        err.status = 500
        throw err
    }

    const params = new URLSearchParams({
        client_id: clientId,
        format: 'json',
        limit: String(limit),
        offset: String((page - 1) * limit),
        audioformat: 'mp32',
        imagesize: '200',
        order: q ? 'relevance' : 'popularity_month'
    })
    if (q) params.set('search', q)
    if (tag) params.set('tags', tag)

    const res = await fetch(`${BASE}?${params}`)
    if (!res.ok) {
        const err = new Error('Music service is not responding. Try again later.')
        err.status = 502
        throw err
    }
    const data = await res.json()
    if (data.headers && data.headers.status === 'failed') {
        const err = new Error(data.headers.error_message || 'Music service error')
        err.status = 502
        throw err
    }

    return (data.results || [])
        .filter(t => t.audio)
        .map(t => ({
            id: 'jm_' + t.id,
            title: t.name,
            uri: t.audio,
            artistName: t.artist_name,
            cover: t.image,
            duration: t.duration,
            source: 'jamendo'
        }))
}

module.exports = { fetchTracks }