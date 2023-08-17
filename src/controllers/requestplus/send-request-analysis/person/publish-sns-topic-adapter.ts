import { MessageAttributeValue, SNSClient } from '@aws-sdk/client-sns'
import { Company, CompanySystemConfigEnum } from 'src/models/dynamo/company'
import { PersonRequestForms } from 'src/models/dynamo/request-person'
import { SNSThirdPartyWorkersMessage } from 'src/models/sns'
import publishThirdPartySns from 'src/services/aws/sns/third_party/publish'
import removeEmpty from 'src/utils/remove-empty'

import snsMountMessage from './sns-mount-message'

export interface publishSnsTopicAdapterParams {
  company: Company
  person_data: PersonRequestForms
  person_id: string,
  request_ids: string[]
}

const publishSnsTopicAdapter = async (
  params: publishSnsTopicAdapterParams,
  sns_client: SNSClient,
): Promise<void | undefined> => {
  const message: SNSThirdPartyWorkersMessage = {}

  for (const [key, value] of Object.entries<boolean>(params.company.system_config)) {
    const company_system_config = key as CompanySystemConfigEnum
    message[company_system_config] = snsMountMessage(company_system_config, value, params.person_data)
  }

  const sns_message = removeEmpty(message)

  if (Object.keys(sns_message).length === 0) {
    return undefined
  }

  const sns_message_attributes: Record<string, MessageAttributeValue> = {
    origin: {
      DataType: 'String',
      StringValue: 'scoreplus',
    },
    person_id: {
      DataType: 'String',
      StringValue: params.person_id,
    },
    request_ids: {
      DataType: 'String',
      StringValue: params.request_ids.toString(),
    },
  }

  await publishThirdPartySns(JSON.stringify(sns_message), sns_message_attributes, sns_client)
}

export default publishSnsTopicAdapter
