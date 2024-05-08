import { PFFacialCDVResult } from '~/models/datavalid/pf-facial-cdv/result'
import logger from '~/utils/logger'

export type VerifyResultReturn = {
  approved: true
} | {
  approved: false,
  reproved_data: Record<string, any>
}

const verifyResult = (body: PFFacialCDVResult): VerifyResultReturn => {
  logger.debug({
    message: 'Verifying results of pf-facial-cdv',
  })
  const reproved_data = new Map()

  if (!body.cnh.numero_registro) {
    reproved_data.set('cnh.numero_registro', {
      validation: 'reproved',
      ocr: body.cnh.numero_registro_ocr,
    })
  }

  if (!body.cnh.nome) {
    reproved_data.set('cnh.nome', {
      validation: 'reproved',
      ocr: body.cnh.nome_ocr,
    })
  }

  if (!body.cnh.identidade) {
    reproved_data.set('cnh.identidade', {
      validation: 'reproved',
      ocr: body.cnh.identidade_ocr,
    })
  }

  if (!body.cnh.data_nascimento) {
    reproved_data.set('cnh.data_nascimento', {
      validation: 'reproved',
      ocr: body.cnh.data_nascimento_ocr,
    })
  }

  if (!body.cnh.data_primeira_habilitacao) {
    reproved_data.set('cnh.data_primeira_habilitacao', {
      validation: 'reproved',
      ocr: body.cnh.data_primeira_habilitacao_ocr,
    })
  }

  if (!body.cnh.data_ultima_emissao) {
    reproved_data.set('cnh.data_ultima_emissao', {
      validation: 'reproved',
      ocr: body.cnh.data_ultima_emissao_ocr,
    })
  }

  if (!body.cnh.data_validade) {
    reproved_data.set('cnh.data_validade', {
      validation: 'reproved',
      ocr: body.cnh.data_validade_ocr,
    })
  }

  if (!body.cnh.retrato.disponivel) {
    if (body.cnh.retrato.probabilidade === 'Baixa probabilidade' || body.cnh.retrato.probabilidade !== 'Baixíssima probabilidade') {
      reproved_data.set('cnh.retrato.probabilidade', {
        validation: 'reproved',
        ocr: body.cnh.retrato.similaridade,
      })
    }
  }

  if (!body.biometria_face.disponivel) {
    if (body.biometria_face.probabilidade === 'Baixa probabilidade' || body.biometria_face.probabilidade !== 'Baixíssima probabilidade') {
      reproved_data.set('biometria_face.probabilidade', {
        validation: 'reproved',
        ocr: body.biometria_face.similaridade,
      })
    }
  }

  if (reproved_data.size !== 0) {
    return {
      approved: false,
      reproved_data: Object.fromEntries(reproved_data),
    }
  }

  return {
    approved: true,
  }
}

export default verifyResult
