import axios, { AxiosRequestConfig } from 'axios'
import { LRUCache } from 'lru-cache'

import { PFFacialCDVBiometryBody } from '~/models/datavalid/pf-facial-cdv/request-body'
import { PFFacialCDVResult } from '~/models/datavalid/pf-facial-cdv/result'
import serproToken, { SerproTokenResponse } from '~/services/serpro/token'
import ErrorHandler from '~/utils/error-handler'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

import serproDatavalidV3ValidateHeaders from './headers'

export type SerproDatavalidV3ValidatePfFacialCDV = {
  body: PFFacialCDVBiometryBody
}

const cache_options = {
  ttl: 60 * 60, // 1 hour: 60 seconds * 60 minutes
  ttlAutopurge: true,
}

const access_token_cache = new LRUCache(cache_options)

const DATAVALID_ENDPOINT = getStringEnv('DATAVALID_ENDPOINT')

const serproDatavalidV3ValidatePfFacialCDV = async ({
  body,
}: SerproDatavalidV3ValidatePfFacialCDV): Promise<PFFacialCDVResult> => {
  if (!access_token_cache.has('access_token')) {
    const access_token = await serproToken()

    access_token_cache.set('access_token', access_token)
  }

  const access_token = access_token_cache.get('access_token') as SerproTokenResponse

  const options: AxiosRequestConfig<PFFacialCDVBiometryBody> = {
    method: 'post',
    baseURL: DATAVALID_ENDPOINT,
    url: '/validate/pf-facial-cdv',
    headers: serproDatavalidV3ValidateHeaders(access_token.access_token),
    data: body,
  }

  logger.debug({
    message: 'DATAVALID: Validate Pf Facial CDV',
    service: 'serpro',
    cpf: body.key.cpf,
  })

  const result = await axios
    .request(options)
    .catch((err) => {
      logger.warn({
        message: 'DATAVALID: Error on validate Pf Facial CDV',
        error: err,
      })

      throw new ErrorHandler('DATAVALID: Error on validate Pf Facial CDV', err.statusCode)
    })

  return result.data
}

export default serproDatavalidV3ValidatePfFacialCDV
