import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { RequestplusFinishedAnalysisPerson } from '~/models/dynamo/requestplus/finished-analysis-person/table'
import { RequestplusFinishedAnalysisVehicle } from '~/models/dynamo/requestplus/finished-analysis-vehicle/table'
import { UserplusUser } from '~/models/dynamo/userplus/user'
import NotFoundError from '~/utils/errors/404-not-found'
import logger from '~/utils/logger'

const verifyCompanyName = (user: UserplusUser, analysis: RequestplusFinishedAnalysisPerson | RequestplusFinishedAnalysisVehicle) => {
  if (user.user_type !== UserGroupEnum.ADMIN
    && user.company_name !== analysis.company_name
  ) {
    logger.warn({
      message: 'Analysis not belong to company',
    })
    throw new NotFoundError('Análise não encontrado')
  }
}

export default verifyCompanyName
