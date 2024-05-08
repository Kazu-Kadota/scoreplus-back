import { S3Client } from '@aws-sdk/client-s3'

import { DatavalidS3Metadata, DatavalidS3MetadataTypeEnum } from '~/models/datavalid/s3-metadata'
import putS3, { PutS3Params } from '~/services/aws/s3/put'
import getStringEnv from '~/utils/get-string-env'

const S3_BUCKET_REQUESTPLUS_ANALYSIS_PERSON_BIOMETRY = getStringEnv('S3_BUCKET_REQUESTPLUS_ANALYSIS_PERSON_BIOMETRY')

export type PutImageToBucketAdapterParams = {
  image: Buffer
  image_name: string
  image_type: string
  request_id: string
  person_id: string
  s3Client: S3Client
}

const putImageToBucketAdapter = async ({
  image,
  image_name,
  image_type,
  person_id,
  request_id,
  s3Client,
}: PutImageToBucketAdapterParams): Promise<string> => {
  const s3_facial_image_path = `${person_id}/${request_id}/${image_name}.${image_type}.bin`
  const put_command: PutS3Params<DatavalidS3Metadata> = {
    body: image,
    bucket: S3_BUCKET_REQUESTPLUS_ANALYSIS_PERSON_BIOMETRY,
    key: s3_facial_image_path,
    s3Client,
    metadata: {
      type: DatavalidS3MetadataTypeEnum.FACIAL,
    },
  }

  await putS3(put_command)

  return s3_facial_image_path
}

export default putImageToBucketAdapter
