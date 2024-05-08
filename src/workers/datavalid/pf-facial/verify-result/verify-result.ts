import { PFFacialBiometryAcceptablePercentageEnum } from '~/models/datavalid/pf-facial/biometry-acceptable-percentage'
import { PFFacialResult } from '~/models/datavalid/pf-facial/result'
import logger from '~/utils/logger'

export type VerifyResultReturn = {
  approved: true
} | {
  approved: false,
  reproved_data: Record<string, any>
}

const verifyResult = (body: PFFacialResult): VerifyResultReturn => {
  logger.debug({
    message: 'Verifying results of pf-facial',
  })
  const reproved_data = new Map()

  if (!body.nome) {
    reproved_data.set('nome', 'reproved')
  }

  if (!body.situacao_cpf) {
    reproved_data.set('situacao_cpf', 'reproved')
  }

  if (!body.cnh_disponivel) {
    reproved_data.set('cnh_disponivel', 'reproved')
  }

  if (!body.cnh.nome) {
    reproved_data.set('cnh.nome', 'reproved')
  }

  if (!body.cnh.numero_registro) {
    reproved_data.set('cnh.numero_registro', 'reproved')
  }

  if (!body.cnh.categoria) {
    reproved_data.set('cnh.categoria', 'reproved')
  }

  if (!body.cnh.codigo_situacao) {
    reproved_data.set('cnh.codigo_situacao', 'reproved')
  }

  if (!body.cnh.possui_impedimento) {
    reproved_data.set('cnh.possui_impedimento', 'reproved')
  }

  if (body.filiacao.nome_mae_similaridade && body.filiacao.nome_mae_similaridade < PFFacialBiometryAcceptablePercentageEnum.PERCENTAGE) {
    reproved_data.set('filiacao.nome_mae_similaridade', 'reproved')
  }

  if (body.filiacao.nome_pai_similaridade && body.filiacao.nome_pai_similaridade < PFFacialBiometryAcceptablePercentageEnum.PERCENTAGE) {
    reproved_data.set('filiacao.nome_pai_similaridade', 'reproved')
  }

  if (!body.documento.numero) {
    reproved_data.set('documento.numero', 'reproved')
  }

  if (!body.documento.tipo) {
    reproved_data.set('documento.tipo', 'reproved')
  }

  if (!body.documento.uf_expedidor) {
    reproved_data.set('documento.uf_expedidor', 'reproved')
  }

  if (body.biometria_face.disponivel) {
    if (body.biometria_face.probabilidade === 'Baixa probabilidade' || body.biometria_face.probabilidade !== 'Baixíssima probabilidade') {
      reproved_data.set('biometria_face.probabilidade', 'reproved')
      reproved_data.set('biometria_face.similaridade', body.biometria_face.similaridade)
    }
  }

  // Keep this part of code. This verify all the results and need to have 100% of accuracy in all information
  // for (const [key, result] of Object.entries(body)) {
  //   if (typeof result === 'boolean' && result !== true) {
  //     reproved_data[key] = 'reproved'
  //   } else if (typeof result === 'number' && result <= PFBasicBiometryAcceptablePercentageEnum.FACE) {
  //     reproved_data[key] = 'reproved'
  //   } else if (typeof result === 'object') {
  //     reproved_data[key] = {}

  //     let reproved_quantity = 0
  //     for (const [specific_key, specific_result] of Object.entries(result)) {
  //       if ((typeof specific_result === 'boolean' && specific_result !== true)) {
  //         if (specific_key === 'possui_impedimento') {
  //           continue
  //         }
  //         reproved_quantity++
  //         reproved_data[key][specific_key] = 'reproved'
  //       } else if (typeof specific_result === 'number' && specific_result <= PFBasicBiometryAcceptablePercentageEnum.FACE) {
  //         reproved_quantity++
  //         reproved_data[key][specific_key] = 'reproved'
  //       }
  //     }

  //     if (reproved_quantity === 0) {
  //       delete reproved_data[key]
  //     }
  //   }
  // }

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
