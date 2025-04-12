import { AttributeValue, DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { RequestplusAnalysisPerson } from '~/models/dynamo/requestplus/analysis-person/table'
import { RequestplusValidateAnalysisPerson } from '~/models/dynamo/requestplus/validate-analysis-person/table'
import { Controller } from '~/models/lambda'
import scanRequestplusAnalysisPerson, { ScanRequestplusAnalysisPersonScan } from '~/services/aws/dynamo/request/analysis/person/scan'
import scanRequestplusValidateAnalysisPerson from '~/services/aws/dynamo/request/validate/person/scan'
import logger from '~/utils/logger'

export type ListPeopleControllerRequestAnalysisPerson = Omit<RequestplusAnalysisPerson, 'person_analysis_options' | 'third_party'>

export type ListPeopleControllerRequestValidateAnalysisPerson = Omit<RequestplusValidateAnalysisPerson, 'information_validation' | 'person_analysis_options' | 'third_party'>

const dynamodbClient = new DynamoDBClient({
  region: 'us-east-1',
})

const listPeopleController: Controller<true> = async (req) => {
  logger.debug({
    message: 'Start list people requests',
  })

  const user_info = req.user

  let last_evaluated_key: Record<string, AttributeValue> | undefined
  const scan: ScanRequestplusAnalysisPersonScan = {}
  const people: (ListPeopleControllerRequestAnalysisPerson | ListPeopleControllerRequestValidateAnalysisPerson)[] = []

  if (user_info.user_type === 'client') {
    scan.company_name = user_info.company_name
  }

  do {
    const scan_result = await scanRequestplusAnalysisPerson(
      scan,
      dynamodbClient,
      last_evaluated_key,
    )

    if (!scan_result) {
      logger.info({
        message: 'Finish on list people requests',
      })

      return {
        body: {
          message: 'Finish on list people requests',
          people,
        },
      }
    }

    if (scan_result.result) {
      const result_map = scan_result.result.map((item) => {
        if (user_info.user_type === UserGroupEnum.CLIENT) {
          const {
            person_analysis_options,
            third_party,
            ...rest_item
          } = item

          return rest_item
        }

        return item
      })

      people.push(...result_map)
    }

    last_evaluated_key = scan_result.last_evaluated_key
  } while (last_evaluated_key)

  do {
    const scan_result = await scanRequestplusValidateAnalysisPerson(
      scan,
      dynamodbClient,
      last_evaluated_key,
    )

    if (!scan_result) {
      logger.info({
        message: 'Finish on list people requests',
      })

      return {
        body: {
          message: 'Finish on list people requests',
          people,
        },
      }
    }

    if (scan_result.result) {
      const result_map = scan_result.result.map((item) => {
        if (user_info.user_type === UserGroupEnum.CLIENT) {
          const {
            information_validation,
            person_analysis_options,
            third_party,
            ...rest_item
          } = item

          return rest_item
        }

        return item
      })

      people.push(...result_map)
    }

    last_evaluated_key = scan_result.last_evaluated_key
  } while (last_evaluated_key)

  people.sort(
    (r1, r2) => r1.created_at > r2.created_at
      ? 1
      : r1.created_at < r2.created_at
        ? -1
        : 0,
  )

  logger.info({
    message: 'Finish on list people requests',
  })

  return {
    body: {
      message: 'Finish on list people requests',
      people,
    },
  }
}

export default listPeopleController
