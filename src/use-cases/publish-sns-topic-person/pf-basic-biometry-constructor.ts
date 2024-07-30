import { PFBasicBiometryBody } from '~/models/datavalid/pf-basic/request-body'
import { PersonRequestForms } from '~/models/dynamo/requestplus/analysis-person/forms'

export type PfBasicBiometryConstructorParams = PersonRequestForms

const pfBasicBiometryConstructor = (
  data: PfBasicBiometryConstructorParams,
): PFBasicBiometryBody => (
  {
    key: {
      cpf: data.document.replace(/[.-]/g, ''),
    },
    answer: {
      nome: data.name,
      data_nascimento: data.birth_date.split('T')[0],
      situacao_cpf: 'regular',
      cnh: {
        numero_registro: data.cnh,
        categoria: data.category_cnh,
        codigo_situacao: '3',
        possui_impedimento: false,
      },
      filiacao: {
        nome_mae: data.mother_name,
        nome_pai: data.father_name,
      },
      documento: {
        numero: data.rg,
        tipo: 1,
        uf_expedidor: data.state_rg,
      },
      endereco: {},
    },
  }
)

export default pfBasicBiometryConstructor
