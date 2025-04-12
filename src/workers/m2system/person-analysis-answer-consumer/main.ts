// import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'

import { m2SystemScoreplusPersonConfigMap } from '~/constants/scoreplus-m2-system-map'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { EventBridgeSQSEventBody } from '~/models/eventbridge'
import { SQSController } from '~/models/lambda'
import { M2PersonAnalysisTypeEnum } from '~/models/m2system/enums/analysis'
import logger from '~/utils/logger'

import fetchS3PresignedURLAdapter from './fetch-s3-presigned-url-adapter'
import sendAnswerAnalysisMessage, { SendAnswerAnalysisMessageParams } from './send-answer-analysis-message'
import validateBody from './validate-body'

// const dynamodbClient = new DynamoDBClient({
//   region: 'us-east-1',
//   maxAttempts: 5,
// })

const sqsClient = new SQSClient({
  region: 'us-east-1',
  maxAttempts: 5,
})

const s3Client = new S3Client({
  region: 'us-east-1',
  maxAttempts: 5,
})

const m2SystemPersonAnalysisAnswerConsumerWorker: SQSController = async (message) => {
  logger.debug({
    message: 'Start on answer request person analysis from m2system response',
  })

  const body = validateBody((message.body as EventBridgeSQSEventBody<'PersonPresignedURLGenerated'>))

  const s3_presigned_url = body.detail.s3_presigned_url

  const company_request_person = m2SystemScoreplusPersonConfigMap[body.detail.person_analysis_type as M2PersonAnalysisTypeEnum] as CompanyRequestPersonConfigEnum

  const person_id = body.detail.person_id
  const request_id = body.detail.request_id

  const s3_answer_key = await fetchS3PresignedURLAdapter({
    company_request_person,
    person_id,
    region: body.detail.region,
    request_id,
    s3_client: s3Client,
    s3_presigned_url,
  })

  const send_person_answer_params: SendAnswerAnalysisMessageParams = {
    answers_body: [{
      region: body.detail.region,
      type: company_request_person,
      reason: s3_answer_key,
    }],
    // dynamodbClient,
    sqsClient,
    person_id,
    request_id,
  }

  await sendAnswerAnalysisMessage(send_person_answer_params)

  // await useCaseSendPersonAnswer(send_person_answer_params)

  logger.info({
    message: 'Finish on answer request person analysis from m2system response',
    person_id,
  })

  return {
    success: true,
    statusCode: 200,
  }
}

export default m2SystemPersonAnalysisAnswerConsumerWorker
