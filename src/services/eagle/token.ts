import axios, { AxiosRequestConfig } from 'axios'

import { EagleSystemLoginParams, EagleSystemLoginResponse } from '~/models/eagle/login/login'
import ErrorHandler from '~/utils/error-handler'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

const EAGLESYSTEM_USER_LOGIN_EMAIL = getStringEnv('EAGLESYSTEM_USER_LOGIN_EMAIL')
const EAGLESYSTEM_USER_LOGIN_PASSWORD = getStringEnv('EAGLESYSTEM_USER_LOGIN_PASSWORD')
const EAGLESYSTEM_USER_ENDPOINT = getStringEnv('EAGLESYSTEM_USER_ENDPOINT')

const eagleSystemToken = async (): Promise<EagleSystemLoginResponse> => {
  logger.debug({
    message: 'EagleSystem: Getting jwt',
    service: 'EagleSystem',
  })

  const data: EagleSystemLoginParams = {
    email: EAGLESYSTEM_USER_LOGIN_EMAIL,
    password: EAGLESYSTEM_USER_LOGIN_PASSWORD,
  }

  const options: AxiosRequestConfig<EagleSystemLoginParams> = {
    method: 'post',
    baseURL: EAGLESYSTEM_USER_ENDPOINT,
    data,
    url: '/login',
  }

  const result = await axios
    .request<EagleSystemLoginResponse>(options)
    .catch((err) => {
      logger.warn({
        message: 'EagleSystem: Error on get token',
        error: err,
      })

      throw new ErrorHandler('EagleSystem: Error on get token', err.statusCode)
    })

  return result.data
}

export default eagleSystemToken
