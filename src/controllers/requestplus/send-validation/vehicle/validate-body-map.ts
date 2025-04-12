import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'
import { gzipSync } from 'zlib'

import { thirdPartyCompanyRequestVehicleConfigMap } from '~/constants/third-party-map'
import { AnalysisTypeEnum, VehicleThirdPartyEnum } from '~/models/dynamo/enums/request'
import { s3ThirdPartyPutParamsResponseType } from '~/services/aws/s3/third-party/answer/person/put'
import s3ThirdPartyAnswerVehiclePut from '~/services/aws/s3/third-party/answer/vehicle/put'
import { UseCaseValidateVehicleAnalysisBody } from '~/use-cases/validate-vehicle-analysis'

import sendAnswerAnalysisMessage from './send-answer-analysis-message'

export type AnswerBodyMapParams = UseCaseValidateVehicleAnalysisBody & {
  vehicle_id: string
  request_id: string
  s3Client: S3Client
  sqsClient: SQSClient
  validation_user_id: string
}

const validateBodyMap = async ({
  vehicle_id,
  reason,
  region,
  request_id,
  result,
  s3Client,
  sqsClient,
  type,
  validation_user_id,
}: AnswerBodyMapParams): Promise<UseCaseValidateVehicleAnalysisBody> => {
  const reason_compressed = gzipSync(reason ?? '')

  const s3_answer_key = await s3ThirdPartyAnswerVehiclePut({
    analysis_type: AnalysisTypeEnum.VEHICLE,
    body: reason_compressed.toString('base64'),
    company_request_vehicle: type,
    vehicle_id,
    region,
    request_id,
    response_type: s3ThirdPartyPutParamsResponseType.validate,
    s3_client: s3Client,
    third_party: thirdPartyCompanyRequestVehicleConfigMap[type].split('_vehicle')[0] as VehicleThirdPartyEnum,
  })

  const answer_body: UseCaseValidateVehicleAnalysisBody[] = [{
    reason: s3_answer_key,
    region,
    result,
    type,
  }]

  await sendAnswerAnalysisMessage({
    vehicle_id,
    request_id,
    sqsClient,
    validation_user_id,
    validations_body: answer_body,
  })

  return {
    reason: s3_answer_key,
    region,
    result,
    type,
  }
}

export default validateBodyMap
