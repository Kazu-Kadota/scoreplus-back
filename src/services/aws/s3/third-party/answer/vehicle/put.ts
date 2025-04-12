import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import getStringEnv from 'src/utils/get-string-env'
import logger from 'src/utils/logger'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisTypeEnum, VehicleAnalysisStateEnum, VehicleThirdPartyEnum } from '~/models/dynamo/enums/request'

export const s3ThirdPartyPutParamsResponseType = {
  answer: 'answer',
  validate: 'validate',
} as const

export type S3ThirdPartyAnswerVehicleGetParamsResponseType = keyof typeof s3ThirdPartyPutParamsResponseType

export type S3ThirdPartyPut = {
  analysis_type: AnalysisTypeEnum
  body: string
  company_request_vehicle: CompanyRequestVehicleConfigEnum
  vehicle_id: string
  region?: VehicleAnalysisStateEnum
  request_id: string
  response_type: S3ThirdPartyAnswerVehicleGetParamsResponseType
  s3_client: S3Client
  third_party: VehicleThirdPartyEnum
}

const S3_THIRD_PARTY_ANSWER = getStringEnv('S3_THIRD_PARTY_ANSWER')

const s3ThirdPartyAnswerVehiclePut = async ({
  analysis_type,
  body,
  company_request_vehicle,
  vehicle_id,
  region,
  request_id,
  response_type,
  s3_client,
  third_party,
}: S3ThirdPartyPut) => {
  logger.debug({
    message: 'S3: PutObject',
    bucket: S3_THIRD_PARTY_ANSWER,
    file_name: company_request_vehicle,
    vehicle_id,
    region,
    request_id,
    response_type,
    third_party,
  })

  let key = `${analysis_type}/${vehicle_id}/${request_id}/${response_type}/${third_party}/${company_request_vehicle}`

  if (region) {
    key = key.concat('_', region, '.json')
  } else {
    key = key.concat('.json')
  }

  const put_command = new PutObjectCommand({
    Bucket: S3_THIRD_PARTY_ANSWER,
    Key: key,
    Body: body,
  })

  await s3_client.send(put_command)

  return key
}

export default s3ThirdPartyAnswerVehiclePut
