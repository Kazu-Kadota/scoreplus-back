import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { v4 as uuid } from 'uuid'

import queryAnalysisplusPeopleByDocument, { QueryAnalysisplusPeopleByDocumentQuery } from '~/services/aws/dynamo/analysis/person/query-by-document'
import queryRequestplusAnalysisPersonByDocument, { QueryRequestplusAnalysisPersonByDocumentQuery } from '~/services/aws/dynamo/request/analysis/person/query-by-document'

const getPersonId = async (
  person_document: string,
  dynamodbClient: DynamoDBClient,
): Promise<string> => {
  const query_people: QueryAnalysisplusPeopleByDocumentQuery = {
    document: person_document,
  }
  const person_analysis_people = await queryAnalysisplusPeopleByDocument(query_people, dynamodbClient)

  if (person_analysis_people && person_analysis_people[0]) {
    return person_analysis_people[0].person_id
  }

  const query_person: QueryRequestplusAnalysisPersonByDocumentQuery = {
    document: person_document,
  }

  const requested_person = await queryRequestplusAnalysisPersonByDocument(
    query_person,
    dynamodbClient,
  )

  if (requested_person && requested_person[0]) {
    return requested_person[0].person_id
  }

  return uuid()
}

export default getPersonId
