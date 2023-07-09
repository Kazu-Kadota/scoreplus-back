import { Company } from 'src/models/dynamo/company'
import { User } from 'src/models/dynamo/user'

import PdfLayout from '../pdf-components/pdf-layout'

import { PdfPersonRequest } from './format-person-analysis'

export interface PersonPdfData {
  company: Company;
  user: User;
  verification_code: string;
  person_analysis: PdfPersonRequest
}

const generatePersonPdf = async ({
  company,
  user,
  person_analysis,
  verification_code,
}: PersonPdfData) => {
  const pdf = PdfLayout({
    header: { title: 'Análise de Liberação de Pessoa' },
    infoBox: {
      title: 'Solicitante',
      values: [
        { label: 'Razão social', text: company.name },
        { label: 'CNPJ', text: company.cnpj },
        { label: 'E-mail do usuário', text: user.email },
      ],
    },
    analysisBoxes: [{
      title: 'Dados da Pessoa',
      items: [{
        finished_at: person_analysis.finished_at,
        validity: person_analysis.validity,
        analysis_result: person_analysis.analysis_result,
        values: [
          { label: 'Nome', text: person_analysis.name },
          { label: 'CPF', text: person_analysis.document },
          { label: 'RG', text: person_analysis.rg },
          { label: 'Vínculo', text: person_analysis.analysis_config_string ?? '' },
        ],
      }],
    }],
    verification_code,
  })

  return pdf.asBuffer()
}

export default generatePersonPdf
