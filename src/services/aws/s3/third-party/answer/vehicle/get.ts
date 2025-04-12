import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import getStringEnv from 'src/utils/get-string-env'
import logger from 'src/utils/logger'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisTypeEnum, VehicleAnalysisStateEnum, VehicleThirdPartyEnum } from '~/models/dynamo/enums/request'

export const s3ThirdPartyGetParamsResponseType = {
  answer: 'answer',
  validate: 'validate',
} as const

export type S3ThirdPartyAnswerVehicleGetParamsResponseType = keyof typeof s3ThirdPartyGetParamsResponseType

export type S3ThirdPartyAnswerVehicleGetParams = {
  analysis_type: AnalysisTypeEnum
  company_request_vehicle: CompanyRequestVehicleConfigEnum
  vehicle_id: string
  region?: VehicleAnalysisStateEnum
  request_id: string
  response_type: S3ThirdPartyAnswerVehicleGetParamsResponseType
  s3_client: S3Client
  third_party: VehicleThirdPartyEnum
}

export type S3ThirdPartyGetOutput = any | undefined

const S3_THIRD_PARTY_ANSWER = getStringEnv('S3_THIRD_PARTY_ANSWER')

const s3ThirdPartyAnswerVehicleGet = async ({
  analysis_type,
  company_request_vehicle,
  vehicle_id,
  region,
  request_id,
  response_type,
  s3_client,
  third_party,
}: S3ThirdPartyAnswerVehicleGetParams): Promise<S3ThirdPartyGetOutput> => {
  // logger.debug({
  //   message: 'S3: GetObject',
  //   bucket: S3_THIRD_PARTY_ANSWER,
  //   company_request_vehicle,
  //   vehicle_id,
  //   region,
  //   request_id,
  //   third_party,
  // })

  let key = `${analysis_type}/${vehicle_id}/${request_id}/${response_type}/${third_party}/${company_request_vehicle}`

  if (region) {
    key = key.concat('_', region, '.json')
  } else {
    key = key.concat('.json')
  }

  const get_command = new GetObjectCommand({
    Bucket: S3_THIRD_PARTY_ANSWER,
    Key: key,
  })

  const result = await s3_client.send(get_command)

  const body = await result.Body?.transformToString()

  if (!body) {
    logger.debug({
      message: 'There is no data in this bucket and key',
      bucket: S3_THIRD_PARTY_ANSWER,
      key,
    })

    return undefined
  }

  return body
}

export default s3ThirdPartyAnswerVehicleGet
