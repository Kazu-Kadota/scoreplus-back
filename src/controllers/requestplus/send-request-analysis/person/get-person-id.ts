import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import queryPersonByDocument from 'src/services/aws/dynamo/analysis/person/query-by-document'
import queryRequestPersonByDocument, { QueryRequestPersonByDocumentQuery } from 'src/services/aws/dynamo/request/analysis/person/query-by-document'
import { v4 as uuid } from 'uuid'

const getPersonId = async (
  person_document: string,
  dynamodbClient: DynamoDBClient,
): Promise<string> => {
  const person_analysis_people = await queryPersonByDocument(person_document, dynamodbClient)

  const query: QueryRequestPersonByDocumentQuery = {
    document: person_document,
  }

  const requested_person = await queryRequestPersonByDocument(
    query,
    dynamodbClient,
  )

  let person_id: string

  if (person_analysis_people && person_analysis_people[0]) {
    person_id = person_analysis_people[0].person_id
  } else if (requested_person && requested_person[0]) {
    person_id = requested_person[0].person_id
  } else {
    person_id = uuid()
  }

  return person_id
}

export default getPersonId
