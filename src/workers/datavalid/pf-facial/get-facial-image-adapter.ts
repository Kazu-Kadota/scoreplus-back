import { S3Client } from '@aws-sdk/client-s3'

import getObjectS3 from '~/services/aws/s3/get'
import getStringEnv from '~/utils/get-string-env'

export type GetFacialImageAdapter = {
  key: string,
  s3Client: S3Client
}

const S3_BUCKET_REQUESTPLUS_ANALYSIS_PERSON_BIOMETRY = getStringEnv('S3_BUCKET_REQUESTPLUS_ANALYSIS_PERSON_BIOMETRY')

const getFacialImageAdapter = async ({
  key,
  s3Client,
}: GetFacialImageAdapter): Promise<string> => {
  const result = await getObjectS3({
    bucket: S3_BUCKET_REQUESTPLUS_ANALYSIS_PERSON_BIOMETRY,
    key,
    s3Client,
  })

  return Buffer.from((await result.Body?.transformToByteArray()) as Uint8Array).toString('base64')
}

export default getFacialImageAdapter
