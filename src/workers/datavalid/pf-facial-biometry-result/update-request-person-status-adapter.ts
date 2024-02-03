import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { GeneralAnalysisStatusEnum, RequestStatusEnum } from '~/models/dynamo/enums/request'
import { PersonAnalysisStatus } from '~/models/dynamo/requestplus/analysis-person/status'
import { RequestplusAnalysisPersonBody, RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import getRequestplusAnalysisPerson from '~/services/aws/dynamo/request/analysis/person/get'
import updateRequestPerson from '~/services/aws/dynamo/request/analysis/person/update'
import ErrorHandler from '~/utils/error-handler'
import logger from '~/utils/logger'

const updateRequestPersonStatusAdapter = async (
  person_id: string,
  request_id: string,
  approved: boolean,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  const person_request_key: RequestplusAnalysisPersonKey = {
    person_id,
    request_id,
  }

  const analysis = await getRequestplusAnalysisPerson(person_request_key, dynamodbClient)

  if (!analysis) {
    logger.warn({
      message: 'Error on get requested analysis',
      person_id,
      request_id,
    })

    throw new ErrorHandler('Erro em pegar análise solicitada', 500)
  }

  if (analysis.status.biometry === RequestStatusEnum.CANCELED) {
    logger.info({
      message: 'Facial biometry analysis cancelled by another work',
      status: analysis.status,
    })

    throw new ErrorHandler('Facial biometry analysis cancelled by another work', 202)
  }

  let update_general: boolean = true

  const update_body: Partial<RequestplusAnalysisPersonBody> = {
    status: {
      ...analysis.status,
      biometry: RequestStatusEnum.FINISHED,
    },
  }

  if (!approved) {
    for (const status of Object.entries(analysis.status)) {
      const key = status[0] as keyof PersonAnalysisStatus<false>

      if (key !== CompanyRequestPersonConfigEnum.BIOMETRY
        && key !== GeneralAnalysisStatusEnum.GENERAL) {
          // @ts-ignore
          update_body.status![key] = RequestStatusEnum.CANCELED
      }
    }

    update_body.status!.general = RequestStatusEnum.WAITING
  } else {
    for (const [key, value] of Object.entries(analysis.status)) {
      const company_system_config_value = value as RequestStatusEnum

      if (key !== CompanyRequestPersonConfigEnum.BIOMETRY
        && key !== GeneralAnalysisStatusEnum.GENERAL
        && company_system_config_value !== RequestStatusEnum.FINISHED) {
        update_general = false
        break
      }
    }

    if (update_general || !approved) {
      update_body.status!.general = RequestStatusEnum.WAITING
    }
  }

  await updateRequestPerson(person_request_key, update_body, dynamodbClient)
}

export default updateRequestPersonStatusAdapter
