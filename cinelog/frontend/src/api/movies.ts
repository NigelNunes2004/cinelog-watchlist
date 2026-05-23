import { api } from './client'

export interface Movie {
  id: number
  title: string
  genre: string
  release_year: number
  poster_url: string | null
  status: 'unwatched' | 'watching' | 'watched'
  rating: number | null
  review: string | null
  favourite_quote: string | null
  rewatch_count: number
  is_top_ten: boolean
  top_ten_rank: number | null
  created_at: string
}

export const getMovies = async (params: Record<string, unknown> = {}): Promise<Movie[]> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
  )
  const response = await api.get('/movies', { params: cleanParams })
  return response.data
}

export const getMovie = async (id: number): Promise<Movie> => {
  const response = await api.get(`/movies/${id}`)
  return response.data
}

export const createMovie = async (data: Partial<Movie>): Promise<Movie> => {
  const response = await api.post('/movies', data)
  return response.data
}

export const updateMovie = async (id: number, data: Partial<Movie>): Promise<Movie> => {
  const response = await api.patch(`/movies/${id}`, data)
  return response.data
}

export const deleteMovie = async (id: number): Promise<void> => {
  await api.delete(`/movies/${id}`)
}

export const getTopTen = async (): Promise<Movie[]> => {
  const response = await api.get('/topten')
  return response.data
}

export const updateTopTen = async (rankings: { movie_id: number; rank: number }[]): Promise<void> => {
  await api.put('/topten', rankings)
}

export const removeFromTopTen = async (id: number): Promise<void> => {
  await api.delete(`/topten/${id}`)
}

export const getStats = async () => {
  const response = await api.get('/stats')
  return response.data
}

export interface TMDBResult {
  tmdb_id: number
  title: string
  genre: string
  release_year: number | null
  poster_url: string | null
  overview: string
}

export const searchTMDB = async (q: string): Promise<TMDBResult[]> => {
  if (!q.trim()) return []
  const response = await api.get<{ results: TMDBResult[] }>('/search', {
    params: { q: q.trim() },
  })
  return response.data.results ?? []
}
