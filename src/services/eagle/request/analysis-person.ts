import axios, { AxiosRequestConfig } from 'axios'
import { LRUCache } from 'lru-cache'

import eagleSystemHeaders from '../headers'
import eagleSystemToken from '../token'
import { EagleSystemLoginResponse } from '~/models/eagle/login/login'
import { EagleSystemRequestAnalysisPersonParams, EagleSystemRequestAnalysisPersonResponse } from '~/models/eagle/request/analysis-person'
import ErrorHandler from '~/utils/error-handler'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

export type EagleRequestAnalysisPersonParams = {
  body: EagleSystemRequestAnalysisPersonParams
}

const cache_options = {
  ttl: 60 * 60 * 24 * 29, // 1 hour: 60 seconds * 60 minutes * 24 hours * 29 days
  ttlAutopurge: true,
}

const access_token_cache = new LRUCache(cache_options)

const EAGLESYSTEM_REQUEST_ENDPOINT = getStringEnv('EAGLESYSTEM_REQUEST_ENDPOINT')

const eagleRequestAnalysisPerson = async ({
  body,
}: EagleRequestAnalysisPersonParams): Promise<EagleSystemRequestAnalysisPersonResponse> => {
  if (!access_token_cache.has('token')) {
    const token = await eagleSystemToken()

    access_token_cache.set('token', token)
  }

  const token = access_token_cache.get('token') as EagleSystemLoginResponse

  const options: AxiosRequestConfig<EagleSystemRequestAnalysisPersonParams> = {
    method: 'post',
    baseURL: EAGLESYSTEM_REQUEST_ENDPOINT,
    url: '/analysis/person',
    headers: eagleSystemHeaders(token.jwtToken),
    data: body,
  }

  logger.debug({
    message: 'EagleRequest: request person analysis',
    service: 'EagleSystem',
    name: body.person.name,
    cpf: body.person.document,
  })

  const result = await axios
    .request<EagleSystemRequestAnalysisPersonResponse>(options)
    .catch((err) => {
      logger.warn({
        message: 'EagleRequest: Error on request person analysis',
        error: {
          response: {
            status: err.response.status,
            headers: err.response.headers,
            data: err.response.data,
          },
        },
      })

      throw new ErrorHandler('EagleRequest: Error on request person analysis', err.statusCode)
    })

  return result.data
}

export default eagleRequestAnalysisPerson
