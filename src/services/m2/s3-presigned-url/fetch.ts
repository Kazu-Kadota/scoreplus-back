import axios, { AxiosRequestConfig } from 'axios'

import ErrorHandler from '~/utils/error-handler'
import logger from '~/utils/logger'

export type M2SystemFetchS3PresignedURL = {
  s3_presigned_url: string
}

const m2SystemFetchS3PresignedURL = async ({
  s3_presigned_url,
}: M2SystemFetchS3PresignedURL) => {
  logger.debug({
    message: 'M2Request: Fetch S3 Presigned Url',
    service: 'M2System',
  })

  const options: AxiosRequestConfig = {
    method: 'get',
    baseURL: s3_presigned_url,
  }

  const result = await axios
    .request(options)
    .catch((err) => {
      logger.warn({
        message: 'M2Request: Error on Fetch S3 Presigned URL',
        error: {
          response: {
            status: err.response.status,
            headers: err.response.headers,
            data: err.response.data,
          },
        },
      })

      throw new ErrorHandler('M2Request: Error on Fetch S3 Presigned URL', err.statusCode)
    })

  return result.data
}

export default m2SystemFetchS3PresignedURL
