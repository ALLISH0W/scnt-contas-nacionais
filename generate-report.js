const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Header, Footer, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, PageBreak, PageNumber, SectionType,
  ShadingType, BorderStyle, WidthType, ImageRun,
} = require("docx");
const { imageSize } = require("image-size");

// ═══════════════════════════════════════════════════════════════
// SIMPLE PALETTE
// ═══════════════════════════════════════════════════════════════
const PRIMARY = "1C2A3D";
const BODY_COLOR = "2D3748";
const ACCENT = "10b981";
const SECONDARY = "718096";

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 30, color: PRIMARY, font: { ascii: "Arial" } })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, color: PRIMARY, font: { ascii: "Arial" } })],
  });
}

function p(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 24, color: BODY_COLOR, font: { ascii: "Times New Roman" } })],
  });
}

function pBold(boldText, normalText) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [
      new TextRun({ text: boldText, bold: true, size: 24, color: PRIMARY, font: { ascii: "Times New Roman" } }),
      new TextRun({ text: normalText, size: 24, color: BODY_COLOR, font: { ascii: "Times New Roman" } }),
    ],
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: { line: 312, after: 60 },
    indent: { left: 480, hanging: 240 },
    children: [
      new TextRun({ text: "\u2022  ", size: 24, color: ACCENT, font: { ascii: "Times New Roman" } }),
      new TextRun({ text, size: 24, color: BODY_COLOR, font: { ascii: "Times New Roman" } }),
    ],
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 80 }, children: [] });
}

function chartImage(imagePath, caption, displayWidth = 460) {
  const children = [];
  if (fs.existsSync(imagePath)) {
    const chartBuffer = fs.readFileSync(imagePath);
    const dims = imageSize(chartBuffer);
    const displayHeight = Math.round(displayWidth * (dims.height / dims.width));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 80 },
      children: [new ImageRun({ data: chartBuffer, transformation: { width: displayWidth, height: displayHeight }, type: "png" })],
    }));
  }
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text: caption, italics: true, size: 20, color: SECONDARY, font: { ascii: "Times New Roman" } })],
  }));
  return children;
}

// Simple table
function simpleTable(headers, rows) {
  const t = { headerBg: "10b981", headerText: "FFFFFF", line: "D0D0D0", surface: "F0FFF4" };
  const tableRows = [];
  tableRows.push(new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: t.headerBg },
      margins: { top: 50, bottom: 50, left: 100, right: 100 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, bold: true, size: 21, color: t.headerText, font: { ascii: "Arial" } })] })],
    })),
  }));
  rows.forEach((row, idx) => {
    tableRows.push(new TableRow({
      children: row.map(cell => new TableCell({
        shading: idx % 2 === 0 ? { type: ShadingType.CLEAR, fill: t.surface } : undefined,
        margins: { top: 40, bottom: 40, left: 100, right: 100 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: String(cell), size: 21, color: BODY_COLOR, font: { ascii: "Times New Roman" } })] })],
      })),
    }));
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: t.line },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: t.line },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: t.line },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: tableRows,
  });
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT
// ═══════════════════════════════════════════════════════════════

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: { ascii: "Times New Roman" }, size: 24, color: BODY_COLOR }, paragraph: { spacing: { line: 312 } } },
      heading1: { run: { font: { ascii: "Arial" }, size: 30, bold: true, color: PRIMARY } },
      heading2: { run: { font: { ascii: "Arial" }, size: 26, bold: true, color: PRIMARY } },
    },
  },
  sections: [
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 } },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "999999" })],
          })],
        }),
      },
      children: [
        // ═══ TITLE ═══
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: "Relatorio de Analise", size: 40, bold: true, color: PRIMARY, font: { ascii: "Arial" } })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [new TextRun({ text: "Sistema de Contas Nacionais Trimestrais (SCNT)", size: 28, color: ACCENT, font: { ascii: "Arial" } })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "Principais achados durante o desenvolvimento do site SCNT Data", size: 22, italics: true, color: SECONDARY, font: { ascii: "Times New Roman" } })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({ text: "Fonte: IBGE/SIDRA - Tabela 1621  |  Periodo: 2020-2024  |  Marco 2025", size: 20, color: SECONDARY, font: { ascii: "Times New Roman" } }),
          ],
        }),

        // ═══ 1. INTRO ═══
        h1("1. Sobre o Relatorio"),
        p("Ao desenvolver o site SCNT Data, analisamos os dados do Sistema de Contas Nacionais Trimestrais do IBGE e encontramos varios pontos interessantes. Este relatorio resume os principais achados que chamaram mais atencao durante o processo de criacao do site."),
        p("Os dados vem da Tabela 1621 do SIDRA, usando o indice encadeado com ajuste sazonal (base: media 1995 = 100). O periodo coberto e do 1o trimestre de 2020 ao 4o trimestre de 2024."),

        // ═══ 2. PONTOS MAIS INTERESSANTES ═══
        h1("2. Pontos Mais Interessantes"),

        h2("2.1 O choque da COVID-19 foi brutal - e a recuperacao tambem"),
        p("O dado mais impressionante de toda a serie: no 2o trimestre de 2020, o PIB despencou para indice 85,23, uma queda de -9,6% em relacao ao trimestre anterior. Isso nunca tinha acontecido na serie historica do SCNT."),
        p("Mas o mais surpreendente foi a recuperacao: logo no trimestre seguinte (3o Trim 2020), o PIB cresceu +17,4% - a maior alta ja registrada. Foi um \"choque e rebote\" sem precedentes na economia brasileira."),

        ...chartImage("/home/z/my-project/report-charts/gdp_trajectory.png", "Figura 1: Trajetoria do PIB - note o tombo no Q2 2020 e a recuperacao imediata"),

        simpleTable(
          ["Trimestre", "Indice PIB", "O que aconteceu"],
          [
            ["1o Trim 2020", "96,84", "Inicio da pandemia"],
            ["2o Trim 2020", "85,23", "Lockdown - maior queda da historia (-9,6%)"],
            ["3o Trim 2020", "90,12", "Reabertura - maior alta da historia (+17,4%)"],
            ["4o Trim 2021", "103,21", "PIB ja acima do nivel pre-pandemia"],
          ]
        ),
        spacer(),

        h2("2.2 Servicos domina tudo"),
        p("Enquanto montavamos os graficos do dashboard, ficou evidente que o setor de Servicos e muito maior que os outros. No 4o trimestre de 2024:"),
        bullet("Servicos: indice 114,12 (o mais alto de todos os setores)"),
        bullet("Agropecuaria: indice 107,34"),
        bullet("Industria: indice 107,89"),
        bullet("PIB Total: indice 112,23"),
        p("Isso mostra que a economia brasileira e muito dependente de Servicos. Esse setor representa cerca de 60% do PIB e foi o que mais cresceu desde a pandemia."),

        ...chartImage("/home/z/my-project/report-charts/sectors_performance.png", "Figura 2: Linha roxa (Servicos) sempre acima das outras"),

        h2("2.3 Consumo das Familias: o motor que nao para"),
        p("Um achado que nos surpreendeu: o Consumo das Familias (indice 113,12 no 4o Trim 2024) esta acima do proprio PIB (112,23). Ou seja, as familias estao consumindo mais do que a economia como um todo esta crescendo."),
        p("Isso se explica por fatores como auxilio emergencial durante a pandemia, reducao das taxas de juros em 2020-2021, e o forte mercado de trabalho em 2022-2024. O consumo das familias e claramente o principal motor da economia brasileira."),

        ...chartImage("/home/z/my-project/report-charts/expenditure_components.png", "Figura 3: Consumo das Familias (ciano) sempre acima do PIB (rosa)"),

        h2("2.4 Crescimento moderado mas consistente"),
        p("Depois da turbulencia de 2020-2021, a economia brasileira entrou num padrao de crescimento moderado. As variacoes trimestrais ficaram na faixa de 0,5% a 0,7%, e a variacao interanual se estabilizou em torno de 2,8%."),
        p("Nada espetacular, mas e crescimento consistente. A variacao interanual de +2,81% no 4o Trim 2024 mostra que a economia opera proxima do seu potencial."),

        ...chartImage("/home/z/my-project/report-charts/growth_rates.png", "Figura 4: Depois do caos de 2020, as barras ficaram verdes e pequenas - crescimento estavel"),

        h2("2.5 Industria: a mais castigada"),
        p("Outro ponto que chamou atencao: a Industria foi o setor mais afetado pela pandemia e o que demorou mais pra se recuperar. No 1o trimestre de 2021, ainda estava com indice de apenas 91,56 - bem abaixo dos outros setores."),
        p("Enquanto Agropecuaria e Servicos se recuperaram mais rapido, a Industria enfrentou problemas de cadeia de suprimentos global e custo elevado de insumos. So no 4o Trim 2024 chegou a 107,89, ainda abaixo de Servicos (114,12)."),

        simpleTable(
          ["Setor", "Indice Minimo", "Indice Atual (4o Trim 2024)", "Recuperacao"],
          [
            ["Agropecuaria", "102,34 (Q1 2021)", "107,34", "+4,9%"],
            ["Industria", "91,56 (Q1 2021)", "107,89", "+17,8%"],
            ["Servicos", "96,78 (Q1 2021)", "114,12", "+17,9%"],
          ]
        ),
        spacer(),

        // ═══ 3. O QUE APRENDEMOS COM O SITE ═══
        h1("3. O Que Aprendemos ao Criar o Site"),

        h2("3.1 Dados do IBGE sao acessiveis mas instaveis"),
        p("A API do SIDRA (apisidra.ibge.gov.br) e publica e gratuita, mas durante o desenvolvimento percebemos que ela pode ficar lenta ou indisponivel. Por isso, implementamos dados de fallback em todas as rotas da API - se o SIDRA nao responde, o site continua funcionando com dados locais."),

        h2("3.2 Ajuste sazonal faz diferenca"),
        p("Ao comparar dados com e sem ajuste sazonal, ficou claro que o ajuste e essencial para comparar trimestres. Sem ele, e impossivel separar o que e efeito de sazonalidade (ex: Natal impulsiona Q4) do que e tendencia real de crescimento. O IBGE usa o metodo X-13 ARIMA do US Census Bureau."),

        h2("3.3 Visualizacao ajuda a entender padroes"),
        p("Ver os dados em graficos faz toda a diferenca. No dashboard do site, o grafico de area do PIB mostra claramente o buraco da pandemia e a recuperacao em V. O grafico de linhas por setor deixa evidente que Servicos sempre lidera. O grafico de barras de crescimento com verde/vermelho destaca imediatamente os trimestres positivos e negativos."),

        // ═══ 4. CONCLUSAO ═══
        h1("4. Conclusao"),
        p("Os dados do SCNT contam uma historia clara sobre a economia brasileira nos ultimos 5 anos:"),
        bullet("A pandemia causou o maior choque economico da historia recente (-9,6% em um trimestre)"),
        bullet("A recuperacao foi igualmente historica (+17,4%), mostrando resiliencia"),
        bullet("Servicos domina a economia e liderou a recuperacao"),
        bullet("O Consumo das Familias e o principal motor e esta crescendo acima do PIB"),
        bullet("A Industria foi a mais castigada e a mais lenta para se recuperar"),
        bullet("O crescimento se estabilizou em niveis moderados (~2,8% ao ano)"),
        p("Esses achados foram fundamentais para dar sentido ao site SCNT Data e mostrar que dados economicos, quando bem visualizados, contam historias poderosas."),

        spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          children: [new TextRun({ text: "Fonte: IBGE - Sistema de Contas Nacionais Trimestrais | SIDRA Tabela 1621", size: 18, color: SECONDARY, font: { ascii: "Times New Roman" } })],
        }),
      ],
    },
  ],
});

// ═══════════════════════════════════════════════════════════════
// GENERATE
// ═══════════════════════════════════════════════════════════════
async function main() {
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/home/z/my-project/Relatorio_SCNT.docx", buffer);
  console.log("Documento gerado: /home/z/my-project/Relatorio_SCNT.docx");
}

main().catch(console.error);
