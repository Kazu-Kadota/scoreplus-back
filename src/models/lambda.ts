import { APIGatewayProxyEvent, SQSMessageAttribute, SQSMessageAttributes, SQSRecordAttributes } from 'aws-lambda'

import { UserFromJwt } from '~/utils/extract-jwt-lambda'

export type ReturnResponse<T> = {
  body: T
}

export type Response<T = any> = ReturnResponse<T> & {
  headers?:
  | {
        [header: string]: boolean | number | string;
    }
  | undefined;
  multiValueHeaders?:
  | {
        [header: string]: Array<boolean | number | string>;
    }
  | undefined;
  statusCode?: number
  isBase64Encoded?: boolean | undefined
  notJsonBody?: boolean
}

export type Input = {
  filename?: string;
  name?: string;
  type: string;
  data: Buffer;
};

export type RequestUserInfo<U extends unknown> = U extends true
  ? { user: UserFromJwt}
  : {}

export type Request<U extends unknown = false> = APIGatewayProxyEvent & RequestUserInfo<U>

/**
 * Generic type to lambda using APIGateway
 *
 * @template U - (required) Verify if the lambda needs authentication
 * @template T - (optional) Typing the return of body
 */
export type Controller<U extends unknown, T = any> = (req: Request<U>) => Promise<Response<T>>

export type BinaryRequest<U extends unknown = false> = APIGatewayProxyEvent & RequestUserInfo<U> & {
  parsed_body: unknown
}

/**
 * Generic type to lambda using Form-Data APIGateway
 *
 * @template U - (required) Verify if the lambda needs authentication
 * @template T - (optional) Typing the return of body
 */
export type BinaryController<U extends unknown, T = any> = (req: BinaryRequest<U>) => Promise<Response<T>>

export type SQSControllerMessageAttributes = {
  origin: SQSMessageAttribute,
  requestId: SQSMessageAttribute,
}

export type SQSControllerMessage<T = SQSMessageAttributes> = {
  attributes: SQSRecordAttributes
  body: unknown
  message_attributes: T & SQSControllerMessageAttributes
  message_id: string
}

export type SQSControllerResponse = {
  success: true,
  statusCode: 200,
} | {
  success: false,
  statusCode: number,
  error: any,
}

export type SQSController<T = SQSMessageAttributes> = (message: SQSControllerMessage<T>) => Promise<SQSControllerResponse>
