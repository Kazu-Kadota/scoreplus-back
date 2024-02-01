import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { UserplusCompany } from '~/models/dynamo/userplus/company'
import { Controller } from '~/models/lambda'
import scanUserplusCompany, { ScanCompanyResponse } from '~/services/aws/dynamo/company/scan'
import logger from '~/utils/logger'

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' })

const requestCompanies: Controller<true> = async () => {
  logger.debug({
    message: 'Start list companies',
  })

  let last_evaluated_key
  const result: UserplusCompany[] = []

  do {
    const scan: ScanCompanyResponse | undefined = await scanUserplusCompany(
      dynamodbClient,
      last_evaluated_key,
    )

    if (scan && scan.result) {
      for (const item of scan.result) {
        result.push(item)
      }

      last_evaluated_key = scan.last_evaluated_key
    }
  } while (last_evaluated_key)

  result.sort(
    (r1, r2) => r1.name > r2.name
      ? 1
      : r1.name < r2.name
        ? -1
        : 0,
  )

  logger.info({
    message: 'Finish on get companies',
    companies: result,
  })

  return {
    body: {
      message: 'Finish on get companies',
      companies: result,
    },
  }
}

export default requestCompanies
