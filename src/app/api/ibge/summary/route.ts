import { NextResponse } from 'next/server'

interface PopulationEntry {
  stateId: string
  stateName: string
  stateSigla: string
  value: number
}

interface PIBEntry {
  stateId: string
  stateName: string
  stateSigla: string
  value: number
}

interface GDPPerCapitaEntry {
  stateId: string
  stateName: string
  stateSigla: string
  population: number
  gdp: number
  gdpPerCapita: number
}

interface SummaryInsights {
  totalPopulation: number
  totalGDP: number
  overallGDPPerCapita: number
  mostPopulousState: PopulationEntry | null
  leastPopulousState: PopulationEntry | null
  highestGDPState: PIBEntry | null
  lowestGDPState: PIBEntry | null
  top5GDPPerCapita: GDPPerCapitaEntry[]
  bottom5GDPPerCapita: GDPPerCapitaEntry[]
  populationConcentration: {
    top5States: PopulationEntry[]
    top5Percentage: number
  }
  gdpConcentration: {
    top5States: PIBEntry[]
    top5Percentage: number
  }
  regionalInsights: string[]
}

// Hardcoded data (same as population and PIB routes)
const POPULATION_DATA: PopulationEntry[] = [
  { stateId: '35', stateName: 'São Paulo', stateSigla: 'SP', value: 44411238 },
  { stateId: '31', stateName: 'Minas Gerais', stateSigla: 'MG', value: 20541694 },
  { stateId: '33', stateName: 'Rio de Janeiro', stateSigla: 'RJ', value: 16055174 },
  { stateId: '29', stateName: 'Bahia', stateSigla: 'BA', value: 14141626 },
  { stateId: '41', stateName: 'Paraná', stateSigla: 'PR', value: 11444380 },
  { stateId: '43', stateName: 'Rio Grande do Sul', stateSigla: 'RS', value: 10950762 },
  { stateId: '26', stateName: 'Pernambuco', stateSigla: 'PE', value: 9058155 },
  { stateId: '23', stateName: 'Ceará', stateSigla: 'CE', value: 8175760 },
  { stateId: '15', stateName: 'Pará', stateSigla: 'PA', value: 8121028 },
  { stateId: '42', stateName: 'Santa Catarina', stateSigla: 'SC', value: 7343349 },
  { stateId: '21', stateName: 'Maranhão', stateSigla: 'MA', value: 6569683 },
  { stateId: '13', stateName: 'Amazonas', stateSigla: 'AM', value: 3872554 },
  { stateId: '32', stateName: 'Espírito Santo', stateSigla: 'ES', value: 3785126 },
  { stateId: '25', stateName: 'Paraíba', stateSigla: 'PB', value: 3765524 },
  { stateId: '51', stateName: 'Mato Grosso', stateSigla: 'MT', value: 3658709 },
  { stateId: '24', stateName: 'Rio Grande do Norte', stateSigla: 'RN', value: 3226800 },
  { stateId: '22', stateName: 'Piauí', stateSigla: 'PI', value: 3195804 },
  { stateId: '27', stateName: 'Alagoas', stateSigla: 'AL', value: 3121646 },
  { stateId: '53', stateName: 'Distrito Federal', stateSigla: 'DF', value: 2817381 },
  { stateId: '50', stateName: 'Mato Grosso do Sul', stateSigla: 'MS', value: 2629254 },
  { stateId: '17', stateName: 'Tocantins', stateSigla: 'TO', value: 1373016 },
  { stateId: '11', stateName: 'Rondônia', stateSigla: 'RO', value: 1581196 },
  { stateId: '28', stateName: 'Sergipe', stateSigla: 'SE', value: 2219294 },
  { stateId: '12', stateName: 'Acre', stateSigla: 'AC', value: 733559 },
  { stateId: '16', stateName: 'Amapá', stateSigla: 'AP', value: 733541 },
  { stateId: '14', stateName: 'Roraima', stateSigla: 'RR', value: 508462 },
].sort((a, b) => b.value - a.value)

const PIB_DATA: PIBEntry[] = [
  { stateId: '35', stateName: 'São Paulo', stateSigla: 'SP', value: 2348491000 },
  { stateId: '33', stateName: 'Rio de Janeiro', stateSigla: 'RJ', value: 779682000 },
  { stateId: '31', stateName: 'Minas Gerais', stateSigla: 'MG', value: 682844000 },
  { stateId: '41', stateName: 'Paraná', stateSigla: 'PR', value: 487936000 },
  { stateId: '43', stateName: 'Rio Grande do Sul', stateSigla: 'RS', value: 432309000 },
  { stateId: '29', stateName: 'Bahia', stateSigla: 'BA', value: 305363000 },
  { stateId: '42', stateName: 'Santa Catarina', stateSigla: 'SC', value: 349327000 },
  { stateId: '53', stateName: 'Distrito Federal', stateSigla: 'DF', value: 278447000 },
  { stateId: '52', stateName: 'Goiás', stateSigla: 'GO', value: 224268000 },
  { stateId: '15', stateName: 'Pará', stateSigla: 'PA', value: 195349000 },
  { stateId: '26', stateName: 'Pernambuco', stateSigla: 'PE', value: 193955000 },
  { stateId: '51', stateName: 'Mato Grosso', stateSigla: 'MT', value: 189237000 },
  { stateId: '23', stateName: 'Ceará', stateSigla: 'CE', value: 166757000 },
  { stateId: '32', stateName: 'Espírito Santo', stateSigla: 'ES', value: 160758000 },
  { stateId: '50', stateName: 'Mato Grosso do Sul', stateSigla: 'MS', value: 122232000 },
  { stateId: '13', stateName: 'Amazonas', stateSigla: 'AM', value: 118036000 },
  { stateId: '21', stateName: 'Maranhão', stateSigla: 'MA', value: 106338000 },
  { stateId: '25', stateName: 'Paraíba', stateSigla: 'PB', value: 65225000 },
  { stateId: '24', stateName: 'Rio Grande do Norte', stateSigla: 'RN', value: 71589000 },
  { stateId: '27', stateName: 'Alagoas', stateSigla: 'AL', value: 61001000 },
  { stateId: '22', stateName: 'Piauí', stateSigla: 'PI', value: 56521000 },
  { stateId: '11', stateName: 'Rondônia', stateSigla: 'RO', value: 52605000 },
  { stateId: '17', stateName: 'Tocantins', stateSigla: 'TO', value: 50585000 },
  { stateId: '28', stateName: 'Sergipe', stateSigla: 'SE', value: 44718000 },
  { stateId: '16', stateName: 'Amapá', stateSigla: 'AP', value: 20046000 },
  { stateId: '14', stateName: 'Roraima', stateSigla: 'RR', value: 18288000 },
  { stateId: '12', stateName: 'Acre', stateSigla: 'AC', value: 17249000 },
].sort((a, b) => b.value - a.value)

const REGIONS: Record<string, string[]> = {
  'Norte': ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
  'Nordeste': ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Sudeste': ['ES', 'MG', 'RJ', 'SP'],
  'Sul': ['PR', 'RS', 'SC'],
  'Centro-Oeste': ['DF', 'GO', 'MS', 'MT'],
}

function generateRegionalInsights(
  population: PopulationEntry[],
  pib: PIBEntry[],
  gdpPerCapita: GDPPerCapitaEntry[]
): string[] {
  const insights: string[] = []

  const regionPopulation: Record<string, number> = {}
  const regionGDP: Record<string, number> = {}

  for (const [region, siglas] of Object.entries(REGIONS)) {
    for (const entry of population) {
      if (siglas.includes(entry.stateSigla)) {
        regionPopulation[region] = (regionPopulation[region] || 0) + entry.value
      }
    }
    for (const entry of pib) {
      if (siglas.includes(entry.stateSigla)) {
        regionGDP[region] = (regionGDP[region] || 0) + entry.value
      }
    }
  }

  const totalPop = population.reduce((sum, e) => sum + e.value, 0)
  const totalGDP = pib.reduce((sum, e) => sum + e.value, 0)

  const regionPopEntries = Object.entries(regionPopulation).sort(([, a], [, b]) => b - a)
  const mostPopulousRegion = regionPopEntries[0]
  const leastPopulousRegion = regionPopEntries[regionPopEntries.length - 1]

  if (mostPopulousRegion) {
    insights.push(
      `A região ${mostPopulousRegion[0]} é a mais populosa com ${((mostPopulousRegion[1] / totalPop) * 100).toFixed(1)}% da população brasileira.`
    )
  }
  if (leastPopulousRegion) {
    insights.push(
      `A região ${leastPopulousRegion[0]} é a menos populosa com ${((leastPopulousRegion[1] / totalPop) * 100).toFixed(1)}% da população.`
    )
  }

  if (gdpPerCapita.length > 0) {
    const highest = gdpPerCapita[0]
    const lowest = gdpPerCapita[gdpPerCapita.length - 1]
    const ratio = highest.gdpPerCapita / lowest.gdpPerCapita
    insights.push(
      `O estado com maior PIB per capita (${highest.stateSigla} - R$ ${highest.gdpPerCapita.toFixed(0)}) tem ${ratio.toFixed(1)}x o PIB per capita do estado com menor (${lowest.stateSigla} - R$ ${lowest.gdpPerCapita.toFixed(0)}).`
    )
  }

  const sePopulation = regionPopulation['Sudeste'] || 0
  const seGDP = regionGDP['Sudeste'] || 0
  insights.push(
    `O Sudeste concentra ${((sePopulation / totalPop) * 100).toFixed(1)}% da população e ${((seGDP / totalGDP) * 100).toFixed(1)}% do PIB nacional.`
  )

  const nnePopulation = (regionPopulation['Norte'] || 0) + (regionPopulation['Nordeste'] || 0)
  const nneGDP = (regionGDP['Norte'] || 0) + (regionGDP['Nordeste'] || 0)
  insights.push(
    `Norte e Nordeste juntos representam ${((nnePopulation / totalPop) * 100).toFixed(1)}% da população, mas apenas ${((nneGDP / totalGDP) * 100).toFixed(1)}% do PIB.`
  )

  const dfEntry = gdpPerCapita.find((e) => e.stateSigla === 'DF')
  if (dfEntry && gdpPerCapita.length > 0) {
    const nationalAvg = gdpPerCapita.reduce((sum, e) => sum + e.gdpPerCapita, 0) / gdpPerCapita.length
    insights.push(
      `O Distrito Federal tem o maior PIB per capita (R$ ${dfEntry.gdpPerCapita.toFixed(0)}), ${((dfEntry.gdpPerCapita / nationalAvg - 1) * 100).toFixed(0)}% acima da média nacional, impulsionado pelo setor público.`
    )
  }

  const sulPopulation = regionPopulation['Sul'] || 0
  const sulGDP = regionGDP['Sul'] || 0
  insights.push(
    `A região Sul, com ${((sulPopulation / totalPop) * 100).toFixed(1)}% da população, gera ${((sulGDP / totalGDP) * 100).toFixed(1)}% do PIB, mostrando produtividade acima da média.`
  )

  return insights
}

export async function GET() {
  try {
    const population = POPULATION_DATA
    const pib = PIB_DATA

    const totalPopulation = population.reduce((sum, e) => sum + e.value, 0)
    const totalGDP = pib.reduce((sum, e) => sum + e.value, 0)
    const overallGDPPerCapita = (totalGDP * 1000) / totalPopulation

    const mostPopulousState = population[0] || null
    const leastPopulousState = population[population.length - 1] || null
    const highestGDPState = pib[0] || null
    const lowestGDPState = pib[pib.length - 1] || null

    const populationMap = new Map<string, number>()
    for (const entry of population) {
      populationMap.set(entry.stateId, entry.value)
    }

    const gdpPerCapitaEntries: GDPPerCapitaEntry[] = []
    for (const pibEntry of pib) {
      const pop = populationMap.get(pibEntry.stateId)
      if (pop && pop > 0) {
        gdpPerCapitaEntries.push({
          stateId: pibEntry.stateId,
          stateName: pibEntry.stateName,
          stateSigla: pibEntry.stateSigla,
          population: pop,
          gdp: pibEntry.value,
          gdpPerCapita: (pibEntry.value * 1000) / pop,
        })
      }
    }
    gdpPerCapitaEntries.sort((a, b) => b.gdpPerCapita - a.gdpPerCapita)

    const top5Pop = population.slice(0, 5)
    const top5PopTotal = top5Pop.reduce((sum, e) => sum + e.value, 0)
    const top5GDP = pib.slice(0, 5)
    const top5GDPTotal = top5GDP.reduce((sum, e) => sum + e.value, 0)

    const regionalInsights = generateRegionalInsights(population, pib, gdpPerCapitaEntries)

    const summary: SummaryInsights = {
      totalPopulation,
      totalGDP,
      overallGDPPerCapita,
      mostPopulousState,
      leastPopulousState,
      highestGDPState,
      lowestGDPState,
      top5GDPPerCapita: gdpPerCapitaEntries.slice(0, 5),
      bottom5GDPPerCapita: gdpPerCapitaEntries.slice(-5).reverse(),
      populationConcentration: {
        top5States: top5Pop,
        top5Percentage: (top5PopTotal / totalPopulation) * 100,
      },
      gdpConcentration: {
        top5States: top5GDP,
        top5Percentage: (top5GDPTotal / totalGDP) * 100,
      },
      regionalInsights,
    }

    return NextResponse.json(summary, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    })
  } catch (error) {
    console.error('Error generating IBGE summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate data summary from IBGE' },
      { status: 500 }
    )
  }
}
