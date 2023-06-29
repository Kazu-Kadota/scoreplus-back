import { RequestStatusEnum } from 'src/models/dynamo/request-enum'
import { PersonRequest } from 'src/models/dynamo/request-person'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const verifyRequestStatus = (request_person: PersonRequest) => {
  if (request_person.status.general !== RequestStatusEnum.WAITING) {
    logger.debug({
      message: 'Request not authorized to send answer',
      request_id: request_person.request_id,
      person_id: request_person.person_id,
    })

    throw new ErrorHandler('Request not authorized to send answer', 401)
  }
}

export default verifyRequestStatus
