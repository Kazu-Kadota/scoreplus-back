import { RawAxiosRequestHeaders } from 'axios'

export type SerproDatavalidV3ValidateHeaders = {
  'x-request-tag'?: string
  'x-request-trace-id'?: string
  'x-signature'?: string
}

const serproDatavalidV3ValidateHeaders = (
  access_token: string,
  options?: SerproDatavalidV3ValidateHeaders,
): RawAxiosRequestHeaders => ({
  Authorization: `Bearer ${access_token}`,
  'Content-Type': 'application/json',
  'x-request-tag': options?.['x-request-tag'],
  'x-request-trace-id': options?.['x-request-trace-id'],
  'x-signature': options?.['x-signature'],
})

export default serproDatavalidV3ValidateHeaders
