import { SNSClient } from '@aws-sdk/client-sns'

import publishSnsTopicPersonAdapter, { publishSnsTopicPersonAdapterParams } from './publish-sns-topic-person-adapter'
import requestPersonAnalysis, { PersonAnalysisRequest } from './request-person-analysis'

export type UseCaseRequestPersonAnalysis = PersonAnalysisRequest & {
  snsClient: SNSClient
}

const useCaseRequestPersonAnalysis = async (params: UseCaseRequestPersonAnalysis) => {
  const { snsClient, ...person_analysis_request } = params

  const person_analysis = await requestPersonAnalysis(person_analysis_request)

  const publish_sns_topic_adapter_params: publishSnsTopicPersonAdapterParams = {
    person_analysis_options: person_analysis.person_analysis_options,
    person_data: person_analysis_request.person_data,
    person_id: person_analysis.person_id,
    request_id: person_analysis.person_request_id,
  }

  await publishSnsTopicPersonAdapter(publish_sns_topic_adapter_params, snsClient)

  return person_analysis
}

export default useCaseRequestPersonAnalysis
