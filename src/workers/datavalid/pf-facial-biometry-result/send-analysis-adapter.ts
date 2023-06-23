import { LRUCache } from 'lru-cache'
import { AnalysisResultEnum } from 'src/models/dynamo/answer'
import invokeSendAnswer, { InvokeSendAnswerParams } from 'src/services/requestplus/send-answer/person/invoke'
import invokeLogin, { InvokeLoginResponse } from 'src/services/userplus/login/invoke'
import getStringEnv from 'src/utils/get-string-env'

export interface sendAnalysisAdapterParams {
  person_id: string
  rejected_info: string
  request_id: string
}

const options = {
  ttl: 60 * 60 * 24 * 29,
  ttlAutopurge: true,
}

const cache = new LRUCache(options)

const SCOREPLUS_DATAVALID_USER_ACCOUNT = getStringEnv('SCOREPLUS_DATAVALID_USER_ACCOUNT')
const SCOREPLUS_DATAVALID_USER_PASSWORD = getStringEnv('SCOREPLUS_DATAVALID_USER_PASSWORD')

const sendAnalysisAdapter = async ({
  person_id,
  rejected_info,
  request_id,
}: sendAnalysisAdapterParams): Promise<void> => {
  const analysis_info = 'Reprovado por análise biométrica. Detalhes: ' + rejected_info

  if (!cache.has('lambda_login')) {
    const lambda_login = await invokeLogin({
      email: SCOREPLUS_DATAVALID_USER_ACCOUNT,
      password: SCOREPLUS_DATAVALID_USER_PASSWORD,
    })

    cache.set('lambda_login', lambda_login)
  }

  const login_response = cache.get('lambda_login') as InvokeLoginResponse

  const invoke_send_answer_params: InvokeSendAnswerParams = {
    analysis_info,
    analysis_result: AnalysisResultEnum.REJECTED,
    person_id,
    request_id,
    user_token: login_response.jwtToken,
  }

  await invokeSendAnswer(invoke_send_answer_params)
}

export default sendAnalysisAdapter
