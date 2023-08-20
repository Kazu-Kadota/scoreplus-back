import { MessageAttributeValue, SNSClient } from '@aws-sdk/client-sns'
import { Company, CompanySystemConfigEnum } from 'src/models/dynamo/company'
import { VehicleRequestForms } from 'src/models/dynamo/request-vehicle'
import { SNSThirdPartyWorkersMessage } from 'src/models/sns'
import publishThirdPartySns from 'src/services/aws/sns/third_party/publish'
import removeEmpty from 'src/utils/remove-empty'

import snsMountMessage from './sns-mount-message'

export interface publishSnsTopicVehicleAdapterParams {
  company: Company
  vehicle_data: VehicleRequestForms
  vehicle_id: string,
  request_id: string
}

const publishSnsTopicVehicleAdapter = async (
  params: publishSnsTopicVehicleAdapterParams,
  sns_client: SNSClient,
): Promise<void | undefined> => {
  const message: SNSThirdPartyWorkersMessage = {}

  for (const [key, value] of Object.entries<boolean>(params.company.system_config)) {
    const company_system_config = key as CompanySystemConfigEnum
    message[company_system_config] = snsMountMessage(company_system_config, value, params.vehicle_data)
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
    vehicle_id: {
      DataType: 'String',
      StringValue: params.vehicle_id,
    },
    request_ids: {
      DataType: 'String',
      StringValue: params.request_id,
    },
  }

  await publishThirdPartySns(JSON.stringify(sns_message), sns_message_attributes, sns_client)
}

export default publishSnsTopicVehicleAdapter
