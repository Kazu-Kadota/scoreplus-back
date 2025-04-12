import axios, { AxiosRequestConfig } from 'axios'

import ErrorHandler from '~/utils/error-handler'
import logger from '~/utils/logger'

export type EagleSystemFetchS3PresignedURL = {
  s3_presigned_url: string
}

const eagleSystemFetchS3PresignedURL = async ({
  s3_presigned_url,
}: EagleSystemFetchS3PresignedURL) => {
  logger.debug({
    message: 'EagleRequest: Fetch S3 Presigned Url',
    service: 'EagleSystem',
  })

  const options: AxiosRequestConfig = {
    method: 'get',
    baseURL: s3_presigned_url,
  }

  const result = await axios
    .request(options)
    .catch((err) => {
      logger.warn({
        message: 'EagleRequest: Error on Fetch S3 Presigned URL',
        error: {
          response: {
            status: err.response.status,
            headers: err.response.headers,
            data: err.response.data,
          },
        },
      })

      throw new ErrorHandler('EagleRequest: Error on Fetch S3 Presigned URL', err.statusCode)
    })

  return result.data
}

export default eagleSystemFetchS3PresignedURL
