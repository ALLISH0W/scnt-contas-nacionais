import { NextResponse } from 'next/server'

interface PopulationData {
  stateId: string
  stateName: string
  stateSigla: string
  value: number
}

// Population data from Censo 2022 (IBGE)
// Source: https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html
const FALLBACK_POPULATION: PopulationData[] = [
  { stateId: '35', stateName: 'São Paulo', stateSigla: 'SP', value: 44411238 },
  { stateId: '33', stateName: 'Rio de Janeiro', stateSigla: 'RJ', value: 16055174 },
  { stateId: '31', stateName: 'Minas Gerais', stateSigla: 'MG', value: 20541694 },
  { stateId: '29', stateName: 'Bahia', stateSigla: 'BA', value: 14141626 },
  { stateId: '41', stateName: 'Paraná', stateSigla: 'PR', value: 11444380 },
  { stateId: '43', stateName: 'Rio Grande do Sul', stateSigla: 'RS', value: 10950762 },
  { stateId: '26', stateName: 'Pernambuco', stateSigla: 'PE', value: 9058155 },
  { stateId: '23', stateName: 'Ceará', stateSigla: 'CE', value: 8175760 },
  { stateId: '15', stateName: 'Pará', stateSigla: 'PA', value: 8121028 },
  { stateId: '52', stateName: 'Goiás', stateSigla: 'GO', value: 6903122 },
  { stateId: '42', stateName: 'Santa Catarina', stateSigla: 'SC', value: 7343349 },
  { stateId: '21', stateName: 'Maranhão', stateSigla: 'MA', value: 6569683 },
  { stateId: '32', stateName: 'Espírito Santo', stateSigla: 'ES', value: 3785126 },
  { stateId: '13', stateName: 'Amazonas', stateSigla: 'AM', value: 3872554 },
  { stateId: '25', stateName: 'Paraíba', stateSigla: 'PB', value: 3765524 },
  { stateId: '51', stateName: 'Mato Grosso', stateSigla: 'MT', value: 3658709 },
  { stateId: '24', stateName: 'Rio Grande do Norte', stateSigla: 'RN', value: 3226800 },
  { stateId: '14', stateName: 'Roraima', stateSigla: 'RR', value: 508462 },
  { stateId: '22', stateName: 'Piauí', stateSigla: 'PI', value: 3195804 },
  { stateId: '50', stateName: 'Mato Grosso do Sul', stateSigla: 'MS', value: 2629254 },
  { stateId: '12', stateName: 'Acre', stateSigla: 'AC', value: 733559 },
  { stateId: '16', stateName: 'Amapá', stateSigla: 'AP', value: 733541 },
  { stateId: '27', stateName: 'Alagoas', stateSigla: 'AL', value: 3121646 },
  { stateId: '17', stateName: 'Tocantins', stateSigla: 'TO', value: 1373016 },
  { stateId: '11', stateName: 'Rondônia', stateSigla: 'RO', value: 1581196 },
  { stateId: '28', stateName: 'Sergipe', stateSigla: 'SE', value: 2219294 },
  { stateId: '53', stateName: 'Distrito Federal', stateSigla: 'DF', value: 2817381 },
]

export async function GET() {
  try {
    const response = await fetch(
      'https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/2022/variaveis/9324?localidades=N3[all]',
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
        const populationData: PopulationData[] = []
        for (const item of data) {
          for (const resultado of item.resultados) {
            for (const serie of resultado.series) {
              const localidade = serie.localidade
              const valueStr = serie.serie['2022']
              if (valueStr && localidade.nivel?.nome === 'Unidade da Federação') {
                populationData.push({
                  stateId: localidade.id,
                  stateName: localidade.nome,
                  stateSigla: STATE_SIGLA_MAP[localidade.nome] || localidade.nome,
                  value: parseInt(valueStr, 10),
                })
              }
            }
          }
        }
        if (populationData.length > 0) {
          populationData.sort((a, b) => b.value - a.value)
          return NextResponse.json(populationData, {
            headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
          })
        }
      }
    }
    // Fallback to hardcoded data
    return NextResponse.json(FALLBACK_POPULATION, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    })
  } catch {
    return NextResponse.json(FALLBACK_POPULATION, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    })
  }
}
