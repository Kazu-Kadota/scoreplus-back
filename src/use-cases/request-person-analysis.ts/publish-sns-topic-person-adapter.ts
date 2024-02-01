import { MessageAttributeValue, SNSClient } from '@aws-sdk/client-sns'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { PersonAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-person/person-analysis-options'
import { SNSThirdPartyWorkersPersonMessage } from '~/models/sns'
import publishThirdPartySns from '~/services/aws/sns/third_party/publish'
import removeEmpty from '~/utils/remove-empty'

import personSnsMountMessage, { PersonSnsMountMessageParams } from './sns-mount-message'

export interface publishSnsTopicPersonAdapterParams {
  person_analysis_options: Partial<PersonAnalysisOptionsRequest<false>>
  person_data: PersonRequestForms
  person_id: string,
  request_id: string
}

const publishSnsTopicPersonAdapter = async (
  params: publishSnsTopicPersonAdapterParams,
  sns_client: SNSClient,
): Promise<void | undefined> => {
  const message: SNSThirdPartyWorkersPersonMessage = {}

  for (const key of Object.keys(params.person_analysis_options)) {
    const person_analysis_option = key as CompanyRequestPersonConfigEnum

    const sns_mount_message_params: PersonSnsMountMessageParams = {
      person_analysis_option,
      person_data: params.person_data,
    }

    message[person_analysis_option] = personSnsMountMessage(sns_mount_message_params)
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
    request_id: {
      DataType: 'String',
      StringValue: params.request_id,
    },
  }

  await publishThirdPartySns(JSON.stringify(sns_message), sns_message_attributes, sns_client)
}

export default publishSnsTopicPersonAdapter
