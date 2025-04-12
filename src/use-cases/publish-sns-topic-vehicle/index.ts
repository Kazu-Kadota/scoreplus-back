import { MessageAttributeValue, SNSClient } from '@aws-sdk/client-sns'

import { thirdPartyCompanyRequestVehicleConfigMap } from '~/constants/third-party-map'
import { CompanyRequestVehicleConfigEnum } from '~/models/dynamo/enums/company'
import { VehicleRequestForms } from '~/models/dynamo/requestplus/analysis-vehicle/forms'
import { VehicleAnalysisOptionsRequest } from '~/models/dynamo/requestplus/analysis-vehicle/vehicle-analysis-options'
import { SNSThirdPartyWorkersVehicleMessage } from '~/models/sns'
import publishThirdPartySns from '~/services/aws/sns/third_party/publish'
import logger from '~/utils/logger'

import vehicleSnsMountMessage, { VehicleSnsMountMessageParams } from './sns-mount-message'

export type PublishSnsTopicVehicleAdapterParams = {
  request_id: string
  vehicle_analysis_options: Partial<VehicleAnalysisOptionsRequest<false>>
  vehicle_data: VehicleRequestForms
  vehicle_id: string,
  sns_client: SNSClient,
}

const publishSnsTopicVehicleAdapter = async ({
  request_id,
  sns_client,
  vehicle_analysis_options,
  vehicle_data,
  vehicle_id,
}: PublishSnsTopicVehicleAdapterParams): Promise<void | undefined> => {
  for (const key of Object.keys(vehicle_analysis_options)) {
    const vehicle_analysis_option = key as CompanyRequestVehicleConfigEnum

    const sns_mount_message_params: VehicleSnsMountMessageParams = {
      company_vehicle_analysis_options: vehicle_analysis_options,
      request_id,
      vehicle_analysis_option,
      vehicle_data,
      vehicle_id,
    }

    const message: SNSThirdPartyWorkersVehicleMessage = {
      [vehicle_analysis_option]: vehicleSnsMountMessage(sns_mount_message_params),
    }

    const consumer = thirdPartyCompanyRequestVehicleConfigMap[vehicle_analysis_option]

    const sns_message_attributes: Record<string, MessageAttributeValue> = {
      origin: {
        DataType: 'String',
        StringValue: 'scoreplus',
      },
      vehicle_id: {
        DataType: 'String',
        StringValue: vehicle_id,
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

    await publishThirdPartySns(JSON.stringify(message), sns_message_attributes, sns_client)
  }
}

export default publishSnsTopicVehicleAdapter
