import { RawAxiosRequestHeaders } from 'axios'

const m2SystemHeaders = (
  token: string,
): RawAxiosRequestHeaders => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
})

export default m2SystemHeaders
