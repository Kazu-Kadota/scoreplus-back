import { PFFacialBiometryBody } from 'src/models/datavalid/pf-facial-biometry/answer'
import { PersonRequestForms } from 'src/models/dynamo/request-person'

const facialBiometryConstructor = (
  data: PersonRequestForms,
): PFFacialBiometryBody => (
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
      biometria_face: {},
    },
  }
)

export default facialBiometryConstructor
