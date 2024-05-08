import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { PersonAnalysisType } from '~/models/dynamo/requestplus/analysis-person/person-analysis-type'
import { RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import BadRequestError from '~/utils/errors/400-bad-request'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'

import { RequestBiometryPersonBinaryBody } from './main'

export type BiometryFacialParseBodyReturn = {
  company_name?: string,
  facial_image: Buffer,
  facial_image_name: string,
  facial_image_type: string,
  is_existing_person: true,
  person: RequestplusAnalysisPersonKey & {company_name?: string}
} | {
  company_name?: string,
  facial_image: Buffer,
  facial_image_name: string,
  facial_image_type: string,
  is_existing_person: false,
  person: PersonRequestForms
  person_analysis_type: PersonAnalysisType
}

function parseBody (parsed_body: RequestBiometryPersonBinaryBody, user_info: UserFromJwt): BiometryFacialParseBodyReturn {
  const facial_image_name = parsed_body.facial_image.name

  if (!facial_image_name) {
    logger.warn({
      message: 'Field "facial_image" is required',
      parsed_body: {
        ...parsed_body,
        image: !!parsed_body.facial_image,
      },
    })

    throw new BadRequestError('Campo "facial_image" é obrigatório')
  }

  const image_binary_buffer = parsed_body.facial_image.data

  if (image_binary_buffer.byteLength >= 3 * Math.pow(10, 6)) {
    logger.warn({
      message: 'Image sizy is bigger than 3mb',
      parsed_body: {
        ...parsed_body,
        image: !!parsed_body.facial_image,
      },
    })

    throw new BadRequestError('O tamanho da imagem é maior que 3mb')
  }

  const facial_image_type_arr = parsed_body.facial_image.filename?.split('.')

  if (!facial_image_type_arr) {
    logger.warn({
      message: 'Name of image not exist',
      parsed_body: {
        ...parsed_body,
        image: !!parsed_body.facial_image,
      },
    })

    throw new BadRequestError('Nome da imagem não fornecido')
  }

  const facial_image_type = facial_image_type_arr[facial_image_type_arr.length - 1]

  const company_name = parsed_body.company_name?.data.toString()

  const existing_person = parsed_body.existing_person?.data.toString()

  const person = parsed_body.person?.data.toString()

  const person_analysis_type = parsed_body.person_analysis_type?.data.toString()

  if (person && existing_person) {
    logger.warn({
      message: 'Now allowed to have "existent_person" and "person" at the same time',
      parsed_body: {
        ...parsed_body,
        image: !!parsed_body.facial_image,
      },
    })

    throw new BadRequestError('Não é permitido ter "existent_person" e "person" ao mesmo tempo')
  }

  if (existing_person) {
    const person = JSON.parse(existing_person) as RequestplusAnalysisPersonKey

    if (user_info.user_type === UserGroupEnum.ADMIN && !company_name) {
      logger.warn({
        message: '"company_name" is required in "existing_person" request',
        parsed_body: {
          ...parsed_body,
          image: !!parsed_body.facial_image,
        },
      })

      throw new BadRequestError('"company_name" é necessário em requisições de "existing_person"')
    }

    logger.debug({
      message: 'Existent_person path',
      parsed_body: {
        person,
        image: !!parsed_body.facial_image,
      },
    })

    return {
      company_name,
      is_existing_person: true,
      facial_image: image_binary_buffer,
      facial_image_name,
      facial_image_type,
      person,
    }
  }

  if (person) {
    if (!person_analysis_type) {
      logger.warn({
        message: '"person_analysis_type" is required in "person" request',
        parsed_body: {
          ...parsed_body,
        },
      })

      throw new BadRequestError('"person_analysis_type" é necessário em requisições de "person"')
    }

    const json_person = JSON.parse(person) as PersonRequestForms

    const json_person_analysis_type = JSON.parse(person_analysis_type) as PersonAnalysisType

    if (user_info.user_type === UserGroupEnum.ADMIN && !json_person.company_name) {
      logger.warn({
        message: '"company_name" is required inside "person"',
        parsed_body: {
          ...parsed_body,
          image: !!parsed_body.facial_image,
        },
      })

      throw new BadRequestError('"company_name" é necessário dentro de "person"')
    }

    logger.debug({
      message: 'Person path',
      parsed_body: {
        person: json_person,
        person_analysis_type: json_person_analysis_type,
        image: !!parsed_body.facial_image,
      },
    })

    return {
      company_name,
      is_existing_person: false,
      facial_image: image_binary_buffer,
      facial_image_name,
      facial_image_type,
      person: json_person,
      person_analysis_type: json_person_analysis_type,
    }
  }

  logger.warn({
    message: 'There is no information about person',
    parsed_body: {
      ...parsed_body,
      image: !!parsed_body.facial_image,
    },
  })

  throw new BadRequestError('Não há informação de pessoas')
}

export default parseBody
