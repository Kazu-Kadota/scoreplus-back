import { SNSClient } from '@aws-sdk/client-sns'

import { DatavalidImageObject } from '~/models/datavalid/image-object'
import { DatavalidSQSSendMessageAttributes } from '~/models/datavalid/sqs-message-attributes'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { PersonAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { SNSMessageAttributes, SNSThirdPartyWorkersPersonMessage } from '~/models/sns'
import publishThirdPartySns from '~/services/aws/sns/third_party/publish'
import logger from '~/utils/logger'
import removeEmpty from '~/utils/remove-empty'

import personSnsMountMessage, { PersonSnsMountMessageParams } from './sns-mount-message'

type UseCaseSNSMessageAttributes = SNSMessageAttributes & DatavalidSQSSendMessageAttributes

export type PublishSnsTopicPersonParamsImages = {
  name: string
  buffer: Buffer
}

export type PublishSnsTopicPersonParams<T = unknown> = {
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<false>>
  person_data: PersonRequestForms
  person_id: string,
  request_id: string,
  snsClient: SNSClient,
  images?: DatavalidImageObject<T>
}

const useCasePublishSnsTopicPerson = async ({
  person_analysis_options,
  person_data,
  person_id,
  request_id,
  snsClient,
  images,
}: PublishSnsTopicPersonParams): Promise<void | undefined> => {
  const message: SNSThirdPartyWorkersPersonMessage = {}

  for (const key of Object.keys(person_analysis_options)) {
    const person_analysis_option = key as CompanyRequestPersonConfigEnum

    const sns_mount_message_params: PersonSnsMountMessageParams = {
      person_analysis_option,
      person_data,
      images,
    }

    message[person_analysis_option] = personSnsMountMessage(sns_mount_message_params)
  }

  const sns_message = removeEmpty(message)

  if (Object.keys(sns_message).length === 0) {
    return undefined
  }

  const sns_message_attributes: UseCaseSNSMessageAttributes = {
    origin: {
      DataType: 'String',
      StringValue: 'scoreplus',
    },
    person_id: {
      DataType: 'String',
      StringValue: person_id,
    },
    request_id: {
      DataType: 'String',
      StringValue: request_id,
    },
    requestId: {
      DataType: 'String',
      StringValue: logger.config.request_id,
    },
  }

  await publishThirdPartySns(JSON.stringify(sns_message), sns_message_attributes, snsClient)
}

export default useCasePublishSnsTopicPerson
