import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { SQSClient } from '@aws-sdk/client-sqs'
import { AnalysisTypeEnum } from 'src/models/dynamo/request-enum'
import { Controller } from 'src/models/lambda'
import ErrorHandler from 'src/utils/error-handler'
import { UserInfoFromJwt } from 'src/utils/extract-jwt-lambda'
import logger from 'src/utils/logger'
import removeEmpty from 'src/utils/remove-empty'
import { v4 as uuid } from 'uuid'

import getCompanyAdapter from '../get-company-adapter'

import personAnalysisConstructor, { PersonAnalysisConstructor } from './person-analysis-constructor'
import sendMessageFacialBiometryAdapter, { SendMessageFacialBiometryAdapterParams } from './send-message-facial-biometry-adapter'
import validateBodyPerson from './validate-body-person'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const sqsClient = new SQSClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const requestAnalysisPerson: Controller = async (req) => {
  const event_body = removeEmpty(JSON.parse(req.body as string))
  const body = validateBodyPerson(event_body)

  const user_info = req.user_info as UserInfoFromJwt

  if (user_info.user_type === 'admin' && !body.person.company_name) {
    logger.warn({
      message: 'Need to inform company name for admin user',
      user_type: user_info.user_type,
    })

    throw new ErrorHandler('É necessário informar o nome da empresa para usuários admin', 400)
  } else if (user_info.user_type === 'client' && body.person.company_name) {
    logger.warn({
      message: 'User not allowed to inform company_name',
      user_type: user_info.user_type,
    })

    throw new ErrorHandler('Usuário não permitido em informar company_name', 400)
  }

  const company_name = body.person.company_name ? body.person.company_name : user_info.company_name
  const company = await getCompanyAdapter(company_name, dynamodbClient)

  const person_analyzes = []

  const release_extract_id = uuid()

  for (const person_analysis of body.person_analysis) {
    const person_analysis_request: PersonAnalysisConstructor = {
      analysis_type: AnalysisTypeEnum.PERSON,
      company_system_config: company.system_config,
      dynamodbClient,
      person_analysis_config: body.person_analysis_config,
      person_data: body.person,
      release_extract_id,
      user_info,
    }

    person_analyzes.push(await personAnalysisConstructor(person_analysis, person_analysis_request))
  }

  const request_ids: string[] = []

  person_analyzes.forEach((first_array_itens) => {
    first_array_itens.forEach((second_array_itens: any) => {
      request_ids.push(second_array_itens.request_id)
    })
  })

  const send_message_facial_biometry_adapter_params: SendMessageFacialBiometryAdapterParams = {
    data: body.person,
    person_id: person_analyzes[0][0].person_id,
    request_ids,
  }

  if (company.system_config.biometry === true) {
    await sendMessageFacialBiometryAdapter(send_message_facial_biometry_adapter_params, sqsClient)
  }

  logger.info({
    message: 'Successfully requested to analyze person',
    person_id: person_analyzes[0][0].person_id,
  })

  return {
    body: {
      message: 'Successfully requested to analyze person',
      person_analyzes: person_analyzes.flat(),
    },
  }
}

export default requestAnalysisPerson
