import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { AnalysisplusPeopleKey } from '~/models/dynamo/analysisplus/people/table'
import { RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import { RequestplusFinishedAnalysisPersonBody, RequestplusFinishedAnalysisPersonKey } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import { RequestplusValidateAnalysisPersonBody, SendAnswerPersonValidationBody } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import { Timestamp } from '~/models/dynamo/timestamp'
import getAnalysisplusPeople from '~/services/aws/dynamo/analysis/person/get'
import putAnalysisplusPeople from '~/services/aws/dynamo/analysis/person/put'
import updateAnalysisplusPeople from '~/services/aws/dynamo/analysis/person/update'
import putRequestplusFinishedAnalysisPerson from '~/services/aws/dynamo/request/finished/person/put'
import deleteRequestplusValidateAnalysisPerson from '~/services/aws/dynamo/request/validate/person/delete'
import updateRequestplusValidateAnalysisPerson from '~/services/aws/dynamo/request/validate/person/update'
import removeEmpty from '~/utils/remove-empty'

import getRequestValidatePersonAdapter from './get-request-validate-person-adapter'
import personConstructor from './person-constructor'
import updatePersonConstructor from './update-person-constructor'
import verifyRequestStatus, { VerifyPersonRequestStatusParams } from './verify-request-status'

export type UseCaseValidatePersonAnalysisBody = Omit<SendAnswerPersonValidationBody, 'validated_at'>

export type UseCaseValidatePersonAnalysisParams = {
  dynamodbClient: DynamoDBClient
  person_id: string
  request_id: string
  validations_body: UseCaseValidatePersonAnalysisBody[]
  validation_user_id: string
}

const useCaseValidatePersonAnalysis = async ({
  dynamodbClient,
  person_id,
  request_id,
  validations_body,
  validation_user_id,
}: UseCaseValidatePersonAnalysisParams): Promise<void> => {
  const validate_request_person_key: RequestplusAnalysisPersonKey = {
    person_id,
    request_id,
  }

  const validate_request_person = await getRequestValidatePersonAdapter(validate_request_person_key, dynamodbClient)

  const verify_request_status_params: VerifyPersonRequestStatusParams = {
    answers_body: validations_body,
    person_id: validate_request_person.person_id,
    request_id: validate_request_person.request_id,
    request_person_status: validate_request_person.status,
    information_validation: validate_request_person.information_validation,
  }

  const {
    is_finished,
    status,
    information_validation,
    is_all_approved,
  } = verifyRequestStatus(verify_request_status_params)

  const now = new Date().toISOString()

  if (is_finished) {
    const person_key: AnalysisplusPeopleKey = {
      person_id: validate_request_person.person_id,
      document: validate_request_person.document,
    }

    const person = await getAnalysisplusPeople(person_key, dynamodbClient)

    const person_request_key: RequestplusAnalysisPersonKey = {
      request_id: validate_request_person.request_id,
      person_id: validate_request_person.person_id,
    }

    if (person) {
      const person_constructor = updatePersonConstructor({
        now,
        information_validation,
        validate_request_person,
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
        ...validate_request_person,
        information_validation,
        status,
        result: is_all_approved,
        last_validation_at: now,
        validation_user_id,
      })

      await putRequestplusFinishedAnalysisPerson(
        finished_request_key,
        finished_request_body,
        dynamodbClient,
      )

      await updateAnalysisplusPeople(person_key, person_body, dynamodbClient)

      await deleteRequestplusValidateAnalysisPerson(person_request_key, dynamodbClient)

      return
    }

    const person_constructor = personConstructor({
      now,
      information_validation,
      validate_request_person,
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
      ...validate_request_person,
      information_validation,
      status,
      result: is_all_approved,
      validation_user_id,
    })

    await putRequestplusFinishedAnalysisPerson(
      finished_request_key,
      finished_request_body,
      dynamodbClient,
    )

    await putAnalysisplusPeople(person_key, person_body, dynamodbClient)

    await deleteRequestplusValidateAnalysisPerson(person_request_key, dynamodbClient)

    return
  }

  const update_body: Partial<RequestplusValidateAnalysisPersonBody> = {
    status,
    information_validation,
  }

  await updateRequestplusValidateAnalysisPerson(validate_request_person_key, update_body, dynamodbClient)
}

export default useCaseValidatePersonAnalysis
