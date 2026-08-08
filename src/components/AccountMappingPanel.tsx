// AccountMappingPanel.tsx
// Visual UI for configuring CSV and Paste import mappings and trade entry inputs.

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus, Download } from './Icons';

export const getBaseFieldOptions = (lang: string = 'en') => {
    const isPt = lang === 'pt';
    const isEs = lang === 'es';

    return [
        { value: 'symbol', label: isPt ? 'Symbol (Ativo)' : isEs ? 'Symbol (Símbolo)' : 'Symbol' },
        { value: 'qty', label: isPt ? 'Qty (Quantidade)' : isEs ? 'Qty (Cantidad)' : 'Qty / Contracts' },
        { value: 'buy_price', label: isPt ? 'Buy Price (Preço Compra)' : isEs ? 'Buy Price (Precio Compra)' : 'Buy Price' },
        { value: 'buy_time', label: isPt ? 'Buy Time (Hora Entrada)' : isEs ? 'Buy Time (Hora Entrada)' : 'Buy Time / Date' },
        { value: 'sell_price', label: isPt ? 'Sell Price (Preço Venda)' : isEs ? 'Sell Price (Precio Venta)' : 'Sell Price' },
        { value: 'sell_time', label: isPt ? 'Sell Time (Hora Saída)' : isEs ? 'Sell Time (Hora Salida)' : 'Sell Time' },
        { value: 'duration', label: isPt ? 'Duration (Duração)' : isEs ? 'Duration (Duración)' : 'Duration' },
        { value: 'pnl', label: isPt ? 'P&L (Lucro/Prejuízo)' : isEs ? 'P&L (Ganancia/Pérdida)' : 'P&L (Profit/Loss)' },
        { value: 'direction', label: isPt ? 'Direction (Long/Short ou Compra/Venda)' : isEs ? 'Direction (Long/Short o Compra/Venta)' : 'Direction / Side (Buy/Sell)' },
        { value: 'strategy', label: isPt ? 'Estratégia / Setup (Strategy)' : isEs ? 'Estrategia / Setup' : 'Strategy / Setup' },
        { value: 'raw', label: isPt ? '📦 Guardar como Dado Extra' : isEs ? '📦 Guardar como Dato Extra' : '📦 Keep as Extra Data' },
        { value: 'ignore', label: isPt ? '✕ Ignorar coluna' : isEs ? '✕ Ignorar columna' : '✕ Ignore column' },
    ];
};

export const getCommissionOption = (lang: string = 'en') => {
    const isPt = lang === 'pt';
    const isEs = lang === 'es';
    return { value: 'commission', label: isPt ? '💰 Comissão (Commission/Fee)' : isEs ? '💰 Comisión (Fee)' : '💰 Commission / Fee' };
};

export const getFieldOptions = (isFixedFee: boolean, lang: string = 'en') => {
    const base = getBaseFieldOptions(lang);
    if (isFixedFee) return base;
    return [
        ...base.slice(0, -2),
        getCommissionOption(lang),
        base[base.length - 2],
        base[base.length - 1],
    ];
};

const getCsvPresets = (lang: string = 'en') => {
    const isPt = lang === 'pt';
    const isEs = lang === 'es';

    return [
        {
            id: 'simple',
            label: isPt ? '⚡ Simples Básico' : isEs ? '⚡ Simple Básico' : '⚡ Basic Simple',
            desc: isPt ? 'Data, Ativo, Lado, Qtd, P&L' : isEs ? 'Fecha, Símbolo, Lado, Cant, P&L' : 'Date, Symbol, Side, Qty, P&L',
            mapping: {
                'Date': 'buy_time',
                'Symbol': 'symbol',
                'Side': 'direction',
                'Qty': 'qty',
                'P&L': 'pnl',
            }
        },
        {
            id: 'simple_prices',
            label: isPt ? '⚡ Simples c/ Preços' : isEs ? '⚡ Simple c/ Precios' : '⚡ Simple w/ Prices',
            desc: isPt ? 'Data, Ativo, Lado, Preço Compra, Preço Venda, Qtd, P&L' : isEs ? 'Fecha, Símbolo, Lado, Precio Compra, Precio Venta, Cant, P&L' : 'Date, Symbol, Side, Buy Price, Sell Price, Qty, P&L',
            mapping: {
                'Date': 'buy_time',
                'Symbol': 'symbol',
                'Side': 'direction',
                'Buy Price': 'buy_price',
                'Sell Price': 'sell_price',
                'Qty': 'qty',
                'P&L': 'pnl',
            }
        },
        {
            id: 'b3',
            label: isPt ? '⚡ B3 / Profitchart' : isEs ? '⚡ B3 / Profitchart' : '⚡ B3 / Profitchart',
            desc: isPt ? 'Data, Ativo, Preços, Qtd, Estratégia, Resultado' : isEs ? 'Fecha, Símbolo, Precios, Cant, Estrategia, Resultado' : 'Date, Symbol, Prices, Qty, Strategy, Result',
            mapping: {
                'Data': 'buy_time',
                'Ativo': 'symbol',
                'Lado': 'direction',
                'Preço Compra': 'buy_price',
                'Preço Venda': 'sell_price',
                'Quantidade': 'qty',
                'Estratégia': 'strategy',
                'Resultado Líquido': 'pnl',
                'Taxas': 'commission',
            }
        },
        {
            id: 'full',
            label: isPt ? '⚡ Completo' : isEs ? '⚡ Completo' : '⚡ Full',
            desc: isPt ? 'Com Horários, Duração, Estratégia e Comissão' : isEs ? 'Con Horarios, Duración, Estrategia y Comisión' : 'With Times, Duration, Strategy and Fees',
            mapping: {
                'Date': 'buy_time',
                'Symbol': 'symbol',
                'Buy Price': 'buy_price',
                'Buy Time': 'buy_time',
                'Sell Price': 'sell_price',
                'Sell Time': 'sell_time',
                'Qty': 'qty',
                'Direction': 'direction',
                'Duration': 'duration',
                'Strategy': 'strategy',
                'P&L': 'pnl',
                'Commission': 'commission',
            }
        }
    ];
};

// ─── Reusable Dropdown ────────────────────────────────────────────────────────
function MapToSelect({ value, onChange, isFixedFee, lang = 'en', selectedValues = [] }: { value: string; onChange: (v: string) => void; isFixedFee: boolean; lang?: string; selectedValues?: string[] }) {
    const options = getFieldOptions(isFixedFee, lang);
    return (
        <select
            value={value || 'ignore'}
            onChange={e => onChange(e.target.value)}
            className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-white/5 text-xs font-semibold text-white/80 outline-none cursor-pointer border border-white/10 hover:border-white/20 transition-all"
            style={{ colorScheme: 'dark' }}
        >
            {options.map(o => {
                const isDisabled = o.value !== 'ignore' && o.value !== 'raw' && o.value !== value && selectedValues.includes(o.value);
                return (
                    <option key={o.value} value={o.value} disabled={isDisabled} className={`bg-gray-900 ${isDisabled ? 'text-white/30' : 'text-white'}`}>
                        {o.label}
                    </option>
                );
            })}
        </select>
    );
}

// ─── CSV / Input Mapping Editor ──────────────────────────────────────────────
interface CsvMappingEditorProps {
    value: Record<string, string>;
    onChange: (v: Record<string, string>) => void;
    isFixedFee: boolean;
    lang?: string;
    allowFileUpload?: boolean;
}

function CsvMappingEditor({ value, onChange, isFixedFee, lang = 'en', allowFileUpload = true }: CsvMappingEditorProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [headers, setHeaders] = useState<string[]>(Object.keys(value));
    const [newColName, setNewColName] = useState('');
    const isPt = lang === 'pt';
    const isEs = lang === 'es';
    const presets = getCsvPresets(lang);

    useEffect(() => {
        setHeaders(Object.keys(value));
    }, [value]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = (ev.target?.result as string) || '';
            const firstLine = text.split(/\r?\n/)[0] || '';
            const delimiter = firstLine.includes('\t') ? /\t/ : /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
            const cols = firstLine.split(delimiter).map(h => h.replace(/(^"|"$)/g, '').trim()).filter(Boolean);

            if (cols.length === 0) return;

            const newMapping: Record<string, string> = { ...value };
            cols.forEach(col => {
                if (!newMapping[col]) {
                    const lower = col.toLowerCase();
                    if (lower.includes('symbol') || lower.includes('ativo') || lower.includes('instrument') || lower.includes('contrato')) newMapping[col] = 'symbol';
                    else if (lower.includes('buy price') || lower.includes('preco compra') || lower.includes('preço compra') || lower.includes('entry price')) newMapping[col] = 'buy_price';
                    else if (lower.includes('sell price') || lower.includes('preco venda') || lower.includes('preço venda') || lower.includes('exit price')) newMapping[col] = 'sell_price';
                    else if (lower.includes('buy time') || lower.includes('hora compra') || lower.includes('hora entrada') || lower.includes('entry time') || lower.includes('data') || lower.includes('date')) newMapping[col] = 'buy_time';
                    else if (lower.includes('sell time') || lower.includes('hora venda') || lower.includes('hora saida') || lower.includes('hora saída') || lower.includes('exit time')) newMapping[col] = 'sell_time';
                    else if (lower.includes('duration') || lower.includes('duracao') || lower.includes('duração') || lower.includes('tempo')) newMapping[col] = 'duration';
                    else if (lower.includes('qty') || lower.includes('quantidade') || lower.includes('size') || lower.includes('lots') || lower.includes('contratos')) newMapping[col] = 'qty';
                    else if (lower.includes('p&l') || lower.includes('pnl') || lower.includes('profit') || lower.includes('lucro') || lower.includes('resultado') || lower.includes('liquid')) newMapping[col] = 'pnl';
                    else if (lower.includes('commis') || lower.includes('taxa') || lower.includes('fee')) newMapping[col] = isFixedFee ? 'ignore' : 'commission';
                    else if (lower.includes('strategy') || lower.includes('estrategia') || lower.includes('estratégia') || lower.includes('setup')) newMapping[col] = 'strategy';
                    else if (lower.includes('type') || lower.includes('side') || lower.includes('lado') || lower.includes('direction') || lower.includes('direcao') || lower.includes('direção')) newMapping[col] = 'direction';
                    else newMapping[col] = 'ignore';
                }
            });
            onChange(newMapping);
        };
        reader.readAsText(file);
    };

    const handleApplyPreset = (presetMapping: Record<string, string>) => {
        onChange({ ...presetMapping });
    };

    const handleSetMap = (col: string, mapTo: string) => {
        onChange({ ...value, [col]: mapTo });
    };

    const handleRemoveColumn = (col: string) => {
        const next = { ...value };
        delete next[col];
        onChange(next);
    };

    const handleAddManualColumn = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newColName.trim();
        if (!trimmed || value[trimmed]) return;
        onChange({ ...value, [trimmed]: 'ignore' });
        setNewColName('');
    };

    const handleDownloadTemplate = () => {
        const activeHeaders = headers.filter(h => value[h] && value[h] !== 'ignore');
        if (activeHeaders.length === 0) return;

        const sampleRow = activeHeaders.map(h => {
            const mapTo = value[h];
            if (mapTo === 'symbol') return 'MNQ';
            if (mapTo === 'direction') return 'Long';
            if (mapTo === 'buy_time') return '2025-01-15 09:30:00';
            if (mapTo === 'sell_time') return '2025-01-15 09:45:00';
            if (mapTo === 'buy_price') return '20500.00';
            if (mapTo === 'sell_price') return '20550.00';
            if (mapTo === 'qty') return '1';
            if (mapTo === 'pnl') return '100.00';
            if (mapTo === 'commission') return '2.50';
            if (mapTo === 'strategy') return 'Scalp';
            return '100';
        }).join(',');

        const csvContent = activeHeaders.join(',') + '\n' + sampleRow;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'quantara_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-3.5">
            {/* Fast Presets */}
            <div>
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1.5 block">
                    {isPt ? 'Modelos Rápidos de Inputs (1-Clique)' : isEs ? 'Plantillas Rápidas de Inputs (1-Clic)' : 'Quick Input Templates (1-Click)'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                    {presets.map(preset => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleApplyPreset(preset.mapping)}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00B0F0]/50 hover:bg-[#00B0F0]/10 text-left transition-all group"
                        >
                            <span className="text-[11px] font-bold text-white group-hover:text-[#00B0F0] transition-colors block truncate">
                                {preset.label}
                            </span>
                            <span className="text-[9px] text-white/40 block truncate mt-0.5">
                                {preset.desc}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Upload Sample File & Download Template */}
            {allowFileUpload && (
                <div className="flex gap-2">
                    <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleUpload} />
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex-1 py-2 rounded-xl border border-dashed border-[#00B0F0]/40 text-xs font-bold text-[#00B0F0] hover:bg-[#00B0F0]/10 hover:border-[#00B0F0] transition-all flex items-center justify-center gap-1.5"
                    >
                        📂 {isPt ? 'Subir CSV de Exemplo' : isEs ? 'Subir CSV de Ejemplo' : 'Upload Sample CSV'}
                    </button>

                    <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="py-2 px-3 rounded-xl border border-white/10 text-xs font-bold text-white/70 hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 shrink-0"
                        title={isPt ? 'Baixar modelo de CSV' : isEs ? 'Descargar plantilla CSV' : 'Download CSV Template'}
                    >
                        <Download size={13} /> {isPt ? 'Modelo .CSV' : isEs ? 'Plantilla .CSV' : 'Template .CSV'}
                    </button>
                </div>
            )}

            {/* List of Configured Inputs / Headers */}
            {headers.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
                    <p className="text-xs text-white/60 font-semibold">
                        {isPt ? 'Nenhum campo configurado ainda' : isEs ? 'Ningún campo configurado aún' : 'No inputs configured yet'}
                    </p>
                    <p className="text-[10px] text-white/40">
                        {isPt
                            ? 'Escolha um Modelo Rápido acima ou adicione seus campos manualmente abaixo.'
                            : isEs
                            ? 'Elija una Plantilla Rápida arriba o agregue sus campos manualmente abajo.'
                            : 'Choose a Quick Template above or add your fields manually below.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 hide-scrollbar">
                    {headers.map(col => (
                        <div key={col} className="flex items-center gap-2">
                            <span
                                className="w-36 flex-shrink-0 text-[11px] font-mono text-white/70 truncate bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/10"
                                title={col}
                            >
                                {col}
                            </span>
                            <span className="text-white/30 text-xs shrink-0">→</span>
                            <MapToSelect value={value[col] || 'ignore'} onChange={v => handleSetMap(col, v)} isFixedFee={isFixedFee} lang={lang} selectedValues={Object.values(value)} />
                            <button
                                type="button"
                                onClick={() => handleRemoveColumn(col)}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-colors shrink-0"
                                title={isPt ? 'Remover este campo' : isEs ? 'Eliminar este campo' : 'Remove this field'}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Manual Input / Column Adder */}
            <form onSubmit={handleAddManualColumn} className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder={isPt ? 'Nome do campo (ex: Preço Compra, Preço Venda, Estratégia)...' : isEs ? 'Nombre del campo...' : 'Field name (e.g. Buy Price, Sell Price, Strategy)...'}
                    value={newColName}
                    onChange={e => setNewColName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 text-xs font-mono text-white outline-none border border-white/10 focus:border-[#00B0F0] transition-all"
                />
                <button
                    type="submit"
                    disabled={!newColName.trim()}
                    className="py-1.5 px-3 rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 shrink-0"
                >
                    <Plus size={13} /> {isPt ? 'Adicionar Campo' : isEs ? 'Agregar Campo' : 'Add Field'}
                </button>
            </form>
        </div>
    );
}

// ─── Paste Tab ────────────────────────────────────────────────────────────────
export interface PasteRule {
    name: string;
    mapTo: string;
}

interface PasteMappingEditorProps {
    value: PasteRule[];
    onChange: (v: PasteRule[]) => void;
    isFixedFee: boolean;
    lang?: string;
}

function PasteMappingEditor({ value, onChange, isFixedFee, lang = 'en' }: PasteMappingEditorProps) {
    const isPt = lang === 'pt';
    const isEs = lang === 'es';

    const add = () => onChange([...value, { name: '', mapTo: 'ignore' }]);
    const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
    const update = (i: number, mapTo: string) => {
        const next = [...value];
        next[i] = { ...next[i], mapTo };
        onChange(next);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                    {isPt ? 'Mapeamento por Ordem de Coluna' : isEs ? 'Mapeo por Orden de Columna' : 'Column Order Mapping'}
                </span>
                <button
                    type="button"
                    onClick={add}
                    className="text-xs font-bold text-[#00B0F0] hover:underline flex items-center gap-1"
                >
                    <Plus size={12} /> {isPt ? 'Adicionar Coluna' : isEs ? 'Agregar Columna' : 'Add Column'}
                </button>
            </div>

            {value.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
                    <p className="text-xs text-white/60 font-semibold">
                        {isPt ? 'Nenhuma coluna de colar configurada' : isEs ? 'No hay columnas configuradas' : 'No paste columns configured'}
                    </p>
                    <p className="text-[10px] text-white/40">
                        {isPt ? 'Clique em "Adicionar Coluna" para mapear os dados copiados.' : 'Click "Add Column" to map pasted data.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 hide-scrollbar">
                    {value.map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className="w-8 text-center text-xs font-mono text-white/40">
                                #{idx + 1}
                            </span>
                            <MapToSelect value={rule.mapTo} onChange={v => update(idx, v)} isFixedFee={isFixedFee} lang={lang} selectedValues={value.map(r => r.mapTo)} />
                            <button
                                type="button"
                                onClick={() => remove(idx)}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-colors shrink-0"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────
interface AccountMappingPanelProps {
    isSimplified?: boolean;
    onIsSimplifiedChange?: (v: boolean) => void;
    enableCsv: boolean;
    onEnableCsvChange: (v: boolean) => void;
    csvMapping: Record<string, string>;
    onCsvMappingChange: (v: Record<string, string>) => void;

    enablePaste: boolean;
    onEnablePasteChange: (v: boolean) => void;
    pasteMapping: PasteRule[];
    onPasteMappingChange: (v: PasteRule[]) => void;

    isFixedFee: boolean;

    showStrategyCol?: boolean;
    onShowStrategyColChange?: (v: boolean) => void;
    lang?: string;
}

export default function AccountMappingPanel({
    isSimplified = false, onIsSimplifiedChange,
    enableCsv, onEnableCsvChange, csvMapping, onCsvMappingChange,
    enablePaste, onEnablePasteChange, pasteMapping, onPasteMappingChange,
    isFixedFee,
    showStrategyCol = true, onShowStrategyColChange,
    lang = 'en'
}: AccountMappingPanelProps) {
    const [activeTab, setActiveTab] = useState<'csv' | 'paste'>('csv');
    const isPt = lang === 'pt';
    const isEs = lang === 'es';

    // Toggle between Simplified (Manual only, file modal hidden) and Full (File import allowed)
    const handleToggleFileImport = (enabled: boolean) => {
        if (onIsSimplifiedChange) {
            onIsSimplifiedChange(!enabled);
        }
        onEnableCsvChange(enabled);
        if (!enabled) {
            onEnablePasteChange(false);
        }
    };

    const tabCls = (tab: 'csv' | 'paste') =>
        `flex-1 py-2 text-xs font-bold transition-all rounded-lg ${activeTab === tab
            ? 'bg-[#00B0F0]/15 text-[#00B0F0] border border-[#00B0F0]/30'
            : 'text-white/30 hover:text-white/50 border border-transparent'
        }`;

    const isFileImportEnabled = !isSimplified && (enableCsv || enablePaste);

    return (
        <div className="pt-4 border-t space-y-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between">
                <label className="text-[11px] text-[#00B0F0] font-black uppercase tracking-widest block">
                    {isPt ? 'Configuração de Inputs e Campos de Trades' : isEs ? 'Configuración de Inputs y Campos de Trades' : 'Trade Inputs & Fields Configuration'}
                </label>
            </div>

            {/* Toggle: Habilitar Importação de Arquivos */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5">
                        <input
                            type="checkbox"
                            checked={isFileImportEnabled}
                            onChange={e => handleToggleFileImport(e.target.checked)}
                            className="w-4 h-4 rounded appearance-none border border-white/20 bg-white/5 checked:bg-[#00B0F0] checked:border-transparent transition-all outline-none cursor-pointer"
                        />
                        <span className="text-xs font-bold text-white">
                            {isPt ? 'Habilitar Importação de Arquivos (CSV / Copiar & Colar)' : isEs ? 'Habilitar Importación de Archivos (CSV / Copiar y Pegar)' : 'Enable File Import (CSV / Copy & Paste)'}
                        </span>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        !isFileImportEnabled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-[#00B0F0]/20 text-[#00B0F0] border border-[#00B0F0]/30'
                    }`}>
                        {!isFileImportEnabled ? (isPt ? 'MODO MANUAL SIMPLES' : 'SIMPLE MANUAL MODE') : (isPt ? 'IMPORTAÇÃO ATIVA' : 'IMPORT ACTIVE')}
                    </span>
                </label>

                {!isFileImportEnabled ? (
                    <p className="text-[10px] text-amber-300/80 leading-relaxed pl-6.5">
                        {isPt
                            ? '⚡ A tela com modal de arquivos (CSV) ficará OCULTA no painel. O registro de trades usará apenas os campos configurados abaixo.'
                            : isEs
                            ? '⚡ La pantalla con modal de archivos (CSV) estará OCULTA en el panel. El registro de operaciones usará solo los campos configurados abajo.'
                            : '⚡ The file upload modal (CSV) will be HIDDEN in the dashboard. Trade entry will use only the fields configured below.'}
                    </p>
                ) : (
                    <div className="flex gap-4 pt-1 pl-6.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enableCsv}
                                onChange={e => onEnableCsvChange(e.target.checked)}
                                className="w-3.5 h-3.5 rounded appearance-none border border-white/20 bg-white/5 checked:bg-[#00B0F0] checked:border-transparent transition-all outline-none"
                            />
                            <span className="text-xs font-semibold text-white/70">CSV</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enablePaste}
                                onChange={e => onEnablePasteChange(e.target.checked)}
                                className="w-3.5 h-3.5 rounded appearance-none border border-white/20 bg-white/5 checked:bg-[#00B0F0] checked:border-transparent transition-all outline-none"
                            />
                            <span className="text-xs font-semibold text-white/70">
                                {isPt ? 'Copiar/Colar' : isEs ? 'Copiar/Pegar' : 'Copy/Paste'}
                            </span>
                        </label>
                    </div>
                )}
            </div>

            {/* Field & Input Editor (ALWAYS AVAILABLE to customize inputs like buy price, sell price, etc.) */}
            <div className="space-y-3 pt-1">
                {isFileImportEnabled && enablePaste && (
                    <div className="flex gap-1.5 mb-3 p-1 rounded-xl bg-white/5">
                        {enableCsv && (
                            <button type="button" className={tabCls('csv')} onClick={() => setActiveTab('csv')}>
                                📄 CSV / Inputs
                            </button>
                        )}
                        {enablePaste && (
                            <button type="button" className={tabCls('paste')} onClick={() => setActiveTab('paste')}>
                                📋 {isPt ? 'Copiar/Colar' : isEs ? 'Copiar/Pegar' : 'Copy/Paste'}
                            </button>
                        )}
                    </div>
                )}

                {(!isFileImportEnabled || activeTab === 'csv' || !enablePaste) && (
                    <CsvMappingEditor
                        value={csvMapping}
                        onChange={onCsvMappingChange}
                        isFixedFee={isFixedFee}
                        lang={lang}
                        allowFileUpload={isFileImportEnabled}
                    />
                )}

                {isFileImportEnabled && activeTab === 'paste' && enablePaste && (
                    <PasteMappingEditor
                        value={pasteMapping}
                        onChange={onPasteMappingChange}
                        isFixedFee={isFixedFee}
                        lang={lang}
                    />
                )}
            </div>

            {/* Strategy / Setup Column Option */}
            {onShowStrategyColChange && (
                <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showStrategyCol}
                            onChange={e => onShowStrategyColChange(e.target.checked)}
                            className="w-4 h-4 rounded appearance-none border border-white/20 bg-white/5 checked:bg-[#00B0F0] checked:border-transparent transition-all outline-none"
                        />
                        <span className="text-xs font-semibold text-white/80">
                            {isPt
                                ? 'Exibir Coluna "Estratégia / Setup" na Tabela de Trades'
                                : isEs
                                ? 'Mostrar Columna "Estrategia / Setup" en la Tabla de Trades'
                                : 'Show "Strategy / Setup" Column in Trades Table'}
                        </span>
                    </label>
                </div>
            )}
        </div>
    );
}
