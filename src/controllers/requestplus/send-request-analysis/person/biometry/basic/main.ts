import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { SNSClient } from '@aws-sdk/client-sns'

import getCompanyAdapter from '../../../get-company-adapter'
import getRequestPersonAdapter from '../get-request-person-adapter'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisTypeEnum } from '~/models/dynamo/enums/request'
import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { BinaryController, Input } from '~/models/lambda'
import useCaseRequestPersonAnalysis, { UseCaseRequestPersonAnalysis } from '~/use-cases/request-person-analysis'
import ForbiddenError from '~/utils/errors/403-forbidden'
import logger from '~/utils/logger'

import parseBody from './parse-body'
import publishSnsTopicPersonAdapter from './publish-sns-topic-person-adapter'
import updateRequestPersonAdapter from './update-request-person-adapter'
import validateBody from './validate-body'

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const snsClient = new SNSClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

export type RequestBiometryPersonBinaryBody = {
  company_name?: Input,
  existing_person?: Input,
  person?: Input,
  person_analysis_type?: Input,
}

const requestPersonBiometryBasic: BinaryController<true> = async (req) => {
  logger.debug({
    message: 'Start request person biometry basic analysis',
  })

  const parsed_body = parseBody(req.parsed_body as RequestBiometryPersonBinaryBody, req.user)

  const body = validateBody(parsed_body)

  const company_name = req.user.user_type === UserGroupEnum.ADMIN
    ? parsed_body.company_name as string
    : req.user.company_name

  const company = await getCompanyAdapter(company_name, dynamodbClient)

  if (company.request_person_config['biometry-basic'] === false) {
    logger.debug({
      message: 'Company not allowed to request basic biometry',
      user: req.user.user_id,
      company,
    })

    throw new ForbiddenError('Empresa não autorizada em requisitar biometria básico')
  }

  if (body.is_existing_person) {
    const request_person = await getRequestPersonAdapter({
      ...body.person,
      company_name_from_admin: company_name,
      dynamodbClient,
      user_info: req.user,
    })

    await updateRequestPersonAdapter({
      request_person,
      dynamodbClient,
    })

    await publishSnsTopicPersonAdapter({
      request_person,
      snsClient,
    })

    logger.info({
      message: 'Successfully requested to analyze person biometry basic',
      person_request_id: request_person.request_id,
      person_id: request_person.person_id,
    })

    return {
      body: {
        message: 'Successfully requested to analyze person biometry basic',
        person_request_id: request_person.request_id,
        person_id: request_person.person_id,
      },
    }
  }

  const use_case_request_person_analysis: UseCaseRequestPersonAnalysis = {
    analysis_type: AnalysisTypeEnum.PERSON,
    company_request_person_config: company.request_person_config,
    dynamodbClient,
    person_analysis_options_to_request: [CompanyRequestPersonConfigEnum.BIOMETRY_BASIC],
    person_analysis_type: body.person_analysis_type,
    person_data: body.person,
    snsClient,
    user_info: req.user,
  }

  const person_analysis = await useCaseRequestPersonAnalysis(use_case_request_person_analysis)

  logger.info({
    message: 'Successfully requested to analyze person biometry basic',
    person_request_id: person_analysis.person_request_id,
    person_id: person_analysis.person_id,
  })

  return {
    body: {
      message: 'Successfully requested to analyze person biometry basic',
      person_request_id: person_analysis.person_request_id,
      person_id: person_analysis.person_id,
    },
  }
}

export default requestPersonBiometryBasic
