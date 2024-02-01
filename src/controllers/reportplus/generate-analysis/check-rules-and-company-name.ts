import BadRequestError from '~/utils/errors/400-bad-request'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'

export type CheckRulesAndCompanyNameParams = {
  user: UserFromJwt
  company?: string
  query: {
    start_date: string
    final_date: string
  }
}

const checkRulesAndCompanyName = ({
  query,
  user,
  company,
}: CheckRulesAndCompanyNameParams): string => {
  const is_earlier_than_60 = new Date(query.start_date).valueOf() < new Date().valueOf() - 60 * 24 * 60 * 60 * 1000

  if (user.user_type === 'client' && is_earlier_than_60) {
    logger.warn({
      message: 'Requested report more earlier than 60 days',
      ...query,
    })

    throw new BadRequestError('Não é possível gerar relatório com mais de 60 dias')
  }

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
