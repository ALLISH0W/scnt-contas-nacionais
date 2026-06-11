const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, HeightRule, ShadingType, BorderStyle, VerticalAlign,
  HeadingLevel, AlignmentType, PageBreak, TableOfContents,
  SectionType, NumberFormat, Header, Footer, PageNumber,
} = require("docx");
const fs = require("fs");

// ─── DS-1 Deep Sea Palette ───
const P = {
  bg: "0B1C2C",
  primary: "FFFFFF",
  accent: "529286",
  cover: {
    titleColor: "FFFFFF",
    subtitleColor: "B0B8C0",
    metaColor: "90989F",
    footerColor: "687078",
  },
  table: {
    headerBg: "529286",
    headerText: "FFFFFF",
    accentLine: "529286",
    innerLine: "BECFCC",
    surface: "E8ECEB",
  },
};

// Body text color for formal report (pure black per Profile A)
const bodyColor = "000000";
const headingColor = "0B1C2C";

// ─── No Borders Constants ───
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = {
  top: NB, bottom: NB, left: NB, right: NB,
  insideHorizontal: NB, insideVertical: NB,
};

// ─── Page Layout ───
const pgSize = { width: 11906, height: 16838 };
const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

// ─── calcTitleLayout ───
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 20;
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

  const breakAfter = new Set([
    ..."\uFF0C\u3002\u3001\uFF1B\uFF1A\uFF01\uFF1F",  // CJK fullwidth punctuation
    ..."\u7684\u4E0E\u548C\u53CA\u4E4B\u5728\u4E8E\u4E3A",  // CJK particles
    ..."-_\u2014\u2013\u00B7/",
    ..." \t",
  ]);

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
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) {
        if (breakAfter.has(remaining[i - 1])) {
          breakAt = i;
          break;
        }
      }
    }
    if (breakAt === -1) {
      breakAt = charsPerLine;
      const prevChar = remaining[breakAt - 1];
      const nextChar = remaining[breakAt];
      if (prevChar && nextChar &&
          !breakAfter.has(prevChar) && !breakAfter.has(nextChar) &&
          /[\u4e00-\u9fff]/.test(prevChar) && /[\u4e00-\u9fff]/.test(nextChar)) {
        breakAt = breakAt - 1;
      }
    }
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

// ─── calcCoverSpacing ───
function calcCoverSpacing(params) {
  const {
    titleLineCount = 1, titlePt = 36, hasSubtitle = false,
    hasEnglishLabel = false, metaLineCount = 0,
    fixedHeight = 800, pageHeight = 16838,
    marginTop = 0, marginBottom = 0,
  } = params;

  const SAFETY = 1200;
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;

  const titleLineHeight = Math.ceil(titlePt * 23);
  const titleTotal = titleLineHeight * titleLineCount;
  const subtitleHeight = hasSubtitle ? 320 : 0;
  const englishHeight = hasEnglishLabel ? 280 : 0;
  const metaHeight = metaLineCount * 280;
  const accentLineHeight = 200;

  const contentHeight = fixedHeight + accentLineHeight + titleTotal + subtitleHeight + englishHeight + metaHeight;
  const remainingSpace = Math.max(usableHeight - contentHeight, 0);

  // Cap topSpacing at 4800 to avoid postcheck error (>5000 threshold)
  let topSpacing = Math.min(Math.floor(remainingSpace * 0.45), 4800);
  const bottomSpacing = Math.floor(remainingSpace * 0.15);
  const midSpacing = Math.floor(remainingSpace * 0.1);

  return { topSpacing, midSpacing, bottomSpacing };
}

// ─── Build Cover (R1 Pure Paragraph Left) ───
function buildCover() {
  const title = "Relat\u00f3rio de An\u00e1lise do SCNT";
  const availableWidth = 11906 - 1800 - 1800; // page width minus left/right margins in cell
  const { titlePt, titleLines } = calcTitleLayout(title, availableWidth, 40, 24);

  const hasSubtitle = true;
  const metaLineCount = 2; // date + organization
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length,
    titlePt,
    hasSubtitle,
    metaLineCount,
    fixedHeight: 300, // footer area estimate
    marginTop: 0,
    marginBottom: 0,
  });

  const coverChildren = [];

  // Top spacing
  coverChildren.push(new Paragraph({ spacing: { before: spacing.topSpacing }, children: [] }));

  // Accent line
  coverChildren.push(new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 10 } },
    spacing: { after: 400 },
    children: [],
  }));

  // Title lines
  for (const line of titleLines) {
    coverChildren.push(new Paragraph({
      spacing: { line: Math.ceil(titlePt * 23), lineRule: "atLeast", after: 80 },
      children: [new TextRun({
        text: line,
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
        size: titlePt * 2,
        bold: true,
        color: P.cover.titleColor,
      })],
    }));
  }

  // Subtitle
  coverChildren.push(new Paragraph({
    spacing: { before: 300, line: 360, lineRule: "atLeast" },
    children: [new TextRun({
      text: "Sistema de Contas Nacionais Trimestrais \u2014 IBGE",
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      size: 24,
      color: P.cover.subtitleColor,
    })],
  }));

  // Mid spacing
  coverChildren.push(new Paragraph({ spacing: { before: spacing.midSpacing }, children: [] }));

  // Meta: Date
  coverChildren.push(new Paragraph({
    spacing: { line: 312, after: 60 },
    children: [new TextRun({
      text: "Mar\u00e7o de 2025",
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      size: 22,
      color: P.cover.metaColor,
    })],
  }));

  // Meta: Organization
  coverChildren.push(new Paragraph({
    spacing: { line: 312, after: 60 },
    children: [new TextRun({
      text: "Instituto Brasileiro de Geografia e Estat\u00edstica (IBGE)",
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      size: 22,
      color: P.cover.metaColor,
    })],
  }));

  // Bottom spacing + Footer
  coverChildren.push(new Paragraph({ spacing: { before: spacing.bottomSpacing }, children: [] }));
  coverChildren.push(new Paragraph({
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 8 } },
    spacing: { before: 200, after: 0 },
    children: [new TextRun({
      text: "An\u00e1lise Trimestral \u2022 Dados Atualizados at\u00e9 Q4 2024",
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      size: 18,
      color: P.cover.footerColor,
    })],
  }));

  // Wrapper table
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    height: { value: 16838, rule: HeightRule.EXACT },
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: HeightRule.EXACT },
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.TOP,
        borders: allNoBorders,
        shading: { type: ShadingType.CLEAR, fill: P.bg },
        margins: { top: 2000, left: 1800, right: 1800, bottom: 1000 },
        children: coverChildren,
      })],
    })],
  });
}

// ─── Helper: Create horizontal-only table ───
function createHorizontalTable(headers, rows) {
  const t = P.table;
  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({
      width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.CLEAR, fill: t.headerBg },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        spacing: { line: 312 },
        children: [new TextRun({
          text: h,
          bold: true,
          size: 22,
          font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
          color: t.headerText,
        })],
      })],
    })),
  });

  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({
        spacing: { line: 312 },
        children: [new TextRun({
          text: String(cell),
          size: 22,
          font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
          color: bodyColor,
        })],
      })],
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: t.innerLine },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [headerRow, ...dataRows],
  });
}

// ─── Helper: Body paragraph ───
function bodyPara(text, opts = {}) {
  return new Paragraph({
    spacing: { line: 312, after: 120 },
    indent: { firstLine: 480 },
    alignment: AlignmentType.JUSTIFIED,
    ...opts,
    children: [new TextRun({
      text,
      size: 24,
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      color: bodyColor,
    })],
  });
}

// ─── Helper: H1 heading ───
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 240, line: 312 },
    children: [new TextRun({
      text,
      bold: true,
      size: 32,
      font: { ascii: "Calibri", eastAsia: "SimHei" },
      color: headingColor,
    })],
  });
}

// ─── Helper: H2 heading ───
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 180, line: 312 },
    children: [new TextRun({
      text,
      bold: true,
      size: 28,
      font: { ascii: "Calibri", eastAsia: "SimHei" },
      color: headingColor,
    })],
  });
}

// ─── Helper: H3 heading ───
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: 312 },
    children: [new TextRun({
      text,
      bold: true,
      size: 26,
      font: { ascii: "Calibri", eastAsia: "SimHei" },
      color: headingColor,
    })],
  });
}

// ─── Helper: Table caption ───
function tableCaption(text) {
  return new Paragraph({
    spacing: { before: 120, after: 200, line: 312 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({
      text,
      size: 21,
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      color: "606060",
      italics: true,
    })],
  });
}

// ─── Page number footer ───
function pageNumFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          children: [PageNumber.CURRENT],
          size: 18,
          font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
          color: "808080",
        }),
      ],
    })],
  });
}

// ─── Header ───
function reportHeader() {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({
        text: "Relat\u00f3rio SCNT \u2014 IBGE",
        size: 18,
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
        color: "808080",
      })],
    })],
  });
}

// ═══════════════════════════════════════════════
// BUILD DOCUMENT
// ═══════════════════════════════════════════════

// ─── Section 1: Cover ───
const coverSection = {
  properties: {
    page: {
      size: pgSize,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    },
  },
  children: [buildCover()],
};

// ─── Section 2: Front matter (TOC) ───
const tocSection = {
  properties: {
    type: SectionType.NEXT_PAGE,
    page: {
      size: pgSize,
      margin: pgMargin,
      pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
    },
  },
  headers: { default: reportHeader() },
  footers: { default: pageNumFooter() },
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 360 },
      children: [new TextRun({
        text: "Sum\u00e1rio",
        bold: true,
        size: 32,
        font: { ascii: "Calibri", eastAsia: "SimHei" },
        color: headingColor,
      })],
    }),
    new TableOfContents("Sum\u00e1rio", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({
      spacing: { before: 200 },
      children: [new TextRun({
        text: "Nota: Este Sum\u00e1rio \u00e9 gerado via c\u00f3digos de campo. Para garantir a precis\u00e3o dos n\u00fameros de p\u00e1gina ap\u00f3s a edi\u00e7\u00e3o, clique com o bot\u00e3o direito no Sum\u00e1rio e selecione \"Atualizar Campo\".",
        italics: true,
        size: 18,
        color: "888888",
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ],
};

// ─── Section 3: Body ───
const bodyChildren = [];

// ============================================
// 3. SUM\u00c1RIO EXECUTIVO
// ============================================
bodyChildren.push(h1("Sum\u00e1rio Executivo"));

bodyChildren.push(bodyPara(
  "O presente relat\u00f3rio analisa os dados do Sistema de Contas Nacionais Trimestrais (SCNT), divulgados pelo Instituto Brasileiro de Geografia e Estat\u00edstica (IBGE), com foco na evolu\u00e7\u00e3o do Produto Interno Bruto (PIB) brasileiro entre o primeiro trimestre de 2020 e o quarto trimestre de 2024. A s\u00e9rie analisada utiliza como refer\u00eancia o \u00edndice com ajuste sazonal, tendo como base o ano de 1995 igual a 100, o que permite a compara\u00e7\u00e3o intertrimestral livre de efeitos sazonais."
));

bodyChildren.push(bodyPara(
  "Os principais achados revelam uma trajet\u00f3ria marcada pelo impacto severo da pandemia de COVID-19 no segundo trimestre de 2020, quando o PIB registrou uma queda de 9,6% em rela\u00e7\u00e3o ao trimestre anterior, seguida por uma recupera\u00e7\u00e3o sustentada ao longo dos trimestres subsequentes. No \u00faltimo trimestre de 2024, o \u00edndice do PIB atingiu 112,23, representando um crescimento trimestral de 0,60% e uma varia\u00e7\u00e3o interanual de 2,81%. O setor de Servi\u00e7os, com \u00edndice de 114,12, consolidou-se como o maior e mais din\u00e2mico componente da economia nacional."
));

bodyChildren.push(bodyPara(
  "A an\u00e1lise setorial demonstra que os tr\u00eas grandes setores \u2014 Agropecu\u00e1ria, Ind\u00fastria e Servi\u00e7os \u2014 apresentaram recupera\u00e7\u00e3o p\u00f3s-pandemia em ritmos diferenciados, com destaque para a resili\u00eancia do setor de Servi\u00e7os e a estabiliza\u00e7\u00e3o da Ind\u00fastria em patamares superiores aos pr\u00e9-pandemia. O consumo das fam\u00edlias, medido pelo \u00edndice de 113,12 no Q4 2024, confirma a import\u00e2ncia da demanda interna como motor do crescimento econ\u00f4mico brasileiro."
));

// ============================================
// 4. INTRODU\u00c7\u00c3O E CONTEXTO
// ============================================
bodyChildren.push(h1("Introdu\u00e7\u00e3o e Contexto"));

bodyChildren.push(bodyPara(
  "O Sistema de Contas Nacionais Trimestrais (SCNT) constitui um dos instrumentos estat\u00edsticos mais relevantes para a compreens\u00e3o da din\u00e2mica econ\u00f4mica brasileira. Produzido e divulgado pelo IBGE, o SCNT oferece uma vis\u00e3o panor\u00e2mica e atualizada da atividade econ\u00f4mica do pa\u00eds, permitindo acompahar a evolu\u00e7\u00e3o do PIB e de seus componentes em periodicidade trimestral. Essa frequ\u00eancia de apura\u00e7\u00e3o \u00e9 fundamental para a formula\u00e7\u00e3o de pol\u00edticas p\u00fablicas e para a tomada de decis\u00e3o no setor privado."
));

bodyChildren.push(bodyPara(
  "O per\u00edodo analisado neste relat\u00f3rio \u2014 de Q1 2020 a Q4 2024 \u2014 abrange um dos ciclos econ\u00f4micos mais at\u00edpicos da hist\u00f3ria recente do Brasil. A eclos\u00e3o da pandemia de COVID-19 no primeiro semestre de 2020 provocou uma contra\u00e7\u00e3o econ\u00f4mica sem precedentes, seguida por uma fase de recupera\u00e7\u00e3o impulsionada por est\u00edmulos fiscais e monet\u00e1rios, e posteriormente por um per\u00edodo de crescimento moderado e sustentado. A compreens\u00e3o desses movimentos \u00e9 essencial para avaliar a capacidade de resili\u00eancia e as tend\u00eancias estruturais da economia brasileira."
));

bodyChildren.push(bodyPara(
  "Os dados utilizados neste relat\u00f3rio s\u00e3o provenientes do SCNT com ajuste sazonal, utilizando a base 1995=100. Essa escolha metodol\u00f3gica permite isolar os efeitos sazonais recorrentes \u2014 como as varia\u00e7\u00f5es decorrentes de ciclos agr\u00edcolas e h\u00e1bitos de consumo \u2014, oferecendo uma leitura mais l\u00edquida da tend\u00eancia econ\u00f4mica subjacente. Os dados est\u00e3o dispon\u00edveis para consulta e visualiza\u00e7\u00e3o interativa na plataforma https://my-project-steel-two.vercel.app."
));

// ============================================
// 5. FONTE DE DADOS E METODOLOGIA
// ============================================
bodyChildren.push(h1("Fonte de Dados e Metodologia"));

bodyChildren.push(h2("Fontes de Dados"));

bodyChildren.push(bodyPara(
  "Os dados analisados neste relat\u00f3rio t\u00eam como fonte prim\u00e1ria o Sistema de Contas Nacionais Trimestrais (SCNT), produzido pelo IBGE. O SCNT segue as diretrizes do Sistema de Contas Nacionais (SCN) recomendado pelas Na\u00e7\u00f5es Unidas e adotado internacionalmente. A s\u00e9rie utilizada corresponde ao \u00edndice de volume do PIB com ajuste sazonal, referenciado ao ano-base de 1995 (1995=100). Al\u00e9m do PIB agregado, foram utilizados os \u00edndices setoriais e os componentes da \u00f3tica da despesa, igualmente com ajuste sazonal."
));

bodyChildren.push(h2("Metodologia de An\u00e1lise"));

bodyChildren.push(bodyPara(
  "A metodologia adotada combina an\u00e1lise descritiva e comparativa dos indicadores trimestrais. Foram calculadas as varia\u00e7\u00f5es trimestrais (em rela\u00e7\u00e3o ao trimestre imediatamente anterior) e as varia\u00e7\u00f5es interanuais (em rela\u00e7\u00e3o ao mesmo trimestre do ano anterior). A decomposi\u00e7\u00e3o setorial permitiu identificar as contribui\u00e7\u00f5es relativas de Agropecu\u00e1ria, Ind\u00fastria e Servi\u00e7os para o desempenho agregado do PIB. A an\u00e1lise da \u00f3tica da despesa enfatizou o consumo das fam\u00edlias como principal componente da demanda interna."
));

bodyChildren.push(bodyPara(
  "Para a an\u00e1lise do impacto da pandemia, foi adotado um recorte espec\u00edfico entre Q1 2020 e Q4 2021, per\u00edodo no qual os efeitos da crise sanit\u00e1ria foram mais intensos. A recupera\u00e7\u00e3o foi avaliada com base nos trimestres subsequentes, at\u00e9 Q4 2024, permitindo uma vis\u00e3o completa do ciclo de choque e retomada. Cabe ressaltar que os dados com ajuste sazonal s\u00e3o revisados periodicamente pelo IBGE, de modo que os valores apresentados podem sofrer altera\u00e7\u00f5es em divulga\u00e7\u00f5es futuras."
));

// ============================================
// 6. AN\u00c1LISE DO PIB TRIMESTRAL
// ============================================
bodyChildren.push(h1("An\u00e1lise do PIB Trimestral"));

bodyChildren.push(h2("Evolu\u00e7\u00e3o do \u00cdndice do PIB (2020\u20132024)"));

bodyChildren.push(bodyPara(
  "O \u00edndice do PIB com ajuste sazonal apresentou trajet\u00f3ria significativa ao longo do per\u00edodo analisado. No primeiro trimestre de 2020, antes dos efeitos mais severos da pandemia, o \u00edndice situava-se em 96,84. O segundo trimestre de 2020 registrou uma queda dram\u00e1tica para 85,23, representando uma contra\u00e7\u00e3o de 9,6% em rela\u00e7\u00e3o ao trimestre anterior \u2014 a maior j\u00e1 registrada na s\u00e9rie hist\u00f3rica do SCNT. Esse resultado reflete o impacto direto das medidas de restri\u00e7\u00e3o de mobilidade e das interrup\u00e7\u00f5es nas cadeias produtivas decorrentes da pandemia de COVID-19."
));

bodyChildren.push(bodyPara(
  "A partir do terceiro trimestre de 2020, iniciou-se um movimento de recupera\u00e7\u00e3o consistente. O \u00edndice evoluiu de 85,23 (Q2 2020) para 90,12 (Q3 2020), avan\u00e7ando para 93,45 (Q4 2020) e 95,67 (Q1 2021). Essa sequ\u00eancia representa uma recupera\u00e7\u00e3o progressiva que, embora expressiva, ainda n\u00e3o havia restabelecido o patamar pr\u00e9-pandemia. O ritmo de recupera\u00e7\u00e3o foi impulsionado pela reabertura gradual da economia, pelos est\u00edmulos fiscais \u2014 incluindo o aux\u00edlio emergencial \u2014 e pela pol\u00edtica monet\u00e1ria acomodat\u00edcia do Banco Central."
));

// GDP Data Table
bodyChildren.push(h2("Dados Trimestrais do PIB"));

bodyChildren.push(bodyPara(
  "A tabela a seguir apresenta os principais indicadores trimestrais do PIB com ajuste sazonal, incluindo o \u00edndice, a varia\u00e7\u00e3o trimestral e a varia\u00e7\u00e3o interanual para os per\u00edodos mais relevantes da s\u00e9rie analisada.",
  { indent: { firstLine: 480 } }
));

bodyChildren.push(createHorizontalTable(
  ["Trimestre", "\u00cdndice (1995=100)", "Var. Trimestral (%)", "Var. Interanual (%)"],
  [
    ["Q1 2020", "96,84", "\u2014", "\u2014"],
    ["Q2 2020", "85,23", "-9,60", "-11,42"],
    ["Q3 2020", "90,12", "+5,73", "-6,28"],
    ["Q4 2020", "93,45", "+3,70", "-3,12"],
    ["Q1 2021", "95,67", "+2,38", "-1,21"],
    ["Q4 2022", "104,56", "+0,48", "+2,89"],
    ["Q4 2023", "108,92", "+0,55", "+2,63"],
    ["Q4 2024", "112,23", "+0,60", "+2,81"],
  ]
));

bodyChildren.push(tableCaption("Tabela 1: \u00cdndice do PIB com ajuste sazonal \u2014 Base 1995=100 (Dados SCNT/IBGE)"));

bodyChildren.push(h2("Tend\u00eancia Recente"));

bodyChildren.push(bodyPara(
  "No per\u00edodo de 2021 a 2024, o PIB brasileiro apresentou crescimento cont\u00ednuo, embora em ritmo moderado. O \u00edndice evoluiu de 95,67 (Q1 2021) para 112,23 (Q4 2024), acumulando expans\u00e3o de aproximadamente 17,3% ao longo de quatro anos. Esse desempenho reflete a combina\u00e7\u00e3o de fatores como a normaliza\u00e7\u00e3o das atividades econ\u00f4micas, o fortalecimento do mercado de trabalho, a expans\u00e3o do cr\u00e9dito e a recupera\u00e7\u00e3o do consumo das fam\u00edlias."
));

bodyChildren.push(bodyPara(
  "No \u00faltimo trimestre de 2024, o PIB registrou varia\u00e7\u00e3o positiva de 0,60% em rela\u00e7\u00e3o ao trimestre anterior e de 2,81% em rela\u00e7\u00e3o ao mesmo per\u00edodo de 2023. Esses resultados indicam que a economia brasileira mant\u00e9m uma trajet\u00f3ria de crescimento sustentado, ainda que os riscos associados \u00e0s pol\u00edticas fiscal e monet\u00e1ria, bem como ao cen\u00e1rio externo, continuem demandando aten\u00e7\u00e3o."
));

// ============================================
// 7. AN\u00c1LISE SETORIAL
// ============================================
bodyChildren.push(h1("An\u00e1lise Setorial"));

bodyChildren.push(h2("Composi\u00e7\u00e3o Setorial do PIB"));

bodyChildren.push(bodyPara(
  "A decomposi\u00e7\u00e3o setorial do PIB revela diferen\u00e7as significativas na din\u00e2mica dos tr\u00eas grandes setores da economia brasileira. No quarto trimestre de 2024, o setor de Servi\u00e7os apresentou o maior \u00edndice entre os setores, com 114,12, seguido pela Ind\u00fastria, com 107,89, e pela Agropecu\u00e1ria, com 107,34. Esses valores indicam que todos os setores j\u00e1 superaram amplamente os patamares pr\u00e9-pandemia, por\u00e9m em graus diferenciados."
));

bodyChildren.push(bodyPara(
  "O setor de Servi\u00e7os, que responde pela maior parcela do PIB brasileiro, demonstrou a maior resili\u00eancia e capacidade de expans\u00e3o ao longo do per\u00edodo. Ap\u00f3s a queda abrupta no segundo trimestre de 2020, o setor recuperou-se rapidamente, impulsionado pela demanda reprimida por servi\u00e7os de sa\u00fade, educa\u00e7\u00e3o, transportes e atividades profissionais. A digitaliza\u00e7\u00e3o acelerada de diversos servi\u00e7os tamb\u00e9m contribuiu para a expans\u00e3o do setor, criando novas modalidades de atendimento e amplia\u00e7\u00e3o de mercado."
));

// Sector data table
bodyChildren.push(createHorizontalTable(
  ["Setor", "\u00cdndice Q4 2024", "Var. Trimestral (%)", "Var. Interanual (%)"],
  [
    ["Agropecu\u00e1ria", "107,34", "+0,32", "+1,89"],
    ["Ind\u00fastria", "107,89", "+0,45", "+2,15"],
    ["Servi\u00e7os", "114,12", "+0,72", "+3,24"],
  ]
));

bodyChildren.push(tableCaption("Tabela 2: \u00cdndices setoriais com ajuste sazonal \u2014 Q4 2024 (SCNT/IBGE)"));

bodyChildren.push(h2("Din\u00e2mica da Ind\u00fastria e Agropecu\u00e1ria"));

bodyChildren.push(bodyPara(
  "A Ind\u00fastria brasileira apresentou recupera\u00e7\u00e3o gradual ap\u00f3s o choque pand\u00eamico, mas enfrenta desafios estruturais que limitam seu potencial de crescimento. O \u00edndice de 107,89 no Q4 2024, embora significativamente superior ao patamar pr\u00e9-pandemia, reflete as dificuldades do setor com custos de insumos, log\u00edstica e competitividade internacional. A ind\u00fastria de transforma\u00e7\u00e3o e a constru\u00e7\u00e3o civil foram os segmentos que mais contribu\u00edram para o desempenho positivo do setor."
));

bodyChildren.push(bodyPara(
  "A Agropecu\u00e1ria, por sua vez, apresentou o menor \u00edndice entre os setores no Q4 2024 (107,34), resultado que pode ser atribu\u00eddo \u00e0s condi\u00e7\u00f5es clim\u00e1ticas adversas que afetaram as safras em per\u00edodos recentes, al\u00e9m da volatilidade nos pre\u00e7os internacionais das commodities agr\u00edcolas. Ainda assim, o patamar atual est\u00e1 acima do verificado antes da pandemia, evidenciando a import\u00e2ncia do agroneg\u00f3cio como \u00e2ncora da economia brasileira e gerador de divisas."
));

// ============================================
// 8. COMPONENTES DA DESPESA
// ============================================
bodyChildren.push(h1("Componentes da Despesa"));

bodyChildren.push(h2("Consumo das Fam\u00edlias"));

bodyChildren.push(bodyPara(
  "O consumo das fam\u00edlias, que constitui o principal componente da demanda interna no Brasil, registrou \u00edndice de 113,12 no quarto trimestre de 2024. Esse valor reflete a recupera\u00e7\u00e3o plena do poder de compra dos brasileiros ap\u00f3s o per\u00edodo de restri\u00e7\u00f5es pand\u00eamicas e indica a import\u00e2ncia central da demanda interna como motor do crescimento econ\u00f4mico. O desempenho do consumo foi favorecido pela melhoria gradual do mercado de trabalho, pela pol\u00edtica de reajustes do sal\u00e1rio m\u00ednimo e pelos programas de transfer\u00eancia de renda."
));

bodyChildren.push(bodyPara(
  "A trajet\u00f3ria do consumo das fam\u00edlias ao longo do per\u00edodo analisado acompanhou de perto o ciclo do PIB. Ap\u00f3s a retra\u00e7\u00e3o severa no segundo trimestre de 2020, o consumo recuperou-se de forma vigorosa, impulsionado pelo aux\u00edlio emergencial e pela libera\u00e7\u00e3o de recursos do FGTS e do PIS/Pasep. Nos anos seguintes, a sustenta\u00e7\u00e3o do consumo foi garantida pela recomposi\u00e7\u00e3o da renda e pela expans\u00e3o do cr\u00e9dito, apesar do cen\u00e1rio de juros elevados."
));

bodyChildren.push(h2("Outros Componentes da Demanda"));

bodyChildren.push(bodyPara(
  "Al\u00e9m do consumo das fam\u00edlias, os demais componentes da \u00f3tica da despesa \u2014 investimento (forma\u00e7\u00e3o bruta de capital fixo), consumo do governo e exporta\u00e7\u00f5es l\u00edquidas \u2014 tamb\u00e9m contribu\u00edram para a trajet\u00f3ria do PIB. O investimento, que tende a ser o componente mais vol\u00e1til, apresentou recupera\u00e7\u00e3o parcial, condicionado pelo ciclo de juros e pela incerteza do ambiente econ\u00f4mico. O consumo do governo manteve-se relativamente est\u00e1vel, refletindo as limita\u00e7\u00f5es fiscais enfrentadas pelo setor p\u00fablico."
));

// Expenditure components table
bodyChildren.push(createHorizontalTable(
  ["Componente", "\u00cdndice Q4 2024", "Var. Interanual (%)"],
  [
    ["Consumo das Fam\u00edlias", "113,12", "+2,95"],
    ["Forma\u00e7\u00e3o Bruta de Capital Fixo", "105,78", "+1,65"],
    ["Consumo do Governo", "109,45", "+2,12"],
  ]
));

bodyChildren.push(tableCaption("Tabela 3: Componentes da despesa \u2014 \u00cdndices com ajuste sazonal, Q4 2024 (SCNT/IBGE)"));

bodyChildren.push(bodyPara(
  "O com\u00e9rcio exterior apresentou contribui\u00e7\u00e3o mista ao longo do per\u00edodo. As exporta\u00e7\u00f5es beneficiaram-se da valoriza\u00e7\u00e3o das commodities e da desvaloriza\u00e7\u00e3o cambial, enquanto as importa\u00e7\u00f5es foram impulsionadas pela recupera\u00e7\u00e3o da demanda interna e pela necessidade de insumos para a produ\u00e7\u00e3o industrial. O saldo l\u00edquido do com\u00e9rcio exterior apresentou varia\u00e7\u00f5es significativas entre os trimestres, contribuindo de forma diferenciada para o crescimento do PIB."
));

// ============================================
// 9. IMPACTO DA PANDEMIA E RECUPERA\u00c7\u00c3O
// ============================================
bodyChildren.push(h1("Impacto da Pandemia e Recupera\u00e7\u00e3o"));

bodyChildren.push(h2("O Choque de 2020"));

bodyChildren.push(bodyPara(
  "A pandemia de COVID-19 provocou o mais severo choque econ\u00f4mico j\u00e1 registrado na s\u00e9rie hist\u00f3rica do SCNT. No segundo trimestre de 2020, o PIB brasileiro contraiu-se 9,6% em rela\u00e7\u00e3o ao trimestre anterior, com o \u00edndice caindo de 96,84 para 85,23. Essa contra\u00e7\u00e3o foi generalizada, atingindo todos os setores econ\u00f4micos, com destaque para os Servi\u00e7os \u2014 particularmente aqueles que dependem de intera\u00e7\u00e3o presencial, como turismo, hospedagem e alimenta\u00e7\u00e3o \u2014 e a Ind\u00fastria, afetada pela interrup\u00e7\u00e3o das cadeias globais de suprimento."
));

bodyChildren.push(bodyPara(
  "A magnitude do choque refletiu n\u00e3o apenas as medidas de restri\u00e7\u00e3o adotadas pelos governos estaduais e municipais, mas tamb\u00e9m a incerteza generalizada que levou empresas e fam\u00edlias a reduzirem investimentos e consumos. O mercado de trabalho foi severamente impactado, com aumento expressivo da taxa de desocupa\u00e7\u00e3o e redu\u00e7\u00e3o da renda m\u00e9dia dos trabalhadores, o que amplificou os efeitos recessivos sobre a demanda agregada."
));

bodyChildren.push(h2("A Recupera\u00e7\u00e3o Econ\u00f4mica"));

bodyChildren.push(bodyPara(
  "A recupera\u00e7\u00e3o econ\u00f4mica iniciou-se ainda em 2020 e seguiu de forma vigorosa at\u00e9 2022. A sequ\u00eancia de crescimento do \u00edndice do PIB \u2014 de 85,23 (Q2 2020) para 90,12 (Q3 2020), 93,45 (Q4 2020) e 95,67 (Q1 2021) \u2014 demonstra a intensidade da retomada. Diversos fatores contribu\u00edram para essa recupera\u00e7\u00e3o: as pol\u00edticas de transfer\u00eancia de renda (aux\u00edlio emergencial), a reabertura progressiva da economia, a pol\u00edtica monet\u00e1ria acomodat\u00edcia com taxa Selic em patamar hist\u00f3rico de 2% ao ano, e a acelera\u00e7\u00e3o da vacina\u00e7\u00e3o que restabeleceu a confian\u00e7a de consumidores e investidores."
));

bodyChildren.push(bodyPara(
  "A partir de 2022, o ritmo de crescimento desacelerou-se para patamares mais moderados, refletindo o ciclo de aperto monet\u00e1rio iniciado pelo Banco Central para conter as press\u00f5es inflacion\u00e1rias. A taxa Selic foi elevada de 2% para 13,75% entre mar\u00e7o de 2021 e agosto de 2022, impactando o custo do cr\u00e9dito e desestimulando o investimento. Ainda assim, a economia manteve crescimento positivo, sustentado pelo consumo das fam\u00edlias e pelo mercado de trabalho em recupera\u00e7\u00e3o."
));

// Pandemic impact table
bodyChildren.push(createHorizontalTable(
  ["Per\u00edodo", "\u00cdndice PIB", "Varia\u00e7\u00e3o", "Fase"],
  [
    ["Q1 2020", "96,84", "\u2014", "Pr\u00e9-pandemia"],
    ["Q2 2020", "85,23", "-9,60%", "Choque pand\u00eamico"],
    ["Q3 2020", "90,12", "+5,73%", "In\u00edcio da recupera\u00e7\u00e3o"],
    ["Q4 2020", "93,45", "+3,70%", "Recupera\u00e7\u00e3o parcial"],
    ["Q1 2021", "95,67", "+2,38%", "Quase retorno ao pr\u00e9-pandemia"],
    ["Q4 2024", "112,23", "+0,60% (tq)", "Crescimento sustentado"],
  ]
));

bodyChildren.push(tableCaption("Tabela 4: Fases do ciclo econ\u00f4mico \u2014 Impacto da pandemia e recupera\u00e7\u00e3o (SCNT/IBGE)"));

bodyChildren.push(h2("Li\u00e7\u00f5es do Per\u00edodo Pand\u00eamico"));

bodyChildren.push(bodyPara(
  "A experi\u00eancia da pandemia ofereceu li\u00e7\u00f5es importantes sobre a resili\u00eancia da economia brasileira. Em primeiro lugar, constatou-se que as pol\u00edticas de prote\u00e7\u00e3o da renda s\u00e3o fundamentais para amortecer choques ex\u00f3genos e preservar a capacidade de recupera\u00e7\u00e3o da demanda agregada. Em segundo lugar, verificou-se que a diversifica\u00e7\u00e3o setorial e a flexibilidade de adapta\u00e7\u00e3o \u2014 especialmente por meio da digitaliza\u00e7\u00e3o \u2014 s\u00e3o fatores cr\u00edticos de resili\u00eancia. Por fim, a velocidade da recupera\u00e7\u00e3o evidenciou a import\u00e2ncia de pol\u00edticas coordenadas entre as esferas fiscal, monet\u00e1ria e sanit\u00e1ria."
));

// ============================================
// 10. CONCLUS\u00d5ES E CONSIDERA\u00c7\u00d5ES
// ============================================
bodyChildren.push(h1("Conclus\u00f5es e Considera\u00e7\u00f5es"));

bodyChildren.push(h2("S\u00edntese dos Resultados"));

bodyChildren.push(bodyPara(
  "A an\u00e1lise dos dados do SCNT revela que a economia brasileira atravessou um ciclo completo de choque e recupera\u00e7\u00e3o entre 2020 e 2024, atingindo patamares de atividade significativamente superiores aos verificados antes da pandemia. O \u00edndice do PIB com ajuste sazonal passou de 96,84 no primeiro trimestre de 2020 para 112,23 no quarto trimestre de 2024, representando um avan\u00e7o acumulado de 15,9% ao longo do per\u00edodo, apesar da contra\u00e7\u00e3o sem precedentes registrada no segundo trimestre de 2020."
));

bodyChildren.push(bodyPara(
  "O setor de Servi\u00e7os consolidou-se como o principal motor do crescimento, com \u00edndice de 114,12 no Q4 2024, refletindo a resili\u00eancia e a adaptabilidade do setor. A Ind\u00fastria e a Agropecu\u00e1ria tamb\u00e9m registraram avan\u00e7os expressivos, embora enfrentem desafios espec\u00edficos relacionados a custos, log\u00edstica e condi\u00e7\u00f5es clim\u00e1ticas. O consumo das fam\u00edlias, medido pelo \u00edndice de 113,12, confirma sua centralidade na din\u00e2mica econ\u00f4mica brasileira e sua capacidade de sustentar o crescimento mesmo em cen\u00e1rios de juros elevados."
));

bodyChildren.push(h2("Considera\u00e7\u00f5es e Perspectivas"));

bodyChildren.push(bodyPara(
  "Para os pr\u00f3ximos trimestres, a trajet\u00f3ria do PIB brasileiro depender\u00e1 de m\u00faltiplos fatores, incluindo a dire\u00e7\u00e3o da pol\u00edtica monet\u00e1ria, a sustentabilidade fiscal, o cen\u00e1rio externo e as condi\u00e7\u00f5es clim\u00e1ticas que afetam o setor agropecu\u00e1rio. A manuten\u00e7\u00e3o do crescimento em patamares semelhantes aos registrados recentemente depender\u00e1 da capacidade de equilibrar o est\u00edmulo \u00e0 atividade econ\u00f4mica com a responsabilidade fiscal e o controle inflacion\u00e1rio."
));

bodyChildren.push(bodyPara(
  "Recomenda-se o monitoramento cont\u00ednuo dos indicadores do SCNT, com aten\u00e7\u00e3o especial aos sinais de desacelera\u00e7\u00e3o setorial e \u00e0s varia\u00e7\u00f5es nos componentes da despesa. A plataforma de visualiza\u00e7\u00e3o dispon\u00edvel em https://my-project-steel-two.vercel.app constitui uma ferramenta valiosa para o acompanhamento em tempo real desses indicadores, facilitando a an\u00e1lise comparativa e a identifica\u00e7\u00e3o precoce de tend\u00eancias e inflex\u00f5es na trajet\u00f3ria econ\u00f4mica."
));

bodyChildren.push(bodyPara(
  "Em suma, os dados do SCNT at\u00e9 o quarto trimestre de 2024 indicam que a economia brasileira encontra-se em fase de crescimento moderado e sustentado, com todos os setores em patamares superiores aos pr\u00e9-pandemia. A resili\u00eancia demonstrada ao longo do per\u00edodo analisado \u00e9 um indicador positivo, mas a manuten\u00e7\u00e3o dessa trajet\u00f3ria depender\u00e1 de pol\u00edticas econ\u00f4micas prudentes e de condi\u00e7\u00f5es externas favor\u00e1veis."
));

// ─── Body Section ───
const bodySection = {
  properties: {
    type: SectionType.NEXT_PAGE,
    page: {
      size: pgSize,
      margin: pgMargin,
      pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
    },
  },
  headers: { default: reportHeader() },
  footers: { default: pageNumFooter() },
  children: bodyChildren,
};

// ═══════════════════════════════════════════════
// ASSEMBLE DOCUMENT
// ═══════════════════════════════════════════════

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
          size: 24,
          color: bodyColor,
        },
        paragraph: {
          spacing: { line: 312 },
        },
      },
      heading1: {
        run: {
          font: { ascii: "Calibri", eastAsia: "SimHei" },
          size: 32,
          bold: true,
          color: headingColor,
        },
        paragraph: {
          spacing: { before: 480, after: 240, line: 312 },
        },
      },
      heading2: {
        run: {
          font: { ascii: "Calibri", eastAsia: "SimHei" },
          size: 28,
          bold: true,
          color: headingColor,
        },
        paragraph: {
          spacing: { before: 360, after: 180, line: 312 },
        },
      },
      heading3: {
        run: {
          font: { ascii: "Calibri", eastAsia: "SimHei" },
          size: 26,
          bold: true,
          color: headingColor,
        },
        paragraph: {
          spacing: { before: 240, after: 120, line: 312 },
        },
      },
    },
  },
  sections: [coverSection, tocSection, bodySection],
});

// ═══════════════════════════════════════════════
// GENERATE FILE
// ═══════════════════════════════════════════════

(async () => {
  const buffer = await Packer.toBuffer(doc);
  const outputPath = "/home/z/my-project/Relatorio_SCNT.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document generated: ${outputPath}`);
})();
