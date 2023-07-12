import { Company } from 'src/models/dynamo/company'

import { User } from 'src/models/dynamo/user'

import PdfLayout from '../pdf-components/pdf-layout'

import { PdfPersonRequest } from '../person/format-person-analysis'
import { PdfVehicleRequest } from '../vehicle/format-vehicle-analysis'

export interface ComboPdfData {
  company: Company;
  user: User;
  verification_code: string;
  person_analysis: PdfPersonRequest
  vehicles_analysis: PdfVehicleRequest[]
}

const generateComboPdf = async ({
  company,
  user,
  person_analysis,
  vehicles_analysis,
  verification_code,
}: ComboPdfData) => {
  const pdf = PdfLayout({
    header: { title: 'Análise de Liberação Combo' },
    infoBox: {
      title: 'Solicitante',
      values: [
        { label: 'Razão social', text: company.name },
        { label: 'CNPJ', text: company.cnpj },
        { label: 'E-mail do usuário', text: user.email },
      ],
    },
    analysisBoxes: [
      {
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
      },
      {
        title: 'Dados da Frota',
        items: vehicles_analysis.map(analysis => ({
          finished_at: analysis.finished_at,
          validity: analysis.validity,
          analysis_result: analysis.analysis_result,
          values: [
            { label: 'Placa', text: analysis.plate },
            { label: 'CPF/CNPJ', text: analysis.owner_document },
            { label: 'Proprietário/Arrendatário', text: analysis.owner_name },
            { label: 'Vínculo', text: analysis.analysis_config_string ?? '' },
          ],
        })),
      },
    ],
    verification_code,
  })

  return pdf.asBuffer()
}

export default generateComboPdf
