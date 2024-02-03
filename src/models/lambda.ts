import { APIGatewayProxyEvent } from 'aws-lambda'
import { UserFromJwt } from 'src/utils/extract-jwt-lambda'

export interface ReturnResponse<T> {
  body: T
}

export interface Response<T = any> extends ReturnResponse<T> {
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
