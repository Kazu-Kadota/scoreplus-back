import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { AnalysisplusPeopleKey } from '~/models/dynamo/analysisplus/people/table'
import { RequestplusAnalysisPersonBody, RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import { RequestplusFinishedAnalysisPersonBody, RequestplusFinishedAnalysisPersonKey, SendAnswerPersonBody } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import { Timestamp } from '~/models/dynamo/timestamp'
import getAnalysisplusPeople from '~/services/aws/dynamo/analysis/person/get'
import putAnalysisplusPeople from '~/services/aws/dynamo/analysis/person/put'
import updateAnalysisplusPeople from '~/services/aws/dynamo/analysis/person/update'
import deleteRequestplusAnalysisPerson from '~/services/aws/dynamo/request/analysis/person/delete'
import updateRequestPerson from '~/services/aws/dynamo/request/analysis/person/update'
import putRequestplusFinishedAnalysisPerson from '~/services/aws/dynamo/request/finished/person/put'
import removeEmpty from '~/utils/remove-empty'

import getRequestPersonAdapter from './get-request-person-adapter'
import personConstructor from './person-constructor'
import updatePersonConstructor from './update-person-constructor'
import verifyRequestStatus, { VerifyPersonRequestStatusParams } from './verify-request-status'

export type UseCaseSendPersonAnswersBody = Omit<SendAnswerPersonBody, 'answered_at'>

export type UseCaseSendPersonAnswerParams = {
  answers_body: UseCaseSendPersonAnswersBody[]
  request_id: string
  person_id: string
  dynamodbClient: DynamoDBClient
}

const useCaseSendPersonAnswer = async ({
  dynamodbClient,
  person_id,
  request_id,
  answers_body,
}: UseCaseSendPersonAnswerParams): Promise<void> => {
  const request_person_key: RequestplusAnalysisPersonKey = {
    person_id,
    request_id,
  }

  const request_person = await getRequestPersonAdapter(request_person_key, dynamodbClient)

  const verify_request_status_params: VerifyPersonRequestStatusParams = {
    answers_body,
    person_id: request_person.person_id,
    request_id: request_person.request_id,
    request_person_status: request_person.status,
    person_analysis_options: request_person.person_analysis_options,
  }

  const {
    is_finished,
    status,
    person_analysis_options,
    is_all_approved,
  } = verifyRequestStatus(verify_request_status_params)

  const now = new Date().toISOString()

  if (is_finished) {
    const person_key: AnalysisplusPeopleKey = {
      person_id: request_person.person_id,
      document: request_person.document,
    }

    const person = await getAnalysisplusPeople(person_key, dynamodbClient)

    const person_request_key: RequestplusAnalysisPersonKey = {
      request_id: request_person.request_id,
      person_id: request_person.person_id,
    }

    if (person) {
      const person_constructor = updatePersonConstructor({
        now,
        person_analysis_options,
        request_person,
        person,
      })

      const {
        person_id: person_id_constructor,
        document,
        ...person_body
      } = person_constructor

      const finished_request_key: RequestplusFinishedAnalysisPersonKey = {
        person_id,
        request_id,
      }

      const finished_request_body: RequestplusFinishedAnalysisPersonBody & Timestamp = removeEmpty({
        ...request_person,
        person_analysis_options,
        status,
        result: is_all_approved,
      })

      await putRequestplusFinishedAnalysisPerson(
        finished_request_key,
        finished_request_body,
        dynamodbClient,
      )

      await updateAnalysisplusPeople(person_key, person_body, dynamodbClient)

      await deleteRequestplusAnalysisPerson(person_request_key, dynamodbClient)

      return
    }
    const person_constructor = personConstructor({
      now,
      person_analysis_options,
      request_person,
    })

    const {
      person_id: person_id_constructor,
      document,
      ...person_body
    } = person_constructor

    const finished_request_key: RequestplusFinishedAnalysisPersonKey = {
      person_id,
      request_id,
    }

    const finished_request_body: RequestplusFinishedAnalysisPersonBody & Timestamp = removeEmpty({
      ...request_person,
      person_analysis_options,
      status,
      result: is_all_approved,
    })

    await putRequestplusFinishedAnalysisPerson(
      finished_request_key,
      finished_request_body,
      dynamodbClient,
    )

    await putAnalysisplusPeople(person_key, person_body, dynamodbClient)

    await deleteRequestplusAnalysisPerson(person_request_key, dynamodbClient)

    return
  }

  const update_body: Partial<RequestplusAnalysisPersonBody> = {
    status,
    person_analysis_options,
  }

  await updateRequestPerson(request_person_key, update_body, dynamodbClient)
}

export default useCaseSendPersonAnswer
