import { SNSClient } from '@aws-sdk/client-sns'

import { thirdPartyCompanyRequestPersonConfigMap } from '~/constants/third-party-map'
import { DatavalidImageObject } from '~/models/datavalid/image-object'
import { DatavalidSQSSendMessageAttributes } from '~/models/datavalid/sqs-message-attributes'
import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { PersonAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { CompanyRequestPersonConfig } from '~/models/dynamo/userplus/company'
import { SNSMessageAttributes, SNSThirdPartyWorkersPersonMessage } from '~/models/sns'
import publishThirdPartySns from '~/services/aws/sns/third_party/publish'
import logger from '~/utils/logger'

import personSnsMountMessage, { PersonSnsMountMessageParams } from './sns-mount-message'

type UseCaseSNSMessageAttributes = SNSMessageAttributes & DatavalidSQSSendMessageAttributes

export type PublishSnsTopicPersonParamsImages = {
  name: string
  buffer: Buffer
}

export type PublishSnsTopicPersonParams<T = unknown> = {
  company_request_person_config: CompanyRequestPersonConfig
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<false>>
  person_data: PersonRequestForms
  person_id: string,
  request_id: string,
  snsClient: SNSClient,
  images?: DatavalidImageObject<T>
}

const useCasePublishSnsTopicPerson = async ({
  company_request_person_config,
  person_analysis_options,
  person_data,
  person_id,
  request_id,
  snsClient,
  images,
}: PublishSnsTopicPersonParams): Promise<void | undefined> => {
  for (const key of Object.keys(person_analysis_options)) {
    const person_analysis_option = key as CompanyRequestPersonConfigEnum

    const sns_mount_message_params: PersonSnsMountMessageParams = {
      company_request_person_config,
      images,
      person_analysis_option,
      person_data,
      person_id,
      request_id,
    }

    const message: SNSThirdPartyWorkersPersonMessage = {
      [person_analysis_option]: personSnsMountMessage(sns_mount_message_params),
    }

    const consumer = thirdPartyCompanyRequestPersonConfigMap[person_analysis_option]

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
        StringValue: logger.config.requestId,
      },
      consumer: {
        DataType: 'String.Array',
        StringValue: JSON.stringify(consumer),
      },
    }

    await publishThirdPartySns(JSON.stringify(message), sns_message_attributes, snsClient)
  }
}

export default useCasePublishSnsTopicPerson
