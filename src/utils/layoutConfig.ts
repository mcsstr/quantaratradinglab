/**
 * ═══════════════════════════════════════════════════════════════════
 *  ARQUIVO CENTRAL DE LAYOUT — QUANTARA TRADING LAB
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Aqui ficam TODOS os valores de espaçamento, tamanho, margem,
 *  padding, fontes e cores de layout do aplicativo.
 *  Altere qualquer valor abaixo e o app inteiro refletirá a mudança.
 *
 *  UNIDADES:
 *    - Valores em REM: usados via style={{ padding: `${valor}rem` }}
 *    - Valores em PX: usados diretamente em style={{ width: `${valor}px` }}
 *    - Valores puros (sem unidade): usados em props como size={24}
 *
 *  COMO ALTERAR:
 *    1. Encontre a seção desejada (ex: "MENU INFERIOR MOBILE")
 *    2. Mude o valor numérico
 *    3. Salve o arquivo → o Hot Reload aplica instantaneamente
 *
 *  IMPORTANTE: Não renomeie as CHAVES (nomes das propriedades),
 *  apenas altere os VALORES numéricos/strings.
 *
 * ═══════════════════════════════════════════════════════════════════
 */

export const LAYOUT = {

    // ═════════════════════════════════════════════════════════════════
    //  ██  1. MENU INFERIOR MOBILE (Bottom Navigation Bar)
    // ═════════════════════════════════════════════════════════════════

    nav: {
        /** Padding superior da barra inteira (rem). Menor = mais fino no topo */
        paddingTop: 0.05,

        /** Padding inferior extra antes do safe-area (rem) */
        paddingBottom: 0,

        /** Padding vertical de cada botão do menu (rem). Controla a altura clicável */
        buttonPaddingY: 0.25,

        /** Espaçamento entre o ícone e o label de cada botão (rem) */
        buttonGap: 0.25,

        /** Cor do botão ativo */
        activeColor: '#00B0F0',

        /** Cor de fundo do FAB quando aberto (vermelho de fechar) */
        fabOpenColor: '#ef4444',

        /** Cor de fundo do FAB quando fechado (azul padrão) */
        fabClosedColor: '#00B0F0',

        /** Margem negativa superior do botão FAB central (rem) — puxa o + pra cima */
        fabNegativeMarginTop: 1,

        /** Padding interno do botão FAB central (rem) */
        fabPadding: 0.875,

        /** Largura da borda do botão FAB (px) */
        fabBorderWidth: 4,

        /** Tamanho do ícone dentro do botão FAB */
        fabIconSize: 30,

        /** Tamanho do ícone dos botões normais quando ATIVO */
        iconSizeActive: 25,

        /** Tamanho do ícone dos botões normais quando INATIVO */
        iconSizeInactive: 22,

        /** Tamanho da fonte dos labels dos botões (rem). 0.5625 = ~9px */
        labelFontSize: 0.5625,

        /** Peso da fonte dos labels ('bold', 'semibold', 'normal', etc.) */
        labelFontWeight: 'bold' as const,
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  2. FAB SPEED DIAL (Botões flutuantes do +)
    // ═════════════════════════════════════════════════════════════════

    fab: {
        /** Distância do fundo da tela até o container dos botões (rem). Aumente p/ subir */
        bottomOffset: 6,

        /** Espaçamento horizontal entre os 3 botões (rem) */
        gap: 1.5,

        /** Largura e altura dos círculos dos botões (rem). 4 = 64px */
        circleSize: 4,

        /** Tamanho dos ícones dentro dos círculos (px) */
        iconSize: 26,

        /** Tamanho da fonte dos labels sob cada botão (rem). 0.625 = 10px */
        labelFontSize: 0.625,

        /** Peso da fonte dos labels ('bold', 'semibold', 'normal') */
        labelFontWeight: 'bold' as const,

        /** Largura da borda dos circulos (px) */
        circleBorderWidth: 1.5,

        /** Opacidade do overlay de fundo (0 a 1). 0.7 = 70% */
        overlayOpacity: 0.7,

        /** Blur do backdrop do overlay (px) */
        overlayBlur: 12,

        /**
         * Offset vertical de cada botão para criar o ARCO (px).
         * O botão do MEIO sobe mais, os laterais menos.
         * Formato: [esquerda, centro, direita]
         * Ex: [12, 40, 12] → centro sobe 40px, laterais sobem 12px
         */
        arcOffsets: [12, 40, 12] as [number, number, number],

        /**
         * Cores de cada botão do FAB.
         * IMPORTANTE: use "iconColor" (não "icon") para não conflitar com componentes.
         *   - iconColor: cor do ícone e do label
         *   - bgColor:   cor de fundo (use rgba para transparência)
         *   - borderColor: cor da borda
         */
        colors: {
            trade: {
                iconColor: '#34d399',                     // Verde esmeralda
                bgColor: 'rgba(52,211,153,0.12)',         // Verde translúcido
                borderColor: 'rgba(52,211,153,0.25)',     // Verde borda
            },
            news: {
                iconColor: '#22d3ee',                     // Ciano
                bgColor: 'rgba(34,211,238,0.12)',         // Ciano translúcido
                borderColor: 'rgba(34,211,238,0.25)',     // Ciano borda
            },
            holidays: {
                iconColor: '#f472b6',                     // Rosa
                bgColor: 'rgba(244,114,182,0.12)',        // Rosa translúcido
                borderColor: 'rgba(244,114,182,0.25)',    // Rosa borda
            },
        },
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  3. CABEÇALHO SUPERIOR (Header — Dashboard)
    // ═════════════════════════════════════════════════════════════════

    header: {
        /** Padding vertical do header em MOBILE (rem) */
        paddingY: 0.625,

        /** Padding vertical do header em DESKTOP (rem) */
        paddingYDesktop: 0.75,

        /** Padding horizontal em MOBILE (rem) */
        paddingX: 1,

        /** Padding horizontal em DESKTOP (rem) */
        paddingXDesktop: 1.5,

        /** Margem superior mínima (safe-area) em MOBILE (rem) */
        marginTopMobile: 0,

        /** Tamanho do logo/ícone do Quantara (rem). 2 = 32px */
        logoSize: 2,

        /** Tamanho do logo em desktop (rem) */
        logoSizeDesktop: 2.25,

        /** Tamanho da fonte do título "Quantara" (rem) */
        titleFontSize: 1.125,

        /** Tamanho dos ícones de ação do header (notificação, perfil) (px) */
        actionIconSize: 20,

        /** Tamanho do avatar do perfil (rem) */
        avatarSize: 2,

        /** Cor de fundo do header (pode ser 'transparent' ou hex) */
        bgColor: 'transparent',

        /** Opacidade do blur (0 a 1) */
        blurOpacity: 0.85,
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  4. CONTEÚDO PRINCIPAL (Main Content Area — Dashboard)
    // ═════════════════════════════════════════════════════════════════

    main: {
        /** Padding horizontal do conteúdo em MOBILE (rem) */
        paddingX: 1,

        /** Padding horizontal do conteúdo em DESKTOP (rem) */
        paddingXDesktop: 1.5,

        /** Padding superior do conteúdo (rem) - abaixo do header */
        paddingTop: 0,

        /** Gap entre os cards do dashboard em MOBILE (rem) */
        cardGap: 1,

        /** Gap entre os cards em DESKTOP (rem) */
        cardGapDesktop: 1.5,

        /** Largura máxima do conteúdo (rem). 80 = max-w-7xl ≈ 1280px */
        maxContentWidth: 80,
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  5. CARDS E MODAIS
    // ═════════════════════════════════════════════════════════════════

    cards: {
        /** Border radius dos cards (rem). 1 ≈ rounded-2xl */
        borderRadius: 1,

        /** Padding interno dos cards em MOBILE (rem) */
        padding: 1,

        /** Padding interno dos cards em DESKTOP (rem) */
        paddingDesktop: 1.25,

        /** Gap entre elementos dentro dos cards (rem) */
        innerGap: 0.75,

        /** Padding interno dos modais (rem) */
        modalPadding: 1.25,

        /** Guard radius dos modais (rem) */
        modalBorderRadius: 1,

        /** Largura máxima dos modais pequenos (rem) */
        modalMaxWidthSm: 24,

        /** Largura máxima dos modais médios (rem) */
        modalMaxWidthMd: 28,

        /** Largura máxima dos modais grandes (rem) */
        modalMaxWidthLg: 32,

        /** Largura máxima dos modais extra-grandes (rem) */
        modalMaxWidthXl: 36,
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  6. TABELAS (Trades, Calendário, etc.)
    // ═════════════════════════════════════════════════════════════════

    table: {
        /** Padding horizontal das células em MOBILE (rem) */
        cellPaddingX: 0.5,

        /** Padding horizontal das células em DESKTOP (rem) */
        cellPaddingXDesktop: 0.75,

        /** Padding vertical das células (rem) */
        cellPaddingY: 0.75,

        /** Padding vertical das células em DESKTOP (rem) */
        cellPaddingYDesktop: 1,

        /** Tamanho da fonte do cabeçalho da tabela em MOBILE (rem). 0.5625 = 9px */
        headerFontSize: 0.5625,

        /** Tamanho da fonte do cabeçalho em DESKTOP (rem) */
        headerFontSizeDesktop: 0.625,

        /** Tamanho da fonte do corpo em MOBILE (rem). 0.625 = 10px */
        bodyFontSize: 0.625,

        /** Tamanho da fonte do corpo em DESKTOP (rem) */
        bodyFontSizeDesktop: 0.75,

        /** Altura mínima das linhas (rem) */
        rowMinHeight: 2.5,

        /** Border radius da tabela container (rem) */
        borderRadius: 1,
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  7. GRÁFICOS E FILTROS (Equity Evolution, Analytics)
    // ═════════════════════════════════════════════════════════════════

    charts: {
        /** Altura do gráfico em MOBILE (rem). 12 = ~192px */
        heightMobile: 12,

        /** Altura do gráfico em DESKTOP (rem). 18 = ~288px */
        heightDesktop: 18,

        /** Tamanho da fonte dos filtros (rem). 0.65 = ~10px */
        filterFontSize: 0.65,

        /** Tamanho da fonte das opções do dropdown (rem) */
        filterOptionFontSize: 0.75,

        /** Padding dos botões de filtro (rem) */
        filterPaddingX: 0.5,
        filterPaddingY: 0.25,

        /** Border radius dos botões de filtro (rem) */
        filterBorderRadius: 0.375,

        /** Gap entre filtros (rem) */
        filterGap: 0.25,
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  8. PÁGINA ADMIN
    // ═════════════════════════════════════════════════════════════════

    admin: {
        /** Largura do sidebar (rem). 16 = 256px */
        sidebarWidth: 19,

        /** Padding do sidebar (rem) */
        sidebarPadding: 1,

        /** Tamanho dos ícones do sidebar (px) */
        sidebarIconSize: 198,

        /** Tamanho da fonte dos itens do sidebar (rem) */
        sidebarFontSize: 0.875,

        /** Padding do conteúdo principal em MOBILE (rem) */
        contentPadding: 1,

        /** Padding do conteúdo principal em DESKTOP (rem) */
        contentPaddingDesktop: 2,

        /** Padding do header admin em MOBILE (rem) */
        headerPaddingX: 1,

        /** Padding do header admin em DESKTOP (rem) */
        headerPaddingXDesktop: 2,

        /** Tamanho do título "User Account Administration" em MOBILE (rem) */
        titleFontSize: 1.25,

        /** Tamanho do título em TABLET (rem) */
        titleFontSizeTablet: 1.5,

        /** Tamanho do título em DESKTOP (rem) */
        titleFontSizeDesktop: 1.875,

        /** Tamanho da fonte da descrição (rem) */
        descFontSize: 0.75,

        /** Tamanho da fonte da descrição em DESKTOP (rem) */
        descFontSizeDesktop: 0.875,

        /** Padding horizontal das células da tabela em MOBILE (rem) */
        tableCellPadding: 1,

        /** Padding horizontal das células da tabela em DESKTOP (rem) */
        tableCellPaddingDesktop: 1.5,

        /** Tamanho da fonte do cabeçalho da tabela (rem) */
        tableHeaderFontSize: 0.625,

        /** Tamanho do avatar na tabela em MOBILE (rem). 2 = 32px */
        avatarSize: 2,

        /** Tamanho do avatar na tabela em DESKTOP (rem). 2.5 = 40px */
        avatarSizeDesktop: 2.5,

        /** Gap entre cards de resumo (rem) */
        summaryCardGap: 1,
        summaryCardGapDesktop: 1.5,

        /** Margem superior dos cards (rem) */
        summaryCardMarginTop: 2,
        summaryCardMarginTopDesktop: 3,
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  9. PÁGINA DE CONTA / MEU PERFIL (Account.tsx)
    // ═════════════════════════════════════════════════════════════════

    account: {
        /** Padding horizontal do formulário em MOBILE (rem) */
        formPaddingX: 1,

        /** Padding horizontal do formulário em DESKTOP (rem) */
        formPaddingXDesktop: 2,

        /** Padding vertical do formulário (rem) */
        formPaddingY: 1.5,

        /** Gap entre os campos do formulário (rem) */
        fieldGap: 1,

        /** Tamanho da fonte dos labels dos campos (rem) */
        labelFontSize: 0.75,

        /** Tamanho da fonte dos inputs (rem) */
        inputFontSize: 0.875,

        /** Altura dos inputs (rem). 2.5 = 40px */
        inputHeight: 2.5,

        /** Border radius dos inputs (rem) */
        inputBorderRadius: 0.75,

        /** Padding horizontal dos inputs (rem) */
        inputPaddingX: 0.75,

        /** Tamanho do título do formulário (rem) */
        titleFontSize: 1.5,

        /** Tamanho do avatar do perfil (rem). 5 = 80px */
        avatarSize: 5,
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  10. PÁGINA DE LOGIN E CADASTRO (Auth.tsx)
    // ═════════════════════════════════════════════════════════════════

    auth: {
        /** Largura máxima do card de login/cadastro (rem). 28 = ~448px */
        cardMaxWidth: 28,

        /** Padding interno do card (rem) */
        cardPadding: 2,

        /** Border radius do card (rem) */
        cardBorderRadius: 1.5,

        /** Gap entre campos do formulário (rem) */
        fieldGap: 1,

        /** Tamanho da fonte dos labels (rem) */
        labelFontSize: 0.75,

        /** Tamanho da fonte dos inputs (rem) */
        inputFontSize: 0.875,

        /** Altura dos inputs (rem) */
        inputHeight: 2.75,

        /** Altura dos botões (rem) */
        buttonHeight: 2.75,

        /** Tamanho da fonte dos botões (rem) */
        buttonFontSize: 0.875,

        /** Tamanho do logo/título (rem) */
        logoSize: 2.5,

        /** Tamanho da fonte do título "Quantara" (rem) */
        titleFontSize: 1.5,

        /** Gap entre o logo e o formulário (rem) */
        logoFormGap: 2,
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  11. LANDING PAGE (Landing.tsx)
    // ═════════════════════════════════════════════════════════════════

    landing: {
        /** Padding horizontal do conteúdo em MOBILE (rem) */
        paddingX: 1.5,

        /** Padding horizontal em DESKTOP (rem) */
        paddingXDesktop: 4,

        /** Padding vertical das seções (rem) */
        sectionPaddingY: 3,

        /** Tamanho do título principal em MOBILE (rem) */
        heroFontSize: 2,

        /** Tamanho do título em DESKTOP (rem) */
        heroFontSizeDesktop: 3.75,

        /** Tamanho da fonte do subtítulo (rem) */
        subtitleFontSize: 1,

        /** Tamanho dos botões CTA (rem) */
        ctaButtonHeight: 3,
        ctaButtonFontSize: 1,

        /** Gap entre elementos do hero (rem) */
        heroGap: 2,
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  12. TIPOGRAFIA GERAL
    // ═════════════════════════════════════════════════════════════════

    typography: {
        /** Fonte principal para texto (body) */
        fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",

        /** Fonte para títulos e destaque (headings) */
        fontFamilyDisplay: "'Plus Jakarta Sans', sans-serif",

        /** Fonte para números e dados de tabelas */
        fontFamilyMono: "'JetBrains Mono', ui-monospace, monospace",

        /** Espaçamento entre letras — texto normal */
        letterSpacing: '-0.01em',

        /** Espaçamento entre letras — títulos */
        letterSpacingDisplay: '-0.02em',

        /** Espaçamento entre letras — números */
        letterSpacingMono: '-0.015em',
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  13. CORES GLOBAIS DE LAYOUT (separadas do tema de cores)
    // ═════════════════════════════════════════════════════════════════

    colors: {
        /** Cor de fundo do body / html */
        bodyBackground: '#09090b',

        /** Cor de fundo padrão para overlays (rgba) */
        overlayBg: 'rgba(0,0,0,0.7)',

        /** Cor do texto de sucesso (toast) */
        successBg: '#16a34a',

        /** Cor do texto de erro (toast) */
        errorBg: '#dc2626',

        /** Cor do texto de aviso (toast/banner) */
        warningBg: '#f97316',
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  14. BANNER DE AVISO (Free Plan Warning, etc.)
    // ═════════════════════════════════════════════════════════════════

    banner: {
        /** Padding horizontal (rem) */
        paddingX: 1,

        /** Padding vertical (rem) */
        paddingY: 0.75,

        /** Border radius (rem) */
        borderRadius: 0.75,

        /** Tamanho da fonte em MOBILE (rem) */
        fontSize: 0.75,

        /** Tamanho da fonte em DESKTOP (rem) */
        fontSizeDesktop: 0.875,

        /** Tamanho do ícone de aviso (px) */
        iconSize: 16,
    },

    // ═════════════════════════════════════════════════════════════════
    //  ██  15. BREAKPOINTS DE REFERÊNCIA (não alterar a menos que
    //      saiba o que está fazendo — estes são os breakpoints do
    //      Tailwind usados no código)
    // ═════════════════════════════════════════════════════════════════

    breakpoints: {
        /** Celular para cima (px) */
        sm: 640,

        /** Tablet para cima (px) */
        md: 768,

        /** Desktop pequeno para cima (px) */
        lg: 1024,

        /** Desktop grande para cima (px) */
        xl: 1280,

        /** Ultra-wide (px) */
        xxl: 1536,
    },
};

/**
 * ═══════════════════════════════════════════════════════════
 *  COMO USAR NOS COMPONENTES:
 * ═══════════════════════════════════════════════════════════
 *
 *  import { LAYOUT } from '../utils/layoutConfig';
 *
 *  // Em style={{}}:
 *  style={{
 *    paddingTop: \`\${LAYOUT.nav.paddingTop}rem\`,
 *    fontSize: \`\${LAYOUT.table.bodyFontSize}rem\`
 *  }}
 *
 *  // Em props de ícone:
 *  <Icon size={LAYOUT.nav.iconSizeActive} />
 *
 *  // Em className (valores arbitrários Tailwind):
 *  className={\`pt-[\${LAYOUT.nav.paddingTop}rem]\`}
 *
 *  // Acessando cores do FAB:
 *  LAYOUT.fab.colors.trade.iconColor   // '#34d399'
 *  LAYOUT.fab.colors.trade.bgColor     // 'rgba(...)'
 *
 * ═══════════════════════════════════════════════════════════
 */
