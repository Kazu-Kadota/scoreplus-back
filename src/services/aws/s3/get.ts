import { GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3'

import logger from '~/utils/logger'

export type PutS3Params = {
  bucket: string
  key: string
  s3Client: S3Client
}

export type GetObjectS3Function = (params: PutS3Params) => Promise<GetObjectCommandOutput>

const getObjectS3: GetObjectS3Function = async ({
  bucket,
  key,
  s3Client,
}) => {
  logger.debug({
    message: 'S3: GetObject',
    bucket,
  })

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  return await s3Client.send(command)
}

export default getObjectS3
