/**
 * Internationalization (i18n) Module
 * Provides translations for static UI text in English, Portuguese and Spanish.
 */

type Lang = 'en' | 'pt' | 'es';

const translations: Record<string, Record<Lang, string>> = {
    // --- Navigation ---
    'nav.dashboard': { en: 'Dashboard', pt: 'Painel', es: 'Panel' },
    'nav.analytics': { en: 'Analytics', pt: 'Análises', es: 'Análisis' },
    'nav.trades': { en: 'Trades', pt: 'Operações', es: 'Operaciones' },
    'nav.import': { en: 'Import', pt: 'Importar', es: 'Importar' },
    'nav.news': { en: 'News', pt: 'Notícias', es: 'Noticias' },
    'nav.holidays': { en: 'Holidays', pt: 'Feriados', es: 'Festivos' },
    'nav.settings': { en: 'Settings', pt: 'Configurações', es: 'Ajustes' },
    'nav.menu': { en: 'Menu', pt: 'Menu', es: 'Menú' },
    'nav.home': { en: 'Home', pt: 'Início', es: 'Inicio' },
    'nav.back': { en: 'Back', pt: 'Voltar', es: 'Volver' },

    // --- Dashboard ---
    'dash.noAccount': { en: 'No Account Selected', pt: 'Nenhuma Conta Selecionada', es: 'Sin Cuenta Seleccionada' },
    'dash.noAccountDesc': { en: 'Please select an active account from the top menu or create a new one to view your data.', pt: 'Selecione uma conta ativa no menu superior ou crie uma nova para ver seus dados.', es: 'Seleccione una cuenta activa del menú superior o cree una nueva para ver sus datos.' },
    'dash.createAccount': { en: 'Create Account', pt: 'Criar Conta', es: 'Crear Cuenta' },
    'dash.stopTrading': { en: 'STOP TRADING!', pt: 'PARE DE OPERAR!', es: '¡DEJA DE OPERAR!' },
    'dash.dailyLimitReached': { en: 'You have reached your Daily Loss Limit.', pt: 'Você atingiu seu Limite de Perda Diário.', es: 'Has alcanzado tu Límite de Pérdida Diario.' },
    'dash.consistencyKey': { en: 'Consistency is key for long term performance.', pt: 'Consistência é a chave para performance de longo prazo.', es: 'La consistencia es clave para el rendimiento a largo plazo.' },
    'dash.totalNetLossToday': { en: 'Total Net Loss Today', pt: 'Prejuízo Líquido Hoje', es: 'Pérdida Neta Hoy' },
    'dash.iUnderstand': { en: 'I Understand & Stopping Now', pt: 'Entendi, Parando Agora', es: 'Entendido, Párando Ahora' },
    'dash.loading': { en: 'Loading...', pt: 'Carregando...', es: 'Cargando...' },

    // --- Settings ---
    'settings.title': { en: 'App Settings', pt: 'Configurações do App', es: 'Ajustes del App' },
    'settings.subtitle': { en: 'Configure layout, currencies, and appearance.', pt: 'Configure layout, moedas e aparência.', es: 'Configure diseño, monedas y apariencia.' },
    'settings.account': { en: 'Settings Account', pt: 'Configurações de Conta', es: 'Ajustes de Cuenta' },
    'settings.theme': { en: 'Theme', pt: 'Tema', es: 'Tema' },
    'settings.database': { en: 'Database', pt: 'Base de Dados', es: 'Base de Datos' },
    'settings.backup': { en: 'Backup & Portable App', pt: 'Backup & App Portátil', es: 'Respaldo & App Portátil' },
    'settings.general': { en: 'General Settings', pt: 'Configurações Gerais', es: 'Ajustes Generales' },
    'settings.appLanguage': { en: 'App Language', pt: 'Idioma do App', es: 'Idioma del App' },
    'settings.dateFormat': { en: 'Date Format', pt: 'Formato de Data', es: 'Formato de Fecha' },
    'settings.saveChanges': { en: 'Save Changes', pt: 'Salvar Alterações', es: 'Guardar Cambios' },
    'settings.manageAccounts': { en: 'Manage Accounts', pt: 'Gerenciar Contas', es: 'Gestionar Cuentas' },
    'settings.newAccount': { en: 'New Account', pt: 'Nova Conta', es: 'Nueva Cuenta' },
    'settings.noAccounts': { en: 'No accounts found. Create an account to start importing your trades.', pt: 'Nenhuma conta encontrada. Crie uma conta para começar a importar suas operações.', es: 'No se encontraron cuentas. Crea una cuenta para empezar a importar tus operaciones.' },
    'settings.active': { en: 'Active', pt: 'Ativa', es: 'Activa' },
    'settings.edit': { en: 'Edit', pt: 'Editar', es: 'Editar' },
    'settings.dashboardLayout': { en: 'Dashboard Layout', pt: 'Layout do Painel', es: 'Diseño del Panel' },
    'settings.enableGlass': { en: 'Enable Glass:', pt: 'Habilitar Vidro:', es: 'Habilitar Cristal:' },
    'settings.backgroundGlass': { en: 'Background & Glass Effect', pt: 'Fundo & Efeito de Vidro', es: 'Fondo & Efecto de Cristal' },
    'settings.bgImageUpload': { en: 'Background Image Upload', pt: 'Carregar Imagem de Fundo', es: 'Cargar Imagen de Fondo' },
    'settings.cardOpacity': { en: 'Card Opacity', pt: 'Opacidade dos Cards', es: 'Opacidad de Tarjetas' },
    'settings.glassBlur': { en: 'Glass Blur Intensity', pt: 'Intensidade do Desfoque', es: 'Intensidad del Desenfoque' },
    'settings.bgGradient': { en: 'Background Gradient', pt: 'Gradiente de Fundo', es: 'Gradiente de Fondo' },
    'settings.enableGradient': { en: 'Enable Gradient:', pt: 'Habilitar Gradiente:', es: 'Habilitar Gradiente:' },
    'settings.gradientType': { en: 'Gradient Type', pt: 'Tipo de Gradiente', es: 'Tipo de Gradiente' },
    'settings.themeCustomization': { en: 'Theme Customization', pt: 'Customização do Tema', es: 'Personalización del Tema' },
    'settings.restoreDefault': { en: 'Restore Default Theme', pt: 'Restaurar Tema Padrão', es: 'Restaurar Tema Predeterminado' },
    'settings.borderThickness': { en: 'Border Thickness (px)', pt: 'Espessura da Borda (px)', es: 'Grosor del Borde (px)' },
    'settings.exportJson': { en: 'Export JSON Database', pt: 'Exportar Base de Dados JSON', es: 'Exportar Base de Datos JSON' },
    'settings.exportJsonDesc': { en: 'Download a lightweight JSON file containing your settings, theme, trades, and news.', pt: 'Baixe um arquivo JSON com suas configurações, tema, operações e notícias.', es: 'Descarga un archivo JSON con tus ajustes, tema, operaciones y noticias.' },
    'settings.importJson': { en: 'Import JSON Database', pt: 'Importar Base de Dados JSON', es: 'Importar Base de Datos JSON' },
    'settings.importJsonDesc': { en: 'Restore your data by selecting a previously exported JSON backup file.', pt: 'Restaure seus dados selecionando um arquivo JSON de backup exportado.', es: 'Restaure sus datos seleccionando un archivo de respaldo JSON exportado.' },
    'settings.backupTitle': { en: 'Backup & Portability', pt: 'Backup & Portabilidade', es: 'Respaldo & Portabilidad' },
    'settings.backupDesc': { en: 'Protect your trading history by regularly exporting your data to a secure file.', pt: 'Proteja seu histórico de operações exportando seus dados regularmente.', es: 'Proteja su historial de operaciones exportando sus datos regularmente.' },
    'settings.exportData': { en: 'Export Data', pt: 'Exportar Dados', es: 'Exportar Datos' },
    'settings.importBackup': { en: 'Import Backup', pt: 'Importar Backup', es: 'Importar Respaldo' },

    // --- Import ---
    'import.title': { en: 'Import Data', pt: 'Importar Dados', es: 'Importar Datos' },
    'import.subtitle': { en: 'Select an account, then add trades manually or upload files.', pt: 'Selecione uma conta, depois adicione operações manualmente ou envie arquivos.', es: 'Seleccione una cuenta, luego agregue operaciones manualmente o cargue archivos.' },
    'import.step1': { en: 'Step 1 — Select Account', pt: 'Passo 1 — Selecionar Conta', es: 'Paso 1 — Seleccionar Cuenta' },
    'import.noAccounts': { en: 'No accounts found. Create an account in Settings → Account first.', pt: 'Nenhuma conta encontrada. Crie uma conta em Configurações → Conta primeiro.', es: 'No se encontraron cuentas. Cree una cuenta en Ajustes → Cuenta primero.' },
    'import.selectAccount': { en: 'Select an account above to reveal import options.', pt: 'Selecione uma conta acima para revelar as opções de importação.', es: 'Seleccione una cuenta arriba para revelar las opciones de importación.' },
    'import.manualEntry': { en: 'Manual Entry', pt: 'Entrada Manual', es: 'Entrada Manual' },
    'import.csvBulk': { en: 'CSV & Bulk Import', pt: 'CSV & Importação em Massa', es: 'CSV & Importación Masiva' },
    'import.csvUpload': { en: 'CSV Upload', pt: 'Enviar CSV', es: 'Cargar CSV' },
    'import.csvDesc': { en: 'Import performance data from broker files (Tradovate, etc.).', pt: 'Importe dados de performance de arquivos da corretora (Tradovate, etc.).', es: 'Importe datos de rendimiento desde archivos de su broker (Tradovate, etc.).' },
    'import.bulkRawText': { en: 'Bulk Raw Text', pt: 'Texto Bruto em Massa', es: 'Texto Masivo en Bruto' },
    'import.bulkDesc': { en: 'Paste raw trade rows for processing.', pt: 'Cole linhas de operações brutas para processamento.', es: 'Pegue filas de operaciones sin procesar.' },
    'import.importText': { en: 'Import Text Data', pt: 'Importar Dados do Texto', es: 'Importar Datos del Texto' },
    'import.addTrade': { en: 'Add Trade', pt: 'Adicionar Operação', es: 'Agregar Operación' },

    // --- Import Fields ---
    'field.symbol': { en: 'Symbol', pt: 'Símbolo', es: 'Símbolo' },
    'field.qty': { en: 'Qty', pt: 'Qtd', es: 'Cant' },
    'field.buyPrice': { en: 'Buy Price', pt: 'Preço Compra', es: 'Precio Compra' },
    'field.buyTime': { en: 'Buy Time', pt: 'Hora Compra', es: 'Hora Compra' },
    'field.duration': { en: 'Duration', pt: 'Duração', es: 'Duración' },
    'field.sellTime': { en: 'Sell Time', pt: 'Hora Venda', es: 'Hora Venta' },
    'field.sellPrice': { en: 'Sell Price', pt: 'Preço Venda', es: 'Precio Venta' },
    'field.pnl': { en: 'P&L ($)', pt: 'P&L ($)', es: 'P&L ($)' },

    // --- Trades Table ---
    'trades.title': { en: 'Trades', pt: 'Operações', es: 'Operaciones' },
    'trades.search': { en: 'Search...', pt: 'Buscar...', es: 'Buscar...' },
    'trades.export': { en: 'Export CSV', pt: 'Exportar CSV', es: 'Exportar CSV' },
    'trades.noTrades': { en: 'No trades found.', pt: 'Nenhuma operação encontrada.', es: 'No se encontraron operaciones.' },

    // --- Account Switcher ---
    'switcher.title': { en: 'Switch Account', pt: 'Trocar Conta', es: 'Cambiar Cuenta' },
    'switcher.noAccounts': { en: 'No accounts yet. Create one in Settings.', pt: 'Sem contas ainda. Crie uma nas Configurações.', es: 'Aún sin cuentas. Cree una en Ajustes.' },
    'switcher.manage': { en: '+ Manage Accounts', pt: '+ Gerenciar Contas', es: '+ Gestionar Cuentas' },

    // --- Account Form ---
    'accountForm.create': { en: 'Create New Account', pt: 'Criar Nova Conta', es: 'Crear Nueva Cuenta' },
    'accountForm.edit': { en: 'Edit Account', pt: 'Editar Conta', es: 'Editar Cuenta' },
    'accountForm.name': { en: 'Account Name *', pt: 'Nome da Conta *', es: 'Nombre de Cuenta *' },
    'accountForm.brokerCurrency': { en: 'Broker Currency', pt: 'Moeda Corretora', es: 'Moneda del Broker' },
    'accountForm.paymentCurrency': { en: 'Payment Currency', pt: 'Moeda Pagamento', es: 'Moneda de Pago' },
    'accountForm.timezone': { en: 'Reference Timezone', pt: 'Fuso Horário de Referência', es: 'Zona Horaria de Referencia' },
    'accountForm.financialParams': { en: 'Financial Parameters', pt: 'Parâmetros Financeiros', es: 'Parámetros Financieros' },
    'accountForm.initialBalance': { en: 'Initial Balance ($)', pt: 'Saldo Inicial ($)', es: 'Saldo Inicial ($)' },
    'accountForm.consistency': { en: 'Consistency (%)', pt: 'Consistência (%)', es: 'Consistencia (%)' },
    'accountForm.profitSplit': { en: 'Profit Split (%)', pt: 'Divisão de Lucros (%)', es: 'División de Ganancias (%)' },
    'accountForm.feePerContract': { en: 'Fee per Contract', pt: 'Taxa por Contrato', es: 'Comisión por Contrato' },
    'accountForm.dailyLossLimit': { en: 'Daily Loss Limit', pt: 'Limite de Perda Diário', es: 'Límite de Pérdida Diario' },
    'accountForm.totalStopLoss': { en: 'Total Stop Loss', pt: 'Stop Loss Total', es: 'Stop Loss Total' },
    'accountForm.cancel': { en: 'Cancel', pt: 'Cancelar', es: 'Cancelar' },
    'accountForm.save': { en: 'Save Changes', pt: 'Salvar Alterações', es: 'Guardar Cambios' },
    'accountForm.createBtn': { en: 'Create Account', pt: 'Criar Conta', es: 'Crear Cuenta' },

    // --- Delete Confirmation ---
    'delete.title': { en: 'Delete Account?', pt: 'Excluir Conta?', es: '¿Eliminar Cuenta?' },
    'delete.desc': { en: 'This will permanently remove the account and all its trades. This cannot be undone.', pt: 'Isso removerá permanentemente a conta e todas as suas operações. Isso não pode ser desfeito.', es: 'Esto eliminará permanentemente la cuenta y todas sus operaciones. Esto no se puede deshacer.' },
    'delete.allTrades': { en: 'all its trades', pt: 'todas as suas operações', es: 'todas sus operaciones' },
    'delete.cancel': { en: 'Cancel', pt: 'Cancelar', es: 'Cancelar' },
    'delete.confirm': { en: 'Delete', pt: 'Excluir', es: 'Eliminar' },

    // --- Calendar ---
    'calendar.holidays': { en: 'Holidays', pt: 'Feriados', es: 'Festivos' },
    'calendar.economicEvents': { en: 'Economic Events', pt: 'Eventos Econômicos', es: 'Eventos Económicos' },

    // --- Edit Modal ---
    'editTrade.title': { en: 'Edit Trade', pt: 'Editar Operação', es: 'Editar Operación' },
    'editNews.title': { en: 'Edit News Event', pt: 'Editar Evento de Notícia', es: 'Editar Evento de Noticia' },

    // --- User ---
    'user.profile': { en: 'My Profile', pt: 'Meu Perfil', es: 'Mi Perfil' },
    'user.logout': { en: 'Logout', pt: 'Sair', es: 'Cerrar Sesión' },
    'user.logoutConfirm': { en: 'Are you sure you want to sign out?', pt: 'Tem certeza que deseja sair?', es: '¿Seguro que desea cerrar sesión?' },
    'user.noAccount': { en: 'No Account', pt: 'Sem Conta', es: 'Sin Cuenta' },

    // --- Toast messages ---
    'toast.settingsSaved': { en: 'Settings Synchronized with Supabase!', pt: 'Configurações sincronizadas com o Supabase!', es: '¡Ajustes sincronizados con Supabase!' },
    'toast.tradeAdded': { en: 'Trade added and synchronized!', pt: 'Operação adicionada e sincronizada!', es: '¡Operación agregada y sincronizada!' },
    'toast.accountCreated': { en: 'Account created!', pt: 'Conta criada!', es: '¡Cuenta creada!' },
    'toast.accountUpdated': { en: 'Account updated!', pt: 'Conta atualizada!', es: '¡Cuenta actualizada!' },
    'toast.accountDeleted': { en: 'Account and its trades deleted.', pt: 'Conta e suas operações excluídas.', es: 'Cuenta y sus operaciones eliminadas.' },
    'toast.tradesImported': { en: 'trades correctly synchronized!', pt: 'operações sincronizadas corretamente!', es: 'operaciones sincronizadas correctamente!' },
    'toast.selectAccount': { en: 'Please select an account before importing.', pt: 'Selecione uma conta antes de importar.', es: 'Seleccione una cuenta antes de importar.' },
    'toast.jsonExported': { en: 'JSON Database Exported Successfully!', pt: 'Base de Dados JSON exportada com sucesso!', es: '¡Base de Datos JSON exportada exitosamente!' },
    'toast.jsonImported': { en: 'Database Imported Successfully!', pt: 'Base de Dados importada com sucesso!', es: '¡Base de Datos importada exitosamente!' },
    'toast.tradeUpdated': { en: 'Trade updated!', pt: 'Operação atualizada!', es: '¡Operación actualizada!' },

    // --- Border Labels (Theme) ---
    'border.general': { en: 'General', pt: 'Geral', es: 'General' },
    'border.today': { en: 'Today', pt: 'Hoje', es: 'Hoy' },
    'border.holiday': { en: 'Holiday', pt: 'Feriado', es: 'Festivo' },
    'border.positive': { en: 'Positive', pt: 'Positivo', es: 'Positivo' },
    'border.negative': { en: 'Negative', pt: 'Negativo', es: 'Negativo' },

    // --- Mobile Menu ---
    'mobile.data': { en: 'Data', pt: 'Dados', es: 'Datos' },
};

/**
 * Translation function. Returns the translated string for the given key and language.
 * Falls back to English if key or language is not found.
 */
export function t(key: string, lang: string = 'en'): string {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang as Lang] || entry.en || key;
}
