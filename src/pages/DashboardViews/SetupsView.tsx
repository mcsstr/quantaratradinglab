import React, { useState, useMemo, useEffect } from 'react';
import { 
  Target, Plus, Save, Trash2, CalendarDays, TrendingUp, Edit2, ChevronLeft, Upload, FileText, Download, Maximize2, Minimize2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as mammoth from 'mammoth';

export default function SetupsView({
  theme,
  getGlassStyle,
  settings,
  t,
  lang,
  trades,
  setups,
  saveSetup,
  deleteSetup
}: any) {
  const [viewMode, setViewMode] = useState<'home'|'create'|'edit'|'view'>('home');
  const [selectedSetupId, setSelectedSetupId] = useState<string | null>(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState(''); // Stores Base64
  const [formFileName, setFormFileName] = useState('');
  
  const [filterPeriod, setFilterPeriod] = useState<'daily'|'weekly'|'monthly'|'yearly'>('daily');
  const [isExpandedDoc, setIsExpandedDoc] = useState(false);
  const [docxHtml, setDocxHtml] = useState('');
  const [isParsingDocx, setIsParsingDocx] = useState(false);
  const [hiddenSetups, setHiddenSetups] = useState<Set<string>>(new Set());

  const handleSelect = (mode: 'home'|'create'|'edit'|'view', id: string | null = null) => {
    setViewMode(mode);
    setSelectedSetupId(id);
    setIsExpandedDoc(false);
    
    if (mode === 'create') {
      setFormTitle('');
      setFormDesc('');
      setFormFileName('');
      setDocxHtml('');
    } else if ((mode === 'edit' || mode === 'view') && id) {
       const s = setups.find((x:any) => x.id === id);
       if (s) {
         setFormTitle(s.title);
         setFormDesc(s.description || '');
         setFormFileName(s.images?.[0] || '');
       }
    }
  };

  useEffect(() => {
     if (viewMode === 'view' && formDesc && (formDesc.includes('wordprocessingml') || formFileName.endsWith('.docx'))) {
        setIsParsingDocx(true);
        try {
           const base64Data = formDesc.split(',')[1];
           const binaryString = window.atob(base64Data);
           const len = binaryString.length;
           const bytes = new Uint8Array(len);
           for (let i = 0; i < len; i++) {
             bytes[i] = binaryString.charCodeAt(i);
           }
           mammoth.convertToHtml({arrayBuffer: bytes.buffer})
             .then((result) => {
                 setDocxHtml(result.value);
                 setIsParsingDocx(false);
             })
             .catch(e => {
                console.error("Mammoth Parse Error:", e);
                setDocxHtml('');
                setIsParsingDocx(false);
             });
        } catch(e) {
           console.error("Base64 Parse Error", e);
           setIsParsingDocx(false);
        }
     } else {
        setDocxHtml('');
     }
  }, [viewMode, formDesc, formFileName]);

  const handleSave = () => {
    if (!formTitle.trim()) return;
    const newId = viewMode === 'create' ? crypto.randomUUID() : (selectedSetupId as string);
    saveSetup({
      id: newId,
      title: formTitle,
      description: formDesc,
      images: [formFileName]
    });
    handleSelect('view', newId);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this setup?')) {
      deleteSetup(id);
      if (selectedSetupId === id) handleSelect('home');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setFormDesc(event.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeFile = () => {
    setFormDesc('');
    setFormFileName('');
    setDocxHtml('');
  };

  const chartData = useMemo(() => {
    const allDates = Array.from(new Set(trades.map((t:any) => t.date))).sort();
    const setupTotals: Record<string, number> = { 'Price Action': 0 };
    setups.forEach((s:any) => { setupTotals[s.id] = 0; });

    const result = allDates.map((dateStr: any) => {
        const dayObj: any = { date: dateStr };
        const dayTrades = trades.filter((t:any) => t.date === dateStr);
        
        dayTrades.forEach((tr:any) => {
            const sid = tr.setup_id && setups.some((s:any)=>s.id === tr.setup_id) ? tr.setup_id : 'Price Action';
            setupTotals[sid] = (setupTotals[sid] || 0) + (parseFloat(tr.pnl) || 0);
        });

        Object.keys(setupTotals).forEach(k => {
           const title = k === 'Price Action' ? 'Price Action' : setups.find((x:any)=>x.id === k)?.title || k;
           dayObj[title] = setupTotals[k];
        });
        return dayObj;
    });

    return result;
  }, [trades, setups]);

  const currentSetupTrades = useMemo(() => {
    if (viewMode !== 'view' || !selectedSetupId) return [];
    return trades.filter((t:any) => t.setup_id === selectedSetupId);
  }, [trades, viewMode, selectedSetupId]);

  const tableRows = useMemo(() => {
    const map = new Map();
    currentSetupTrades.forEach((t:any) => {
       const dt = t.date;
       if (!map.has(dt)) map.set(dt, { date: dt, takes: 0, stops: 0, pnl: 0, assets: new Set() });
       const o = map.get(dt);
       const val = parseFloat(t.pnl) || 0;
       if (val >= 0) o.takes++; else o.stops++;
       o.pnl += val;
       o.assets.add(t.symbol);
    });
    const arr = Array.from(map.values()).sort((a:any, b:any) => a.date.localeCompare(b.date));
    return arr.map(r => ({
      ...r,
      assetStr: Array.from(r.assets).join(', '),
      winRate: r.takes + r.stops > 0 ? (r.takes / (r.takes + r.stops)) * 100 : 0
    }));
  }, [currentSetupTrades]);

  const grandTotal = tableRows.reduce((acc, r) => {
    acc.takes += r.takes;
    acc.stops += r.stops;
    acc.pnl += r.pnl;
    return acc;
  }, { takes: 0, stops: 0, pnl: 0 });
  const grandWinRate = grandTotal.takes + grandTotal.stops > 0 ? (grandTotal.takes / (grandTotal.takes + grandTotal.stops)) * 100 : 0;

  const setupNames = ['Price Action', ...setups.map((s:any) => s.title)];
  const lineColors = ['#94a3b8', '#eab308', '#3b82f6', '#ef4444', '#10b981', '#a855f7', '#ec4899', '#f97316'];

  const toggleSetupVisible = (name: string) => {
    setHiddenSetups(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const renderGlobalChart = () => (
    <div className="p-6 rounded-2xl border flex flex-col shadow-sm min-h-[450px]" style={{ background: theme.fundoCards, borderColor: theme.contornoGeral }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 flex items-center gap-2" style={{ color: theme.textoPrincipal }}>
          <TrendingUp size={12} /> Equity Curves Comparison (All Strategies)
        </h3>
        
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 items-center">
           <span className="text-[9px] font-bold uppercase opacity-40 mr-2" style={{ color: theme.textoPrincipal }}>Filter:</span>
           {setupNames.map((name, i) => {
             const isHidden = hiddenSetups.has(name);
             const color = lineColors[i % lineColors.length];
             return (
                <button 
                  key={name}
                  onClick={() => toggleSetupVisible(name)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-bold uppercase tracking-widest transition-all ${!isHidden ? 'opacity-100 bg-white/10' : 'opacity-40 hover:opacity-80'}`}
                  style={{ borderColor: !isHidden ? color : theme.contornoGeral, color: theme.textoPrincipal }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, opacity: isHidden ? 0.2 : 1 }} />
                  {name}
                </button>
             );
           })}
        </div>
      </div>

      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
           <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
             <CartesianGrid stroke={theme.contornoGeral} strokeDasharray="3 3" vertical={false} />
             <XAxis dataKey="date" stroke={theme.textoSecundario} fontSize={10} tickLine={false} axisLine={false} />
             <YAxis stroke={theme.textoSecundario} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
             <Tooltip 
               contentStyle={{ backgroundColor: theme.fundoMenu, borderColor: theme.contornoGeral, borderRadius: '8px' }}
               itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
               labelStyle={{ fontSize: '10px', color: theme.textoSecundario, marginBottom: '4px' }}
               formatter={(val: number, name: string) => {
                   if (hiddenSetups.has(name)) return [];
                   return [`$${val}`, name];
               }}
             />
             {setupNames.filter(name => !hiddenSetups.has(name)).map((name, i) => (
               <Line 
                 key={name}
                 type="monotone" 
                 dataKey={name} 
                 stroke={lineColors[setupNames.indexOf(name) % lineColors.length]} 
                 strokeWidth={name === 'Price Action' ? 1.5 : 2.5} 
                 dot={false}
                 strokeDasharray={name === 'Price Action' ? '5 5' : 'none'}
               />
             ))}
           </LineChart>
         </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-4 overflow-y-auto max-h-16 hide-scrollbar lg:hidden">
         {setupNames.map((name, i) => (
           <div key={name} className="flex items-center gap-1.5 shrink-0">
             <div className="w-3 h-1 rounded-full" style={{ backgroundColor: lineColors[i % lineColors.length] }} />
             <span className="text-[9px] uppercase font-bold tracking-wider opacity-60" style={{ color: theme.textoPrincipal }}>{name}</span>
           </div>
         ))}
      </div>
    </div>
  );

  return (
    <div className="flex w-full min-h-[calc(100vh-140px)] animate-tab-enter relative" style={{ background: theme.fundoGeral }}>
       {/* LEFT SIDEBAR (Infinite) */}
       <div className="w-16 md:w-64 self-stretch border-r shrink-0 hidden sm:flex flex-col pt-5 pb-0 px-2 md:px-4" style={{ borderColor: theme.contornoGeral, background: theme.fundoCards }}>
          <button 
            onClick={() => handleSelect('create')}
            className="w-full flex items-center justify-center md:justify-start gap-2 py-3 md:px-4 mb-4 rounded-xl font-bold text-black transition-transform active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
            style={{ background: '#eab308' }}
          >
            <Plus size={18} />
            <span className="hidden md:block uppercase tracking-wider text-xs">New Setup</span>
          </button>

          <div className="text-[10px] uppercase font-bold tracking-widest opacity-40 px-2 mt-4 mb-1 cursor-pointer hover:opacity-100 transition-opacity" style={{ color: theme.textoPrincipal }} onClick={() => handleSelect('home')}>
            All Strategies Chart
          </div>

          <nav className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-1 mt-2 pb-5">
             {setups.map((s:any) => {
                const isActive = selectedSetupId === s.id;
                return (
                  <div key={s.id} className="flex gap-1 items-center">
                    <button 
                      onClick={() => handleSelect('view', s.id)}
                      className={`flex-1 flex items-center justify-start gap-2 py-2.5 px-3 rounded-lg transition-all ${isActive ? 'bg-white/10 opacity-100 border' : 'hover:bg-white/5 opacity-60 hover:opacity-100 border border-transparent'}`}
                      style={{ borderColor: isActive ? theme.contornoGeral : 'transparent' }}
                    >
                      <Target size={12} style={{ color: isActive ? '#eab308' : theme.textoSecundario }} />
                      <span className="hidden md:block text-[10px] sm:text-[11px] font-bold line-clamp-1 text-left" style={{ color: theme.textoPrincipal }}>{s.title}</span>
                    </button>
                    <div className="flex items-center justify-center gap-0.5">
                      <button onClick={(e) => { e.stopPropagation(); handleSelect('edit', s.id); }} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: theme.textoPrincipal }} title="Edit Setup"><Edit2 size={11} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors" title="Delete Setup"><Trash2 size={11} /></button>
                    </div>
                  </div>
                )
             })}
          </nav>
       </div>

      {/* MAIN CONTENT */}
       <div className="flex-1 flex flex-col p-2 md:p-4 gap-6 max-w-full min-w-0 w-full mb-12">
          
          {!isExpandedDoc && (
             <div className="flex justify-between items-center z-10 py-2" style={{ background: 'transparent' }}>
                <div className="flex items-center gap-3">
                  <Target size={28} className="text-yellow-500" />
                  <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight flex items-center gap-3" style={{ color: theme.textoPrincipal }}>
                    Setups & Strategy
                  </h1>
                </div>
                {viewMode !== 'home' && (
                   <button onClick={() => handleSelect('home')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 px-3 py-2 rounded-lg bg-black/20" style={{ color: theme.textoPrincipal }}>
                      <ChevronLeft size={14}/> Back
                   </button>
                )}
             </div>
          )}

          {/* DYNAMIC VIEW AREA */}
          <div className="flex-1 flex flex-col min-w-0 gap-6 w-full h-full">
            {viewMode === 'home' && !isExpandedDoc && (
              <div className="flex-1 flex flex-col min-h-0 h-full w-full">
                {renderGlobalChart()}
              </div>
            )}

          {(viewMode === 'create' || viewMode === 'edit') && !isExpandedDoc && (
             <div className="flex-1 max-w-4xl w-full mx-auto p-6 rounded-2xl border flex flex-col gap-6 shadow-sm" style={{ background: theme.fundoCards, borderColor: theme.contornoGeral }}>
               <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 flex items-center justify-between" style={{ color: theme.textoPrincipal }}>
                 {viewMode === 'create' ? 'Create New Setup' : 'Edit Setup'}
               </h3>
               
               <div>
                 <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-2 block" style={{ color: theme.textoPrincipal }}>Setup Title</span>
                 <input 
                   type="text" 
                   value={formTitle}
                   onChange={e => setFormTitle(e.target.value)}
                   placeholder="e.g. OBR Pullback"
                   className="w-full bg-black/20 hover:bg-black/30 rounded-xl p-4 text-xl font-bold font-display outline-none focus:ring-1 ring-yellow-500/50 transition-all border border-transparent focus:border-yellow-500/20"
                   style={{ color: theme.textoPrincipal }}
                 />
               </div>
               
               <div className="flex-1 flex flex-col">
                 <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-2 block" style={{ color: theme.textoPrincipal }}>Strategy Document (PDF or DOCX)</span>
                 
                 {!formDesc ? (
                   <label className="flex-1 w-full min-h-[300px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-black/10 hover:bg-black/20" style={{ borderColor: theme.contornoGeral }}>
                     <Upload size={40} className="mb-4 opacity-50" style={{ color: theme.textoPrincipal }} />
                     <span className="text-sm font-bold opacity-70 mb-2" style={{ color: theme.textoPrincipal }}>Click or drag a file to upload</span>
                     <span className="text-xs opacity-40 uppercase tracking-widest font-bold" style={{ color: theme.textoPrincipal }}>Accepts .pdf, .docx</span>
                     <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                   </label>
                 ) : (
                   <div className="flex-1 w-full min-h-[300px] border rounded-xl flex flex-col items-center justify-center bg-black/30 p-8" style={{ borderColor: theme.contornoGeral }}>
                     <FileText size={48} className="mb-4 text-blue-500" />
                     <span className="text-lg font-bold mb-6 text-center break-all" style={{ color: theme.textoPrincipal }}>{formFileName || 'Document Loaded'}</span>
                     <div className="flex gap-4">
                       <label className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors uppercase text-[10px] font-bold tracking-widest cursor-pointer" style={{ color: theme.textoPrincipal }}>
                         Change File
                         <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                       </label>
                       <button onClick={removeFile} className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-colors uppercase text-[10px] font-bold tracking-widest">
                         Remove File
                       </button>
                     </div>
                   </div>
                 )}
               </div>

               <div className="flex justify-end items-center mt-2 pt-4 border-t" style={{ borderColor: theme.contornoGeral }}>
                 <button 
                   onClick={handleSave}
                   className="px-8 py-3 rounded-xl flex items-center gap-2 font-bold text-sm text-black transition-all hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                   style={{ background: '#eab308' }}
                 >
                   <Save size={16} /> Save Setup
                 </button>
               </div>
             </div>
          )}

          {viewMode === 'view' && selectedSetupId && (
            <div className={`flex flex-col gap-6 w-full pb-10 ${isExpandedDoc ? 'h-full max-w-none' : 'max-w-7xl mx-auto'}`}>
               
               {/* 1. DOCUMENT VIEW CONTAINER */}
               <div className="rounded-3xl border shadow-sm relative overflow-hidden flex flex-col p-6 md:p-10" style={{ background: theme.fundoCards, borderColor: theme.contornoGeral }}>
                  
                  {/* Document Header - always visible */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl lg:text-2xl font-black font-display tracking-tight leading-tight max-w-[75%] break-all" style={{ color: theme.textoPrincipal }}>
                      {formTitle}
                    </h2>
                    
                    <div className="flex items-center gap-2 shrink-0">
                       <a href={formDesc} download={formFileName || 'SetupDocument'} className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border" style={{ borderColor: theme.contornoGeral }} title="Download Document">
                          <Download size={15} style={{ color: theme.textoPrincipal }} /> 
                       </a>
                       {formDesc && (
                         <button onClick={() => setIsExpandedDoc(!isExpandedDoc)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500 hover:brightness-110 text-black transition-colors text-[9px] font-bold uppercase tracking-widest" title={isExpandedDoc ? 'Collapse Document' : 'Read Document'}>
                            {isExpandedDoc ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            <span>{isExpandedDoc ? 'Collapse' : 'Read'}</span>
                         </button>
                       )}
                    </div>
                  </div>

                  {/* Document Content - expanded reader */}
                  {isExpandedDoc && (
                    <div className="overflow-auto hide-scrollbar mt-4 rounded-xl border" style={{ borderColor: theme.contornoGeral, minHeight: '1200px', maxHeight: 'max-content', resize: 'vertical' }}>
                      {!formDesc ? (
                         <div className="py-16 text-center opacity-50 flex flex-col items-center justify-center gap-3 italic" style={{ color: theme.textoPrincipal }}>
                           <FileText size={32} className="opacity-20" />
                           No document attached.
                         </div>
                      ) : formDesc.startsWith('data:application/pdf') ? (
                         <object data={formDesc} type="application/pdf" className="w-full h-[1100px] bg-white">
                           <div className="p-10 flex flex-col items-center justify-center text-center h-full">
                             <p className="mb-4 font-bold text-black">Your browser does not support embedded PDFs.</p>
                             <a href={formDesc} download={formFileName || 'Setup_Doc.pdf'} className="px-6 py-2 bg-yellow-500 text-black font-bold text-xs uppercase tracking-widest rounded-lg">Download PDF</a>
                           </div>
                         </object>
                      ) : formDesc.includes('wordprocessingml') || formFileName.endsWith('.docx') ? (
                         <div className="bg-white shadow-2xl p-8 md:p-16 text-black prose prose-sm md:prose-base max-w-none">
                           {isParsingDocx ? (
                              <div className="flex flex-col gap-4 py-10 items-center justify-center opacity-50">
                                 <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
                                 <span className="font-bold tracking-widest uppercase text-xs">Parsing DOCX...</span>
                              </div>
                           ) : docxHtml ? (
                              <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
                           ) : (
                              <div className="py-10 text-center text-red-500 font-bold">Failed to render DOCX inline. Please download it using the button above.</div>
                           )}
                         </div>
                      ) : (
                         <div className="py-16 flex flex-col items-center justify-center gap-6 bg-white">
                           <div className="w-14 h-14 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center"><FileText size={28} /></div>
                           <p className="text-sm font-bold text-black">{formFileName}</p>
                           <a href={formDesc} download={formFileName || 'SetupDocument'} className="px-8 py-3 bg-yellow-500 text-black font-bold text-xs uppercase tracking-widest rounded-lg flex items-center gap-2">
                             <Download size={16} /> Download File
                           </a>
                         </div>
                      )}
                    </div>
                  )}
               </div>

               {/* 2. EQUITY CURVE (GLOBAL) */}
               {!isExpandedDoc && renderGlobalChart()}

               {/* 3. PERFORMANCE DATA TABLE */}
               {!isExpandedDoc && (
                 <div className="p-6 rounded-2xl border flex flex-col shadow-sm" style={{ background: theme.fundoCards, borderColor: theme.contornoGeral }}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 flex items-center gap-2" style={{ color: theme.textoPrincipal }}>
                        <CalendarDays size={12} /> Performance Log
                      </h3>
                      <div className="flex bg-black/40 p-1 rounded-lg border" style={{ borderColor: theme.contornoGeral }}>
                        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map(p => (
                           <button 
                             key={p} onClick={()=>setFilterPeriod(p.toLowerCase() as any)}
                             className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all ${filterPeriod === p.toLowerCase() ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                           >
                             {p}
                           </button>
                        ))}
                      </div>
                    </div>

                    <div className="w-full overflow-x-auto hide-scrollbar">
                       <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                             <tr className="border-b text-[10px] uppercase font-bold tracking-widest opacity-40" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }}>
                                <th className="pb-3 px-4 font-bold">Date</th>
                                <th className="pb-3 px-4 font-bold">Asset</th>
                                <th className="pb-3 px-4 font-bold text-center">TAKES</th>
                                <th className="pb-3 px-4 font-bold text-center">STOPS</th>
                                <th className="pb-3 px-4 font-bold text-right">Value (P&L)</th>
                                <th className="pb-3 px-4 font-bold text-right">Win Rate</th>
                             </tr>
                          </thead>
                          <tbody>
                             {tableRows.map((r, i) => (
                               <tr key={i} className="border-b transition-colors hover:bg-white/5" style={{ borderColor: theme.contornoGeral }}>
                                  <td className="py-4 px-4 text-xs font-bold" style={{ color: theme.textoPrincipal }}>{r.date}</td>
                                  <td className="py-4 px-4 text-xs max-w-[200px] truncate" style={{ color: theme.textoPrincipal }} title={r.assetStr}>{r.assetStr}</td>
                                  <td className="py-4 px-4 text-xs font-black text-green-500 text-center bg-green-500/5">{r.takes}</td>
                                  <td className="py-4 px-4 text-xs font-black text-red-500 text-center bg-red-500/5">{r.stops}</td>
                                  <td className={`py-4 px-4 text-xs md:text-sm font-black text-right ${r.pnl >= 0 ? 'text-[#eab308]' : 'text-red-500'}`}>
                                    {r.pnl >= 0 ? '+' : ''}${parseFloat(r.pnl).toFixed(2)}
                                 </td>
                                  <td className="py-4 px-4 text-xs text-right font-bold" style={{ color: theme.textoPrincipal }}>
                                    {r.winRate.toFixed(1)}%
                                  </td>
                               </tr>
                             ))}
                             {tableRows.length === 0 && (
                               <tr><td colSpan={6} className="py-8 text-center text-xs opacity-50 italic" style={{ color: theme.textoPrincipal }}>No trades recorded under this setup yet.</td></tr>
                             )}
                          </tbody>
                          {tableRows.length > 0 && (
                             <tfoot>
                                <tr className="bg-black/20">
                                   <td className="py-4 px-4 text-xs font-black uppercase tracking-widest" colSpan={2} style={{ color: theme.textoPrincipal }}>Grand Total</td>
                                   <td className="py-4 px-4 text-sm font-black text-green-500 text-center">{grandTotal.takes}</td>
                                   <td className="py-4 px-4 text-sm font-black text-red-500 text-center">{grandTotal.stops}</td>
                                   <td className={`py-4 px-4 text-lg font-black font-display tracking-tight text-right ${grandTotal.pnl >= 0 ? 'text-[#eab308]' : 'text-red-500'}`}>
                                     {grandTotal.pnl >= 0 ? '+' : ''}${parseFloat(grandTotal.pnl).toFixed(2)}
                                   </td>
                                   <td className="py-4 px-4 text-sm font-black text-right" style={{ color: theme.textoPrincipal }}>
                                     {grandWinRate.toFixed(1)}% Avg
                                   </td>
                                </tr>
                             </tfoot>
                          )}
                       </table>
                    </div>
                 </div>
               )}
             </div>
          )}
          </div>
       </div>
    </div>
  );
}
