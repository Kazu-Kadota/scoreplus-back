import { SNSClient } from '@aws-sdk/client-sns'

import { CompanyRequestPersonBiometryConfigEnum } from '~/models/dynamo/enums/company'
import { RequestplusAnalysisPerson } from '~/models/dynamo/requestplus/analysis-person/table'
import useCasePublishSnsTopicPerson, { PublishSnsTopicPersonParams } from '~/use-cases/publish-sns-topic-person'

export type BiometryFacialPublishSnsTopicPersonAdapterParams = {
  request_person: RequestplusAnalysisPerson,
  snsClient: SNSClient
  s3_facial_image_path: string
}

const publishSnsTopicPersonAdapter = async ({
  request_person,
  snsClient,
  s3_facial_image_path,
}: BiometryFacialPublishSnsTopicPersonAdapterParams) => {
  const publish_sns_topic_person: PublishSnsTopicPersonParams<CompanyRequestPersonBiometryConfigEnum.BIOMETRY_FACIAL> = {
    person_analysis_options: {
      [CompanyRequestPersonBiometryConfigEnum.BIOMETRY_FACIAL]: {},
    },
    person_data: {
      birth_date: request_person.birth_date,
      document: request_person.document,
      mother_name: request_person.mother_name,
      name: request_person.name,
      rg: request_person.rg,
      state_rg: request_person.state_rg,
      category_cnh: request_person.category_cnh,
      cnh: request_person.cnh,
      company_name: request_person.company_name,
      expire_at_cnh: request_person.expire_at_cnh,
      father_name: request_person.father_name,
      naturalness: request_person.naturalness,
      security_number_cnh: request_person.security_number_cnh,
    },
    person_id: request_person.person_id,
    request_id: request_person.request_id,
    snsClient,
    images: {
      s3_facial_image_path,
      type: CompanyRequestPersonBiometryConfigEnum.BIOMETRY_FACIAL,
    },
  }

  await useCasePublishSnsTopicPerson(publish_sns_topic_person)
}

export default publishSnsTopicPersonAdapter
