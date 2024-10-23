import BadRequestError from '~/utils/errors/400-bad-request'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'

export type CheckRulesAndCompanyNameParams = {
  user: UserFromJwt
  company?: string
}

const checkRulesAndCompanyName = ({
  user,
  company,
}: CheckRulesAndCompanyNameParams): string => {
  let company_name: string

  if (user.user_type === 'admin') {
    if (!company) {
      logger.warn({
        message: 'Is necessary inform company to generate report',
      })

      throw new BadRequestError('É necessário informar a empresa para gerar relatório')
    }
    company_name = company
  } else {
    company_name = user.company_name
  }

  return company_name
}

export default checkRulesAndCompanyName
