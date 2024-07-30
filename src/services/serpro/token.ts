import axios, { AxiosRequestConfig } from 'axios'

import ErrorHandler from '~/utils/error-handler'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'
import stringToBase64 from '~/utils/string-to-base64'

export type SerproTokenResponse = {
  access_token: string
  scope: string
  token_type: string
  expires_in: number
}

const SERPRO_CONSUMER_KEY = getStringEnv('SERPRO_CONSUMER_KEY')
const SERPRO_CONSUMER_SECRET = getStringEnv('SERPRO_CONSUMER_SECRET')
const SERPRO_ENDPOINT = getStringEnv('SERPRO_ENDPOINT')

const serproToken = async (): Promise<SerproTokenResponse> => {
  logger.debug({
    message: 'SERPRO: Getting token',
    service: 'serpro',
  })

  const basic_token = stringToBase64(`${SERPRO_CONSUMER_KEY}:${SERPRO_CONSUMER_SECRET}`)

  const options: AxiosRequestConfig = {
    method: 'post',
    baseURL: SERPRO_ENDPOINT,
    data: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${basic_token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    url: '/token',
  }

  const result = await axios
    .request(options)
    .catch((err) => {
      logger.warn({
        message: 'SERPRO: Error on get token',
        error: err,
      })

      throw new ErrorHandler('SERPRO: Error on get token', err.statusCode)
    })

  return result.data
}

export default serproToken
