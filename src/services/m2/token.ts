import axios, { AxiosRequestConfig } from 'axios'

import { M2User } from '~/models/m2system/user/user'

import ErrorHandler from '~/utils/error-handler'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

export type M2SystemLoginParams = {
  email: string
  password: string
}

export type M2SystemTokenResponse = {
  message: string
  user: M2User
  jwtToken: string
  expires_date: Date
}

const M2SYSTEM_USER_LOGIN_EMAIL = getStringEnv('M2SYSTEM_USER_LOGIN_EMAIL')
const M2SYSTEM_USER_LOGIN_PASSWORD = getStringEnv('M2SYSTEM_USER_LOGIN_PASSWORD')
const M2SYSTEM_USER_ENDPOINT = getStringEnv('M2SYSTEM_USER_ENDPOINT')

const m2SystemToken = async (): Promise<M2SystemTokenResponse> => {
  logger.debug({
    message: 'M2User: Getting jwt',
    service: 'M2System',
  })

  const options: AxiosRequestConfig<M2SystemLoginParams> = {
    method: 'post',
    baseURL: M2SYSTEM_USER_ENDPOINT,
    data: {
      email: M2SYSTEM_USER_LOGIN_EMAIL,
      password: M2SYSTEM_USER_LOGIN_PASSWORD,
    },
    url: '/login',
  }

  const result = await axios
    .request<M2SystemTokenResponse>(options)
    .catch((err) => {
      logger.warn({
        message: 'M2System: Error on get token',
        error: err,
      })

      throw new ErrorHandler('M2System: Error on get token', err.statusCode)
    })

  return result.data
}

export default m2SystemToken
