import axios, { AxiosRequestConfig } from 'axios'
import { LRUCache } from 'lru-cache'

import eagleSystemHeaders from '../headers'
import eagleSystemToken from '../token'
import { EagleSystemLoginResponse } from '~/models/eagle/login/login'
import { EagleSystemRequestAnalysisVehicleResponse, EagleSystemVehicleRequestAnalysisTypeForms } from '~/models/eagle/request/vehicle-analysis'
import ErrorHandler from '~/utils/error-handler'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

export type EagleRequestAnalysisVehicleParams = {
  body: EagleSystemVehicleRequestAnalysisTypeForms
}

const cache_options = {
  ttl: 60 * 60 * 24 * 29, // 1 hour: 60 seconds * 60 minutes * 24 hours * 29 days
  ttlAutopurge: true,
}

const access_token_cache = new LRUCache(cache_options)

const EAGLESYSTEM_REQUEST_ENDPOINT = getStringEnv('EAGLESYSTEM_REQUEST_ENDPOINT')

const eagleRequestAnalysisVehicleANTT = async ({
  body,
}: EagleRequestAnalysisVehicleParams): Promise<EagleSystemRequestAnalysisVehicleResponse> => {
  if (!access_token_cache.has('token')) {
    const token = await eagleSystemToken()

    access_token_cache.set('token', token)
  }

  const token = access_token_cache.get('token') as EagleSystemLoginResponse

  const options: AxiosRequestConfig<EagleSystemVehicleRequestAnalysisTypeForms> = {
    method: 'post',
    baseURL: EAGLESYSTEM_REQUEST_ENDPOINT,
    url: '/analysis/vehicle/antt',
    headers: eagleSystemHeaders(token.jwtToken),
    data: body,
  }

  logger.debug({
    message: 'EagleRequest: request vehicle analysis',
    service: 'EagleSystem',
    owner_name: body.owner_name,
    plate: body.plate,
  })

  const result = await axios
    .request<EagleSystemRequestAnalysisVehicleResponse>(options)
    .catch((err) => {
      logger.warn({
        message: 'EagleRequest: Error on request antt vehicle analysis',
        error: {
          response: {
            status: err.response.status,
            headers: err.response.headers,
            data: err.response.data,
          },
        },
      })

      throw new ErrorHandler('EagleRequest: Error on request vehicle antt analysis', err.statusCode)
    })

  return result.data
}

export default eagleRequestAnalysisVehicleANTT
