import { MessageAttributeValue, SNSClient } from '@aws-sdk/client-sns'

import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { VehicleRequestForms } from '~/models/dynamo/requestplus/analysis-vehicle/forms'
import { VehicleAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import { SNSThirdPartyWorkersVehicleMessage } from '~/models/sns'
import publishThirdPartySns from '~/services/aws/sns/third_party/publish'
import removeEmpty from '~/utils/remove-empty'

import vehicleSnsMountMessage, { VehicleSnsMountMessageParams } from './sns-mount-message'

export type publishSnsTopicVehicleAdapterParams = {
  request_id: string
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>>
  vehicle_data: VehicleRequestForms
  vehicle_id: string,
  sns_client: SNSClient,
}

const publishSnsTopicVehicleAdapter = async (
  params: publishSnsTopicVehicleAdapterParams,
): Promise<void | undefined> => {
  const message: SNSThirdPartyWorkersVehicleMessage = {}

  for (const key of Object.keys(params.vehicle_analysis_options)) {
    const vehicle_analysis_option = key as CompanyRequestVehicleConfigEnum

    const sns_mount_message_params: VehicleSnsMountMessageParams = {
      vehicle_analysis_option,
      vehicle_data: params.vehicle_data,
    }

    message[vehicle_analysis_option] = vehicleSnsMountMessage(sns_mount_message_params)
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

  await publishThirdPartySns(JSON.stringify(sns_message), sns_message_attributes, params.sns_client)
}

export default publishSnsTopicVehicleAdapter
