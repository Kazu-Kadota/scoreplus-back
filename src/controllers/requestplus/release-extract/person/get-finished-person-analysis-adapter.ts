import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { AnalysisResultEnum } from 'src/models/dynamo/answer'
import { PersonReleaseExtractKey, PersonRequest } from 'src/models/dynamo/request-person'
import queryRequestFinishedPersonByReleaseExtractId from 'src/services/aws/dynamo/request/finished/person/query-by-release-extract-id'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const getFinishedPersonAnalysisAdapter = async (
  params: PersonReleaseExtractKey,
  dynamodbClient: DynamoDBClient,
): Promise<PersonRequest> => {
  const finished_person = await queryRequestFinishedPersonByReleaseExtractId(params, dynamodbClient)

  if (!finished_person || !finished_person[0]) {
    logger.warn({
      message: 'Person not exist',
      person_id: params.release_extract_id,
    })

    throw new ErrorHandler('Pessoa não existe.', 404)
  }

  finished_person.sort(
    (row1, row2) => {
      const finished_at_row1 = row1.finished_at as string
      const finished_at_row2 = row2.finished_at as string
      return finished_at_row1 > finished_at_row2
        ? -1
        : finished_at_row1 < finished_at_row2
          ? 1
          : 0
    },
  )

  const rejected_person = finished_person.find((person) => person.analysis_result === AnalysisResultEnum.REJECTED)

  if (!rejected_person) {
    return finished_person[0]
  }

  return rejected_person
}

export default getFinishedPersonAnalysisAdapter
