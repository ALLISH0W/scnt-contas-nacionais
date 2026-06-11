import { NextResponse } from 'next/server'

interface State {
  id: number
  sigla: string
  nome: string
}

const FALLBACK_STATES: State[] = [
  { id: 11, sigla: 'RO', nome: 'Rondônia' },
  { id: 12, sigla: 'AC', nome: 'Acre' },
  { id: 13, sigla: 'AM', nome: 'Amazonas' },
  { id: 14, sigla: 'RR', nome: 'Roraima' },
  { id: 15, sigla: 'PA', nome: 'Pará' },
  { id: 16, sigla: 'AP', nome: 'Amapá' },
  { id: 17, sigla: 'TO', nome: 'Tocantins' },
  { id: 21, sigla: 'MA', nome: 'Maranhão' },
  { id: 22, sigla: 'PI', nome: 'Piauí' },
  { id: 23, sigla: 'CE', nome: 'Ceará' },
  { id: 24, sigla: 'RN', nome: 'Rio Grande do Norte' },
  { id: 25, sigla: 'PB', nome: 'Paraíba' },
  { id: 26, sigla: 'PE', nome: 'Pernambuco' },
  { id: 27, sigla: 'AL', nome: 'Alagoas' },
  { id: 28, sigla: 'SE', nome: 'Sergipe' },
  { id: 29, sigla: 'BA', nome: 'Bahia' },
  { id: 31, sigla: 'MG', nome: 'Minas Gerais' },
  { id: 32, sigla: 'ES', nome: 'Espírito Santo' },
  { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' },
  { id: 35, sigla: 'SP', nome: 'São Paulo' },
  { id: 41, sigla: 'PR', nome: 'Paraná' },
  { id: 42, sigla: 'SC', nome: 'Santa Catarina' },
  { id: 43, sigla: 'RS', nome: 'Rio Grande do Sul' },
  { id: 50, sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { id: 51, sigla: 'MT', nome: 'Mato Grosso' },
  { id: 52, sigla: 'GO', nome: 'Goiás' },
  { id: 53, sigla: 'DF', nome: 'Distrito Federal' },
]

export async function GET() {
  try {
    const response = await fetch(
      'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
      {
        next: { revalidate: 86400 },
        headers: { 'Accept': 'application/json' },
      }
    )

    if (response.ok) {
      const data: State[] = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        const states = data
          .map((s) => ({ id: s.id, sigla: s.sigla, nome: s.nome }))
          .sort((a, b) => a.sigla.localeCompare(b.sigla))
        return NextResponse.json(states, {
          headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
        })
      }
    }
    // Fallback
    return NextResponse.json(FALLBACK_STATES, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    })
  } catch {
    return NextResponse.json(FALLBACK_STATES, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    })
  }
}
