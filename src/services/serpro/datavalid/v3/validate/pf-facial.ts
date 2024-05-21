import axios, { AxiosRequestConfig } from 'axios'
import { LRUCache } from 'lru-cache'

import { PFFacialBiometryBody } from '~/models/datavalid/pf-facial/request-body'
import { PFFacialResult } from '~/models/datavalid/pf-facial/result'
import serproToken, { SerproTokenResponse } from '~/services/serpro/token'
import ErrorHandler from '~/utils/error-handler'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

import serproDatavalidV3ValidateHeaders from './headers'

export type SerproDatavalidV3ValidatePfFacial = {
  body: PFFacialBiometryBody
}

const cache_options = {
  ttl: 60 * 60, // 1 hour: 60 seconds * 60 minutes
  ttlAutopurge: true,
}

const access_token_cache = new LRUCache(cache_options)

const DATAVALID_ENDPOINT = getStringEnv('DATAVALID_ENDPOINT')

const serproDatavalidV3ValidatePfFacial = async ({
  body,
}: SerproDatavalidV3ValidatePfFacial): Promise<PFFacialResult> => {
  if (!access_token_cache.has('access_token')) {
    const access_token = await serproToken()

    access_token_cache.set('access_token', access_token)
  }

  const access_token = access_token_cache.get('access_token') as SerproTokenResponse

  const options: AxiosRequestConfig<PFFacialBiometryBody> = {
    method: 'post',
    baseURL: DATAVALID_ENDPOINT,
    url: '/validate/pf-facial',
    headers: serproDatavalidV3ValidateHeaders(access_token.access_token),
    data: body,
  }

  logger.debug({
    message: 'DATAVALID: Validate Pf Facial',
    service: 'serpro',
    cpf: body.key.cpf,
  })

  const result = await axios
    .request(options)
    .catch((err) => {
      logger.warn({
        message: 'DATAVALID: Error on validate Pf Facial',
        error: {
          request: err.request,
          response: {
            status: err.response.status,
            headers: err.response.headers,
            data: err.response.data,
          },
        },
      })

      throw new ErrorHandler('DATAVALID: Error on validate Pf Facial', err.statusCode)
    })

  return result.data
}

export default serproDatavalidV3ValidatePfFacial
