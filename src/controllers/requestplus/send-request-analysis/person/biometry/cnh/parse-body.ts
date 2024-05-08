import { PFFacialCDVImagesAnswerEnum } from '~/models/datavalid/pf-facial-cdv/request-body'
import { UserGroupEnum } from '~/models/dynamo/enums/user'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'
import { PersonAnalysisType } from '~/models/dynamo/requestplus/analysis-person/person-analysis-type'
import { RequestplusAnalysisPersonKey } from '~/models/dynamo/requestplus/analysis-person/table'
import BadRequestError from '~/utils/errors/400-bad-request'
import { UserFromJwt } from '~/utils/extract-jwt-lambda'
import logger from '~/utils/logger'

import { RequestBiometryPersonBinaryBody } from './main'

export type BiometryCnhParseBodyImage = {
  image: Buffer
  image_name: string
  image_type: string
}

export type BiometryCnhParseBodyImages = {
  document: BiometryCnhParseBodyImage
  document_back?: BiometryCnhParseBodyImage
  facial?: BiometryCnhParseBodyImage
}

export type BiometryCnhParseBodyReturn = BiometryCnhParseBodyImages & {
  company_name?: string,
  images: Array<PFFacialCDVImagesAnswerEnum>,
  is_existing_person: true,
  person: RequestplusAnalysisPersonKey & {company_name?: string},
} | BiometryCnhParseBodyImages & {
  company_name?: string,
  images: Array<PFFacialCDVImagesAnswerEnum>,
  is_existing_person: false,
  person: PersonRequestForms,
  person_analysis_type: PersonAnalysisType
}

function parseBody (parsed_body: RequestBiometryPersonBinaryBody, user_info: UserFromJwt): BiometryCnhParseBodyReturn {
  const images: Array<PFFacialCDVImagesAnswerEnum> = []
  const document_image_name = parsed_body.document_image.name

  if (!document_image_name) {
    logger.warn({
      message: 'Field "document_image" is required',
      parsed_body: {
        ...parsed_body,
        document_image: !!parsed_body.document_image,
        document_back_image: !!parsed_body.document_back_image,
        facial_image: !!parsed_body.facial_image,
      },
    })

    throw new BadRequestError('Campo "document_image" é obrigatório')
  }

  const document_image_binary_buffer = parsed_body.document_image.data

  if (document_image_binary_buffer.byteLength >= 3 * Math.pow(10, 6)) {
    logger.warn({
      message: 'Image sizy is bigger than 3mb',
      parsed_body: {
        ...parsed_body,
        document_image: !!parsed_body.document_image,
        document_back_image: !!parsed_body.document_back_image,
        facial_image: !!parsed_body.facial_image,
      },
    })

    throw new BadRequestError('O tamanho da imagem é maior que 3mb')
  }

  const document_image_type_arr = parsed_body.document_image.filename?.split('.')

  if (!document_image_type_arr) {
    logger.warn({
      message: 'Name of document image not exist',
      parsed_body: {
        ...parsed_body,
        document_image: !!parsed_body.document_image,
        document_back_image: !!parsed_body.document_back_image,
        facial_image: !!parsed_body.facial_image,
      },
    })

    throw new BadRequestError('Nome da imagem do "document" não fornecido')
  }

  const document_image_type = document_image_type_arr[document_image_type_arr.length - 1]

  const document: BiometryCnhParseBodyImage = {
    image: document_image_binary_buffer,
    image_name: document_image_name,
    image_type: document_image_type,
  }

  images.push(PFFacialCDVImagesAnswerEnum.DOCUMENT)

  let document_back: BiometryCnhParseBodyImage = {} as BiometryCnhParseBodyImage

  if (parsed_body.document_back_image) {
    const document_back_image_name = parsed_body.document_back_image.name

    if (!document_back_image_name) {
      logger.warn({
        message: 'Field "document_back_image" sent and there is no name itself',
        parsed_body: {
          ...parsed_body,
          document_image: !!parsed_body.document_image,
          document_back_image: !!parsed_body.document_back_image,
          facial_image: !!parsed_body.facial_image,
        },
      })

      throw new BadRequestError('Campo "document_back_image" fornecido e não há nenhum nome nela')
    }

    const document_back_image_binary_buffer = parsed_body.document_back_image.data

    if (document_back_image_binary_buffer.byteLength >= 3 * Math.pow(10, 6)) {
      logger.warn({
        message: 'Image sizy is bigger than 3mb',
        parsed_body: {
          ...parsed_body,
          document_image: !!parsed_body.document_image,
          document_back_image: !!parsed_body.document_back_image,
          facial_image: !!parsed_body.facial_image,
        },
      })

      throw new BadRequestError('O tamanho da imagem é maior que 3mb')
    }

    const document_back_image_type_arr = parsed_body.document_back_image.filename?.split('.')

    if (!document_back_image_type_arr) {
      logger.warn({
        message: 'Name of document back image not exist',
        parsed_body: {
          ...parsed_body,
          document_image: !!parsed_body.document_image,
          document_back_image: !!parsed_body.document_back_image,
          facial_image: !!parsed_body.facial_image,
        },
      })

      throw new BadRequestError('Nome da imagem do "document_back" não fornecido')
    }

    const document_back_image_type = document_back_image_type_arr[document_back_image_type_arr.length - 1]

    document_back = {
      image: document_back_image_binary_buffer,
      image_name: document_back_image_name,
      image_type: document_back_image_type,
    }

    images.push(PFFacialCDVImagesAnswerEnum.DOCUMENT_BACK)
  }

  let facial: BiometryCnhParseBodyImage = {} as BiometryCnhParseBodyImage

  if (parsed_body.facial_image) {
    const facial_image_name = parsed_body.facial_image.name

    if (!facial_image_name) {
      logger.warn({
        message: 'Field "facial_image" sent and there is no name itself',
        parsed_body: {
          ...parsed_body,
          document_image: !!parsed_body.document_image,
          document_back_image: !!parsed_body.document_back_image,
          facial_image: !!parsed_body.facial_image,
        },
      })

      throw new BadRequestError('Campo "facial_image" fornecido e não há nenhum nome nela')
    }

    const facial_image_binary_buffer = parsed_body.facial_image.data

    if (facial_image_binary_buffer.byteLength >= 3 * Math.pow(10, 6)) {
      logger.warn({
        message: 'Image sizy is bigger than 3mb',
        parsed_body: {
          ...parsed_body,
          document_image: !!parsed_body.document_image,
          document_back_image: !!parsed_body.document_back_image,
          facial_image: !!parsed_body.facial_image,
        },
      })

      throw new BadRequestError('O tamanho da imagem é maior que 3mb')
    }

    const facial_image_type_arr = parsed_body.facial_image.filename?.split('.')

    if (!facial_image_type_arr) {
      logger.warn({
        message: 'Name of document back image not exist',
        parsed_body: {
          ...parsed_body,
          document_image: !!parsed_body.document_image,
          document_back_image: !!parsed_body.document_back_image,
          facial_image: !!parsed_body.facial_image,
        },
      })

      throw new BadRequestError('Nome da imagem do "facial" não fornecido')
    }

    const facial_image_type = facial_image_type_arr[facial_image_type_arr.length - 1]

    facial = {
      image: facial_image_binary_buffer,
      image_name: facial_image_name,
      image_type: facial_image_type,
    }

    images.push(PFFacialCDVImagesAnswerEnum.FACIAL)
  }

  const company_name = parsed_body.company_name?.data.toString()

  const existing_person = parsed_body.existing_person?.data.toString()

  const person = parsed_body.person?.data.toString()

  const person_analysis_type = parsed_body.person_analysis_type?.data.toString()

  if (person && existing_person) {
    logger.warn({
      message: 'Now allowed to have "existent_person" and "person" at the same time',
      parsed_body: {
        ...parsed_body,
        document_image: !!parsed_body.document_image,
        document_back_image: !!parsed_body.document_back_image,
        facial_image: !!parsed_body.facial_image,
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
          document_image: !!parsed_body.document_image,
          document_back_image: !!parsed_body.document_back_image,
          facial_image: !!parsed_body.facial_image,
        },
      })

      throw new BadRequestError('"company_name" é necessário em requisições de "existing_person"')
    }

    logger.debug({
      message: 'Existent_person path',
      parsed_body: {
        person,
        document_image: !!parsed_body.document_image,
        document_back_image: !!parsed_body.document_back_image,
        facial_image: !!parsed_body.facial_image,
      },
    })

    return {
      company_name,
      images,
      document,
      document_back,
      facial,
      is_existing_person: true,
      person,
    }
  }

  if (person) {
    if (!person_analysis_type) {
      logger.warn({
        message: '"person_analysis_type" is required in "person" request',
        parsed_body: {
          document_image: !!parsed_body.document_image,
          document_back_image: !!parsed_body.document_back_image,
          facial_image: !!parsed_body.facial_image,
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
          document_image: !!parsed_body.document_image,
          document_back_image: !!parsed_body.document_back_image,
          facial_image: !!parsed_body.facial_image,
        },
      })

      throw new BadRequestError('"company_name" é necessário dentro de "person"')
    }

    logger.debug({
      message: 'Person path',
      parsed_body: {
        person: json_person,
        person_analysis_type: json_person_analysis_type,
        document_image: !!parsed_body.document_image,
        document_back_image: !!parsed_body.document_back_image,
        facial_image: !!parsed_body.facial_image,
      },
    })

    return {
      company_name,
      images,
      document,
      document_back,
      facial,
      is_existing_person: false,
      person: json_person,
      person_analysis_type: json_person_analysis_type,
    }
  }

  logger.warn({
    message: 'There is no information about person',
    parsed_body: {
      ...parsed_body,
      document_image: !!parsed_body.document_image,
      document_back_image: !!parsed_body.document_back_image,
      facial_image: !!parsed_body.facial_image,
    },
  })

  throw new BadRequestError('Não há informação de pessoas')
}

export default parseBody
