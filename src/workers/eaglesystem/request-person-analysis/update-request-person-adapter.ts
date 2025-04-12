import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusAnalysisPerson, RequestplusAnalysisPersonBody, RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import { EagleSystemRequestAnalysisPersonResponse } from '~/models/eagle/request/analysis-person'
import updateRequestPerson from '~/services/aws/dynamo/request/analysis/person/update'

import thirdPartyConstructor from './third-party-constructor'

export type BiometryFacialUpdateRequestPersonParams = {
  eagle_request_person_analysis: EagleSystemRequestAnalysisPersonResponse
  request_person: RequestplusAnalysisPerson
  dynamodbClient: DynamoDBClient
}

const updateRequestPersonAdapter = async ({
  eagle_request_person_analysis,
  request_person,
  dynamodbClient,
}: BiometryFacialUpdateRequestPersonParams): Promise<void> => {
  const third_party = thirdPartyConstructor({
    eagle_request_person_analysis,
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
