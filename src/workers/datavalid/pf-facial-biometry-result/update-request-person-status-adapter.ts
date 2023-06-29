import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { CompanySystemConfigEnum } from 'src/models/dynamo/company'
import { RequestStatusEnum } from 'src/models/dynamo/request-enum'
import { PersonAnalysisStatusGeneralEnum, PersonRequestBody, PersonRequestKey } from 'src/models/dynamo/request-person'
import getRequestPerson from 'src/services/aws/dynamo/request/analysis/person/get'
import updateRequestPerson from 'src/services/aws/dynamo/request/analysis/person/update'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const updateRequestPersonStatusAdapter = async (
  person_id: string,
  request_id: string,
  dynamodbClient: DynamoDBClient,
): Promise<void> => {
  const update_key: PersonRequestKey = {
    person_id,
    request_id,
  }

  const analysis = await getRequestPerson(update_key, dynamodbClient)

  if (!analysis) {
    logger.warn({
      message: 'Error on get requested analysis',
      person_id,
      request_id,
    })

    throw new ErrorHandler('Erro em pegar análise solicitada', 500)
  }

  let update_general: boolean = true

  for (const [key, value] of Object.entries(analysis.status)) {
    const company_system_config_value = value as RequestStatusEnum

    if (key !== CompanySystemConfigEnum.BIOMETRY
      && key !== PersonAnalysisStatusGeneralEnum.GENERAL
      && company_system_config_value !== RequestStatusEnum.FINISHED) {
      update_general = false
      break
    }
  }

  const update_body: Partial<PersonRequestBody> = {
    status: {
      ...analysis.status,
      biometry: RequestStatusEnum.FINISHED,
    },
  }

  if (update_general) {
    update_body.status!.general = RequestStatusEnum.WAITING
  }

  await updateRequestPerson(update_key, update_body, dynamodbClient)
}

export default updateRequestPersonStatusAdapter
