import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { VehicleAnalysisStateEnum } from '~/models/dynamo/enums/request'
import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { RequestplusAnalysisVehicle, RequestplusAnalysisVehicleKey } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { VehicleAnalysisOptionsRequest, VehicleAnalysisOptionsRequestValueAnswer } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import { RequestplusFinishedAnalysisVehicle, RequestplusFinishedAnalysisVehicleKey } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import { RequestplusValidateAnalysisVehicle } from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import { VehicleAnalysisInformationValidation } from '~/models/dynamo/requestplus/validate-analysis-vehicle/validation-information'
import getRequestplusAnalysisVehicle from '~/services/aws/dynamo/request/analysis/vehicle/get'
import getRequestplusFinishedAnalysisVehicle from '~/services/aws/dynamo/request/finished/vehicle/get'
import getRequestplusValidateAnalysisVehicle from '~/services/aws/dynamo/request/validate/vehicle/get'
import { s3ThirdPartyGetParamsResponseType } from '~/services/aws/s3/third-party/answer/vehicle/get'
import ForbiddenError from '~/utils/errors/403-forbidden'
import NotFoundError from '~/utils/errors/404-not-found'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'
import { Exact } from '~/utils/types/exact'

import countConsult from './count-consult'
import informationValidationMap from './information-validation-map'
import vehicleAnalysisOptionMap from './vehicle-analysis-option-map'

export type GetRequestVehicleAdapterParams = {
  dynamodbClient: DynamoDBClient
  request_id: string
  user_info: UserFromJwt
  vehicle_id: string
  s3Client: S3Client
}

export type GetRequestVehicleAdapterResponseRequestedVehicle = Omit<RequestplusAnalysisVehicle,
  | 'third_party'
>

export type GetRequestVehicleAdapterResponseValidateVehicle = Omit<RequestplusValidateAnalysisVehicle,
  | 'third_party'
>

export type GetRequestVehicleAdapterResponseFinishedVehicle = Omit<RequestplusFinishedAnalysisVehicle,
| 'third_party'
| 'already_consulted'
>

// export type GetRequestVehicleAdapterResponseFinishedVehicle = RequestplusFinishedAnalysisVehicleKey & VehicleRequestForms & Timestamp & {
//   analysis_type: AnalysisTypeEnum
//   finished_at: string
//   result: AnalysisResultEnum
//   vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<true>>
//   vehicle_analysis_type: VehicleAnalysisType
// }

// export type GetRequestVehicleAdapterResponseRequestedVehicle = RequestplusAnalysisVehicleKey & VehicleRequestForms & Timestamp & {
//   analysis_type: AnalysisTypeEnum
//   vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>>
//   vehicle_analysis_type: VehicleAnalysisType
// }

export type GetRequestVehicleAdapterResponse = GetRequestVehicleAdapterResponseFinishedVehicle | GetRequestVehicleAdapterResponseValidateVehicle | GetRequestVehicleAdapterResponseRequestedVehicle

const getRequestVehicleAdapter = async ({
  dynamodbClient,
  request_id,
  user_info,
  vehicle_id,
  s3Client,
}: GetRequestVehicleAdapterParams): Promise<GetRequestVehicleAdapterResponse> => {
  const key: RequestplusAnalysisVehicleKey | RequestplusFinishedAnalysisVehicleKey = {
    request_id,
    vehicle_id,
  }
  const request_vehicle = await getRequestplusAnalysisVehicle(key, dynamodbClient)

  if (request_vehicle) {
    const is_client_request = user_info.user_type === UserGroupEnum.CLIENT
    if (is_client_request) {
      if (user_info.company_name !== request_vehicle.company_name) {
        logger.warn({
          message: 'Vehicle in analysis',
          request_id: key.request_id,
          vehicle_id: key.vehicle_id,
        })

        throw new ForbiddenError('Veículo em análise')
      }

      // Only Ethical and Historical is forbidden to client see from third party responses
      for (const key of Object.keys(request_vehicle.vehicle_analysis_options)) {
        const company_request_vehicle = key as CompanyRequestVehicleConfigEnum
        if (company_request_vehicle === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
          const regions = request_vehicle.vehicle_analysis_options[company_request_vehicle]?.regions.map((region): (Partial<VehicleAnalysisOptionsRequestValueAnswer> & {
            region: VehicleAnalysisStateEnum
          }) => {
            return {
              ...region,
              reason: undefined,
            }
          }) ?? []

          request_vehicle.vehicle_analysis_options[company_request_vehicle] = {
            ...request_vehicle.vehicle_analysis_options[company_request_vehicle],
            regions,
          }
        } else if (company_request_vehicle === CompanyRequestVehicleConfigEnum.ETHICAL) {
          delete request_vehicle.vehicle_analysis_options[company_request_vehicle]?.reason
        }
      }

      const vehicle_analysis_options_map = await Promise.all(Object
        .entries(request_vehicle.vehicle_analysis_options)
        .map(([key, value]) => vehicleAnalysisOptionMap({
          key,
          value,
          vehicle_id,
          request_id,
          response_type: s3ThirdPartyGetParamsResponseType.answer,
          s3Client,
        },
        )))

      const vehicle_analysis_options = vehicle_analysis_options_map.reduce((prev, curr) => ({
        ...prev,
        ...curr,
      }), {} as any) as Partial<VehicleAnalysisOptionsRequest<false>>

      request_vehicle.vehicle_analysis_options = vehicle_analysis_options

      const {
        third_party,
        ...client_vehicle_info
      } = request_vehicle

      const vehicle: Exact<GetRequestVehicleAdapterResponseRequestedVehicle, typeof client_vehicle_info> = client_vehicle_info

      return vehicle
    }

    const vehicle_analysis_options_map = await Promise.all(Object
      .entries(request_vehicle.vehicle_analysis_options)
      .map(([key, value]) => vehicleAnalysisOptionMap({
        key,
        value,
        vehicle_id,
        request_id,
        response_type: s3ThirdPartyGetParamsResponseType.answer,
        s3Client,
      },
      )))

    const vehicle_analysis_options = vehicle_analysis_options_map.reduce((prev, curr) => ({
      ...prev,
      ...curr,
    }), {} as any) as Partial<VehicleAnalysisOptionsRequest<false>>

    request_vehicle.vehicle_analysis_options = vehicle_analysis_options

    return request_vehicle
  }

  const validate_request_vehicle = await getRequestplusValidateAnalysisVehicle(key, dynamodbClient)

  if (validate_request_vehicle) {
    const is_client_request = user_info.user_type === UserGroupEnum.CLIENT
    if (is_client_request) {
      if (user_info.company_name !== validate_request_vehicle.company_name) {
        logger.warn({
          message: 'Vehicle in analysis',
          company_name: user_info,
          request_id: key.request_id,
          vehicle_id: key.vehicle_id,
        })

        throw new ForbiddenError('Pessoa em análise')
      }

      // Only Ethical and Historical is forbidden to client see from third party responses
      for (const key of Object.keys(validate_request_vehicle.vehicle_analysis_options)) {
        const company_request_vehicle = key as CompanyRequestVehicleConfigEnum
        if (company_request_vehicle === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
          const regions = validate_request_vehicle.vehicle_analysis_options[company_request_vehicle]?.regions.map((region): (VehicleAnalysisOptionsRequestValueAnswer & {
            region: VehicleAnalysisStateEnum
          }) => {
            return {
              ...region,
              reason: undefined,
            }
          }) ?? []

          validate_request_vehicle.vehicle_analysis_options[company_request_vehicle] = {
            ...validate_request_vehicle.vehicle_analysis_options[company_request_vehicle],
            regions,
          }
        } else if (company_request_vehicle === CompanyRequestVehicleConfigEnum.ETHICAL) {
          delete validate_request_vehicle.vehicle_analysis_options[company_request_vehicle]?.reason
        }
      }

      const vehicle_analysis_options_map = await Promise.all(Object
        .entries(validate_request_vehicle.vehicle_analysis_options)
        .map(([key, value]) => vehicleAnalysisOptionMap({
          key,
          value,
          vehicle_id,
          request_id,
          response_type: s3ThirdPartyGetParamsResponseType.answer,
          s3Client,
        },
        )))

      const vehicle_analysis_options = vehicle_analysis_options_map.reduce((prev, curr) => ({
        ...prev,
        ...curr,
      }), {} as any) as Partial<VehicleAnalysisOptionsRequest<true>>

      validate_request_vehicle.vehicle_analysis_options = vehicle_analysis_options

      // Only Ethical is forbidden to client see from validation
      for (const key of Object.keys(validate_request_vehicle.information_validation)) {
        const company_request_vehicle = key as CompanyRequestVehicleConfigEnum
        if (company_request_vehicle === CompanyRequestVehicleConfigEnum.ETHICAL) {
          delete validate_request_vehicle.information_validation[company_request_vehicle]?.reason
        }
      }

      const information_validation_map = await Promise.all(Object
        .entries(validate_request_vehicle.information_validation)
        .map(([key, value]) => informationValidationMap({
          key,
          value,
          vehicle_id,
          request_id,
          response_type: s3ThirdPartyGetParamsResponseType.validate,
          s3Client,
        },
        )))

      const information_validation = information_validation_map.reduce((prev, curr) => ({
        ...prev,
        ...curr,
      }), {} as any) as Partial<VehicleAnalysisInformationValidation<false>>

      validate_request_vehicle.information_validation = information_validation

      const {
        third_party,
        ...client_vehicle_info
      } = validate_request_vehicle

      const vehicle: Exact<GetRequestVehicleAdapterResponseValidateVehicle, typeof client_vehicle_info> = client_vehicle_info

      return vehicle
    }

    const vehicle_analysis_options_map = await Promise.all(Object
      .entries(validate_request_vehicle.vehicle_analysis_options)
      .map(([key, value]) => vehicleAnalysisOptionMap({
        key,
        value,
        vehicle_id,
        request_id,
        response_type: s3ThirdPartyGetParamsResponseType.answer,
        s3Client,
      },
      )))

    const vehicle_analysis_options = vehicle_analysis_options_map.reduce((prev, curr) => ({
      ...prev,
      ...curr,
    }), {} as any) as Partial<VehicleAnalysisOptionsRequest<true>>

    validate_request_vehicle.vehicle_analysis_options = vehicle_analysis_options

    const information_validation_map = await Promise.all(Object
      .entries(validate_request_vehicle.information_validation)
      .map(([key, value]) => informationValidationMap({
        key,
        value,
        vehicle_id,
        request_id,
        response_type: s3ThirdPartyGetParamsResponseType.validate,
        s3Client,
      },
      )))

    const information_validation = information_validation_map.reduce((prev, curr) => ({
      ...prev,
      ...curr,
    }), {} as any) as Partial<VehicleAnalysisInformationValidation<false>>

    validate_request_vehicle.information_validation = information_validation

    return validate_request_vehicle
  }

  const finished_vehicle = await getRequestplusFinishedAnalysisVehicle(key, dynamodbClient)

  if (finished_vehicle) {
    const is_client_request = user_info.user_type === UserGroupEnum.CLIENT
    if (is_client_request) {
      // Only Ethical and Historical is forbidden to client see from third party responses
      for (const key of Object.keys(finished_vehicle.vehicle_analysis_options)) {
        const company_request_vehicle = key as CompanyRequestVehicleConfigEnum
        if (company_request_vehicle === CompanyRequestVehicleConfigEnum.PLATE_HISTORY) {
          const regions = finished_vehicle.vehicle_analysis_options[company_request_vehicle]?.regions.map((region): (VehicleAnalysisOptionsRequestValueAnswer & {
            region: VehicleAnalysisStateEnum
          }) => {
            return {
              ...region,
              reason: undefined,
            }
          }) ?? []

          finished_vehicle.vehicle_analysis_options[company_request_vehicle] = {
            ...finished_vehicle.vehicle_analysis_options[company_request_vehicle],
            regions,
          }
        } else if (company_request_vehicle === CompanyRequestVehicleConfigEnum.ETHICAL) {
          delete finished_vehicle.vehicle_analysis_options[company_request_vehicle]?.reason
        }
      }

      const vehicle_analysis_options_map = await Promise.all(Object
        .entries(finished_vehicle.vehicle_analysis_options)
        .map(([key, value]) => vehicleAnalysisOptionMap({
          key,
          value,
          vehicle_id,
          request_id,
          response_type: s3ThirdPartyGetParamsResponseType.answer,
          s3Client,
        },
        )))

      const vehicle_analysis_options = vehicle_analysis_options_map.reduce((prev, curr) => ({
        ...prev,
        ...curr,
      }), {} as any) as Partial<VehicleAnalysisOptionsRequest<true>>

      finished_vehicle.vehicle_analysis_options = vehicle_analysis_options

      // Only Ethical is forbidden to client see from validation
      for (const key of Object.keys(finished_vehicle.information_validation)) {
        const company_request_vehicle = key as CompanyRequestVehicleConfigEnum
        if (company_request_vehicle === CompanyRequestVehicleConfigEnum.ETHICAL) {
          delete finished_vehicle.information_validation[company_request_vehicle]?.reason
        }
      }

      const information_validation_map = await Promise.all(Object
        .entries(finished_vehicle.information_validation)
        .map(([key, value]) => informationValidationMap({
          key,
          value,
          vehicle_id,
          request_id,
          response_type: s3ThirdPartyGetParamsResponseType.validate,
          s3Client,
        },
        )))

      const information_validation = information_validation_map.reduce((prev, curr) => ({
        ...prev,
        ...curr,
      }), {} as any) as Partial<VehicleAnalysisInformationValidation<true>>

      finished_vehicle.information_validation = information_validation

      await countConsult({
        dynamodbClient,
        finished_vehicle,
        user_info,
      })

      const {
        already_consulted,
        third_party,
        ...client_vehicle_info
      } = finished_vehicle

      const vehicle: Exact<GetRequestVehicleAdapterResponseFinishedVehicle, typeof client_vehicle_info> = client_vehicle_info

      return vehicle
    }

    const vehicle_analysis_options_map = await Promise.all(Object
      .entries(finished_vehicle.vehicle_analysis_options)
      .map(([key, value]) => vehicleAnalysisOptionMap({
        key,
        value,
        vehicle_id,
        request_id,
        response_type: s3ThirdPartyGetParamsResponseType.answer,
        s3Client,
      },
      )))

    const vehicle_analysis_options = vehicle_analysis_options_map.reduce((prev, curr) => ({
      ...prev,
      ...curr,
    }), {} as any) as Partial<VehicleAnalysisOptionsRequest<true>>

    finished_vehicle.vehicle_analysis_options = vehicle_analysis_options

    const information_validation_map = await Promise.all(Object
      .entries(finished_vehicle.information_validation)
      .map(([key, value]) => informationValidationMap({
        key,
        value,
        vehicle_id,
        request_id,
        response_type: s3ThirdPartyGetParamsResponseType.validate,
        s3Client,
      },
      )))

    const information_validation = information_validation_map.reduce((prev, curr) => ({
      ...prev,
      ...curr,
    }), {} as any) as Partial<VehicleAnalysisInformationValidation<true>>

    finished_vehicle.information_validation = information_validation

    return finished_vehicle
  }

  logger.warn({
    message: 'Vehicle not exist',
    request_id: key.request_id,
    vehicle_id: key.vehicle_id,
  })

  throw new NotFoundError('Veículo não existe', 404)
}

export default getRequestVehicleAdapter
