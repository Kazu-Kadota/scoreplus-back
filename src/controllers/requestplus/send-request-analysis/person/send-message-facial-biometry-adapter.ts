import { SQSClient } from '@aws-sdk/client-sqs'

import { PersonRequestForms } from 'src/models/dynamo/request-person'
import sendMessage, { sendMessageParams } from 'src/services/aws/sqs/datavalid/facial/send'
import removeEmpty from 'src/utils/remove-empty'

import facialBiometryConstructor from './facial-biometry-constructor'

export interface SendMessageFacialBiometryAdapterParams {
  data: PersonRequestForms,
  person_id: string,
  request_ids: string[]
}

const sendMessageFacialBiometryAdapter = async ({
  data,
  person_id,
  request_ids,
}: SendMessageFacialBiometryAdapterParams,
sqsClient: SQSClient,
) => {
  const facial_biometry_constructor = removeEmpty(facialBiometryConstructor(data))

  const send_message_params: sendMessageParams = {
    message: JSON.stringify(facial_biometry_constructor),
    message_attributes: {
      origin: {
        DataType: 'String',
        StringValue: 'scoreplus',
      },
      person_id: {
        DataType: 'String',
        StringValue: person_id,
      },
      request_ids: {
        DataType: 'String',
        StringValue: request_ids.toString(),
      },
    },
    message_group_id: person_id,
  }

  await sendMessage(send_message_params, sqsClient)
}

export default sendMessageFacialBiometryAdapter
