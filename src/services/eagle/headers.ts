import { RawAxiosRequestHeaders } from 'axios'

const eagleSystemHeaders = (
  token: string,
): RawAxiosRequestHeaders => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
})

export default eagleSystemHeaders
