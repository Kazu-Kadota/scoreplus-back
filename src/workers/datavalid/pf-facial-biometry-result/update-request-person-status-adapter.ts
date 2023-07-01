import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { CompanySystemConfigEnum } from 'src/models/dynamo/company'
import { RequestStatusEnum } from 'src/models/dynamo/request-enum'
import { PersonAnalysisStatus, PersonAnalysisStatusGeneralEnum, PersonRequestBody, PersonRequestKey } from 'src/models/dynamo/request-person'
import getRequestPerson from 'src/services/aws/dynamo/request/analysis/person/get'
import updateRequestPerson from 'src/services/aws/dynamo/request/analysis/person/update'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const updateRequestPersonStatusAdapter = async (
  person_id: string,
  request_id: string,
  approved: boolean,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  const person_request_key: PersonRequestKey = {
    person_id,
    request_id,
  }

  const analysis = await getRequestPerson(person_request_key, dynamodbClient)

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

  const update_body: Partial<PersonRequestBody> = {
    status: {
      ...analysis.status,
      biometry: RequestStatusEnum.FINISHED,
    },
  }

  if (!approved) {
    for (const status of Object.entries(analysis.status)) {
      const key = status[0] as keyof PersonAnalysisStatus

      if (key !== CompanySystemConfigEnum.BIOMETRY
        && key !== PersonAnalysisStatusGeneralEnum.GENERAL) {
          update_body.status![key] = RequestStatusEnum.CANCELED
      }
    }

    update_body.status!.general = RequestStatusEnum.WAITING
  } else {
    for (const [key, value] of Object.entries(analysis.status)) {
      const company_system_config_value = value as RequestStatusEnum

      if (key !== CompanySystemConfigEnum.BIOMETRY
        && key !== PersonAnalysisStatusGeneralEnum.GENERAL
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
