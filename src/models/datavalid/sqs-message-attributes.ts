import { MessageAttributeValue } from '@aws-sdk/client-sns'
import { SQSMessageAttribute } from 'aws-lambda'

export enum DatavalidSQSMessageAttributesKeys {
  PERSON_ID = 'person_id',
  REQUEST_ID = 'request_id',
}

export type DatavalidSQSSendMessageAttributes = {
  [Key in DatavalidSQSMessageAttributesKeys]: MessageAttributeValue
}

export type DatavalidSQSReceivedMessageAttributes = {
  [Key in DatavalidSQSMessageAttributesKeys]: SQSMessageAttribute
}
