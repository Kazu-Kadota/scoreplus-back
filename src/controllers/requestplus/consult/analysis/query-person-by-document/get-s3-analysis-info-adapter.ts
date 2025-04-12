import { S3Client } from '@aws-sdk/client-s3'

import { thirdPartyCompanyRequestPersonConfigMap } from '~/constants/third-party-map'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'
import { AnalysisTypeEnum, PersonStateEnum, PersonThirdPartyEnum } from '~/models/dynamo/enums/request'
import s3ThirdPartyAnswerPersonGet, { S3ThirdPartyAnswerPersonGetResponseType } from '~/services/aws/s3/third-party/answer/person/get'

export type GetS3AnalysisInfoAdapterParams = {
  company_request_person: CompanyRequestPersonConfigEnum
  person_id: string
  region?: PersonStateEnum
  request_id: string
  response_type: S3ThirdPartyAnswerPersonGetResponseType
  s3_client: S3Client
}

const getS3AnalysisInfoAdapter = async ({
  company_request_person,
  person_id,
  region,
  request_id,
  response_type,
  s3_client,
}: GetS3AnalysisInfoAdapterParams): Promise<string> => {
  const third_party: PersonThirdPartyEnum = thirdPartyCompanyRequestPersonConfigMap[company_request_person].split('_person')[0] as PersonThirdPartyEnum

  const s3_body = await s3ThirdPartyAnswerPersonGet({
    analysis_type: AnalysisTypeEnum.PERSON,
    company_request_person,
    person_id,
    region,
    request_id,
    response_type,
    s3_client,
    third_party,
  })

  return s3_body
}

export default getS3AnalysisInfoAdapter
