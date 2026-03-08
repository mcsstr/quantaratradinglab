/**
 * ═══════════════════════════════════════════════════════════════════
 *  ARQUIVO CENTRAL DE LAYOUT — QUANTARA TRADING LAB
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Aqui ficam TODOS os valores de espaçamento, tamanho, margem e
 *  padding do aplicativo. Altere qualquer valor abaixo e o app
 *  inteiro refletirá a mudança.
 *
 *  UNIDADES:
 *    - Valores em REM: usados dentro de classes Tailwind arbitrárias
 *      ex: pt-[0.25rem] → `${LAYOUT.nav.paddingTop}rem`
 *    - Valores em PX: usados diretamente em style={{}}
 *    - Valores puros (sem unidade): usados em props como size={24}
 *
 *  COMO ALTERAR:
 *    1. Encontre a seção desejada (ex: "MENU INFERIOR MOBILE")
 *    2. Mude o valor numérico
 *    3. Salve o arquivo → o Hot Reload aplica instantaneamente
 *
 * ═══════════════════════════════════════════════════════════════════
 */

export const LAYOUT = {

    // ─────────────────────────────────────────────────────────
    //  MENU INFERIOR MOBILE (Bottom Navigation Bar)
    // ─────────────────────────────────────────────────────────

    nav: {
        /** Padding superior da barra de navegação (rem) */
        paddingTop: 0.05,         // pt-1 = 0.25rem (4px). Aumente para subir o conteúdo.

        /** Padding vertical de cada botão do menu (rem) */
        buttonPaddingY: 0.02,      // py-2 = 0.5rem (8px). Controla a altura dos botões.

        /** Margem negativa superior do botão FAB central (rem) — puxa o botão pra cima */
        fabNegativeMarginTop: 1.75, // -mt-7 = -1.75rem. Quanto maior, mais o + sobe.

        /** Padding interno do botão FAB central (rem) */
        fabPadding: 0.875,        // p-3.5 = 0.875rem. Controla o tamanho interno do +.

        /** Largura da borda do botão FAB (px) */
        fabBorderWidth: 4,

        /** Tamanho do ícone dentro do botão FAB */
        fabIconSize: 26,

        /** Tamanho do ícone dos botões normais (ativo / inativo) */
        iconSizeActive: 22,
        iconSizeInactive: 20,

        /** Tamanho da fonte dos labels dos botões (rem) */
        labelFontSize: 0.5625,    // text-[9px] = 0.5625rem
    },

    // ─────────────────────────────────────────────────────────
    //  FAB SPEED DIAL (Botões que aparecem ao clicar no +)
    // ─────────────────────────────────────────────────────────

    fab: {
        /** Distância do fundo da tela até o container dos botões (rem) */
        bottomOffset: 6,         // bottom-24 = 6rem. Aumente para subir os botões.

        /** Espaçamento horizontal entre os 3 botões (rem) */
        gap: 1.5,               // gap-6 = 1.5rem

        /** Tamanho dos círculos dos botões (rem) */
        circleSize: 4,          // w-16 h-16 = 4rem (64px)

        /** Tamanho dos ícones dentro dos círculos */
        iconSize: 26,

        /** Tamanho da fonte dos labels (rem) */
        labelFontSize: 0.625,   // text-[10px] = 0.625rem

        /**
         * Offset vertical de cada botão para criar o arco (px).
         * O botão do MEIO sobe mais, criando a curvatura.
         * [esquerda, centro, direita]
         */
        arcOffsets: [12, 40, 12],

        /** Cores dos botões: [Trade, News, Holidays] */
        colors: {
            trade: { icon: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)' },
            news: { icon: '#22d3ee', bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.25)' },
            holidays: { icon: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.25)' },
        },
    },

    // ─────────────────────────────────────────────────────────
    //  CABEÇALHO (Header)
    // ─────────────────────────────────────────────────────────

    header: {
        /** Padding vertical do header em mobile (rem) */
        paddingY: 0.625,          // py-2.5 = 0.625rem

        /** Padding vertical do header em desktop (rem) */
        paddingYDesktop: 0.75,    // py-3 = 0.75rem

        /** Padding horizontal em mobile (rem) */
        paddingX: 1,              // px-4 = 1rem

        /** Padding horizontal em desktop (rem) */
        paddingXDesktop: 1.5,     // px-6 = 1.5rem

        /** Tamanho do logo (rem) */
        logoSize: 2,              // w-8 h-8 = 2rem (32px)

        /** Tamanho do logo em desktop (rem) */
        logoSizeDesktop: 2.25,    // w-9 h-9 = 2.25rem (36px)

        /** Tamanho da fonte do título "Quantara" (rem) */
        titleFontSize: 1.125,     // text-lg = 1.125rem
    },

    // ─────────────────────────────────────────────────────────
    //  CONTEÚDO PRINCIPAL (Main Content Area)
    // ─────────────────────────────────────────────────────────

    main: {
        /** Padding horizontal do conteúdo em mobile (rem) */
        paddingX: 1,              // px-4 = 1rem

        /** Padding horizontal do conteúdo em desktop (rem) */
        paddingXDesktop: 1.5,     // px-6 = 1.5rem

        /** Gap entre os cards do dashboard (rem) */
        cardGap: 1,               // gap-4 = 1rem

        /** Gap entre os cards em desktop (rem) */
        cardGapDesktop: 1.5,      // gap-6 = 1.5rem
    },

    // ─────────────────────────────────────────────────────────
    //  TABELAS (Trades, News, etc.)
    // ─────────────────────────────────────────────────────────

    table: {
        /** Padding horizontal das células (rem) */
        cellPaddingX: 0.75,       // px-3 = 0.75rem

        /** Padding vertical das células (rem) */
        cellPaddingY: 1,          // py-4 = 1rem

        /** Tamanho da fonte do cabeçalho (rem) */
        headerFontSize: 0.5625,   // text-[9px] = 0.5625rem

        /** Tamanho da fonte do corpo (rem) */
        bodyFontSize: 0.625,      // text-[10px] = 0.625rem em mobile, text-xs em desktop

        /** Tamanho da fonte do corpo em desktop (rem) */
        bodyFontSizeDesktop: 0.75, // text-xs = 0.75rem
    },

    // ─────────────────────────────────────────────────────────
    //  CARDS E MODAIS
    // ─────────────────────────────────────────────────────────

    cards: {
        /** Border radius dos cards (rem) */
        borderRadius: 1,          // rounded-2xl ≈ 1rem

        /** Padding interno dos cards (rem) */
        padding: 1,            // p-5 = 1.25rem

        /** Padding interno dos modais (rem) */
        modalPadding: 1.25,       // p-5 = 1.25rem

        /** Largura máxima dos modais pequenos (rem) */
        modalMaxWidthSm: 24,      // max-w-sm = 24rem

        /** Largura máxima dos modais médios (rem) */
        modalMaxWidthMd: 28,      // max-w-md = 28rem

        /** Largura máxima dos modais grandes (rem) */
        modalMaxWidthLg: 32,      // max-w-lg = 32rem
    },

    // ─────────────────────────────────────────────────────────
    //  PÁGINA ADMIN
    // ─────────────────────────────────────────────────────────

    admin: {
        /** Largura do sidebar (rem) */
        sidebarWidth: 16,         // w-64 = 16rem (256px)

        /** Padding do conteúdo em mobile (rem) */
        contentPadding: 1,        // p-4 = 1rem

        /** Padding do conteúdo em desktop (rem) */
        contentPaddingDesktop: 2, // p-8 = 2rem

        /** Tamanho do título em mobile (rem) */
        titleFontSize: 1.25,      // text-xl = 1.25rem

        /** Tamanho do título em desktop grande (rem) */
        titleFontSizeDesktop: 1.875, // text-3xl = 1.875rem

        /** Padding das células da tabela (rem) */
        tableCellPadding: 1,      // px-4 = 1rem em mobile

        /** Padding das células da tabela em desktop (rem) */
        tableCellPaddingDesktop: 1.5, // px-6 = 1.5rem
    },

    // ─────────────────────────────────────────────────────────
    //  FILTROS E SELECTS DOS GRÁFICOS
    // ─────────────────────────────────────────────────────────

    filters: {
        /** Tamanho da fonte dos selects de filtro (rem) */
        fontSize: 0.65,           // filter-select = 0.65rem (~10px)

        /** Tamanho da fonte das opções (rem) */
        optionFontSize: 0.75,     // 0.75rem (~12px)
    },

    // ─────────────────────────────────────────────────────────
    //  BANNER DE AVISO (Free Plan Warning)
    // ─────────────────────────────────────────────────────────

    banner: {
        /** Padding horizontal (rem) */
        paddingX: 1,              // px-4 = 1rem

        /** Padding vertical (rem) */
        paddingY: 0.75,           // py-3 = 0.75rem

        /** Border radius (rem) */
        borderRadius: 0.75,       // rounded-xl = 0.75rem

        /** Tamanho da fonte em mobile (rem) */
        fontSize: 0.75,           // text-xs = 0.75rem

        /** Tamanho da fonte em desktop (rem) */
        fontSizeDesktop: 0.875,   // text-sm = 0.875rem
    },
};

/**
 * ═══════════════════════════════════════════════════════════
 *  HELPER: Converte valores de LAYOUT para classes Tailwind
 *  arbitrárias ou estilos inline.
 * ═══════════════════════════════════════════════════════════
 *
 *  Uso nos componentes:
 *
 *    import { LAYOUT } from '../utils/layoutConfig';
 *
 *    // Em style={{}}:
 *    style={{ paddingTop: `${LAYOUT.nav.paddingTop}rem` }}
 *
 *    // Em props:
 *    <Icon size={LAYOUT.nav.iconSizeActive} />
 *
 *    // Em className (valores arbitrários Tailwind):
 *    className={`pt-[${LAYOUT.nav.paddingTop}rem]`}
 *
 * ═══════════════════════════════════════════════════════════
 */
