import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'
import { gzipSync } from 'zlib'

import { thirdPartyCompanyRequestVehicleConfigMap } from '~/constants/third-party-map'
import { AnalysisTypeEnum, VehicleThirdPartyEnum } from '~/models/dynamo/enums/request'
import { s3ThirdPartyPutParamsResponseType } from '~/services/aws/s3/third-party/answer/person/put'
import s3ThirdPartyAnswerVehiclePut from '~/services/aws/s3/third-party/answer/vehicle/put'
import { UseCaseSendVehicleAnswersBody } from '~/use-cases/answer-vehicle-analysis'

import sendAnswerAnalysisMessage from './send-answer-analysis-message'

export type AnswerBodyMapParams = UseCaseSendVehicleAnswersBody & {
  vehicle_id: string
  request_id: string
  s3Client: S3Client
  sqsClient: SQSClient
}

const answerBodyMap = async ({
  type,
  reason,
  region,
  vehicle_id,
  request_id,
  s3Client,
  sqsClient,
}: AnswerBodyMapParams): Promise<UseCaseSendVehicleAnswersBody> => {
  const reason_compressed = gzipSync(reason ?? '')

  const s3_answer_key = await s3ThirdPartyAnswerVehiclePut({
    analysis_type: AnalysisTypeEnum.VEHICLE,
    body: reason_compressed.toString('base64'),
    company_request_vehicle: type,
    vehicle_id,
    region,
    request_id,
    response_type: s3ThirdPartyPutParamsResponseType.answer,
    s3_client: s3Client,
    third_party: thirdPartyCompanyRequestVehicleConfigMap[type].split('_vehicle')[0] as VehicleThirdPartyEnum,
  })

  const answer_body: UseCaseSendVehicleAnswersBody[] = [{
    type,
    reason: s3_answer_key,
    region,
  }]

  await sendAnswerAnalysisMessage({
    answers_body: answer_body,
    vehicle_id,
    request_id,
    sqsClient,
  })

  return {
    type,
    reason: s3_answer_key,
    region,
  }
}

export default answerBodyMap
