import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestStatusEnum } from '~/models/dynamo/enums/request'
import { RequestplusAnalysisPerson, RequestplusAnalysisPersonBody, RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import updateRequestPerson from '~/services/aws/dynamo/request/analysis/person/update'

export type BiometryBasicUpdateRequestPersonParams = {
  request_person: RequestplusAnalysisPerson
  dynamodbClient: DynamoDBClient
}

const updateRequestPersonAdapter = async ({
  request_person,
  dynamodbClient,
}: BiometryBasicUpdateRequestPersonParams): Promise<void> => {
  const update_request_person: RequestplusAnalysisPerson = {
    ...request_person,
  }

  update_request_person.status['biometry-basic'] = RequestStatusEnum.WAITING
  update_request_person.person_analysis_options['biometry-basic'] = {}

  const { person_id, request_id, ...rest } = update_request_person

  const key: RequestplusAnalysisPersonKey = {
    person_id,
    request_id,
  }

  const body: RequestplusAnalysisPersonBody = rest

  await updateRequestPerson(key, body, dynamodbClient)
}

export default updateRequestPersonAdapter
