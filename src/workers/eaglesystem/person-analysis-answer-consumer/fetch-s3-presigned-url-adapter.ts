import { S3Client } from '@aws-sdk/client-s3'

import { CompanyRequestPersonConfigEnum } from '~/models/dynamo/enums/company'

import { AnalysisTypeEnum, PersonThirdPartyEnum } from '~/models/dynamo/enums/request'

import s3ThirdPartyAnswerPersonPut, { s3ThirdPartyPutParamsResponseType } from '~/services/aws/s3/third-party/answer/person/put'
import eagleSystemFetchS3PresignedURL from '~/services/eagle/s3-presigned-url/fetch'

export type FetchS3PresignedURL = {
  company_request_person: CompanyRequestPersonConfigEnum
  person_id: string
  request_id: string
  s3_client: S3Client
  s3_presigned_url: string
}

const fetchS3PresignedURLAdapter = async ({
  company_request_person,
  person_id,
  request_id,
  s3_client,
  s3_presigned_url,
}: FetchS3PresignedURL): Promise<string> => {
  const content = await eagleSystemFetchS3PresignedURL({
    s3_presigned_url,
  })

  const s3_answer_key = await s3ThirdPartyAnswerPersonPut({
    analysis_type: AnalysisTypeEnum.PERSON,
    body: JSON.stringify(content),
    company_request_person,
    person_id,
    request_id,
    response_type: s3ThirdPartyPutParamsResponseType.answer,
    s3_client,
    third_party: PersonThirdPartyEnum.EAGLESYSTEM,
  })

  return s3_answer_key
}

export default fetchS3PresignedURLAdapter
