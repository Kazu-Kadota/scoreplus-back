import { SNSClient } from '@aws-sdk/client-sns'

import publishSnsTopicVehicleAdapter, { PublishSnsTopicVehicleAdapterParams } from '../publish-sns-topic-vehicle'

import requestVehicleAnalysis, { VehicleAnalysisRequest } from './request-vehicle-analysis'

export type UseCaseRequestVehicleAnalysis = VehicleAnalysisRequest & {
  snsClient: SNSClient
}

const useCaseRequestVehicleAnalysis = async (params: UseCaseRequestVehicleAnalysis) => {
  const { snsClient, ...vehicle_analysis_constructor } = params

  const vehicle_analysis = await requestVehicleAnalysis(vehicle_analysis_constructor)

  const vehicle_params: PublishSnsTopicVehicleAdapterParams = {
    request_id: vehicle_analysis.vehicle_request_id,
    vehicle_analysis_options: vehicle_analysis.vehicle_analysis_options,
    vehicle_data: vehicle_analysis_constructor.vehicle_data,
    vehicle_id: vehicle_analysis.vehicle_id,
    sns_client: snsClient,
  }

  await publishSnsTopicVehicleAdapter(vehicle_params)

  return vehicle_analysis
}

export default useCaseRequestVehicleAnalysis
