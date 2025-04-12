import axios, { AxiosRequestConfig } from 'axios'
import { LRUCache } from 'lru-cache'

import m2SystemHeaders from '../headers'
import m2SystemToken, { M2SystemTokenResponse } from '../token'
import { M2PersonRequestAnalysisBody, M2PersonRequestAnalysisResponse } from '~/models/m2system/request/analysis-person'
import ErrorHandler from '~/utils/error-handler'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

export type M2RequestAnalysisPersonParams = {
  body: M2PersonRequestAnalysisBody
}

const cache_options = {
  ttl: 60 * 60 * 24 * 29, // 1 hour: 60 seconds * 60 minutes * 24 hours * 29 days
  ttlAutopurge: true,
}

const access_token_cache = new LRUCache(cache_options)

const M2SYSTEM_REQUEST_ENDPOINT = getStringEnv('M2SYSTEM_REQUEST_ENDPOINT')

const m2RequestAnalysisPerson = async ({
  body,
}: M2RequestAnalysisPersonParams): Promise<M2PersonRequestAnalysisResponse> => {
  if (!access_token_cache.has('token')) {
    const token = await m2SystemToken()

    access_token_cache.set('token', token)
  }

  const token = access_token_cache.get('token') as M2SystemTokenResponse

  const options: AxiosRequestConfig<M2PersonRequestAnalysisBody> = {
    method: 'post',
    baseURL: M2SYSTEM_REQUEST_ENDPOINT,
    url: '/analysis/person',
    headers: m2SystemHeaders(token.jwtToken),
    data: body,
  }

  logger.debug({
    message: 'M2Request: request person analysis',
    service: 'M2System',
    name: body.person.name,
    cpf: body.person.document,
  })

  const result = await axios
    .request<M2PersonRequestAnalysisResponse>(options)
    .catch((err) => {
      logger.warn({
        message: 'M2Request: Error on request person analysis',
        error: {
          response: {
            status: err.response.status,
            headers: err.response.headers,
            data: err.response.data,
          },
        },
      })

      throw new ErrorHandler('M2Request: Error on request person analysis', err.statusCode)
    })

  return result.data
}

export default m2RequestAnalysisPerson
