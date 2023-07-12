import { Company } from 'src/models/dynamo/company'

import { User } from 'src/models/dynamo/user'

import PdfLayout from '../pdf-components/pdf-layout'

import { PdfVehicleRequest } from './format-vehicle-analysis'

export interface VehiclePdfData {
  company: Company;
  user: User;
  verification_code: string;
  vehicle_analysis: PdfVehicleRequest
}

const generateVehiclePdf = async ({
  company,
  user,
  vehicle_analysis,
  verification_code,
}: VehiclePdfData) => {
  const pdf = PdfLayout({
    header: { title: 'Análise de Liberação de Frota' },
    infoBox: {
      title: 'Solicitante',
      values: [
        { label: 'Razão social', text: company.name },
        { label: 'CNPJ', text: company.cnpj },
        { label: 'E-mail do usuário', text: user.email },
      ],
    },
    analysisBoxes: [{
      title: 'Dados da Frota',
      items: [{
        finished_at: vehicle_analysis.finished_at,
        validity: vehicle_analysis.validity,
        analysis_result: vehicle_analysis.analysis_result,
        values: [
          { label: 'Placa', text: vehicle_analysis.plate },
          { label: 'CPF/CNPJ', text: vehicle_analysis.owner_document },
          { label: 'Proprietário/Arrendatário', text: vehicle_analysis.owner_name },
          { label: 'Vínculo', text: vehicle_analysis.analysis_config_string ?? '' },
        ],
      }],
    }],
    verification_code,
  })

  return pdf.asBuffer()
}

export default generateVehiclePdf
