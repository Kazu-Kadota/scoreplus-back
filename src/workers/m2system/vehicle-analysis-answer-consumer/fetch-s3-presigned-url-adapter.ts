import { S3Client } from '@aws-sdk/client-s3'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisTypeEnum, VehicleThirdPartyEnum, VehicleAnalysisStateEnum } from '~/models/dynamo/enums/request'
import s3ThirdPartyAnswerVehiclePut, { s3ThirdPartyPutParamsResponseType } from '~/services/aws/s3/third-party/answer/vehicle/put'
import m2SystemFetchS3PresignedURL from '~/services/m2/s3-presigned-url/fetch'

export type FetchS3PresignedURL = {
  company_request_vehicle: CompanyRequestVehicleConfigEnum
  vehicle_id: string
  region?: VehicleAnalysisStateEnum
  request_id: string
  s3_client: S3Client
  s3_presigned_url: string
}

const fetchS3PresignedURLAdapter = async ({
  company_request_vehicle,
  vehicle_id,
  region,
  request_id,
  s3_client,
  s3_presigned_url,
}: FetchS3PresignedURL): Promise<string> => {
  const content = await m2SystemFetchS3PresignedURL({
    s3_presigned_url,
  })

  const s3_answer_key = await s3ThirdPartyAnswerVehiclePut({
    analysis_type: AnalysisTypeEnum.VEHICLE,
    body: JSON.stringify(content),
    company_request_vehicle,
    vehicle_id,
    region,
    request_id,
    response_type: s3ThirdPartyPutParamsResponseType.answer,
    s3_client,
    third_party: VehicleThirdPartyEnum.M2SYSTEM,
  })

  return s3_answer_key
}

export default fetchS3PresignedURLAdapter
