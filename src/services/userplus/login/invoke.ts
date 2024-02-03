import axios from 'axios'

import { UserplusUser } from '~/models/dynamo/userplus/user'
import ErrorHandler from '~/utils/error-handler'
import getStringEnv from '~/utils/get-string-env'
import logger from '~/utils/logger'

export interface InvokeLoginParams {
  email: string
  password: string
}

export interface InvokeLoginResponse {
  message: string
  user: UserplusUser
  jwtToken: string
  expires_date: string
}

const SCOREPLUS_USERPLUS_URL = getStringEnv('SCOREPLUS_USERPLUS_URL')

const invokeLogin = async ({
  email,
  password,
}: InvokeLoginParams): Promise<InvokeLoginResponse> => {
  logger.debug({
    message: 'SCOREPLUS: Request to login',
    service: 'userplus',
    password,
    email,
  })

  const options = {
    method: 'post',
    baseURL: SCOREPLUS_USERPLUS_URL,
    url: '/login',
    data: {
      email,
      password,
    },
  }

  const result = await axios
    .request<InvokeLoginResponse>(options)
    .catch((err) => {
      logger.warn({
        message: 'SCOREPLUS: Error on login',
        error: err,
      })

      throw new ErrorHandler('SCOREPLUS: Error on login', 500)
    })

  return result.data
}

export default invokeLogin
