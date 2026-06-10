import { NextResponse } from 'next/server'

interface PIBData {
  stateId: string
  stateName: string
  stateSigla: string
  value: number // in thousands of BRL
}

// GDP (PIB) data from 2021 (IBGE)
// Source: https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais/9088-produto-interno-bruto-dos-municipios.html
// Values in thousands of BRL
const FALLBACK_PIB: PIBData[] = [
  { stateId: '35', stateName: 'São Paulo', stateSigla: 'SP', value: 2348491000 },
  { stateId: '33', stateName: 'Rio de Janeiro', stateSigla: 'RJ', value: 779682000 },
  { stateId: '31', stateName: 'Minas Gerais', stateSigla: 'MG', value: 682844000 },
  { stateId: '41', stateName: 'Paraná', stateSigla: 'PR', value: 487936000 },
  { stateId: '53', stateName: 'Distrito Federal', stateSigla: 'DF', value: 278447000 },
  { stateId: '43', stateName: 'Rio Grande do Sul', stateSigla: 'RS', value: 432309000 },
  { stateId: '29', stateName: 'Bahia', stateSigla: 'BA', value: 305363000 },
  { stateId: '42', stateName: 'Santa Catarina', stateSigla: 'SC', value: 349327000 },
  { stateId: '52', stateName: 'Goiás', stateSigla: 'GO', value: 224268000 },
  { stateId: '15', stateName: 'Pará', stateSigla: 'PA', value: 195349000 },
  { stateId: '26', stateName: 'Pernambuco', stateSigla: 'PE', value: 193955000 },
  { stateId: '51', stateName: 'Mato Grosso', stateSigla: 'MT', value: 189237000 },
  { stateId: '23', stateName: 'Ceará', stateSigla: 'CE', value: 166757000 },
  { stateId: '32', stateName: 'Espírito Santo', stateSigla: 'ES', value: 160758000 },
  { stateId: '50', stateName: 'Mato Grosso do Sul', stateSigla: 'MS', value: 122232000 },
  { stateId: '14', stateName: 'Roraima', stateSigla: 'RR', value: 18288000 },
  { stateId: '21', stateName: 'Maranhão', stateSigla: 'MA', value: 106338000 },
  { stateId: '13', stateName: 'Amazonas', stateSigla: 'AM', value: 118036000 },
  { stateId: '17', stateName: 'Tocantins', stateSigla: 'TO', value: 50585000 },
  { stateId: '12', stateName: 'Acre', stateSigla: 'AC', value: 17249000 },
  { stateId: '25', stateName: 'Paraíba', stateSigla: 'PB', value: 65225000 },
  { stateId: '16', stateName: 'Amapá', stateSigla: 'AP', value: 20046000 },
  { stateId: '24', stateName: 'Rio Grande do Norte', stateSigla: 'RN', value: 71589000 },
  { stateId: '22', stateName: 'Piauí', stateSigla: 'PI', value: 56521000 },
  { stateId: '27', stateName: 'Alagoas', stateSigla: 'AL', value: 61001000 },
  { stateId: '28', stateName: 'Sergipe', stateSigla: 'SE', value: 44718000 },
  { stateId: '11', stateName: 'Rondônia', stateSigla: 'RO', value: 52605000 },
]

export async function GET() {
  try {
    const response = await fetch(
      'https://servicodados.ibge.gov.br/api/v3/agregados/5938/periodos/2021/variaveis/37?localidades=N3[all]',
      {
        next: { revalidate: 86400 },
        headers: { 'Accept': 'application/json' },
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0 && data[0].resultados) {
        const STATE_SIGLA_MAP: Record<string, string> = {
          'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
          'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
          'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
          'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
          'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
          'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
          'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO',
        }
        const pibData: PIBData[] = []
        for (const item of data) {
          for (const resultado of item.resultados) {
            for (const serie of resultado.series) {
              const localidade = serie.localidade
              const valueStr = serie.serie['2021']
              if (valueStr && localidade.nivel?.nome === 'Unidade da Federação') {
                pibData.push({
                  stateId: localidade.id,
                  stateName: localidade.nome,
                  stateSigla: STATE_SIGLA_MAP[localidade.nome] || localidade.nome,
                  value: parseInt(valueStr, 10),
                })
              }
            }
          }
        }
        if (pibData.length > 0) {
          pibData.sort((a, b) => b.value - a.value)
          return NextResponse.json(pibData, {
            headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
          })
        }
      }
    }
    // Fallback to hardcoded data
    return NextResponse.json(FALLBACK_PIB, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    })
  } catch {
    return NextResponse.json(FALLBACK_PIB, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    })
  }
}
