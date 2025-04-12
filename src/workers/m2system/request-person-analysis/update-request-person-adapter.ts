import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusAnalysisPerson, RequestplusAnalysisPersonBody, RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import { M2PersonRequestAnalysisResponse } from '~/models/m2system/request/analysis-person'
import updateRequestPerson from '~/services/aws/dynamo/request/analysis/person/update'

import thirdPartyConstructor from './third-party-constructor'

export type UpdateRequestPersonAdapterParams = {
  m2_request_person_analysis: M2PersonRequestAnalysisResponse
  request_person: RequestplusAnalysisPerson
  dynamodbClient: DynamoDBClient
}

const updateRequestPersonAdapter = async ({
  m2_request_person_analysis,
  request_person,
  dynamodbClient,
}: UpdateRequestPersonAdapterParams): Promise<void> => {
  const third_party = thirdPartyConstructor({
    m2_request_person_analysis,
    request_person,
  })

  request_person.third_party = third_party

  const { person_id, request_id, ...rest } = request_person

  const key: RequestplusAnalysisPersonKey = {
    person_id,
    request_id,
  }

  const body: RequestplusAnalysisPersonBody = rest

  await updateRequestPerson(key, body, dynamodbClient)
}

export default updateRequestPersonAdapter
