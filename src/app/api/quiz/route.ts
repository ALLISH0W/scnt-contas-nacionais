import { NextResponse } from 'next/server'

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  category: string
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'O que significa a sigla SCNT?',
    options: [
      'Sistema de Contas Nacionais Trimestrais',
      'Sistema de Controle Nacional Tributário',
      'Sistema de Cálculo Nominal Trimestral',
      'Sistema de Contas Nacionais Totais',
    ],
    correctIndex: 0,
    explanation: 'SCNT significa Sistema de Contas Nacionais Trimestrais, produzido pelo IBGE para acompanhar a evolução da economia brasileira em intervalos trimestrais.',
    category: 'Conceitos',
  },
  {
    id: 2,
    question: 'Qual foi o impacto da COVID-19 no PIB brasileiro no 2º trimestre de 2020?',
    options: [
      '-5.2%',
      '-9.6%',
      '-12.3%',
      '-7.8%',
    ],
    correctIndex: 1,
    explanation: 'No 2º trimestre de 2020, o PIB brasileiro sofreu uma queda de -9.6%, a maior queda trimestral da série histórica, causada pelas medidas de restrição da pandemia.',
    category: 'PIB',
  },
  {
    id: 3,
    question: 'Qual é o maior setor da economia brasileira em termos de participação no PIB?',
    options: [
      'Agropecuária',
      'Indústria',
      'Serviços',
      'Comércio Exterior',
    ],
    correctIndex: 2,
    explanation: 'O setor de Serviços é o maior da economia brasileira, abrangendo comércio, transporte, informação, setor financeiro e serviços pessoais.',
    category: 'Setores',
  },
  {
    id: 4,
    question: 'Qual foi a maior recuperação trimestral do PIB registrada na série histórica?',
    options: [
      '+8.2% no 3º trimestre de 2020',
      '+17.4% no 3º trimestre de 2020',
      '+12.1% no 4º trimestre de 2020',
      '+15.0% no 1º trimestre de 2021',
    ],
    correctIndex: 1,
    explanation: 'A maior recuperação foi de +17.4% no 3º trimestre de 2020, um rebote forte após a queda histórica do 2º trimestre devido à pandemia.',
    category: 'PIB',
  },
  {
    id: 5,
    question: 'Qual é a base de cálculo do índice do SCNT utilizado no site?',
    options: [
      'Média de 2010 = 100',
      'Média de 2000 = 100',
      'Média de 1995 = 100',
      'Média de 2015 = 100',
    ],
    correctIndex: 2,
    explanation: 'O índice encadeado do SCNT utiliza como base a média de 1995 = 100, com ajuste sazonal pelo método X-13 ARIMA.',
    category: 'Metodologia',
  },
  {
    id: 6,
    question: 'Qual é o principal componente da despesa no PIB brasileiro?',
    options: [
      'Formação Bruta de Capital Fixo (Investimento)',
      'Exportações Líquidas',
      'Consumo das Famílias',
      'Gasto do Governo',
    ],
    correctIndex: 2,
    explanation: 'O Consumo das Famílias é o principal componente da despesa, representando a maior fatia do PIB brasileiro, com índice de 113.12 no 4º trimestre de 2024.',
    category: 'Despesa',
  },
  {
    id: 7,
    question: 'Qual método de ajuste sazonal é utilizado pelo IBGE no SCNT?',
    options: [
      'Holt-Winters',
      'X-13 ARIMA',
      'Moving Average',
      'STL Decomposition',
    ],
    correctIndex: 1,
    explanation: 'O IBGE utiliza o método X-13 ARIMA, desenvolvido pelo US Census Bureau, para realizar o ajuste sazonal dos dados do SCNT.',
    category: 'Metodologia',
  },
  {
    id: 8,
    question: 'Qual tabela do SIDRA contém os dados do SCNT utilizados neste site?',
    options: [
      'Tabela 5938',
      'Tabela 1621',
      'Tabela 6579',
      'Tabela 1846',
    ],
    correctIndex: 1,
    explanation: 'A Tabela 1621 do SIDRA contém os dados do Sistema de Contas Nacionais Trimestrais, incluindo PIB, setores e componentes da despesa.',
    category: 'Dados',
  },
  {
    id: 9,
    question: 'Qual setor da economia brasileira teve o pior desempenho durante a pandemia de COVID-19?',
    options: [
      'Agropecuária',
      'Indústria',
      'Serviços',
      'Todos foram igualmente afetados',
    ],
    correctIndex: 1,
    explanation: 'A Indústria foi o setor que teve o pior desempenho durante a pandemia, com recuperação mais lenta em comparação com Serviços e Agropecuária.',
    category: 'Setores',
  },
  {
    id: 10,
    question: 'Com que frequência o IBGE divulga os dados do SCNT?',
    options: [
      'Mensalmente',
      'Trimestralmente',
      'Semestralmente',
      'Anualmente',
    ],
    correctIndex: 1,
    explanation: 'O SCNT é divulgado trimestralmente, aproximadamente 60 dias após o fechamento de cada trimestre, permitindo o acompanhamento pontual da economia.',
    category: 'Conceitos',
  },
  {
    id: 11,
    question: 'O PIB sob a ótica da produção é medido pelo:',
    options: [
      'Consumo das famílias + Investimento + Exportações',
      'Valor adicionado por setor econômico',
      'Remuneração dos fatores de produção',
      'Receita tributária do governo',
    ],
    correctIndex: 1,
    explanation: 'Sob a ótica da produção, o PIB é medido pelo valor adicionado bruto por setor (Agropecuária, Indústria, Serviços), descontando os consumos intermediários.',
    category: 'Conceitos',
  },
  {
    id: 12,
    question: 'Qual é o valor aproximado do índice do PIB no 4º trimestre de 2024 (com ajuste sazonal)?',
    options: [
      '108.76',
      '110.34',
      '112.23',
      '115.34',
    ],
    correctIndex: 2,
    explanation: 'O índice do PIB com ajuste sazonal no 4º trimestre de 2024 foi de 112.23 (base média 1995 = 100).',
    category: 'PIB',
  },
  {
    id: 13,
    question: 'Qual instituição produz o Sistema de Contas Nacionais Trimestrais?',
    options: [
      'Banco Central do Brasil (Bacen)',
      'Instituto Brasileiro de Geografia e Estatística (IBGE)',
      'Ministério da Economia',
      'Instituto de Pesquisa Econômica Aplicada (IPEA)',
    ],
    correctIndex: 1,
    explanation: 'O SCNT é produzido pelo IBGE (Instituto Brasileiro de Geografia e Estatística), que é o órgão oficial de estatísticas do Brasil.',
    category: 'Conceitos',
  },
  {
    id: 14,
    question: 'A variação interanual do PIB compara o trimestre com:',
    options: [
      'O trimestre imediatamente anterior',
      'O mesmo trimestre do ano anterior',
      'A média anual do ano anterior',
      'O 4º trimestre do ano anterior',
    ],
    correctIndex: 1,
    explanation: 'A variação interanual compara o trimestre com o mesmo trimestre do ano anterior, eliminando efeitos sazonais naturais da economia.',
    category: 'Metodologia',
  },
  {
    id: 15,
    question: 'Qual foi a variação interanual do PIB no 4º trimestre de 2024?',
    options: [
      '+1.50%',
      '+2.81%',
      '+3.45%',
      '+4.10%',
    ],
    correctIndex: 1,
    explanation: 'A variação interanual do PIB no 4º trimestre de 2024 foi de +2.81%, indicando crescimento da economia em relação ao mesmo período do ano anterior.',
    category: 'PIB',
  },
]

export async function GET() {
  // Shuffle questions for variety
  const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5)
  // Return questions WITH correct answers for interactive feedback
  // (server-side validation still happens on submit for ranking integrity)
  const questionsWithAnswers = shuffled.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    category: q.category,
  }))

  return NextResponse.json({
    questions: questionsWithAnswers,
    totalQuestions: questionsWithAnswers.length,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userName, userEmail, answers, timeSeconds } = body as {
      userName: string
      userEmail: string
      answers: Record<string, number>
      timeSeconds?: number
    }

    if (!userName || !userEmail || !answers) {
      return NextResponse.json(
        { error: 'Nome, email e respostas são obrigatórios' },
        { status: 400 }
      )
    }

    // Calculate score
    let score = 0
    const results: Array<{
      questionId: number
      correct: boolean
      correctIndex: number
      explanation: string
    }> = []

    for (const q of QUIZ_QUESTIONS) {
      const userAnswer = answers[q.id]
      const isCorrect = userAnswer === q.correctIndex
      if (isCorrect) score++
      results.push({
        questionId: q.id,
        correct: isCorrect,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })
    }

    const totalQuestions = QUIZ_QUESTIONS.length
    const percentage = Math.round((score / totalQuestions) * 100 * 100) / 100

    // Save to database
    const { db } = await import('@/lib/db')
    await db.quizScore.create({
      data: {
        userName,
        userEmail,
        score,
        totalQuestions,
        percentage,
        timeSeconds: timeSeconds || 0,
      },
    })

    return NextResponse.json({
      score,
      totalQuestions,
      percentage,
      results,
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar resultado do quiz' },
      { status: 500 }
    )
  }
}
