// AccountMappingPanel.tsx
// Visual UI for configuring CSV and Paste import mappings.
// CSV: column name mapping (dictionary) — Paste: index mapping (array).

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
            label: isPt ? '⚡ Simplificado' : isEs ? '⚡ Simplificado' : '⚡ Simplified',
            desc: isPt ? 'Data, Ativo, Compra/Venda, Qtd, P&L' : isEs ? 'Fecha, Símbolo, Lado, Cant, P&L' : 'Date, Symbol, Side, Qty, P&L',
            mapping: {
                'Date': 'buy_time',
                'Symbol': 'symbol',
                'Side': 'direction',
                'Qty': 'qty',
                'P&L': 'pnl',
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
        },
        {
            id: 'b3',
            label: isPt ? '⚡ B3 / Profitchart' : isEs ? '⚡ B3 / Profitchart' : '⚡ B3 / Profitchart',
            desc: isPt ? 'Mapeamento padrão das plataformas BR' : isEs ? 'Mapeo estándar de plataformas BR' : 'Default mapping for BR platforms',
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

// ─── CSV Tab ─────────────────────────────────────────────────────────────────
interface CsvMappingEditorProps {
    value: Record<string, string>;
    onChange: (v: Record<string, string>) => void;
    isFixedFee: boolean;
    lang?: string;
}

function CsvMappingEditor({ value, onChange, isFixedFee, lang = 'en' }: CsvMappingEditorProps) {
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
            setHeaders(cols);
            const newMap: Record<string, string> = {};
            cols.forEach(col => { newMap[col] = value[col] || 'ignore'; });
            onChange(newMap);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleApplyPreset = (presetMapping: Record<string, string>) => {
        const adjustedMap = { ...presetMapping };
        if (isFixedFee && adjustedMap['Commission']) {
            delete adjustedMap['Commission'];
        }
        if (isFixedFee && adjustedMap['Taxas']) {
            delete adjustedMap['Taxas'];
        }
        setHeaders(Object.keys(adjustedMap));
        onChange(adjustedMap);
    };

    const handleAddManualColumn = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = newColName.trim();
        if (!trimmed || headers.includes(trimmed)) return;
        
        const newHeaders = [...headers, trimmed];
        setHeaders(newHeaders);
        onChange({ ...value, [trimmed]: 'ignore' });
        setNewColName('');
    };

    const handleRemoveColumn = (col: string) => {
        const newMap = { ...value };
        delete newMap[col];
        setHeaders(Object.keys(newMap));
        onChange(newMap);
    };

    const handleSetMap = (col: string, mapTo: string) => {
        onChange({ ...value, [col]: mapTo });
    };

    const handleDownloadTemplate = () => {
        const activeHeaders = headers.length > 0 ? headers : ['Date', 'Symbol', 'Buy Price', 'Sell Price', 'Qty', 'P&L'];
        const sampleRow = activeHeaders.map(h => {
            const lower = h.toLowerCase();
            if (lower.includes('date') || lower.includes('data')) return '2026-08-01 10:00:00';
            if (lower.includes('symbol') || lower.includes('ativo')) return 'NQ';
            if (lower.includes('buy') || lower.includes('compra')) return '20500.00';
            if (lower.includes('sell') || lower.includes('venda')) return '20550.00';
            if (lower.includes('qty') || lower.includes('qtd') || lower.includes('quantidade')) return '1';
            if (lower.includes('p&l') || lower.includes('pnl') || lower.includes('resultado')) return '100.00';
            if (lower.includes('commis') || lower.includes('taxa')) return '2.50';
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
                    {isPt ? 'Modelos de Mapeamento Rápido (1-Clique)' : isEs ? 'Plantillas de Mapeo Rápido (1-Clic)' : 'Quick Mapping Templates (1-Click)'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {presets.map(preset => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleApplyPreset(preset.mapping)}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#00B0F0]/50 hover:bg-[#00B0F0]/10 text-left transition-all group"
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

            {/* Upload File & Download Template */}
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

            {/* List of Headers */}
            {headers.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
                    <p className="text-xs text-white/60 font-semibold">
                        {isPt ? 'Nenhuma coluna configurada ainda' : isEs ? 'No hay columnas configuradas aún' : 'No columns configured yet'}
                    </p>
                    <p className="text-[10px] text-white/40">
                        {isPt
                            ? 'Escolha um Modelo Rápido acima, suba seu arquivo CSV ou crie suas colunas manualmente abaixo.'
                            : isEs
                            ? 'Elija una Plantilla Rápida arriba, suba su archivo CSV o cree sus columnas manualmente a continuación.'
                            : 'Choose a Quick Template above, upload your CSV file, or add your columns manually below.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 hide-scrollbar">
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
                                title={isPt ? 'Remover esta coluna' : isEs ? 'Eliminar esta columna' : 'Remove this column'}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Manual Column Adder */}
            <form onSubmit={handleAddManualColumn} className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder={isPt ? 'Nome da coluna (ex: Data, Ativo, Lucro)...' : isEs ? 'Nombre de columna...' : 'Column name (e.g. Date, Symbol, PnL)...'}
                    value={newColName}
                    onChange={e => setNewColName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 text-xs font-mono text-white outline-none border border-white/10 focus:border-[#00B0F0] transition-all"
                />
                <button
                    type="submit"
                    disabled={!newColName.trim()}
                    className="py-1.5 px-3 rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 shrink-0"
                >
                    <Plus size={13} /> {isPt ? 'Coluna' : isEs ? 'Columna' : 'Column'}
                </button>
            </form>

            <p className="text-[10px] text-white/30 leading-relaxed">
                {isFixedFee
                    ? (isPt ? 'Taxa fixa por contrato ativa — a opção "Comissão" não é necessária.' : isEs ? 'Tarifa fija activa — no es necesaria la opción "Comisión".' : 'Fixed fee per contract active — "Commission" option is not required.')
                    : (isPt ? 'Mapeie a coluna de comissão da corretora para "💰 Comissão" para calcular o custo real.' : isEs ? 'Mapee la columna de comisión a "💰 Comisión" para calcular el costo real.' : 'Map the broker commission column to "💰 Commission" to calculate real costs.')}
            </p>
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
    const move = (i: number, dir: -1 | 1) => {
        const arr = [...value];
        const swap = i + dir;
        if (swap < 0 || swap >= arr.length) return;
        [arr[i], arr[swap]] = [arr[swap], arr[i]];
        onChange(arr);
    };
    const update = (i: number, field: keyof PasteRule, val: string) => {
        const arr = [...value];
        arr[i] = { ...arr[i], [field]: val };
        onChange(arr);
    };

    return (
        <div className="space-y-3">
            {value.length === 0 ? (
                <p className="text-[10px] text-white/30 text-center py-2">
                    {isPt
                        ? 'Adicione as colunas na ordem exata em que aparecem quando você copia da sua corretora.'
                        : isEs
                        ? 'Agregue las columnas en el orden exacto en que aparecen al copiar de su broker.'
                        : 'Add columns in the exact order as they appear when copied from your broker.'}
                </p>
            ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 hide-scrollbar">
                    {value.map((rule, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <span className="text-[10px] text-white/20 font-mono w-4 text-right shrink-0">{i}</span>
                            <input
                                type="text"
                                placeholder={isPt ? 'Nome da coluna' : isEs ? 'Nombre columna' : 'Column name'}
                                value={rule.name}
                                onChange={e => update(i, 'name', e.target.value)}
                                className="w-28 flex-shrink-0 px-2 py-1.5 rounded-lg bg-white/5 text-xs font-mono text-white/80 outline-none border border-white/10 focus:border-white/25 transition-all"
                            />
                            <span className="text-white/20 text-xs shrink-0">→</span>
                            <MapToSelect value={rule.mapTo} onChange={v => update(i, 'mapTo', v)} isFixedFee={isFixedFee} lang={lang} selectedValues={value.map(r => r.mapTo)} />
                            <div className="flex shrink-0 gap-0.5">
                                <button type="button" onClick={() => move(i, -1)} className="p-1 text-white/20 hover:text-white/60 transition-colors" disabled={i === 0}>
                                    <ArrowUp size={12} />
                                </button>
                                <button type="button" onClick={() => move(i, 1)} className="p-1 text-white/20 hover:text-white/60 transition-colors" disabled={i === value.length - 1}>
                                    <ArrowDown size={12} />
                                </button>
                                <button type="button" onClick={() => remove(i)} className="p-1 text-red-400/40 hover:text-red-400 transition-colors">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <button
                type="button"
                onClick={add}
                className="w-full py-2 rounded-xl border border-dashed border-white/15 text-xs font-bold text-white/40 hover:bg-white/5 hover:border-white/25 transition-all flex items-center justify-center gap-1.5"
            >
                <Plus size={13} /> {isPt ? 'Adicionar Coluna' : isEs ? 'Agregar Columna' : 'Add Column'}
            </button>
            <p className="text-[10px] text-white/30 leading-relaxed">
                {isPt
                    ? 'A ordem é crucial. O índice à esquerda (0, 1, 2…) corresponde à posição exata das colunas no texto colado.'
                    : isEs
                    ? 'El orden es crucial. El índice a la izquierda corresponde a la posición exacta de las columnas en el texto pegado.'
                    : 'The order is crucial. The index on the left corresponds to the exact position of columns in the pasted text.'}
                {!isFixedFee && <span className="text-yellow-400/60"> {isPt ? 'Lembre de mapear a coluna de comissão.' : isEs ? 'Recuerde mapear la columna de comisión.' : 'Remember to map the commission column.'}</span>}
            </p>
        </div>
    );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────
interface AccountMappingPanelProps {
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
    enableCsv, onEnableCsvChange, csvMapping, onCsvMappingChange,
    enablePaste, onEnablePasteChange, pasteMapping, onPasteMappingChange,
    isFixedFee,
    showStrategyCol = true, onShowStrategyColChange,
    lang = 'en'
}: AccountMappingPanelProps) {
    const [activeTab, setActiveTab] = useState<'csv' | 'paste'>('csv');
    const isPt = lang === 'pt';
    const isEs = lang === 'es';

    const tabCls = (tab: 'csv' | 'paste') =>
        `flex-1 py-2 text-xs font-bold transition-all rounded-lg ${activeTab === tab
            ? 'bg-[#00B0F0]/15 text-[#00B0F0] border border-[#00B0F0]/30'
            : 'text-white/30 hover:text-white/50 border border-transparent'
        }`;

    return (
        <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <label className="text-[11px] text-[#00B0F0] font-black uppercase tracking-widest mb-4 block">
                {isPt ? 'Configuração de Importação' : isEs ? 'Configuración de Importación' : 'Import Configuration'}
            </label>

            {/* Method Checkboxes */}
            <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={enableCsv}
                        onChange={e => onEnableCsvChange(e.target.checked)}
                        className="w-4 h-4 rounded appearance-none border border-white/20 bg-white/5 checked:bg-[#00B0F0] checked:border-transparent transition-all outline-none"
                    />
                    <span className="text-xs font-semibold text-white/70">CSV</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={enablePaste}
                        onChange={e => onEnablePasteChange(e.target.checked)}
                        className="w-4 h-4 rounded appearance-none border border-white/20 bg-white/5 checked:bg-[#00B0F0] checked:border-transparent transition-all outline-none"
                    />
                    <span className="text-xs font-semibold text-white/70">
                        {isPt ? 'Copiar/Colar' : isEs ? 'Copiar/Pegar' : 'Copy/Paste'}
                    </span>
                </label>
            </div>

            {/* Tabs */}
            {(enableCsv || enablePaste) && (
                <>
                    <div className="flex gap-1.5 mb-3 p-1 rounded-xl bg-white/5">
                        {enableCsv && (
                            <button type="button" className={tabCls('csv')} onClick={() => setActiveTab('csv')}>
                                📄 CSV
                            </button>
                        )}
                        {enablePaste && (
                            <button type="button" className={tabCls('paste')} onClick={() => setActiveTab('paste')}>
                                📋 {isPt ? 'Copiar/Colar' : isEs ? 'Copiar/Pegar' : 'Copy/Paste'}
                            </button>
                        )}
                    </div>

                    {activeTab === 'csv' && enableCsv && (
                        <CsvMappingEditor value={csvMapping} onChange={onCsvMappingChange} isFixedFee={isFixedFee} lang={lang} />
                    )}
                    {activeTab === 'paste' && enablePaste && (
                        <PasteMappingEditor value={pasteMapping} onChange={onPasteMappingChange} isFixedFee={isFixedFee} lang={lang} />
                    )}
                </>
            )}

            {/* Strategy / Setup Column Option */}
            {onShowStrategyColChange && (
                <div className="pt-3 mt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
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
