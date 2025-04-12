import { S3Client } from '@aws-sdk/client-s3'

import { thirdPartyCompanyRequestVehicleConfigMap } from '~/constants/third-party-map'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisTypeEnum, VehicleAnalysisStateEnum, VehicleThirdPartyEnum } from '~/models/dynamo/enums/request'
import s3ThirdPartyAnswerVehicleGet, { S3ThirdPartyAnswerVehicleGetParamsResponseType } from '~/services/aws/s3/third-party/answer/vehicle/get'

export type GetS3AnalysisInfoAdapterParams = {
  company_request_vehicle: CompanyRequestVehicleConfigEnum
  vehicle_id: string
  region?: VehicleAnalysisStateEnum
  request_id: string
  response_type: S3ThirdPartyAnswerVehicleGetParamsResponseType
  s3_client: S3Client
}

const getS3AnalysisInfoAdapter = async ({
  company_request_vehicle,
  vehicle_id,
  region,
  request_id,
  response_type,
  s3_client,
}: GetS3AnalysisInfoAdapterParams): Promise<string> => {
  const third_party: VehicleThirdPartyEnum = thirdPartyCompanyRequestVehicleConfigMap[company_request_vehicle].split('_vehicle')[0] as VehicleThirdPartyEnum

  const s3_body = await s3ThirdPartyAnswerVehicleGet({
    analysis_type: AnalysisTypeEnum.VEHICLE,
    company_request_vehicle,
    vehicle_id,
    region,
    request_id,
    response_type,
    s3_client,
    third_party,
  })

  return s3_body
}

export default getS3AnalysisInfoAdapter
