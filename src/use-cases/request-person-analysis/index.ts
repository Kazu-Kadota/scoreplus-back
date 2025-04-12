import { SNSClient } from '@aws-sdk/client-sns'

import useCasePublishSnsTopicPerson, { PublishSnsTopicPersonParams } from '../publish-sns-topic-person'

import requestPersonAnalysis, { PersonAnalysisRequest, PersonAnalysisResponse } from './request-person-analysis'

export type UseCaseRequestPersonAnalysis = PersonAnalysisRequest & {
  snsClient: SNSClient
  images?: boolean
}

const useCaseRequestPersonAnalysis = async (params: UseCaseRequestPersonAnalysis): Promise<PersonAnalysisResponse> => {
  const { snsClient, ...person_analysis_request } = params

  const person_analysis = await requestPersonAnalysis(person_analysis_request)

  const publish_sns_topic_adapter_params: PublishSnsTopicPersonParams = {
    company_request_person_config: person_analysis_request.company_request_person_config,
    person_analysis_options: person_analysis.person_analysis_options,
    person_data: person_analysis_request.person_data,
    person_id: person_analysis.person_id,
    request_id: person_analysis.person_request_id,
    snsClient,
  }

  if (!params.images) {
    await useCasePublishSnsTopicPerson(publish_sns_topic_adapter_params)
  }

  return person_analysis
}

export default useCaseRequestPersonAnalysis
