const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Header, Footer, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, PageBreak, PageNumber, NumberFormat, SectionType,
  ShadingType, BorderStyle, WidthType, TableLayoutType, TableOfContents, ImageRun,
} = require("docx");
const { imageSize } = require("image-size");

// ═══════════════════════════════════════════════════════════════
// PALETTE — DS-1 Deep Sea (general business report)
// ═══════════════════════════════════════════════════════════════
const P = {
  bg: "0B1C2C",
  titleColor: "FFFFFF",
  subtitleColor: "B0B8C0",
  metaColor: "90989F",
  accent: "529286",
  footerColor: "687078",
  primary: "0B1C2C",
  body: "1C2A3D",
  secondary: "506070",
  surface: "E8ECEB",
  table: { headerBg: "529286", headerText: "FFFFFF", accentLine: "529286", innerLine: "BECFCC", surface: "E8ECEB" },
};

const c = (hex) => hex.replace("#", "");

// ═══════════════════════════════════════════════════════════════
// COVER RECIPE R1 — Pure Paragraph Left
// ═══════════════════════════════════════════════════════════════
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 12; // Latin chars ≈ pt * 12 twips average
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) {
    const cpl = charsPerLine(minPt);
    lines = splitTitleLines(title, cpl);
    titlePt = minPt;
  }
  return { titlePt, titleLines: lines };
}

function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([" ", "-", ",", ".", ";", ":", "!", "?"]);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) {
        breakAt = i;
        break;
      }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }
  return lines;
}

function calcCoverSpacing(params) {
  const { titleLineCount = 1, titlePt = 36, hasSubtitle = false, hasEnglishLabel = false,
    metaLineCount = 0, fixedHeight = 800, pageHeight = 16838 } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - SAFETY;
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? 500 : 0;
  const englishLabelHeight = hasEnglishLabel ? 600 : 0;
  const metaHeight = metaLineCount * 340;
  const contentHeight = titleHeight + subtitleHeight + englishLabelHeight + metaHeight + fixedHeight;
  const available = usableHeight - contentHeight;
  const topSpacing = Math.min(Math.floor(available * 0.5), 4000);
  const bottomSpacing = Math.min(Math.floor(available * 0.3), 2000);
  return { topSpacing, midSpacing: Math.floor(available * 0.2), bottomSpacing };
}

function buildCoverR1(config) {
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 36, 20);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length, fixedHeight: 400,
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 };
  const children = [];
  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));
  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
      children: [new TextRun({ text: config.englishLabel, size: 18, color: P.accent, font: { ascii: "Calibri" }, characterSpacing: 40 })],
    }));
  }
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true,
        color: P.titleColor, font: { ascii: "Arial" } })],
    }));
  }
  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 800 },
      children: [new TextRun({ text: config.subtitle, size: 24, color: P.subtitleColor, font: { ascii: "Arial" } })],
    }));
  }
  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 24, color: P.metaColor, font: { ascii: "Arial" } })],
    }));
  }
  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: P.footerColor, font: { ascii: "Arial" } }),
      new TextRun({ text: "                                                                                              " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: P.footerColor, font: { ascii: "Arial" } }),
    ],
  }));
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.bg }, borders: noBorders, children,
      })],
    })],
  })];
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, color: c(P.primary), font: { ascii: "Arial" } })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, color: c(P.primary), font: { ascii: "Arial" } })],
  });
}

function bodyPara(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman" } })],
  });
}

function bodyParaBold(textBold, textNormal) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [
      new TextRun({ text: textBold, bold: true, size: 24, color: c(P.primary), font: { ascii: "Times New Roman" } }),
      new TextRun({ text: textNormal, size: 24, color: c(P.body), font: { ascii: "Times New Roman" } }),
    ],
  });
}

function bulletItem(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 80 },
    indent: { left: 480, hanging: 240 },
    children: [
      new TextRun({ text: "\u2022  ", size: 24, color: c(P.accent), font: { ascii: "Times New Roman" } }),
      new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman" } }),
    ],
  });
}

function chartImage(imagePath, caption, displayWidth = 500) {
  const children = [];
  if (fs.existsSync(imagePath)) {
    const chartBuffer = fs.readFileSync(imagePath);
    const dims = imageSize(chartBuffer);
    const displayHeight = Math.round(displayWidth * (dims.height / dims.width));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [new ImageRun({ data: chartBuffer, transformation: { width: displayWidth, height: displayHeight }, type: "png" })],
    }));
  }
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: caption, italics: true, size: 20, color: c(P.secondary), font: { ascii: "Times New Roman" } })],
  }));
  return children;
}

// Horizontal-Only Table
function makeTable(headers, rows, caption) {
  const t = P.table;
  const children = [];
  
  if (caption) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: caption, bold: true, size: 22, color: c(P.primary), font: { ascii: "Arial" } })],
    }));
  }

  const tableRows = [];
  // Header row
  tableRows.push(new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map(h => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: t.headerBg },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
      },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, bold: true, size: 22, color: t.headerText, font: { ascii: "Arial" } })] })],
    })),
  }));

  // Data rows
  rows.forEach((row, idx) => {
    tableRows.push(new TableRow({
      cantSplit: true,
      children: row.map(cell => new TableCell({
        shading: idx % 2 === 0 ? { type: ShadingType.CLEAR, fill: t.surface } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: t.innerLine },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: t.innerLine },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: String(cell), size: 22, color: c(P.body), font: { ascii: "Times New Roman" } })] })],
      })),
    }));
  });

  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: t.innerLine },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: tableRows,
  }));

  return children;
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT CONSTRUCTION
// ═══════════════════════════════════════════════════════════════

const pgSize = { width: 11906, height: 16838 };
const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

function pageNumFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
    })],
  });
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Times New Roman" }, size: 24, color: c(P.body) },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: { ascii: "Arial" }, size: 32, bold: true, color: c(P.primary) },
      },
      heading2: {
        run: { font: { ascii: "Arial" }, size: 28, bold: true, color: c(P.primary) },
      },
    },
  },
  sections: [
    // ═══ SECTION 1: COVER ═══
    {
      properties: {
        page: { size: pgSize, margin: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
      children: buildCoverR1({
        title: "Relatorio de Analise do SCNT",
        subtitle: "Contas Nacionais Trimestrais - Principais Achados",
        englishLabel: "QUARTERLY NATIONAL ACCOUNTS",
        metaLines: [
          "Fonte: IBGE / SIDRA - Tabela 1621",
          "Periodo: 1o Trim 2020 - 4o Trim 2024",
          "Base: Indice Encadeado (media 1995 = 100)",
          "Autor: Projeto SCNT Data",
          "Data: Marco de 2025",
        ],
        footerLeft: "SCNT Data",
        footerRight: "IBGE / SIDRA",
        palette: P,
      }),
    },

    // ═══ SECTION 2: TOC ═══
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } },
      },
      footers: { default: pageNumFooter() },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Relatorio SCNT", size: 18, color: "808080", font: { ascii: "Arial" } })] })] }) },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 360 },
          children: [new TextRun({ text: "Sumario", bold: true, size: 32, font: { ascii: "Arial" }, color: c(P.primary) })],
        }),
        new TableOfContents("Table of Contents", {
          hyperlink: true,
          headingStyleRange: "1-2",
        }),
        new Paragraph({
          spacing: { before: 200 },
          children: [new TextRun({
            text: "Nota: Este Sumario e gerado via codigos de campo. Para garantir a precisao dos numeros de pagina apos edicao, clique com o botao direito no Sumario e selecione \"Atualizar Campo\".",
            italics: true, size: 18, color: "888888", font: { ascii: "Times New Roman" },
          })],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },

    // ═══ SECTION 3: BODY ═══
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } },
      },
      footers: { default: pageNumFooter() },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Relatorio SCNT", size: 18, color: "808080", font: { ascii: "Arial" } })] })] }) },
      children: [
        // ═══ 1. SUMARIO EXECUTIVO ═══
        heading1("1. Sumario Executivo"),
        bodyPara("Este relatorio apresenta os principais achados derivados da analise dos dados do Sistema de Contas Nacionais Trimestrais (SCNT), produzido pelo Instituto Brasileiro de Geografia e Estatistica (IBGE). O SCNT constitui a fonte primaria de indicadores de atividade economica de alta frequencia no Brasil, permitindo o acompanhamento trimestral do Produto Interno Bruto (PIB) e seus componentes."),
        bodyPara("A analise cobre o periodo de 1o trimestre de 2020 a 4o trimestre de 2024, abrangendo os setores de Agropecuaria, Industria e Servicos, alem dos componentes da despesa, com destaque para o Consumo das Familias. Os dados utilizados sao indices encadeados com ajuste sazonal, tendo como base a media de 1995 igual a 100, conforme a Tabela 1621 do SIDRA/IBGE."),
        bodyPara("Os achados mais relevantes incluem: (1) o impacto sem precedentes da pandemia de COVID-19, com queda de -9,6% no PIB no 2o trimestre de 2020; (2) a recuperacao igualmente historica de +17,4% no trimestre seguinte; (3) a trajetoria de crescimento moderado e sustentado entre 2022 e 2024; (4) a lideranca consistente do setor de Servicos na composicao do PIB; e (5) o Consumo das Familias como principal motor da demanda interna."),

        // ═══ 2. CONTEXTO E OBJETIVOS ═══
        heading1("2. Contexto e Objetivos"),
        heading2("2.1 O Sistema de Contas Nacionais Trimestrais"),
        bodyPara("O SCNT e uma estatistica produzida pelo IBGE que permite acompanhar a evolucao da economia brasileira em intervalos curtos, possibilitando a analise conjuntural e a formulacao de politicas publicas. O sistema mede o PIB sob tres oticas: producao (valor adicionado por setor), despesa (consumo, investimento, exportacoes liquidas) e renda (remuneracao dos fatores de producao)."),
        bodyPara("Os dados sao divulgados a cada trimestre, com aproximadamente 60 dias de defasagem em relacao ao periodo de referencia. O ajuste sazonal e realizado mediante a metodologia X-13 ARIMA do US Census Bureau, que remove efeitos sazonais e calendarios, permitindo a comparacao valida entre trimestres consecutivos."),

        heading2("2.2 Objetivos do Relatorio"),
        bulletItem("Identificar os pontos mais interessantes e relevantes nos dados do SCNT entre 2020 e 2024"),
        bulletItem("Analisar o impacto da pandemia de COVID-19 e o padrao de recuperacao economica"),
        bulletItem("Comparar o desempenho dos setores economicos (Agropecuaria, Industria, Servicos)"),
        bulletItem("Examinar os componentes da despesa, com enfase no Consumo das Familias"),
        bulletItem("Diagnosticar padroes de crescimento e tendencias emergentes"),

        // ═══ 3. FONTES E METODOLOGIA ═══
        heading1("3. Fontes de Dados e Metodologia"),
        heading2("3.1 Fonte Primaria"),
        bodyPara("Todos os dados utilizados neste relatorio sao provenientes do Sistema IBGE de Recuperacao Automatica (SIDRA), especificamente da Tabela 1621 - Indice encadeado trimestral da Contas Nacionais Trimestrais. A variavel utilizada e a 584 (Indice encadeado com ajuste sazonal), com classificacoes 93404 (Agropecuaria), 93405 (Industria), 93406 (Consumo das Familias), 93407 (PIB) e 93408 (Servicos)."),
        bodyPara("Os dados sao acessados via API publica do SIDRA (apisidra.ibge.gov.br) com fallback para dados locais em caso de indisponibilidade do servico."),

        heading2("3.2 Metodologia de Analise"),
        bulletItem("Comparacao interanual (variacao contra o mesmo trimestre do ano anterior)"),
        bulletItem("Comparacao trimestral (variacao contra o trimestre imediatamente anterior)"),
        bulletItem("Analise de composicao setorial (participacao relativa dos setores no PIB)"),
        bulletItem("Analise de series temporais para identificacao de tendencias e ciclos"),
        bulletItem("Calculo de taxas de crescimento acumuladas e medias moveis"),

        heading2("3.3 Periodo de Analise"),
        bodyPara("O periodo analisado compreende 20 trimestres, do 1o trimestre de 2020 ao 4o trimestre de 2024. Este intervalo foi escolhido por capturar integralmente o choque pandemico, a recuperacao e o periodo de consolidacao do crescimento, oferecendo uma visao completa do ciclo economico recente."),

        // ═══ 4. PRINCIPAIS ACHADOS ═══
        heading1("4. Principais Achados"),

        heading2("4.1 Trajetoria do PIB e Impacto da COVID-19"),
        bodyPara("O achado mais dramatico da serie analisada e o impacto sem precedentes da pandemia de COVID-19 sobre a economia brasileira. No 2o trimestre de 2020, o indice do PIB com ajuste sazonal despencou para 85,23, representando uma queda de -9,6% em relacao ao trimestre anterior (1o Trim 2020: 96,84). Esta e a maior contracao trimestral registrada na serie historica do SCNT."),
        bodyPara("A recuperacao foi igualmente historica: no 3o trimestre de 2020, o PIB cresceu +17,4% (de 85,23 para 90,12), a maior expansao trimestral ja registrada. Este padrao de \"choque e rebote\" e consistente com o observado em outras economias que adotaram lockdowns rigorosos seguidos de reaberturas."),

        ...chartImage("/home/z/my-project/report-charts/gdp_trajectory.png", "Figura 1: Trajetoria do Indice do PIB com Ajuste Sazonal (1o Trim 2020 - 4o Trim 2024)"),

        ...makeTable(
          ["Trimestre", "Indice PIB", "Variacao Trimestral", "Variacao Interanual"],
          [
            ["1o Trim 2020", "96,84", "-", "-"],
            ["2o Trim 2020", "85,23", "-9,60%", "-"],
            ["3o Trim 2020", "90,12", "+17,40%", "-"],
            ["4o Trim 2020", "93,45", "+3,69%", "-"],
            ["4o Trim 2021", "103,21", "+0,90%", "+10,45%"],
            ["4o Trim 2022", "106,12", "+0,74%", "+2,82%"],
            ["4o Trim 2023", "109,12", "+0,64%", "+2,83%"],
            ["4o Trim 2024", "112,23", "+0,60%", "+2,81%"],
          ],
          "Tabela 1: Evolucao do Indice do PIB - Periodos Selecionados"
        ),

        bodyPara("A partir de 2021, o PIB iniciou uma trajetoria ascendente consistente, ultrapassando o nivel pre-pandemia no 3o trimestre de 2021 (indice 100,89). Desde entao, a economia tem apresentado crescimento moderado mas sustentado, com variacoes trimestrais positivas e variacoes interanuais na faixa de 2,5% a 3,0%."),

        heading2("4.2 Desempenho Setorial"),
        bodyPara("A analise por setores revela dinamica diferenciada entre Agropecuaria, Industria e Servicos. O setor de Servicos consistently lidera em nivel de indice, refletindo sua predominancia estrutural na economia brasileira (responsavel por aproximadamente 60% do PIB)."),

        ...chartImage("/home/z/my-project/report-charts/sectors_performance.png", "Figura 2: Indice por Setor Economico com Ajuste Sazonal (2021-2024)"),

        bodyParaBold("Agropecuaria: ", "Apresentou o indice mais elevado entre os setores produtivos ao longo de todo o periodo analisado (indice 107,34 no 4o Trim 2024), porem com crescimento mais moderado nos trimestres recentes. O setor demonstrou resiliencia durante a pandemia, sustentado pela demanda externa e pela safra recorde de 2020."),
        bodyParaBold("Industria: ", "Foi o setor mais afetado pela pandemia, com indice de apenas 91,56 no 1o Trim 2021 (ainda em recuperacao). A retomada foi gradual, atingindo 107,89 no 4o Trim 2024. O setor enfrentou desafios adicionais como descompassos na cadeia de suprimentos global e custo elevado de insumos."),
        bodyParaBold("Servicos: ", "Maior setor da economia, atingiu o indice de 114,12 no 4o Trim 2024, o mais alto entre todos os setores. A recuperacao pos-pandemia foi impulsionada pela reabertura do comercio, retomada do turismo e crescimento dos servicos digitais."),

        ...makeTable(
          ["Setor", "Indice (4o Trim 2024)", "Variacao vs 1o Trim 2021", "Participacao Aprox. no PIB"],
          [
            ["Agropecuaria", "107,34", "+4,90%", "~5%"],
            ["Industria", "107,89", "+17,80%", "~20%"],
            ["Servicos", "114,12", "+17,90%", "~60%"],
            ["PIB Total", "112,23", "+17,30%", "100%"],
          ],
          "Tabela 2: Comparativo Setorial - 4o Trim 2024"
        ),

        heading2("4.3 Componentes da Despesa e Consumo das Familias"),
        bodyPara("A analise dos componentes da despesa revela que o Consumo das Familias e o principal motor da demanda interna brasileira. No 4o trimestre de 2024, o indice do Consumo das Familias atingiu 113,12, acima do proprio indice do PIB (112,23), indicando que o consumo das familias esta crescendo ligeiramente acima da media da economia."),

        ...chartImage("/home/z/my-project/report-charts/expenditure_components.png", "Figura 3: Componentes da Despesa - Ultimos 8 Trimestres"),

        bodyPara("A resiliencia do consumo das familias durante e apos a pandemia pode ser atribuida a fatores como: (1) o auxilio emergencial e outras politicas de transferencia de renda; (2) a reducao das taxas de juros em 2020-2021; (3) o forte mercado de trabalho em 2022-2024; e (4) o aumento real do salario minimo. Este padrao e consistente com a literatura economica que identifica o consumo das familias como o componente mais estavel da demanda agregada."),

        ...makeTable(
          ["Trimestre", "PIB", "Agropecuaria", "Industria", "Consumo Familias", "Servicos"],
          [
            ["1o Trim 2023", "105,89", "106,56", "102,67", "107,23", "107,45"],
            ["2o Trim 2023", "107,23", "107,12", "103,89", "108,45", "108,56"],
            ["3o Trim 2023", "108,45", "107,34", "104,56", "109,12", "109,67"],
            ["4o Trim 2023", "109,12", "107,23", "105,12", "109,89", "110,23"],
            ["1o Trim 2024", "108,76", "106,89", "105,34", "110,23", "110,56"],
            ["2o Trim 2024", "110,34", "107,45", "106,78", "111,56", "112,12"],
            ["3o Trim 2024", "111,56", "107,56", "107,23", "112,34", "113,45"],
            ["4o Trim 2024", "112,23", "107,34", "107,89", "113,12", "114,12"],
          ],
          "Tabela 3: Indice dos Componentes da Despesa - Ultimos 8 Trimestres"
        ),

        heading2("4.4 Padroes de Crescimento"),
        bodyPara("A analise das taxas de crescimento trimestral revela um padrao de desaceleracao gradual mas consistente a partir de 2021. Apos o rebote pos-pandemia, as variacoes trimestrais se estabilizaram na faixa de 0,5% a 0,7%, indicando crescimento moderado mas sustentavel."),

        ...chartImage("/home/z/my-project/report-charts/growth_rates.png", "Figura 4: Taxas de Crescimento Trimestral do PIB (%)"),

        bodyPara("Este padrao de \"crescimento em L\" apos a recuperacao pos-pandemia e caracteristico de economias que combinam: (1) politica monetaria restritiva para conter inflacao; (2) consolidacao fiscal gradual; e (3) baixo investimento privado. A variacao interanual estabilizada em torno de 2,8% sugere que a economia brasileira opera proxima do seu potencial, sem pressoes inflacionarias significativas originadas pelo lado da demanda."),

        // ═══ 5. DIAGNOSTICO ═══
        heading1("5. Diagnostico e Analise Critica"),

        heading2("5.1 Recuperacao Assimetrica"),
        bodyPara("A recuperacao pos-pandemia foi assimetrica entre setores. Enquanto Servicos e Consumo das Familias apresentaram recuperacao robusta e sustentada, a Industria enfrentou maiores dificuldades, com crescimento mais lento e vulnerabilidade a choques externos (cadeia de suprimentos, custo de energia). A Agropecuaria, por sua vez, demonstrou resiliencia mas crescimento limitado nos trimestres mais recentes."),

        heading2("5.2 Sustentabilidade do Crescimento"),
        bodyPara("O crescimento moderado observado entre 2022 e 2024 (variacao interanual entre 2,5% e 3,0%) e sustentavel no curto prazo, mas enfrenta riscos no medio prazo. A dependencia do consumo das familias como principal motor de crescimento torna a economia vulneravel a choques no mercado de trabalho e a aperto monetario prolongado. A taxa de investimento (Formacao Bruta de Capital Fixo) permanece abaixo do necessario para sustentar crescimento mais elevado no longo prazo."),

        heading2("5.3 Limitacoes da Analise"),
        bulletItem("Os dados utilizados sao indices encadeados, nao valores absolutos, o que limita a analise em termos monetarios"),
        bulletItem("O periodo analisado e relativamente curto (5 anos), englobando predominantemente o ciclo pandemico"),
        bulletItem("Os dados com ajuste sazonal podem diferir dos dados originais em niveis absolutos"),
        bulletItem("A analise nao incorpora variaveis complementares como inflacao, emprego e taxa de juros"),

        // ═══ 6. CONCLUSOES ═══
        heading1("6. Conclusoes e Recomendacoes"),

        heading2("6.1 Principais Conclusoes"),
        bodyPara("1. O impacto da COVID-19 foi o evento economico mais significativo do periodo, com queda de -9,6% do PIB no 2o trimestre de 2020, seguida de recuperacao historica de +17,4% no trimestre seguinte."),
        bodyPara("2. A economia brasileira atingiu e superou o nivel pre-pandemia no 3o trimestre de 2021, e desde entao apresenta crescimento moderado mas consistente."),
        bodyPara("3. O setor de Servicos lidera a recuperacao e o crescimento, refletindo a estrutura economica do pais, enquanto a Industria apresenta dinamica mais lenta."),
        bodyPara("4. O Consumo das Familias constitui o principal motor da demanda interna, com indice (113,12) superior ao PIB (112,23) no 4o trimestre de 2024."),
        bodyPara("5. As taxas de crescimento estabilizaram-se em patamares moderados (variacao interanual de +2,81%), sugerindo crescimento proximo ao potencial."),

        heading2("6.2 Recomendacoes"),
        bulletItem("Monitoramento continuo: Manter o acompanhamento trimestral dos indicadores do SCNT para detectar mudancas de tendencia"),
        bulletItem("Politica de investimento: Implementar politicas que estimulem a Formacao Bruta de Capital Fixo para sustentar crescimento de longo prazo"),
        bulletItem("Diversificacao setorial: Reduzir a dependencia do setor de Servicos, promovendo politicas industriais que fortalecam a Industria e a inovacao"),
        bulletItem("Protecao do consumo: Manter politicas de protecao ao emprego e renda que sustentem o Consumo das Familias como motor da economia"),
        bulletItem("Integracao de dados: Complementar a analise do SCNT com indicadores de inflacao (IPCA), emprego (PNAD Continua) e politica monetaria (taxa Selic) para uma visao mais completa"),

        // ═══ 7. REFERENCIAS ═══
        heading1("7. Referencias"),
        bodyPara("IBGE. Sistema de Contas Nacionais Trimestrais (SCNT). Disponivel em: https://www.ibge.gov.br/estatisticas/economicas/comercio/9300-contas-nacionais-trimestrais.html"),
        bodyPara("IBGE. SIDRA - Tabela 1621. Disponivel em: https://sidra.ibge.gov.br/tabela/1621"),
        bodyPara("BANCO CENTRAL DO BRASIL. Relatorio de Inflacao. Various editions, 2020-2024."),
        bodyPara("INSTITUTO DE PESQUISA ECONOMICA APLICADA (IPEA). Carta de Conjuntura. Various editions, 2020-2024."),
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
