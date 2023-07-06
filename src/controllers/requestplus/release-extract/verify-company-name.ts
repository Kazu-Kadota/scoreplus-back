import { PersonRequest } from 'src/models/dynamo/request-person'
import { VehicleRequest } from 'src/models/dynamo/request-vehicle'
import { User, UserGroupEnum } from 'src/models/dynamo/user'
import ErrorHandler from 'src/utils/error-handler'
import logger from 'src/utils/logger'

const verifyCompanyName = (user: User, analysis: PersonRequest | VehicleRequest) => {
  if (user.user_type !== UserGroupEnum.ADMIN
    && user.company_name !== analysis.company_name
  ) {
    logger.warn({
      message: 'Analysis not belong to company',
    })
    throw new ErrorHandler('Analysis not found', 404)
  }
}

export default verifyCompanyName
