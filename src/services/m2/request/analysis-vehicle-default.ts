import axios, { AxiosRequestConfig } from 'axios'
import { LRUCache } from 'lru-cache'

import m2SystemHeaders from '../headers'
import m2SystemToken, { M2SystemTokenResponse } from '../token'
import { M2VehicleRequestAnalysisResponse, M2VehicleRequestForms } from '~/models/m2system/request/analysis-vehicle'
import ErrorHandler from '~/utils/error-handler'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

export type M2RequestAnalysisVehicleParams = {
  body: M2VehicleRequestForms
}

const cache_options = {
  ttl: 60 * 60 * 24 * 29, // 1 hour: 60 seconds * 60 minutes * 24 hours * 29 days
  ttlAutopurge: true,
}

const access_token_cache = new LRUCache(cache_options)

const M2SYSTEM_REQUEST_ENDPOINT = getStringEnv('M2SYSTEM_REQUEST_ENDPOINT')

const m2RequestAnalysisVehicle = async ({
  body,
}: M2RequestAnalysisVehicleParams): Promise<M2VehicleRequestAnalysisResponse> => {
  if (!access_token_cache.has('token')) {
    const token = await m2SystemToken()

    access_token_cache.set('token', token)
  }

  const token = access_token_cache.get('token') as M2SystemTokenResponse

  const options: AxiosRequestConfig<M2VehicleRequestForms> = {
    method: 'post',
    baseURL: M2SYSTEM_REQUEST_ENDPOINT,
    url: '/analysis/vehicle',
    headers: m2SystemHeaders(token.jwtToken),
    data: body,
  }

  logger.debug({
    message: 'M2Request: request vehicle analysis',
    service: 'M2System',
    plate: body.plate,
    plate_state: body.plate_state,
  })

  const result = await axios
    .request<M2VehicleRequestAnalysisResponse>(options)
    .catch((err) => {
      logger.warn({
        message: 'M2Request: Error on request vehicle analysis',
        error: {
          response: {
            status: err.response.status,
            headers: err.response.headers,
            data: err.response.data,
          },
        },
      })

      throw new ErrorHandler('M2Request: Error on request vehicle analysis', err.statusCode)
    })

  return result.data
}

export default m2RequestAnalysisVehicle
