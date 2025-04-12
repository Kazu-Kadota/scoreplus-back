import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { RequestplusAnalysisPersonBody, RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import { SendAnswerPersonBody } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import { RequestplusValidateAnalysisPersonBody, RequestplusValidateAnalysisPersonKey } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import { Timestamp } from '~/models/dynamo/timestamp'
import deleteRequestplusAnalysisPerson from '~/services/aws/dynamo/request/analysis/person/delete'
import updateRequestPerson from '~/services/aws/dynamo/request/analysis/person/update'
import putRequestplusValidateAnalysisPerson from '~/services/aws/dynamo/request/validate/person/put'
import removeEmpty from '~/utils/remove-empty'

import getRequestPersonAdapter from './get-request-person-adapter'
import informationValidationConstructor from './validate-inforation-constructor'
import verifyRequestStatus, { VerifyPersonRequestStatusParams } from './verify-request-status'

export type UseCaseSendPersonAnswersBody = Omit<SendAnswerPersonBody, 'answered_at'> & {
  reason?: string
}

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
  } = verifyRequestStatus(verify_request_status_params)

  if (is_finished) {
    const person_request_key: RequestplusAnalysisPersonKey = {
      request_id: request_person.request_id,
      person_id: request_person.person_id,
    }

    const information_validation = informationValidationConstructor({
      person_analysis_options,
    })

    const validate_request_key: RequestplusValidateAnalysisPersonKey = {
      person_id,
      request_id,
    }

    const now = new Date().toISOString()

    const validate_request_body: RequestplusValidateAnalysisPersonBody & Timestamp = removeEmpty({
      ...request_person,
      person_analysis_options,
      status,
      information_validation,
      requested_at: request_person.created_at,
      answered_at: now,
    })

    await putRequestplusValidateAnalysisPerson(
      validate_request_key,
      validate_request_body,
      dynamodbClient,
    )

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
