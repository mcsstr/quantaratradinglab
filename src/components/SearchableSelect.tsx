import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from './Icons';

const SearchableSelect = ({ label, options, value, onChange, theme, settings }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(o => o.label.toLowerCase().includes(searchTerm.toLowerCase()));
    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="space-y-1.5 md:space-y-2 relative" ref={wrapperRef}>
            <label className="text-[10px] md:text-xs font-bold" style={{ color: theme.textoSecundario }}>{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full rounded-lg p-2.5 outline-none text-xs md:text-sm bg-transparent cursor-pointer flex justify-between items-center transition-colors hover:bg-white/5"
                style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }}
            >
                <span className="truncate">{selectedOption ? selectedOption.label : 'Select...'}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute z-[100] w-full mt-1 rounded-lg shadow-2xl max-h-60 flex flex-col overflow-hidden" style={{ backgroundColor: theme.fundoCards, borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid' }}>
                    <div className="p-2 border-b" style={{ borderColor: theme.contornoGeral, backgroundColor: theme.fundoCards }}>
                        <div className="relative">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" style={{ color: theme.textoPrincipal }} />
                            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onClick={e => e.stopPropagation()} className="w-full rounded p-1.5 pl-8 text-xs outline-none bg-black/20" style={{ color: theme.textoPrincipal }} />
                        </div>
                    </div>
                    <div className="overflow-y-auto hide-scrollbar flex-1 p-1">
                        {filteredOptions.map(opt => (
                            <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); setSearchTerm(''); }} className="p-2 text-xs md:text-sm cursor-pointer hover:bg-white/10 rounded transition-colors truncate" style={{ color: theme.textoPrincipal, backgroundColor: opt.value === value ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                                {opt.label}
                            </div>
                        ))}
                        {filteredOptions.length === 0 && <div className="p-3 text-xs text-center" style={{ color: theme.textoSecundario }}>No results found</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;