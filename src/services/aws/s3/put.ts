import { ObjectCannedACL, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { StreamingBlobPayloadInputTypes } from '@smithy/types'

import logger from '~/utils/logger'

export type PutS3Params<T = Record<string, string>> = {
  body: StreamingBlobPayloadInputTypes
  bucket: string
  key: string
  metadata?: T
  acl?: ObjectCannedACL
  contentEncoding?: string
  s3Client: S3Client
}

export type PutS3Function<T = Record<string, string>> = (params: PutS3Params<T>) => Promise<void>

const putS3: PutS3Function = async ({
  body,
  bucket,
  key,
  metadata,
  s3Client,
  contentEncoding,
  acl,
}) => {
  logger.debug({
    message: 'S3: PutObject',
    bucket,
  })

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    Metadata: metadata,
    ContentEncoding: contentEncoding,
    ACL: acl,
  })

  await s3Client.send(command)
}

export default putS3
