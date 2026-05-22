import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export const getMovies = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
  )
  const response = await api.get('/movies', { params: cleanParams })
  return response.data
}

export const getMovie = async (id) => {
  const response = await api.get(`/movies/${id}`)
  return response.data
}

export const createMovie = async (data) => {
  const response = await api.post('/movies', data)
  return response.data
}

export const updateMovie = async (id, data) => {
  const response = await api.patch(`/movies/${id}`, data)
  return response.data
}

export const deleteMovie = async (id) => {
  await api.delete(`/movies/${id}`)
}

export const getTopTen = async () => {
  const response = await api.get('/topten')
  return response.data
}

export const updateTopTen = async (rankings) => {
  const response = await api.put('/topten', rankings)
  return response.data
}

export const removeFromTopTen = async (id) => {
  const response = await api.delete(`/topten/${id}`)
  return response.data
}

export const getStats = async () => {
  const response = await api.get('/stats')
  return response.data
}
