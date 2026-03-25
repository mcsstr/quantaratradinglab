// AccountMappingPanel.tsx
// UI visual dupla para configurar mapeamentos de importação via CSV e Paste.
// CSV: mapeamento por nome de coluna (dicionário) — Paste: mapeamento por índice (array).

import React, { useState, useRef } from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus } from './Icons';

// Opções de mapeamento base (sem comissão — usada quando is_fixed_fee = true)
const BASE_FIELD_OPTIONS = [
    { value: 'symbol', label: 'Symbol (Ativo)' },
    { value: 'qty', label: 'Qty (Quantidade)' },
    { value: 'buy_price', label: 'Buy Price (Preço Compra)' },
    { value: 'buy_time', label: 'Buy Time (Hora Entrada)' },
    { value: 'sell_price', label: 'Sell Price (Preço Venda)' },
    { value: 'sell_time', label: 'Sell Time (Hora Saída)' },
    { value: 'duration', label: 'Duration (Duração)' },
    { value: 'pnl', label: 'P&L (Lucro/Prejuízo)' },
    { value: 'direction', label: 'Direction (Long/Short)' },
    { value: 'raw', label: '📦 Guardar como Dado Extra' },
    { value: 'ignore', label: '✕ Ignorar coluna' },
];

// Opção de comissão — só aparece quando is_fixed_fee = false
const COMMISSION_OPTION = { value: 'commission', label: '💰 Comissão (Commission/Fee)' };

export const getFieldOptions = (isFixedFee: boolean) =>
    isFixedFee
        ? BASE_FIELD_OPTIONS
        : [
            ...BASE_FIELD_OPTIONS.slice(0, -2),
            COMMISSION_OPTION,
            BASE_FIELD_OPTIONS[BASE_FIELD_OPTIONS.length - 2], // raw
            BASE_FIELD_OPTIONS[BASE_FIELD_OPTIONS.length - 1], // ignore
        ];

// ─── Dropdown reutilizável ────────────────────────────────────────────────────
function MapToSelect({ value, onChange, isFixedFee, selectedValues = [] }: { value: string; onChange: (v: string) => void; isFixedFee: boolean; selectedValues?: string[] }) {
    const options = getFieldOptions(isFixedFee);
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

// ─── Aba CSV ─────────────────────────────────────────────────────────────────
interface CsvMappingEditorProps {
    value: Record<string, string>;
    onChange: (v: Record<string, string>) => void;
    isFixedFee: boolean;
}

function CsvMappingEditor({ value, onChange, isFixedFee }: CsvMappingEditorProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [headers, setHeaders] = useState<string[]>(Object.keys(value));

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = (ev.target?.result as string) || '';
            const firstLine = text.split(/\r?\n/)[0] || '';
            // CSV usa vírgula com regex robusto para aspas
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

    const handleSetMap = (col: string, mapTo: string) => {
        onChange({ ...value, [col]: mapTo });
    };

    return (
        <div className="space-y-3">
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleUpload} />
            <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full py-2.5 rounded-xl border border-dashed border-[#00B0F0]/40 text-xs font-bold text-[#00B0F0]/80 hover:bg-[#00B0F0]/8 hover:border-[#00B0F0]/60 transition-all flex items-center justify-center gap-2"
            >
                📂 Fazer Upload de CSV de Exemplo
                <span className="text-white/30 font-normal">(lê apenas o cabeçalho)</span>
            </button>

            {headers.length === 0 ? (
                <p className="text-[10px] text-white/30 text-center py-2">
                    Suba um arquivo CSV da sua corretora. Os cabeçalhos aparecerão aqui para você mapear.
                </p>
            ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 hide-scrollbar">
                    {headers.map(col => (
                        <div key={col} className="flex items-center gap-2">
                            <span
                                className="w-36 flex-shrink-0 text-[11px] font-mono text-white/60 truncate bg-white/5 rounded px-2 py-1.5"
                                title={col}
                            >
                                {col}
                            </span>
                            <span className="text-white/20 text-xs shrink-0">→</span>
                            <MapToSelect value={value[col] || 'ignore'} onChange={v => handleSetMap(col, v)} isFixedFee={isFixedFee} selectedValues={Object.values(value)} />
                        </div>
                    ))}
                </div>
            )}
            <p className="text-[10px] text-white/30 leading-relaxed">
                {isFixedFee
                    ? 'Taxa fixa por contrato ativa — o campo "Comissão" não é necessário no mapeamento.'
                    : 'Mapeie a coluna de comissão da corretora para "💰 Comissão" para calcular o custo real.'}
            </p>
        </div>
    );
}

// ─── Aba Paste ────────────────────────────────────────────────────────────────
export interface PasteRule {
    name: string;
    mapTo: string;
}

interface PasteMappingEditorProps {
    value: PasteRule[];
    onChange: (v: PasteRule[]) => void;
    isFixedFee: boolean;
}

function PasteMappingEditor({ value, onChange, isFixedFee }: PasteMappingEditorProps) {
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
                    Adicione as colunas na <strong>ordem exata</strong> em que aparecem quando você copia da sua corretora.
                </p>
            ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 hide-scrollbar">
                    {value.map((rule, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <span className="text-[10px] text-white/20 font-mono w-4 text-right shrink-0">{i}</span>
                            <input
                                type="text"
                                placeholder="Nome da coluna"
                                value={rule.name}
                                onChange={e => update(i, 'name', e.target.value)}
                                className="w-28 flex-shrink-0 px-2 py-1.5 rounded-lg bg-white/5 text-xs font-mono text-white/80 outline-none border border-white/10 focus:border-white/25 transition-all"
                            />
                            <span className="text-white/20 text-xs shrink-0">→</span>
                            <MapToSelect value={rule.mapTo} onChange={v => update(i, 'mapTo', v)} isFixedFee={isFixedFee} selectedValues={value.map(r => r.mapTo)} />
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
                <Plus size={13} /> Adicionar Coluna
            </button>
            <p className="text-[10px] text-white/30 leading-relaxed">
                A <strong className="text-white/50">ordem é crucial</strong>. O índice à esquerda (0, 1, 2…) corresponde à posição exata das colunas no texto colado.
                {!isFixedFee && <span className="text-yellow-400/60"> Lembre de mapear a coluna de comissão da sua corretora.</span>}
            </p>
        </div>
    );
}

// ─── Painel Principal ─────────────────────────────────────────────────────────
interface AccountMappingPanelProps {
    enableCsv: boolean;
    onEnableCsvChange: (v: boolean) => void;
    csvMapping: Record<string, string>;
    onCsvMappingChange: (v: Record<string, string>) => void;

    enablePaste: boolean;
    onEnablePasteChange: (v: boolean) => void;
    pasteMapping: PasteRule[];
    onPasteMappingChange: (v: PasteRule[]) => void;

    /** Quando true, comissão é fixa por contrato — oculta opção "Comissão" dos dropdowns */
    isFixedFee: boolean;
}

export default function AccountMappingPanel({
    enableCsv, onEnableCsvChange, csvMapping, onCsvMappingChange,
    enablePaste, onEnablePasteChange, pasteMapping, onPasteMappingChange,
    isFixedFee,
}: AccountMappingPanelProps) {
    const [activeTab, setActiveTab] = useState<'csv' | 'paste'>('csv');

    const tabCls = (tab: 'csv' | 'paste') =>
        `flex-1 py-2 text-xs font-bold transition-all rounded-lg ${activeTab === tab
            ? 'bg-[#00B0F0]/15 text-[#00B0F0] border border-[#00B0F0]/30'
            : 'text-white/30 hover:text-white/50 border border-transparent'
        }`;

    return (
        <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <label className="text-[11px] text-[#00B0F0] font-black uppercase tracking-widest mb-4 block">
                Import Configuration
            </label>

            {/* Checkboxes de método */}
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
                    <span className="text-xs font-semibold text-white/70">Copiar/Colar</span>
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
                                📋 Copiar/Colar
                            </button>
                        )}
                    </div>

                    {activeTab === 'csv' && enableCsv && (
                        <CsvMappingEditor value={csvMapping} onChange={onCsvMappingChange} isFixedFee={isFixedFee} />
                    )}
                    {activeTab === 'paste' && enablePaste && (
                        <PasteMappingEditor value={pasteMapping} onChange={onPasteMappingChange} isFixedFee={isFixedFee} />
                    )}
                </>
            )}
        </div>
    );
}
