import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { SNSClient } from '@aws-sdk/client-sns'

import getCompanyAdapter from '../../get-company-adapter'
import { AnalysisTypeEnum } from '~/models/dynamo/enums/request'
import { Controller } from '~/models/lambda'
import useCaseRequestPersonAnalysis, { UseCaseRequestPersonAnalysis } from '~/use-cases/request-person-analysis'
import BadRequestError from '~/utils/errors/400-bad-request'
import logger from '~/utils/logger'

import validateBodyPerson from './validate-body-person'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const snsClient = new SNSClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const requestAnalysisPerson: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start request person analysis path',
  })
  const body = validateBodyPerson(JSON.parse(req.body as string))

  const user_info = req.user

  if (user_info.user_type === 'admin' && !body.person.company_name) {
    logger.warn({
      message: 'Need to inform company name for admin user',
    })

    throw new BadRequestError('É necessário informar o nome da empresa para usuários admin')
  } else if (user_info.user_type === 'client' && body.person.company_name) {
    logger.warn({
      message: 'User not allowed to inform company_name',
    })

    throw new BadRequestError('Usuário não permitido em informar company_name')
  }

  const company_name = body.person.company_name ?? user_info.company_name
  const company = await getCompanyAdapter(company_name, dynamodbClient)

  const use_case_request_person_analysis: UseCaseRequestPersonAnalysis = {
    analysis_type: AnalysisTypeEnum.PERSON,
    company_request_person_config: company.request_person_config,
    dynamodbClient,
    person_analysis_options_to_request: body.person_analysis_options_to_request,
    person_analysis_type: body.person_analysis_type,
    person_data: body.person,
    snsClient,
    user_info,
  }

  const person_analysis = await useCaseRequestPersonAnalysis(use_case_request_person_analysis)

  logger.info({
    message: 'Successfully requested to analyze person',
    person_id: person_analysis.person_id,
    person_request_id: person_analysis.person_request_id,
  })

  return {
    body: {
      message: 'Successfully requested to analyze person',
      person_analysis,
    },
  }
}

export default requestAnalysisPerson
