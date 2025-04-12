import { AttributeValue, DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { RequestplusAnalysisVehicle } from '~/models/dynamo/requestplus/analysis-vehicle/table'
import { RequestplusValidateAnalysisVehicle } from '~/models/dynamo/requestplus/validate-analysis-vehicle/table'
import { Controller } from '~/models/lambda'
import scanRequestplusAnalysisVehicle, { ScanRequestplusAnalysisVehicleScan } from '~/services/aws/dynamo/request/analysis/vehicle/scan'
import scanRequestplusValidateAnalysisVehicle from '~/services/aws/dynamo/request/validate/vehicle/scan'
import logger from '~/utils/logger'

export type ListPeopleControllerRequestAnalysisVehicle = Omit<RequestplusAnalysisVehicle, 'vehicle_analysis_options' | 'third_party'>

export type ListPeopleControllerRequestValidateAnalysisVehicle = Omit<RequestplusValidateAnalysisVehicle, 'information_validation' | 'vehicle_analysis_options' | 'third_party'>

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const requestVehicles: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start list vehicles',
  })

  const user_info = req.user

  let last_evaluated_key: Record<string, AttributeValue> | undefined
  const scan: ScanRequestplusAnalysisVehicleScan = {}
  const vehicles: (ListPeopleControllerRequestAnalysisVehicle | ListPeopleControllerRequestValidateAnalysisVehicle)[] = []

  if (user_info.user_type === 'client') {
    scan.company_name = user_info.company_name
  }

  do {
    const scan_result = await scanRequestplusAnalysisVehicle(
      scan,
      dynamodbClient,
      last_evaluated_key,
    )

    if (!scan_result) {
      logger.info({
        message: 'Finish on list vehicles requests',
      })

      return {
        body: {
          message: 'Finish on list vehicles requests',
          vehicles,
        },
      }
    }

    if (scan_result.result) {
      const result_map = scan_result.result.map((item) => {
        if (user_info.user_type === UserGroupEnum.CLIENT) {
          const {
            vehicle_analysis_options,
            third_party,
            ...rest_item
          } = item

          return rest_item
        }

        return item
      })

      vehicles.push(...result_map)
    }

    last_evaluated_key = scan_result.last_evaluated_key
  } while (last_evaluated_key)

  do {
    const scan_result = await scanRequestplusValidateAnalysisVehicle(
      scan,
      dynamodbClient,
      last_evaluated_key,
    )

    if (!scan_result) {
      logger.info({
        message: 'Finish on list vehicles requests',
      })

      return {
        body: {
          message: 'Finish on list vehicles requests',
          vehicles,
        },
      }
    }

    if (scan_result.result) {
      const result_map = scan_result.result.map((item) => {
        if (user_info.user_type === UserGroupEnum.CLIENT) {
          const {
            information_validation,
            vehicle_analysis_options,
            third_party,
            ...rest_item
          } = item

          return rest_item
        }

        return item
      })

      vehicles.push(...result_map)
    }

    last_evaluated_key = scan_result.last_evaluated_key
  } while (last_evaluated_key)

  vehicles.sort(
    (r1, r2) => r1.created_at > r2.created_at
      ? 1
      : r1.created_at < r2.created_at
        ? -1
        : 0,
  )

  logger.info({
    message: 'Finish on list vehicles requests',
  })

  return {
    body: {
      message: 'Finish on list vehicles requests',
      vehicles,
    },
  }
}

export default requestVehicles
