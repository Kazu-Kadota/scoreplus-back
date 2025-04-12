import { S3Client } from '@aws-sdk/client-s3'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { VehicleAnalysisOptionsRequest, VehicleAnalysisOptionsRequestValueDefault, VehicleAnalysisOptionsRequestValueHistory, VehicleAnalysisOptionsRequestValueHistoryRegion } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import { S3ThirdPartyAnswerVehicleGetParamsResponseType } from '~/services/aws/s3/third-party/answer/vehicle/get'

import getS3AnalysisInfoAdapter, { GetS3AnalysisInfoAdapterParams } from './get-s3-analysis-info-adapter'

export type VehicleAnalysisOptionMapParams = {
  key: string
  value: any
  vehicle_id: string
  request_id: string
  response_type: S3ThirdPartyAnswerVehicleGetParamsResponseType
  s3Client: S3Client
}

type VehicleAnalysisOptionValuesHistoryRegion = VehicleAnalysisOptionsRequestValueHistoryRegion<true>
  | VehicleAnalysisOptionsRequestValueHistoryRegion<false>

type VehicleAnalysisOptionValuesHistory = VehicleAnalysisOptionsRequestValueHistory<true>
  | VehicleAnalysisOptionsRequestValueHistory<false>

type VehicleAnalysisOptionValuesDefault = VehicleAnalysisOptionsRequestValueDefault<true>
| VehicleAnalysisOptionsRequestValueDefault<false>

const vehicleAnalysisOptionMap = async ({
  key,
  value,
  vehicle_id,
  request_id,
  response_type,
  s3Client,
}: VehicleAnalysisOptionMapParams): Promise<Partial<VehicleAnalysisOptionsRequest<true>> | Partial<VehicleAnalysisOptionsRequest<false>>> => {
  const company_request_vehicle = key as CompanyRequestVehicleConfigEnum

  if (company_request_vehicle === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
    const regions: VehicleAnalysisOptionValuesHistoryRegion[] = [] as VehicleAnalysisOptionValuesHistoryRegion[]

    for (const region of (value as VehicleAnalysisOptionValuesHistory).regions) {
      if (!region.reason) {
        regions.push(region)

        continue
      }

      const get_s3_analysis_info_params: GetS3AnalysisInfoAdapterParams = {
        company_request_vehicle,
        vehicle_id,
        region: region.region,
        request_id,
        response_type,
        s3_client: s3Client,
      }

      const analysis_info = await getS3AnalysisInfoAdapter(get_s3_analysis_info_params)

      regions.push({
        ...region,
        reason: analysis_info,
      })
    }

    return {
      [company_request_vehicle]: {
        regions,
      },
    }
  }
  const content = value as VehicleAnalysisOptionValuesDefault

  if (!content.reason) {
    return {
      [company_request_vehicle]: {
        ...content,
      },
    }
  }

  const get_s3_analysis_info_params: GetS3AnalysisInfoAdapterParams = {
    company_request_vehicle,
    vehicle_id,
    request_id,
    response_type,
    s3_client: s3Client,
  }

  const analysis_info = await getS3AnalysisInfoAdapter(get_s3_analysis_info_params)

  return {
    [company_request_vehicle]: {
      ...content,
      reason: analysis_info,
    },
  }
}

// const vehicleAnalysisOptionMap = ({
//   vehicle_id,
//   request_id,
//   s3Client,
// }: VehicleAnalysisOptionMapParams) =>
//   async ([key, value]: [string, any] )
//   : Promise<Partial<VehicleAnalysisOptionsRequest<true>> | Partial<VehicleAnalysisOptionsRequest<false>>> => {
//     const company_request_vehicle = key as CompanyRequestVehicleConfigEnum
//     const content = value as Partial<VehicleAnalysisOptionsRequest<true>> | Partial<VehicleAnalysisOptionsRequest<false>>]
//     if (company_request_vehicle === CompanyRequestVehicleConfigEnum.HISTORY) {
//       const regions: VehicleAnalysisOptionsRequestValueHistory<true> | VehicleAnalysisOptionsRequestValueHistory<false> = [] as unknown as VehicleAnalysisOptionsRequestValueHistory<true> | VehicleAnalysisOptionsRequestValueHistory<false>

//       for (const region of content[company_request_vehicle].regions) {
//         if (!region.result) {
//           continue
//         }

//         const get_s3_analysis_info_params: GetS3AnalysisInfoAdapterParams = {
//           company_request_vehicle,
//           vehicle_id,
//           request_id,
//           s3_client: s3Client,
//         }

//         const analysis_info = await getS3AnalysisInfoAdapter(get_s3_analysis_info_params)
//       }
//     }

//     if (!content[company_request_vehicle]) {
//       return {
//         [company_request_vehicle]: {},
//       }
//     }

//     const get_s3_analysis_info_params: GetS3AnalysisInfoAdapterParams = {
//       company_request_vehicle,
//       vehicle_id,
//       request_id,
//       s3_client: s3Client,
//     }

//     const analysis_info = await getS3AnalysisInfoAdapter(get_s3_analysis_info_params)

//     return {
//       [company_request_vehicle]: {
//         ...content,
//         analysis_info,
//       },
//     }
//   }

export default vehicleAnalysisOptionMap
