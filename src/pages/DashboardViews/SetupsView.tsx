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
  deleteSetup,
  setupTargets,
  saveSetupTarget,
  deleteSetupTarget,
  activeAccountId,
  formatDate
}: any) {
  const [viewMode, setViewMode] = useState<'home'|'create'|'edit'|'view'>('home');
  const [selectedSetupId, setSelectedSetupId] = useState<string | null>(null);

  // Target Form States
  const [targetDate, setTargetDate] = useState('');
  const [targetAsset, setTargetAsset] = useState('');
  const [targetTakes, setTargetTakes] = useState<number | ''>('');
  const [targetStops, setTargetStops] = useState<number | ''>('');
  const [targetPnl, setTargetPnl] = useState<number | ''>('');
  const [targetWinRate, setTargetWinRate] = useState<number | ''>('');
  
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

           const styleMap = [
             "p[style-name='Heading 1'] => h1:fresh",
             "p[style-name='Heading 2'] => h2:fresh",
             "p[style-name='Heading 3'] => h3:fresh",
             "p[style-name='Heading 4'] => h4:fresh",
             "p[style-name='Heading 5'] => h5:fresh",
             "p[style-name='Heading 6'] => h6:fresh",
             "p[style-name='Title'] => h1.doc-title:fresh",
             "p[style-name='Subtitle'] => p.doc-subtitle:fresh",
             "p[style-name='Quote'] => blockquote:fresh",
             "p[style-name='Intense Quote'] => blockquote.intense:fresh",
             "p[style-name='List Paragraph'] => p.list-para:fresh",
             "r[style-name='Strong'] => strong",
             "r[style-name='Emphasis'] => em",
             "table => table",
             "tr => tr",
             "td => td",
             "th => th",
           ];

           mammoth.convertToHtml({ arrayBuffer: bytes.buffer }, { styleMap })
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
    const validTrades = trades.filter((t:any) => t.date);
    const validTargets = (setupTargets||[]).filter((t:any) => t.date);
    const allDates = Array.from(new Set([
      ...validTrades.map((t:any) => t.date),
      ...validTargets.map((t:any) => t.date)
    ])).sort();

    const setupRealTotals: Record<string, number> = { 'Price Action': 0 };
    const setupTargetTotals: Record<string, number> = {};
    setups.forEach((s:any) => { 
       setupRealTotals[s.id] = 0; 
       setupTargetTotals[s.id] = 0;
    });

    const result = allDates.map((dateStr: any) => {
        const dayObj: any = { date: dateStr };
        const dayTrades = validTrades.filter((t:any) => t.date === dateStr);
        const dayTargets = validTargets.filter((t:any) => t.date === dateStr);
        
        dayTrades.forEach((tr:any) => {
            const sid = tr.setup_id && setups.some((s:any)=>s.id === tr.setup_id) ? tr.setup_id : 'Price Action';
            setupRealTotals[sid] = (setupRealTotals[sid] || 0) + (parseFloat(tr.pnl) || 0);
        });

        dayTargets.forEach((tg:any) => {
            const sid = tg.setup_id;
            if (sid) {
                setupTargetTotals[sid] = (setupTargetTotals[sid] || 0) + (parseFloat(tg.pnl) || 0);
            }
        });

        Object.keys(setupRealTotals).forEach(k => {
           const title = k === 'Price Action' ? 'Price Action' : setups.find((x:any)=>x.id === k)?.title || k;
           dayObj[`${title}_real`] = setupRealTotals[k];
        });

        Object.keys(setupTargetTotals).forEach(k => {
           const title = setups.find((x:any)=>x.id === k)?.title || k;
           dayObj[`${title}_target`] = setupTargetTotals[k];
        });

        return dayObj;
    });

    return result;
  }, [trades, setups, setupTargets]);

  const currentSetupTargets = useMemo(() => {
    if (viewMode !== 'view' || !selectedSetupId) return [];
    return (setupTargets||[]).filter((t:any) => t.setup_id === selectedSetupId);
  }, [setupTargets, viewMode, selectedSetupId]);

  const handleSubmitTarget = () => {
     if (!targetDate || !targetAsset) return;
     saveSetupTarget({
       id: crypto.randomUUID(),
       setup_id: selectedSetupId as string,
       account_id: activeAccountId,
       date: targetDate,
       asset_str: targetAsset,
       takes: Number(targetTakes) || 0,
       stops: Number(targetStops) || 0,
       pnl: Number(targetPnl) || 0,
       win_rate: Number(targetWinRate) || 0
     });
     setTargetDate('');
     setTargetAsset('');
     setTargetTakes('');
     setTargetStops('');
     setTargetPnl('');
     setTargetWinRate('');
  };

  const tableRows = useMemo(() => {
    const arr = [...currentSetupTargets].sort((a:any, b:any) => a.date.localeCompare(b.date));
    return arr.map(t => ({
      id: t.id,
      date: t.date,
      assetStr: t.asset_str,
      takes: t.takes,
      stops: t.stops,
      pnl: parseFloat(t.pnl) || 0,
      winRate: parseFloat(t.win_rate) || 0
    }));
  }, [currentSetupTargets]);

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
    <div className="p-6 rounded-2xl border flex flex-col shadow-sm min-h-[450px]" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
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
                   const bareName = name.replace('_real', '').replace('_target', '');
                   if (hiddenSetups.has(bareName)) return [];
                   return [`$${val.toFixed(2)}`, name.endsWith('_real') ? `${bareName} (Real)` : `${bareName} (Almejado)`];
               }}
             />
             {setupNames.filter(name => !hiddenSetups.has(name)).map((name, i) => {
               const color = lineColors[setupNames.indexOf(name) % lineColors.length];
               return (
                 <React.Fragment key={name}>
                   <Line 
                     type="monotone" 
                     dataKey={`${name}_real`} 
                     stroke={color} 
                     strokeWidth={name === 'Price Action' ? 1.5 : 2.5} 
                     dot={false}
                   />
                   {name !== 'Price Action' && (
                     <Line 
                       type="monotone" 
                       dataKey={`${name}_target`} 
                       stroke={color} 
                       strokeWidth={2} 
                       dot={false}
                       strokeDasharray="5 5"
                     />
                   )}
                 </React.Fragment>
               );
             })}
           </LineChart>
         </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-4 overflow-y-auto max-h-16 hide-scrollbar">
         {setupNames.map((name, i) => (
           <div key={name} className="flex items-center gap-1.5 shrink-0">
             <div className="w-3 h-1 rounded-full" style={{ backgroundColor: lineColors[i % lineColors.length] }} />
             <span className="text-[9px] uppercase font-bold tracking-wider opacity-60" style={{ color: theme.textoPrincipal }}>{name} (Real)</span>
           </div>
         ))}
         {setupNames.filter(n => n !== 'Price Action').map((name, i) => (
           <div key={`${name}-t`} className="flex items-center gap-1.5 shrink-0">
             <div className="w-3 h-1 rounded-full border-t border-dashed" style={{ borderColor: lineColors[i % lineColors.length] }} />
             <span className="text-[9px] uppercase font-bold tracking-wider opacity-60" style={{ color: theme.textoPrincipal }}>{name} (Almejado)</span>
           </div>
         ))}
      </div>
    </div>
  );

  return (
    <div className="flex w-full min-h-[calc(100vh-140px)] animate-tab-enter relative" style={{ background: theme.fundoGeral }}>
       {/* LEFT SIDEBAR (Infinite) */}
       <div className="w-16 md:w-64 self-stretch border-r shrink-0 hidden sm:flex flex-col pt-5 pb-0 px-2 md:px-4" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
          <button 
            onClick={() => handleSelect('create')}
            className="w-full flex items-center justify-center gap-2 py-3 md:px-4 mb-4 rounded-xl font-bold text-black transition-transform active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
            style={{ background: '#eab308' }}
          >
            <Plus size={18} />
            <span className="hidden md:block uppercase tracking-wider text-xs text-center">New Setup</span>
          </button>

          <div className="text-[11px] md:text-xs uppercase font-bold tracking-widest opacity-50 px-2 mt-4 mb-1 cursor-pointer hover:opacity-100 transition-opacity" style={{ color: theme.textoPrincipal }} onClick={() => handleSelect('home')}>
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
       <div className="flex-1 flex flex-col p-2 md:p-4 gap-2 max-w-full min-w-0 w-full mb-12">
          
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
              <div className="flex-1 flex flex-col min-h-0 h-full w-full max-w-7xl mx-auto">
                {renderGlobalChart()}
              </div>
            )}

          {(viewMode === 'create' || viewMode === 'edit') && !isExpandedDoc && (
             <div className="flex-1 max-w-4xl w-full mx-auto p-6 rounded-2xl border flex flex-col gap-3 shadow-sm" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
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
            <div className={`flex flex-col gap-3 w-full pb-10 ${isExpandedDoc ? 'h-full max-w-none' : 'max-w-7xl mx-auto'}`}>
               
               {/* 1. DOCUMENT VIEW CONTAINER */}
               <div className="rounded-3xl border shadow-sm relative overflow-hidden flex flex-col p-6 md:p-10" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
                  
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
                         <div className="bg-white shadow-2xl text-black max-w-none overflow-auto">
                           {isParsingDocx ? (
                              <div className="flex flex-col gap-4 py-10 items-center justify-center opacity-50">
                                 <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
                                 <span className="font-bold tracking-widest uppercase text-xs">Parsing DOCX...</span>
                              </div>
                           ) : docxHtml ? (
                              <>
                                 <style>{`
                                   .docx-reader { padding: 48px 64px; max-width: 860px; margin: 0 auto; line-height: 1.75; color: #1a1a1a; font-size: 15px; font-family: Georgia, 'Times New Roman', serif; }
                                   .docx-reader h1 { font-size: 2rem; font-weight: 900; margin: 1.6em 0 0.5em; color: #111; line-height: 1.2; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.3em; }
                                   .docx-reader h2 { font-size: 1.45rem; font-weight: 800; margin: 1.4em 0 0.4em; color: #222; border-bottom: 1px solid #f0f0f0; padding-bottom: 0.2em; }
                                   .docx-reader h3 { font-size: 1.18rem; font-weight: 700; margin: 1.2em 0 0.3em; color: #333; }
                                   .docx-reader h4, .docx-reader h5, .docx-reader h6 { font-size: 1rem; font-weight: 700; margin: 0.9em 0 0.2em; color: #444; }
                                   .docx-reader h1.doc-title { font-size: 2.5rem; text-align: center; border-bottom: none; margin-bottom: 0.2em; }
                                   .docx-reader p.doc-subtitle { text-align: center; color: #666; font-style: italic; margin-bottom: 2em; font-size: 1.1rem; }
                                   .docx-reader p { margin: 0.65em 0; }
                                   .docx-reader strong, .docx-reader b { font-weight: 800; color: #111; }
                                   .docx-reader em, .docx-reader i { font-style: italic; }
                                   .docx-reader u { text-decoration: underline; }
                                   .docx-reader blockquote { margin: 1.2em 0; padding: 0.8em 1.5em; border-left: 4px solid #d1d5db; background: #f9fafb; font-style: italic; color: #555; border-radius: 0 6px 6px 0; }
                                   .docx-reader blockquote.intense { border-left-color: #3b82f6; background: #eff6ff; color: #1e40af; }
                                   .docx-reader ul { list-style: disc; padding-left: 2em; margin: 0.6em 0; }
                                   .docx-reader ol { list-style: decimal; padding-left: 2em; margin: 0.6em 0; }
                                   .docx-reader li { margin: 0.3em 0; }
                                   .docx-reader p.list-para { padding-left: 1.5em; }
                                   .docx-reader table { width: 100%; border-collapse: collapse; margin: 1.2em 0; font-size: 0.9rem; font-family: Arial, sans-serif; }
                                   .docx-reader th { background: #f3f4f6; font-weight: 800; text-align: left; padding: 10px 14px; border: 1px solid #d1d5db; }
                                   .docx-reader td { padding: 8px 14px; border: 1px solid #e5e7eb; vertical-align: top; }
                                   .docx-reader tr:nth-child(even) td { background: #f9fafb; }
                                   .docx-reader a { color: #2563eb; text-decoration: underline; }
                                   .docx-reader hr { border: none; border-top: 2px solid #e5e7eb; margin: 2em 0; }
                                   .docx-reader img { max-width: 100%; height: auto; border-radius: 6px; margin: 0.5em 0; }
                                 `}</style>
                                 <div className="docx-reader" dangerouslySetInnerHTML={{ __html: docxHtml }} /></>
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

               {!isExpandedDoc && (
                 <div className="flex flex-col gap-2 w-full items-start">
                   {/* 2. EQUITY CURVE */}
                   <div className="w-full">
                     {renderGlobalChart()}
                   </div>
                   
                   {/* 3. PERFORMANCE DATA TABLE */}
                   <div className="w-full p-6 rounded-2xl border flex flex-col shadow-sm" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 flex items-center gap-2" style={{ color: theme.textoPrincipal }}>
                          <CalendarDays size={12} /> Performance Log
                        </h3>
                        <div className="flex bg-black/40 p-1 rounded-lg border flex-wrap" style={{ borderColor: theme.contornoGeral }}>
                          {['Daily', 'Weekly', 'Monthly'].map(p => (
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
                       {/* TARGET FORM */}
                       <div className="flex flex-wrap items-end gap-2 p-4 bg-black/10 border-b" style={{ borderColor: theme.contornoGeral }}>
                         <div className="flex flex-col gap-1 w-28">
                            <label className="text-[8px] uppercase font-bold tracking-widest opacity-50" style={{ color: theme.textoPrincipal }}>Date</label>
                            <input type="date" className="py-1 px-2 rounded-lg bg-white/5 border text-[9px] font-bold w-full outline-none focus:bg-white/10" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal, colorScheme: 'dark' }} value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                         </div>
                         <div className="flex flex-col gap-1 w-32">
                            <label className="text-[8px] uppercase font-bold tracking-widest opacity-50" style={{ color: theme.textoPrincipal }}>Asset</label>
                            <input type="text" placeholder="e.g. EURUSD" className="py-1 px-2 rounded-lg bg-white/5 border text-[9px] font-bold w-full outline-none focus:bg-white/10 uppercase" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} value={targetAsset} onChange={e => setTargetAsset(e.target.value.toUpperCase())} />
                         </div>
                         <div className="flex flex-col gap-1 w-20">
                            <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 text-green-500">Takes</label>
                            <input type="number" placeholder="0" className="py-1 px-2 rounded-lg bg-white/5 border border-green-500/20 text-[10px] font-bold w-full outline-none focus:bg-white/10" style={{ color: theme.textoPrincipal }} value={targetTakes} onChange={e => setTargetTakes(e.target.value ? Number(e.target.value) : '')} />
                         </div>
                         <div className="flex flex-col gap-1 w-20">
                            <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 text-red-500">Stops</label>
                            <input type="number" placeholder="0" className="py-1 px-2 rounded-lg bg-white/5 border border-red-500/20 text-[10px] font-bold w-full outline-none focus:bg-white/10" style={{ color: theme.textoPrincipal }} value={targetStops} onChange={e => setTargetStops(e.target.value ? Number(e.target.value) : '')} />
                         </div>
                         <div className="flex flex-col gap-1 w-28">
                            <label className="text-[8px] uppercase font-bold tracking-widest opacity-50" style={{ color: theme.textoPrincipal }}>Value ($)</label>
                            <input type="number" step="0.01" placeholder="e.g. 150.00" className="py-1 px-2 rounded-lg bg-white/5 border text-[9px] font-bold w-full outline-none focus:bg-white/10" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} value={targetPnl} onChange={e => setTargetPnl(e.target.value ? Number(e.target.value) : '')} />
                         </div>
                         <div className="flex flex-col gap-1 w-24">
                            <label className="text-[8px] uppercase font-bold tracking-widest opacity-50" style={{ color: theme.textoPrincipal }}>Win Rate (%)</label>
                            <input type="number" placeholder="e.g. 60" className="py-1 px-2 rounded-lg bg-white/5 border text-[9px] font-bold w-full outline-none focus:bg-white/10" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} value={targetWinRate} onChange={e => setTargetWinRate(e.target.value ? Number(e.target.value) : '')} />
                         </div>
                         <button 
                           onClick={handleSubmitTarget}
                           disabled={!targetDate || !targetAsset}
                           className="ml-auto px-4 py-1.5 h-[26px] rounded-md bg-[#00B0F0] text-white font-bold text-[10px] shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest flex items-center justify-center gap-1.5"
                         >
                           <Plus size={12} /> Inserir
                         </button>
                       </div>

                       <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                             <tr className="border-b text-[11px] md:text-xs uppercase font-bold tracking-widest opacity-50" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }}>
                                <th className="py-4 px-2 font-bold text-center">Date</th>
                                <th className="py-4 px-2 font-bold text-center max-w-[150px]">Asset</th>
                                <th className="py-4 px-2 font-bold text-center">TAKES</th>
                                <th className="py-4 px-2 font-bold text-center">STOPS</th>
                                <th className="py-4 px-2 font-bold text-center">Value (P&L)</th>
                                <th className="py-4 px-2 font-bold text-center">Win Rate</th>
                                <th className="py-4 px-2 font-bold text-center w-12">Action</th>
                             </tr>
                          </thead>
                          <tbody>
                             {tableRows.map((r, i) => (
                               <tr key={i} className="border-b transition-colors hover:bg-white/5" style={{ borderColor: theme.contornoGeral }}>
                                  <td className="py-2 px-2 text-xs font-bold text-center" style={{ color: theme.textoPrincipal }}>{formatDate ? formatDate(r.date) : r.date}</td>
                                  <td className="py-2 px-2 text-xs max-w-[150px] truncate text-center" style={{ color: theme.textoPrincipal }} title={r.assetStr}>{r.assetStr}</td>
                                  <td className="py-2 px-2 text-xs font-black text-green-500 text-center bg-green-500/5">{r.takes}</td>
                                  <td className="py-2 px-2 text-xs font-black text-red-500 text-center bg-red-500/5">{r.stops}</td>
                                  <td className={`py-2 px-2 text-xs md:text-sm font-black text-center ${r.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {r.pnl < 0 ? '-' : ''}${Math.abs(parseFloat(r.pnl)).toFixed(2)}
                                 </td>
                                  <td className="py-2 px-2 text-xs text-center font-bold" style={{ color: theme.textoPrincipal }}>
                                    {r.winRate.toFixed(1)}%
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                     <button 
                                       onClick={() => { if(window.confirm('Delete this target entry?')) deleteSetupTarget(r.id); }}
                                       className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors inline-flex"
                                     >
                                        <Trash2 size={13} />
                                     </button>
                                  </td>
                               </tr>
                             ))}
                             {tableRows.length === 0 && (
                               <tr><td colSpan={7} className="py-8 text-center text-xs opacity-50 italic" style={{ color: theme.textoPrincipal }}>No manual targets recorded for this setup yet.</td></tr>
                             )}
                          </tbody>
                          {tableRows.length > 0 && (
                             <tfoot>
                                <tr className="bg-black/20">
                                   <td className="py-2 px-2 text-xs font-black uppercase tracking-widest text-center" colSpan={2} style={{ color: theme.textoPrincipal }}>Grand Total</td>
                                   <td className="py-2 px-2 text-sm font-black text-green-500 text-center">{grandTotal.takes}</td>
                                   <td className="py-2 px-2 text-sm font-black text-red-500 text-center">{grandTotal.stops}</td>
                                   <td className={`py-2 px-2 text-md font-black font-display tracking-tight text-center ${grandTotal.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                     {grandTotal.pnl < 0 ? '-' : ''}${Math.abs(parseFloat(grandTotal.pnl)).toFixed(2)}
                                   </td>
                                   <td className="py-2 px-2 text-xs font-black text-center" colSpan={2} style={{ color: theme.textoPrincipal }}>
                                     {grandWinRate.toFixed(1)}% Avg
                                   </td>
                                </tr>
                             </tfoot>
                          )}
                       </table>
                    </div>
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



