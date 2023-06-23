import axios from 'axios'
import { AnalysisResultEnum } from 'src/models/dynamo/answer'
import ErrorHandler from 'src/utils/error-handler'
import getStringEnv from 'src/utils/get-string-env'
import logger from 'src/utils/logger'

import sendAnswerHeaders from './formater/headers'

export interface InvokeSendAnswerParams {
  analysis_info: string
  analysis_result: AnalysisResultEnum
  person_id: string
  request_id: string
  user_token: string
}

const SCOREPLUS_REQUESTPLUS_URL = getStringEnv('SCOREPLUS_REQUESTPLUS_URL')

const invokeSendAnswer = async ({
  analysis_info,
  analysis_result,
  person_id,
  request_id,
  user_token,
}: InvokeSendAnswerParams) => {
  logger.debug({
    message: 'SCOREPLUS: Request to send answer',
    request_id,
    person_id,
  })

  const options = {
    method: 'post',
    baseURL: SCOREPLUS_REQUESTPLUS_URL,
    url: '/analysis/person/' + request_id + '/answer',
    params: {
      person_id,
    },
    headers: sendAnswerHeaders(user_token),
    data: {
      analysis_info,
      analysis_result,
    },
  }

  await axios.request(options).catch((err) => {
    logger.warn({
      message: 'SCOREPLUS: Error on send answer',
      error: err,
    })

    throw new ErrorHandler('SCOREPLUS: Error on send answer', 500)
  })
}

export default invokeSendAnswer
