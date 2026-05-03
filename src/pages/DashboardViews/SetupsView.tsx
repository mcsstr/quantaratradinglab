import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Target, Plus, Save, Trash2, CalendarDays, TrendingUp, Edit2, ChevronLeft, Upload, FileText, Download, Maximize2, Minimize2, Check, X, Settings, BookOpen, Search
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import * as mammoth from 'mammoth';

export default function SetupsView({
  theme,
  getGlassStyle,
  settings,
  accountSettings,
  t,
  lang,
  trades,
  setups,
  saveSetup,
  deleteSetup,
  setupTargets,
  saveSetupTarget,
  saveBatchSetupTargets,
  deleteSetupTarget,
  setupConfigLogs,
  addSetupConfigLog,
  updateSetupConfigLog,
  activeAccountId,
  formatDate
}: any) {
  const [viewMode, setViewMode] = useState<'home'|'create'|'edit'|'view'>('home');
  const [selectedSetupId, setSelectedSetupId] = useState<string | null>(null);

  // Table State
  const [selectedTargetIds, setSelectedTargetIds] = useState<Set<string>>(new Set());
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  
  // Setup Config Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configDate, setConfigDate] = useState('');
  const [configNotes, setConfigNotes] = useState('');

  // Target Form States
  const [targetDay, setTargetDay] = useState<number | ''>('');
  const [targetMonth, setTargetMonth] = useState<number | ''>('');
  const [targetYear, setTargetYear] = useState<number | ''>('');
  const [targetAsset, setTargetAsset] = useState('');
  const [targetTakes, setTargetTakes] = useState<number | ''>('');
  const [targetStops, setTargetStops] = useState<number | ''>('');
  const [targetPnl, setTargetPnl] = useState<number | ''>('');
  
  // Auto-Calc Referencial States
  const [targetStopPoints, setTargetStopPoints] = useState<number | ''>('');
  const [targetRiskReward, setTargetRiskReward] = useState<number | ''>('');
  const [targetPointValue, setTargetPointValue] = useState<number | ''>('');
  const [targetCommission, setTargetCommission] = useState<number | ''>('');
  
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState(''); // Stores Base64
  const [formFileName, setFormFileName] = useState('');
  
  const [filterPeriod, setFilterPeriod] = useState<string>('All Time');
  const [isExpandedDoc, setIsExpandedDoc] = useState(false);
  const [docxHtml, setDocxHtml] = useState('');
  const [isParsingDocx, setIsParsingDocx] = useState(false);
  const [hiddenSetups, setHiddenSetups] = useState<Set<string>>(new Set());

  // Groups and Staging State
  const [activeGroupName, setActiveGroupName] = useState<string>('');
  const [originalGroupName, setOriginalGroupName] = useState<string>('');
  const [stagingTargets, setStagingTargets] = useState<any[]>([]);

  const isAutoCalc = targetStopPoints !== '' || targetRiskReward !== '' || targetPointValue !== '';
  const [activeChartGroupNames, setActiveChartGroupNames] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('quantara_active_chart_groups') || '{}'); } catch { return {}; }
  });
  const [isEditingGroup, setIsEditingGroup] = useState<boolean>(true);

  // Persist activeChartGroupNames to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('quantara_active_chart_groups', JSON.stringify(activeChartGroupNames));
  }, [activeChartGroupNames]);

  // Open a read-only preview of a group's targets in a new tab
  const handleOpenPreview = useCallback((groupName: string, setupTitle: string) => {
    const myTargets = (setupTargets || []).filter(
      (t: any) => t.setup_id === selectedSetupId && t.group_name === groupName
    );
    if (myTargets.length === 0) return;

    // Convert targets to synthetic trades
    // qty = takes + stops (each is 1 trade), commission per trade = t.commission
    const syntheticTrades = myTargets.map((t: any) => ({
      id: `synth-${t.id}`,
      date: t.date,
      symbol: t.asset_str || 'SETUP',
      pnl: parseFloat(t.pnl) || 0,                // gross pnl
      qty: (t.takes || 0) + (t.stops || 0) || 1,  // total ops
      takes: t.takes || 0,
      stops: t.stops || 0,
      commission_per_trade: parseFloat(t.commission) || 0,
    }));

    // Filter real trades to only the active account and normalize fields
    const activeAccountTrades = (trades || [])
      .filter((t: any) => !activeAccountId || t.accountId === activeAccountId)
      .filter((t: any) => t.date && t.pnl != null)
      .map((t: any) => ({
        date: typeof t.date === 'string' ? t.date.slice(0, 10) : '',
        pnl: Number(t.pnl) || 0,
        commission: Number(t.commission) || 0,
        qty: Number(t.qty) || 1,
      }))
      .filter((t: any) => t.date);

    const previewKey = `preview_${crypto.randomUUID()}`;
    const payload = {
      syntheticTrades,
      accountHistory: activeAccountTrades,
      setupTitle,
      groupName,
      settings: { ...settings, ...accountSettings },
      theme,
    };
    
    const request = indexedDB.open('QuantaraPreviewDB', 1);
    request.onupgradeneeded = (e: any) => {
      e.target.result.createObjectStore('previews');
    };
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const tx = db.transaction('previews', 'readwrite');
      const store = tx.objectStore('previews');
      store.put(payload, previewKey);
      tx.oncomplete = () => {
        window.open(`/setup-preview?key=${previewKey}`, '_blank');
      };
      tx.onerror = () => {
        alert('Erro ao salvar dados de preview no IndexedDB.');
      };
    };
    request.onerror = () => {
      try {
        sessionStorage.setItem(previewKey, JSON.stringify(payload));
        window.open(`/setup-preview?key=${previewKey}`, '_blank');
      } catch {
        alert('Erro ao abrir preview: dados muito grandes para sessionStorage e falha no IndexedDB.');
      }
    };
  }, [setupTargets, selectedSetupId, settings, accountSettings, theme, trades, activeAccountId]);


  const handleSelect = (mode: 'home'|'create'|'edit'|'view', id: string | null = null) => {
    setViewMode(mode);
    setSelectedSetupId(id);
    setIsExpandedDoc(false);
    setActiveGroupName('');
    setStagingTargets([]);
    setIsEditingGroup(true);
    
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

  const setupToActiveGroup = useMemo(() => {
     const map: Record<string, string> = { ...activeChartGroupNames };
     setups.forEach((s:any) => {
       if (!map[s.id]) {
          const myT = (setupTargets||[]).find((t:any) => t.setup_id === s.id && t.group_name);
          if (myT) map[s.id] = myT.group_name;
       }
     });
     return map;
  }, [activeChartGroupNames, setups, setupTargets]);

  const chartData = useMemo(() => {
    const validTrades = trades.filter((t:any) => t.date);
    const validTargets = (setupTargets||[]).filter((t:any) => t.date);
    const validLogs = (setupConfigLogs||[]).filter((l:any) => l.date);

    const allDates = Array.from(new Set([
      ...validTrades.map((t:any) => t.date),
      ...validTargets.map((t:any) => t.date),
      ...validLogs.map((l:any) => l.date)
    ])).sort();

    const setupRealTotals: Record<string, number> = { 'Price Action': 0 };
    const setupTargetTotals: Record<string, number> = {};
    const setupTitleMap = new Map<string, string>();
    
    setups.forEach((s:any) => { 
       setupRealTotals[s.id] = 0; 
       setupTargetTotals[s.id] = 0;
       setupTitleMap.set(s.id, s.title);
    });

    const tradesByDate: Record<string, any[]> = {};
    validTrades.forEach((t:any) => {
       if (!tradesByDate[t.date]) tradesByDate[t.date] = [];
       tradesByDate[t.date].push(t);
    });

    const targetsByDate: Record<string, any[]> = {};
    validTargets.forEach((t:any) => {
       if (!targetsByDate[t.date]) targetsByDate[t.date] = [];
       targetsByDate[t.date].push(t);
    });

    const logsByDate: Record<string, any[]> = {};
    validLogs.forEach((l:any) => {
       if (!logsByDate[l.date]) logsByDate[l.date] = [];
       logsByDate[l.date].push(l);
    });

    const result = allDates.map((dateStr: any) => {
        const dayObj: any = { date: dateStr };
        const dayTrades = tradesByDate[dateStr] || [];
        const dayTargets = targetsByDate[dateStr] || [];
        const dayLogs = logsByDate[dateStr] || [];
        
        dayTrades.forEach((tr:any) => {
            const sid = tr.setup_id && setupTitleMap.has(tr.setup_id) ? tr.setup_id : 'Price Action';
            setupRealTotals[sid] = (setupRealTotals[sid] || 0) + (parseFloat(tr.pnl) || 0);
        });

        dayTargets.forEach((tg:any) => {
            const sid = tg.setup_id;
            if (sid) {
                const activeGroup = setupToActiveGroup[sid];
                if ((!tg.group_name && !activeGroup) || tg.group_name === activeGroup) {
                    setupTargetTotals[sid] = (setupTargetTotals[sid] || 0) + (parseFloat(tg.pnl) || 0);
                }
            }
        });

        Object.keys(setupRealTotals).forEach(k => {
           const title = k === 'Price Action' ? 'Price Action' : (setupTitleMap.get(k) || k);
           dayObj[`${title}_real`] = setupRealTotals[k];
        });

        Object.keys(setupTargetTotals).forEach(k => {
           const title = setupTitleMap.get(k) || k;
           dayObj[`${title}_target`] = setupTargetTotals[k];
        });

        dayLogs.forEach((l:any) => {
           const activeGroup = setupToActiveGroup[l.setup_id];
           if ((!l.group_name && !activeGroup) || l.group_name === activeGroup) {
               const title = setupTitleMap.get(l.setup_id) || l.setup_id;
               dayObj[`${title}_config`] = l;
           }
        });

        return dayObj;
    });

    return result;
  }, [trades, setups, setupTargets, setupConfigLogs, setupToActiveGroup]);

  // Groups derived for current selected setup
  const setupGroups = useMemo(() => {
    if (viewMode !== 'view' || !selectedSetupId) return [];
    const myTargets = (setupTargets||[]).filter((t:any) => t.setup_id === selectedSetupId);
    
    const groupsMap: Record<string, { takes: number, stops: number, pnl: number }> = {};
    
    const currentSetup = setups.find((s:any) => s.id === selectedSetupId);
    myTargets.forEach((t:any) => {
       const g = t.group_name || `Default - ${currentSetup?.title || 'Setup'}`;
       if (!groupsMap[g]) groupsMap[g] = { takes: 0, stops: 0, pnl: 0 };
       groupsMap[g].takes += t.takes || 0;
       groupsMap[g].stops += t.stops || 0;
       groupsMap[g].pnl += parseFloat(t.pnl) || 0;
    });

    return Object.keys(groupsMap).map(k => {
       const takesNum = groupsMap[k].takes;
       const stopsNum = groupsMap[k].stops;
       const winRateCalc = (takesNum + stopsNum) > 0 ? (takesNum / (takesNum + stopsNum)) * 100 : 0;
       return { name: k, pnl: groupsMap[k].pnl, winRate: winRateCalc };
    }).sort((a,b) => b.pnl - a.pnl);
  }, [setupTargets, viewMode, selectedSetupId, setups]);

  // Helper: get all DB targets for a specific named group
  // Handles null group_name for "Default" groups created before group_name was tracked
  const getTargetsForGroup = (groupName: string): any[] => {
    const isDefaultGroup = groupName.startsWith('Default');
    return (setupTargets||[]).filter((t:any) => {
      if (t.setup_id !== selectedSetupId) return false;
      if (isDefaultGroup && (!t.group_name || t.group_name === '')) return true;
      return t.group_name === groupName;
    });
  };

  // Table rows depend on stagingTargets now
  const tableRows = useMemo(() => {
    let arr = [...stagingTargets];
    if (filterPeriod !== 'All Time') {
       arr = arr.filter((t:any) => {
         if(!t.date) return false;
         try {
           const [y, m, d] = t.date.split('-');
           const dt = new Date(Number(y), Number(m)-1, Number(d));
           const month = dt.toLocaleString('en-US', { month: 'short' });
           const year = dt.getFullYear();
           return `${month} ${year}` === filterPeriod;
         } catch(e) { return false; }
       });
    }
    return arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [stagingTargets, filterPeriod]);

  const availablePeriods = useMemo(() => {
    if (viewMode !== 'view' || !selectedSetupId) return ['All Time'];
    const p = new Set<string>();
    p.add('All Time');
    const myTargets = (setupTargets||[]).filter((t:any) => t.setup_id === selectedSetupId);
    myTargets.forEach((t:any) => {
       if(t.date) {
         try {
           const [y, m, d] = t.date.split('-');
           const dt = new Date(Number(y), Number(m)-1, Number(d));
           const month = dt.toLocaleString('en-US', { month: 'short' });
           const year = dt.getFullYear();
           p.add(`${month} ${year}`);
         } catch(e){}
       }
    });
    return Array.from(p);
  }, [setupTargets, viewMode, selectedSetupId]);

  // Bulk Actions & Inline Edit Handlers for Staging
  const toggleRowSelect = (id: string) => {
    setSelectedTargetIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedTargetIds(new Set(stagingTargets.map(r => r.id)));
    else setSelectedTargetIds(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedTargetIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedTargetIds.size} target(s) from staging?`)) return;
    setStagingTargets(prev => prev.filter(t => !selectedTargetIds.has(t.id)));
    setSelectedTargetIds(new Set());
  };

  const startInlineEdit = (row: any) => {
    setEditingTargetId(row.id);
    setEditValues({
      date: row.date,
      assetStr: row.asset_str,
      takes: row.takes,
      stops: row.stops,
      pnl: row.pnl,
      commission: row.commission
    });
  };

  const saveInlineEdit = () => {
    if (!editingTargetId) return;
    const takesNum = Number(editValues.takes) || 0;
    const stopsNum = Number(editValues.stops) || 0;
    const winRateCalc = (takesNum + stopsNum) > 0 ? (takesNum / (takesNum + stopsNum)) * 100 : 0;
    
    setStagingTargets(prev => prev.map(t => {
       if (t.id === editingTargetId) {
          return {
            ...t,
            date: editValues.date,
            asset_str: editValues.assetStr,
            takes: takesNum,
            stops: stopsNum,
            pnl: Number(editValues.pnl) || 0,
            commission: Number(editValues.commission) || 0,
            win_rate: winRateCalc
          };
       }
       return t;
    }));
    
    setEditingTargetId(null);
    setEditValues({});
  };

  const cancelInlineEdit = () => {
    setEditingTargetId(null);
    setEditValues({});
  };

  const handleSubmitTarget = () => {
     const d = Number(targetDay);
     const m = Number(targetMonth);
     const y = Number(targetYear);
     const hasDate = d > 0 && m > 0 && y > 0;
     if (!hasDate || !targetAsset) return;

     const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

     const takesNum = Number(targetTakes) || 0;
     const stopsNum = Number(targetStops) || 0;
     const winRateCalc = (takesNum + stopsNum) > 0 ? (takesNum / (takesNum + stopsNum)) * 100 : 0;
     
     const isAutoCalc = targetStopPoints !== '' || targetRiskReward !== '' || targetPointValue !== '';
     let finalPnl = Number(targetPnl) || 0;

     if (isAutoCalc) {
        const sp = Number(targetStopPoints) || 0;
        const rr = Number(targetRiskReward) || 0;
        const pv = Number(targetPointValue) || 0;
        const takesValue = takesNum * (sp * rr * pv);
        const stopsValue = stopsNum * (sp * pv);
        finalPnl = takesValue - stopsValue;
     }

     const newTarget = {
       id: crypto.randomUUID(),
       setup_id: selectedSetupId as string,
       account_id: activeAccountId,
       group_name: activeGroupName || 'Default Group',
       date: dateStr,
       asset_str: targetAsset,
       takes: takesNum,
       stops: stopsNum,
       pnl: finalPnl,
       win_rate: winRateCalc,
       commission: Number(targetCommission) || 0
     };

     setStagingTargets(prev => [newTarget, ...prev]);
     
     // Clear only per-entry fields; day/month/year/asset/commission persist as reference
     setTargetTakes('');
     setTargetStops('');
     setTargetPnl('');
     // targetDay, targetMonth, targetYear, targetAsset, targetStopPoints,
     // targetRiskReward, targetPointValue, targetCommission intentionally kept
  };

  const handleSaveStagingTable = async () => {
    if (!activeGroupName) return;
    const groupName = activeGroupName;
    
    // Assign proper group_name to all staging targets
    const updatedStaging = stagingTargets.map(t => ({ ...t, group_name: groupName }));
    
    await saveBatchSetupTargets(updatedStaging, selectedSetupId as string, groupName, originalGroupName);
    
    // Update originalGroupName after save
    setOriginalGroupName(groupName);
    
    // Activate chart for this group initially
    if (!activeChartGroupNames[selectedSetupId as string]) {
       setActiveChartGroupNames(prev => ({ ...prev, [selectedSetupId as string]: groupName }));
    }
    
    setIsEditingGroup(false);
  };

  const grandTotal = useMemo(() => {
    return tableRows.reduce((acc, row) => ({
      takes: acc.takes + (row.takes || 0),
      stops: acc.stops + (row.stops || 0),
      pnl: acc.pnl + (parseFloat(row.pnl) || 0),
      commission: acc.commission + ((parseFloat(row.commission) || 0) * ((row.takes || 0) + (row.stops || 0)))
    }), { takes: 0, stops: 0, pnl: 0, commission: 0 });
  }, [tableRows]);

  const grandNetPnl = grandTotal.pnl - grandTotal.commission;

  const grandWinRate = (grandTotal.takes + grandTotal.stops) > 0 
    ? (grandTotal.takes / (grandTotal.takes + grandTotal.stops)) * 100 
    : 0;

  const setupNames = useMemo(() => ['Price Action', ...setups.map((s:any) => s.title)], [setups]);
  const lineColors = useMemo(() => ['#94a3b8', '#eab308', '#3b82f6', '#ef4444', '#10b981', '#a855f7', '#ec4899', '#f97316'], []);

  const toggleSetupVisible = useCallback((name: string) => {
    setHiddenSetups(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const globalChartNode = useMemo(() => (
    <div className="p-2 md:p-6 rounded-2xl border flex flex-col shadow-sm min-h-[450px]" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
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
                   {name === 'Price Action' ? (
                     <Line 
                       type="monotone" 
                       dataKey={`${name}_real`} 
                       stroke={color} 
                       strokeWidth={1.5} 
                       dot={false}
                     />
                   ) : (
                     <Line 
                       type="monotone" 
                       dataKey={`${name}_target`} 
                       stroke={color} 
                       strokeWidth={2} 
                       strokeDasharray="5 5"
                       activeDot={{ r: 6, fill: color }}
                       dot={(props: any) => {
                         const { cx, cy, payload } = props;
                         const configLog = payload[`${name}_config`];
                         if (configLog) {
                           return (
                             <circle 
                               cx={cx} cy={cy} r={5} 
                               fill="#eab308" stroke={theme.fundoGeral} strokeWidth={2} 
                               style={{ cursor: 'pointer' }}
                               onClick={() => {
                                 setConfigDate(configLog.date);
                                 setConfigNotes(configLog.notes);
                                 setShowConfigModal(true);
                               }}
                             />
                           );
                         }
                         return <rect display="none" />;
                       }}
                     />
                   )}
                 </React.Fragment>
               );
             })}
           </LineChart>
         </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-4 overflow-y-auto max-h-16 hide-scrollbar justify-center">
         <div className="flex items-center gap-1.5 shrink-0 mr-4">
           <div className="w-3 h-1 rounded-full" style={{ backgroundColor: lineColors[0] }} />
           <span className="text-[9px] uppercase font-bold tracking-wider opacity-60" style={{ color: theme.textoPrincipal }}>Price Action (Real)</span>
         </div>
         {setupNames.filter(n => n !== 'Price Action').map((name, i) => (
           <div key={`${name}-t`} className="flex items-center gap-1.5 shrink-0">
             <div className="w-3 h-1 rounded-full border-t border-dashed" style={{ borderColor: lineColors[(setupNames.indexOf(name)) % lineColors.length] }} />
             <span className="text-[9px] uppercase font-bold tracking-wider opacity-60" style={{ color: theme.textoPrincipal }}>{name} (Almejado)</span>
           </div>
         ))}
      </div>
    </div>
  ), [chartData, hiddenSetups, theme, getGlassStyle, lineColors, setupNames, toggleSetupVisible]);

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
             <div className="hidden md:flex justify-between items-center z-10 py-2" style={{ background: 'transparent' }}>
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
                {globalChartNode}
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
                     {globalChartNode}
                   </div>
                   
                   {/* 3. PERFORMANCE DATA TABLE (Grid Layout for Versions) */}
                   <div className="w-full flex flex-col md:flex-row gap-4 mt-4">
                     
                     {/* COLUMN 1: Performance Versions Card */}
                     <div className="w-full md:w-1/3 p-5 rounded-2xl border flex flex-col shadow-sm max-h-[700px] overflow-hidden" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
                       <div className="flex justify-between items-center mb-4">
                         <h3 className="text-xs font-black tracking-widest uppercase flex items-center gap-2" style={{ color: theme.textoPrincipal }}>
                           <CalendarDays size={14} className="text-yellow-500" /> Performance Versions
                         </h3>
                       </div>

                       <button 
                         onClick={() => {
                           // Reset staging table and local states
                           setActiveGroupName('');
                           setOriginalGroupName('');
                           setStagingTargets([]);
                           setTargetDay('');
                           setTargetMonth('');
                           setTargetYear('');
                           setTargetAsset('');
                           setTargetTakes('');
                           setTargetStops('');
                           setTargetPnl('');
                         }}
                         className="w-full py-3 mb-4 rounded-xl font-bold text-black transition-all hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.2)] flex justify-center items-center gap-2 text-xs uppercase tracking-widest"
                         style={{ background: '#eab308' }}
                       >
                         <Plus size={16} /> New Performance
                       </button>

                        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-3 pb-2 pr-1">
                          {setupGroups.map((g) => {
                            const isActiveChart = activeChartGroupNames[selectedSetupId as string] === g.name;
                            const isSelected = activeGroupName === g.name;
                            
                            return (
                              <div 
                                key={g.name} 
                                className={`w-full p-4 rounded-xl border flex flex-col gap-2 transition-all cursor-pointer ${
                                  isSelected && isEditingGroup ? 'bg-yellow-500/10 border-yellow-500/60'
                                  : isSelected ? 'bg-white/10 border-white/20'
                                  : 'bg-black/20 hover:bg-white/5 border-transparent'
                                }`}
                                style={{ borderColor: isSelected && isEditingGroup ? undefined : isSelected ? theme.contornoGeral : 'transparent', border: isSelected && isEditingGroup ? '1px solid rgba(234,179,8,0.5)' : undefined }}
                                onClick={() => {
                                  // Click on card = read-only view
                                  setActiveGroupName(g.name);
                                  setIsEditingGroup(false);
                                  const myT = getTargetsForGroup(g.name);
                                  setStagingTargets(myT.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                                  // Also set as active chart group
                                  setActiveChartGroupNames(prev => ({...prev, [selectedSetupId as string]: g.name}));
                                }}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex flex-col gap-0.5">
                                    <h4 className="text-xs font-black font-display uppercase truncate" style={{ color: theme.textoPrincipal }} title={g.name}>{g.name}</h4>
                                    {isActiveChart && <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest">◉ Active Chart</span>}
                                  </div>
                                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                     {/* Preview button */}
                                     <button
                                       onClick={() => handleOpenPreview(g.name, formTitle)}
                                       className="p-1.5 rounded-lg transition-colors hover:bg-purple-500/20 opacity-60 hover:opacity-100"
                                       style={{ color: '#a855f7' }}
                                       title="Abrir preview do dashboard nesta versão"
                                     >
                                       <Search size={12} />
                                     </button>
                                    {/* Chart toggle icon */}
                                    <button
                                      onClick={() => {
                                        setActiveChartGroupNames(prev => ({
                                          ...prev,
                                          [selectedSetupId as string]: isActiveChart ? '' : g.name
                                        }));
                                      }}
                                      className={`p-1.5 rounded-lg transition-colors ${isActiveChart ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-white/10 opacity-40 hover:opacity-100'}`}
                                      style={{ color: isActiveChart ? undefined : theme.textoPrincipal }}
                                      title={isActiveChart ? 'Desativar do gráfico' : 'Mostrar no gráfico'}
                                    >
                                      <TrendingUp size={12} />
                                    </button>
                                    <button 
                                      onClick={() => {
                                         setActiveGroupName(g.name);
                                         setOriginalGroupName(g.name);
                                         setIsEditingGroup(true);
                                         const myT = getTargetsForGroup(g.name);
                                         setStagingTargets(myT.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                                      }}
                                      className={`p-1.5 rounded-lg transition-colors ${ isSelected && isEditingGroup ? 'bg-yellow-500 text-black' : 'hover:bg-white/10'}`} 
                                      style={{ color: isSelected && isEditingGroup ? '#000' : theme.textoPrincipal }} 
                                      title="Edit Version"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button 
                                      onClick={async () => {
                                        if(window.confirm(`Deletar a versão de performance "${g.name}" e todos seus dados?`)) {
                                           const myT = (setupTargets||[]).filter((t:any) => t.setup_id === selectedSetupId && t.group_name === g.name);
                                           if (myT.length > 0) {
                                              await deleteSetupTarget(myT.map((x:any)=>x.id));
                                           }
                                           if (activeGroupName === g.name) {
                                              setActiveGroupName('');
                                              setStagingTargets([]);
                                              setIsEditingGroup(true);
                                           }
                                           if (activeChartGroupNames[selectedSetupId as string] === g.name) {
                                              const rest = setupGroups.find(x => x.name !== g.name);
                                              setActiveChartGroupNames(prev => ({...prev, [selectedSetupId as string]: rest ? rest.name : ''}));
                                           }
                                        }
                                      }}
                                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                                      title="Deletar Versão"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-xs font-black">
                                  <span className={g.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>{g.pnl < 0 ? '-' : ''}${Math.abs(g.pnl).toFixed(2)}</span>
                                  <span className={g.winRate >= 50 ? 'text-[#00B0F0]' : 'text-orange-400'}>{g.winRate.toFixed(1)}% WR</span>
                                </div>
                              </div>
                            );
                          })}
                          {setupGroups.length === 0 && (
                            <div className="p-4 text-center opacity-40 text-xs font-bold uppercase tracking-widest mt-10" style={{ color: theme.textoPrincipal }}>
                              Nenhuma versão salva ainda.
                            </div>
                          )}
                        </div>
                     </div>

                     {/* COLUMNS 2 & 3: Performance Staging Data */}
                     <div className="w-full md:w-2/3 p-5 rounded-2xl border flex flex-col shadow-sm max-h-[700px]" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3 w-1/2">
                          <input
                            type="text"
                            value={activeGroupName}
                            onChange={(e) => setActiveGroupName(e.target.value)}
                            placeholder="Nome da versão (ex: V1, RR 1:2)"
                            readOnly={!isEditingGroup}
                            className={`w-full bg-black/20 border p-2 rounded-xl text-sm font-bold font-display outline-none transition-colors placeholder:text-gray-500 ${
                              isEditingGroup ? 'focus:border-yellow-500 cursor-text' : 'opacity-70 cursor-default'
                            }`}
                            style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }}
                          />
                          </div>
                                                <div className="flex items-center gap-2">
                              <div className="flex bg-black/40 rounded-lg border" style={{ borderColor: theme.contornoGeral }}>
                                <select 
                                   value={filterPeriod} 
                                   onChange={(e) => setFilterPeriod(e.target.value)}
                                   className="bg-transparent text-[9px] font-bold uppercase tracking-wider outline-none px-2 py-1.5"
                                   style={{ color: theme.textoPrincipal }}
                                >
                                   {availablePeriods.map(p => <option key={p} value={p} className="bg-gray-900 normal-case">{p}</option>)}
                                </select>
                              </div>
                              {isEditingGroup ? (
                                 <>
                                   <button
                                      onClick={() => {
                                         setIsEditingGroup(false);
                                         const myT = getTargetsForGroup(activeGroupName);
                                         setStagingTargets(myT.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                                      }}
                                      className="h-8 w-8 flex items-center justify-center rounded-lg font-bold bg-white/5 hover:bg-red-500/20 text-red-500 border-none transition-all shrink-0"
                                      title="Cancelar Edições"
                                   >
                                      <X size={14} />
                                   </button>
                                   <button
                                     onClick={handleSaveStagingTable}
                                     disabled={!activeGroupName || stagingTargets.length === 0}
                                     className="h-8 px-4 rounded-lg font-bold text-black border-none text-[10px] uppercase tracking-widest bg-yellow-500 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
                                   >
                                      <Check size={13} /> Save
                                   </button>
                                 </>
                              ) : (
                                   <button
                                     onClick={() => setIsEditingGroup(true)}
                                     disabled={!activeGroupName}
                                     className="h-8 px-4 rounded-lg font-bold text-black border-none text-[10px] uppercase tracking-widest bg-yellow-500 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                                   >
                                      <Edit2 size={13} /> Edit
                                   </button>
                              )}
                              <button
                                 onClick={() => {
                                    setConfigDate(new Date().toISOString().split('T')[0]);
                                    setConfigNotes('');
                                    setShowConfigModal(true);
                                 }} 
                                 className="h-8 px-4 rounded-lg font-bold text-white border-none text-[10px] uppercase tracking-widest bg-blue-500 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
                              >
                                 <Settings size={13} /> Params
                              </button>
                           </div>
                        </div>

                         <div className="w-full overflow-x-auto hide-scrollbar flex flex-col h-full">
                         {/* TARGET FORM — only visible in edit mode */}
                         {isEditingGroup && (
                         <div className="flex flex-col gap-3 p-3 bg-black/20 border-b shrink-0" style={{ borderColor: theme.contornoGeral }}>
                             {/* ROW 1: Reference fields (persistent) — Dia, Mês, Ano + Stop Pts, R/R, Val/Pt, Ativo */}
                             <div className="flex flex-wrap items-end gap-2">
                                <div className="flex flex-col gap-1 w-[52px]">
                                   <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 text-yellow-500" style={{ color: theme.textoPrincipal }}>Dia</label>
                                   <input
                                     type="number" min={1} max={31} placeholder="DD"
                                     className="h-8 px-1 rounded-lg bg-black/40 border outline-none focus:border-yellow-500 w-full text-[9px] font-mono font-bold text-center"
                                     style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }}
                                     value={targetDay}
                                     onChange={e => {
                                       const v = e.target.value ? Number(e.target.value) : '';
                                       if (v === '' || (Number(v) >= 1 && Number(v) <= 31)) setTargetDay(v);
                                     }}
                                   />
                                </div>
                                <div className="flex flex-col gap-1 w-[52px]">
                                   <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 text-yellow-500" style={{ color: theme.textoPrincipal }}>Mês</label>
                                   <input
                                     type="number" min={1} max={12} placeholder="MM"
                                     className="h-8 px-1 rounded-lg bg-black/40 border outline-none focus:border-yellow-500 w-full text-[9px] font-mono font-bold text-center"
                                     style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }}
                                     value={targetMonth}
                                     onChange={e => {
                                       const v = e.target.value ? Number(e.target.value) : '';
                                       if (v === '' || (Number(v) >= 1 && Number(v) <= 12)) setTargetMonth(v);
                                     }}
                                   />
                                </div>
                                <div className="flex flex-col gap-1 w-[68px]">
                                   <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 text-yellow-500" style={{ color: theme.textoPrincipal }}>Ano</label>
                                   <input
                                     type="number" min={2000} max={2099} placeholder="AAAA"
                                     className="h-8 px-1 rounded-lg bg-black/40 border outline-none focus:border-yellow-500 w-full text-[9px] font-mono font-bold text-center"
                                     style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }}
                                     value={targetYear}
                                     onChange={e => setTargetYear(e.target.value ? Number(e.target.value) : '')}
                                   />
                                </div>
                                <div className="w-px h-8 bg-white/10 self-end" />
                                <div className="flex flex-col gap-1 w-[110px]">
                                   <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 text-yellow-500" style={{ color: theme.textoPrincipal }}>Pts de Stop</label>
                                   <input type="number" placeholder="Ex: 100" className="h-8 px-2 rounded-lg bg-black/40 border outline-none focus:border-yellow-500 w-full text-[9px] font-mono font-bold" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} value={targetStopPoints} onChange={e => setTargetStopPoints(e.target.value ? Number(e.target.value) : '')} />
                                </div>
                                <div className="flex flex-col gap-1 w-[72px]">
                                   <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 text-yellow-500" style={{ color: theme.textoPrincipal }}>R/R</label>
                                   <input type="number" step="0.1" placeholder="Ex: 2" className="h-8 px-2 rounded-lg bg-black/40 border outline-none focus:border-yellow-500 w-full text-[9px] font-mono font-bold" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} value={targetRiskReward} onChange={e => setTargetRiskReward(e.target.value ? Number(e.target.value) : '')} />
                                </div>
                                <div className="flex flex-col gap-1 w-[80px]">
                                   <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 text-yellow-500" style={{ color: theme.textoPrincipal }}>Val/Pt $</label>
                                   <input type="number" step="0.01" placeholder="0.20" className="h-8 px-2 rounded-lg bg-black/40 border outline-none focus:border-yellow-500 w-full text-[9px] font-mono font-bold" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} value={targetPointValue} onChange={e => setTargetPointValue(e.target.value ? Number(e.target.value) : '')} />
                                </div>
                                <div className="flex flex-col gap-1 w-[80px]">
                                   <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 text-yellow-500" style={{ color: theme.textoPrincipal }}>Comissão</label>
                                   <input type="number" step="0.01" placeholder="Ex: 1.50" className="h-8 px-2 rounded-lg bg-black/40 border outline-none focus:border-yellow-500 w-full text-[9px] font-mono font-bold" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} value={targetCommission} onChange={e => setTargetCommission(e.target.value ? Number(e.target.value) : '')} />
                                </div>
                                <div className="flex flex-col gap-1 w-[120px]">
                                   <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 text-yellow-500" style={{ color: theme.textoPrincipal }}>Ativo</label>
                                   <input type="text" placeholder="Ex: EURUSD" className="h-8 px-2 rounded-lg bg-black/40 border outline-none focus:border-yellow-500 w-full text-[9px] font-mono font-bold uppercase" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} value={targetAsset} onChange={e => setTargetAsset(e.target.value.toUpperCase())} />
                                </div>
                                <div className="flex flex-col gap-1 ml-auto text-[8px] opacity-30 italic max-w-[140px] text-right pb-1" style={{ color: theme.textoPrincipal }}>
                                   Referência — persiste entre entradas
                                </div>
                             </div>

                             <div className="w-full h-px bg-white/5 my-0.5" style={{ background: theme.contornoGeral }}></div>

                             {/* ROW 2: Per-entry fields (cleared after each Add) */}
                             <div className="flex flex-wrap items-end gap-2">
                                <div className="flex flex-col gap-1 w-[64px]">
                                   <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 text-green-500">Takes</label>
                                   <input type="number" placeholder="0" className="h-8 px-2 rounded-lg bg-white/5 border border-green-500/20 text-[9px] font-mono font-bold w-full outline-none focus:bg-white/10 text-center" style={{ color: theme.textoPrincipal }} value={targetTakes} onChange={e => setTargetTakes(e.target.value ? Number(e.target.value) : '')} />
                                </div>
                                <div className="flex flex-col gap-1 w-[64px]">
                                   <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 text-red-500">Stops</label>
                                   <input type="number" placeholder="0" className="h-8 px-2 rounded-lg bg-white/5 border border-red-500/20 text-[9px] font-mono font-bold w-full outline-none focus:bg-white/10 text-center" style={{ color: theme.textoPrincipal }} value={targetStops} onChange={e => setTargetStops(e.target.value ? Number(e.target.value) : '')} />
                                </div>
                                <div className="flex flex-col gap-1 w-[84px]">
                                   <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 flex items-center justify-between" style={{ color: theme.textoPrincipal }}>
                                     Val $ {isAutoCalc && <span className="text-yellow-500 text-[6px] ml-1">(Auto)</span>}
                                   </label>
                                   <input 
                                     type={isAutoCalc ? "text" : "number"} 
                                     step="0.01" 
                                     placeholder={isAutoCalc ? "—" : "0.00"} 
                                     className={`h-8 px-2 rounded-lg bg-white/5 border text-[9px] font-mono font-bold w-full outline-none focus:bg-white/10 ${isAutoCalc ? 'opacity-30 cursor-not-allowed' : ''}`} 
                                     style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} 
                                     value={isAutoCalc ? '' : targetPnl} 
                                     onChange={e => setTargetPnl(e.target.value ? Number(e.target.value) : '')} 
                                     disabled={isAutoCalc}
                                   />
                                </div>
                                <div className="flex flex-col gap-1 w-[64px]">
                                   <label className="text-[8px] uppercase font-bold tracking-widest opacity-50 text-[#00B0F0] truncate" title="Win Rate">W.Rate</label>
                                   <div className="h-8 px-2 rounded-lg bg-black/20 border text-[9px] font-mono font-bold w-full flex items-center justify-center" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }}>
                                      {targetTakes !== '' && targetStops !== '' && (Number(targetTakes)+Number(targetStops)) > 0 ? ((Number(targetTakes)/(Number(targetTakes)+Number(targetStops)))*100).toFixed(0) + '%' : '—'}
                                   </div>
                                </div>
                                <button 
                                  onClick={handleSubmitTarget}
                                  disabled={!(Number(targetDay) > 0 && Number(targetMonth) > 0 && Number(targetYear) > 0) || !targetAsset}
                                  className="h-8 px-5 flex-1 sm:flex-none rounded-lg bg-[#00B0F0] text-white font-bold text-[10px] shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest flex items-center justify-center gap-1.5 shrink-0 mt-auto ml-auto"
                                >
                                  <Plus size={12} /> Add
                                </button>
                             </div>
                         </div>
                         )}

                        {/* BULK ACTIONS OR SELECT ALL BAR */}
                        {(tableRows.length > 0 || selectedTargetIds.size > 0) && isEditingGroup && (
                          <div className="flex items-center justify-between p-2 mt-2 bg-black/5 rounded-t-lg border-b border-white/5 shrink-0">
                             <div className="flex items-center gap-2 px-2">
                                <input 
                                  type="checkbox" 
                                  className="cursor-pointer rounded bg-black/40 border-gray-600 focus:ring-yellow-500 text-yellow-500" 
                                  onChange={handleSelectAll} 
                                  checked={tableRows.length > 0 && selectedTargetIds.size === tableRows.length} 
                                />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: theme.textoPrincipal }}>Select All</span>
                             </div>
                             {selectedTargetIds.size > 0 && (
                                <button 
                                  onClick={handleBulkDelete}
                                  className="px-3 py-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 text-[9px] uppercase font-bold tracking-widest rounded transition-colors flex items-center gap-1.5"
                                >
                                  <Trash2 size={12} /> Delete Selected ({selectedTargetIds.size})
                                </button>
                             )}
                          </div>
                        )}

                        <div className="w-full overflow-y-auto hide-scrollbar flex-1">
                           <table className="w-full text-left border-collapse min-w-[600px]">
                              <thead className="sticky top-0 z-10" style={{ backgroundColor: theme.fundoCards || '#0a0a0a' }}>
                                 <tr className="border-b text-[10px] uppercase font-bold tracking-widest opacity-80" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }}>
                                   {isEditingGroup && <th className="py-3 px-3 w-8"></th>}
                                   <th className="py-3 px-2 font-bold text-center">Date</th>
                                   <th className="py-3 px-2 font-bold text-center">Asset</th>
                                   <th className="py-3 px-2 font-bold text-center">TAKES</th>
                                   <th className="py-3 px-2 font-bold text-center">STOPS</th>
                                   <th className="py-3 px-2 font-bold text-center">Gross P&L</th>
                                   <th className="py-3 px-2 font-bold text-center text-orange-400">Comissão</th>
                                   <th className="py-3 px-2 font-bold text-center">Net P&L</th>
                                   <th className="py-3 px-2 font-bold text-center">Win Rate</th>
                                   <th className="py-3 px-2 font-bold text-center w-16">Action</th>
                                </tr>
                             </thead>
                             <tbody>
                                {tableRows.map((r, i) => {
                                  const isSelected = selectedTargetIds.has(r.id);
                                  const isEditing = editingTargetId === r.id;
                                  return (
                                    <tr key={r.id} className={`border-b transition-colors ${isSelected ? 'bg-yellow-500/10' : 'hover:bg-white/5'}`} style={{ borderColor: theme.contornoGeral }}>
                                       {isEditingGroup && (
                                       <td className="py-1 px-3 text-center">
                                          <input 
                                            type="checkbox" 
                                            className="cursor-pointer rounded bg-black/40 border-gray-600 focus:ring-yellow-500 text-yellow-500"
                                            checked={isSelected}
                                            onChange={() => toggleRowSelect(r.id)}
                                          />
                                       </td>
                                       )}
                                       
                                       {isEditing ? (
                                         <>
                                           <td className="py-1 px-1">
                                              <input type="date" className="w-full bg-black/30 border border-yellow-500/30 text-[10px] p-1.5 rounded outline-none" style={{ color: theme.textoPrincipal, colorScheme: "dark" }} value={editValues.date || ''} onChange={e => setEditValues({...editValues, date: e.target.value})} />
                                           </td>
                                           <td className="py-1 px-1">
                                              <input type="text" className="w-full bg-black/30 border border-yellow-500/30 text-[10px] p-1.5 rounded outline-none uppercase" style={{ color: theme.textoPrincipal }} value={editValues.assetStr || ''} onChange={e => setEditValues({...editValues, assetStr: e.target.value.toUpperCase()})} />
                                           </td>
                                           <td className="py-1 px-1">
                                              <input type="number" className="w-full bg-black/30 border border-green-500/30 text-[10px] p-1.5 rounded outline-none text-center" style={{ color: theme.textoPrincipal }} value={editValues.takes !== undefined ? editValues.takes : ''} onChange={e => setEditValues({...editValues, takes: e.target.value ? Number(e.target.value) : ''})} />
                                           </td>
                                           <td className="py-1 px-1">
                                              <input type="number" className="w-full bg-black/30 border border-red-500/30 text-[10px] p-1.5 rounded outline-none text-center" style={{ color: theme.textoPrincipal }} value={editValues.stops !== undefined ? editValues.stops : ''} onChange={e => setEditValues({...editValues, stops: e.target.value ? Number(e.target.value) : ''})} />
                                           </td>
                                           <td className="py-1 px-1">
                                              <input type="number" step="0.01" className="w-full bg-black/30 border border-yellow-500/30 text-[10px] p-1.5 rounded outline-none text-center" style={{ color: theme.textoPrincipal }} value={editValues.pnl !== undefined ? editValues.pnl : ''} onChange={e => setEditValues({...editValues, pnl: e.target.value ? Number(e.target.value) : ''})} />
                                           </td>
                                           <td className="py-1 px-1">
                                              <input type="number" step="0.01" className="w-full bg-black/30 border border-orange-500/30 text-[10px] p-1.5 rounded outline-none text-center" style={{ color: theme.textoPrincipal }} value={editValues.commission !== undefined ? editValues.commission : ''} onChange={e => setEditValues({...editValues, commission: e.target.value ? Number(e.target.value) : ''})} />
                                           </td>
                                           <td className="py-1 px-1 text-xs text-center font-bold opacity-50" style={{ color: theme.textoPrincipal }}>
                                             Auto
                                           </td>
                                           <td className="py-1 px-1 text-xs text-center font-bold opacity-50" style={{ color: theme.textoPrincipal }}>
                                             Auto
                                           </td>
                                           <td className="py-1 px-1 text-center">
                                              <div className="flex items-center justify-center gap-1.5">
                                                 <button onClick={saveInlineEdit} className="p-1 rounded bg-green-500/20 text-green-500 hover:bg-green-500/40 transition-colors" title="Save"><Check size={14}/></button>
                                                 <button onClick={cancelInlineEdit} className="p-1 rounded bg-red-500/20 text-red-500 hover:bg-red-500/40 transition-colors" title="Cancel"><X size={14}/></button>
                                              </div>
                                           </td>
                                         </>
                                       ) : (
                                         <>
                                           <td className="py-2.5 px-2 text-[10px] font-bold text-center" style={{ color: theme.textoPrincipal }}>{formatDate ? formatDate(r.date) : r.date}</td>
                                           <td className="py-2.5 px-2 text-[10px] max-w-[120px] truncate text-center uppercase" style={{ color: theme.textoPrincipal }} title={r.asset_str}>{r.asset_str}</td>
                                           <td className="py-2.5 px-2 text-[10px] font-black text-green-500 text-center">{r.takes}</td>
                                           <td className="py-2.5 px-2 text-[10px] font-black text-red-500 text-center">{r.stops}</td>
                                           <td className={`py-2.5 px-2 text-[10px] font-black text-center ${parseFloat(r.pnl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                             {parseFloat(r.pnl) < 0 ? '-' : ''}${Math.abs(parseFloat(r.pnl)).toFixed(2)}
                                           </td>
                                           <td className="py-2.5 px-2 text-[10px] font-bold text-center text-orange-400">
                                             {(parseFloat(r.commission) || 0) > 0 ? `-$${((parseFloat(r.commission) || 0) * ((r.takes || 0) + (r.stops || 0))).toFixed(2)}` : '—'}
                                           </td>
                                           <td className={`py-2.5 px-2 text-[10px] font-black text-center ${(parseFloat(r.pnl) - (parseFloat(r.commission)||0)*((r.takes||0)+(r.stops||0))) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                             {(() => { const net = parseFloat(r.pnl) - (parseFloat(r.commission)||0)*((r.takes||0)+(r.stops||0)); return `${net < 0 ? '-' : ''}$${Math.abs(net).toFixed(2)}`; })()}
                                           </td>
                                           <td className={`py-2.5 px-2 text-[10px] text-center font-black ${parseFloat(r.win_rate) >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                                             {parseFloat(r.win_rate).toFixed(1)}%
                                           </td>
                                           <td className="py-2.5 px-2 text-center">
                                               {isEditingGroup ? (
                                               <div className="flex items-center justify-center gap-1">
                                                  <button onClick={() => startInlineEdit(r)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white inline-flex" title="Editar">
                                                     <Edit2 size={13} />
                                                  </button>
                                                  <button 
                                                    onClick={() => { if(window.confirm('Remover este registro do staging?')) { setStagingTargets(prev => prev.filter(t => t.id !== r.id)); } }}
                                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors inline-flex"
                                                    title="Remover"
                                                  >
                                                     <Trash2 size={13} />
                                                  </button>
                                               </div>
                                               ) : (
                                               <span className="text-[9px] opacity-30" style={{ color: theme.textoPrincipal }}>—</span>
                                               )}
                                            </td>
                                         </>
                                       )}
                                    </tr>
                                  );
                                })}
                                {tableRows.length === 0 && (
                                  <tr><td colSpan={9} className="py-12 text-center text-xs opacity-50 italic" style={{ color: theme.textoPrincipal }}>Staging table is empty. Input below to add rows.</td></tr>
                                )}
                             </tbody>
                              {tableRows.length > 0 && (
                                 <tfoot className="sticky bottom-0 z-10" style={{ backgroundColor: theme.fundoCards || '#0a0a0a' }}>
                                   <tr>
                                      <td className="py-3 px-2 text-[10px] font-black uppercase tracking-widest text-center" colSpan={3} style={{ color: theme.textoPrincipal }}>Grand Total</td>
                                      <td className="py-3 px-2 text-[10px] font-black text-green-500 text-center">{grandTotal.takes}</td>
                                      <td className="py-3 px-2 text-[10px] font-black text-red-500 text-center">{grandTotal.stops}</td>
                                      <td className={`py-3 px-2 text-[11px] font-black font-display tracking-tight text-center ${grandTotal.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {grandTotal.pnl < 0 ? '-' : ''}${Math.abs(parseFloat(grandTotal.pnl)).toFixed(2)}
                                      </td>
                                      <td className="py-3 px-2 text-[11px] font-black text-orange-400 text-center">
                                        {grandTotal.commission > 0 ? `-$${grandTotal.commission.toFixed(2)}` : '—'}
                                      </td>
                                      <td className={`py-3 px-2 text-[11px] font-black font-display tracking-tight text-center ${grandNetPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {grandNetPnl < 0 ? '-' : ''}${Math.abs(grandNetPnl).toFixed(2)}
                                      </td>
                                      <td className={`py-3 px-2 text-[10px] font-black text-center ${grandWinRate >= 50 ? 'text-[#00B0F0]' : 'text-orange-400'}`} colSpan={2}>
                                        {grandWinRate.toFixed(1)}% Avg
                                      </td>
                                   </tr>
                                </tfoot>
                             )}
                          </table>
                        </div>
                     </div>
                  </div>
                 </div>
               </div>
               )}
              </div>
            )}
            </div>
         </div>
         
         {/* Setup Config / Parameters Modal */}
         {showConfigModal && selectedSetupId && (() => {
            const myLogs = (setupConfigLogs||[])
              .filter((l:any) => l.setup_id === selectedSetupId)
              .sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowConfigModal(false)}>
               <div className="w-full max-w-2xl flex flex-col shadow-2xl relative border rounded-2xl overflow-hidden" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral, maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: theme.contornoGeral }}>
                     <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2" style={{ color: theme.textoPrincipal }}>
                        <BookOpen size={16} className="text-blue-400" /> Strategy Log
                        <span className="text-[10px] opacity-40 font-normal normal-case tracking-normal ml-1">
                          {setups.find((s:any) => s.id === selectedSetupId)?.title}
                        </span>
                     </h3>
                     <button onClick={() => setShowConfigModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <X size={16} style={{ color: theme.textoPrincipal }} />
                     </button>
                  </div>
                  <div className="flex items-end gap-3 px-6 py-4 border-b shrink-0" style={{ borderColor: theme.contornoGeral, background: 'rgba(0,0,0,0.2)' }}>
                     <div className="flex flex-col gap-1">
                        <label className="text-[8px] uppercase font-bold tracking-widest opacity-50" style={{ color: theme.textoPrincipal }}>Data da entrada</label>
                        <input type="date" value={configDate} onChange={e => setConfigDate(e.target.value)} className="h-8 px-3 rounded-lg bg-black/30 border text-[11px] font-bold outline-none focus:border-blue-400 w-[150px]" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal, colorScheme: 'dark' }} />
                     </div>
                     <button disabled={!configDate} onClick={() => {
                        if (addSetupConfigLog && selectedSetupId && configDate) {
                           addSetupConfigLog({ setup_id: selectedSetupId, date: configDate, notes: '' });
                           setConfigDate(new Date().toISOString().split('T')[0]);
                        }
                     }} className="h-8 px-4 rounded-lg font-bold text-white text-[10px] uppercase tracking-widest bg-blue-500 hover:brightness-110 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                        <Plus size={13} /> Criar entrada
                     </button>
                     <p className="text-[10px] opacity-30 italic mb-1" style={{ color: theme.textoPrincipal }}>O texto e salvo ao sair do campo.</p>
                  </div>
                  <div className="flex flex-col gap-3 overflow-y-auto hide-scrollbar px-6 py-4 flex-1" style={{ minHeight: 0 }}>
                     {myLogs.length === 0 && (
                        <div className="py-16 flex flex-col items-center gap-3 opacity-30">
                           <BookOpen size={32} style={{ color: theme.textoPrincipal }} />
                           <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.textoPrincipal }}>Nenhum log ainda. Crie uma entrada acima.</p>
                        </div>
                     )}
                     {myLogs.map((log:any, idx:number) => (
                        <div key={log.id || idx} className="flex flex-col gap-2 rounded-xl border p-4" style={{ borderColor: theme.contornoGeral, background: 'rgba(0,0,0,0.15)' }}>
                           <div className="flex items-center gap-2">
                              <CalendarDays size={12} className="text-blue-400 shrink-0" />
                              <span className="text-[11px] font-black text-blue-400">{log.date}</span>
                           </div>
                           <textarea
                              defaultValue={log.notes || ''}
                              onBlur={async (e) => {
                                 const newNotes = e.target.value;
                                 if (updateSetupConfigLog && log.id) {
                                    await updateSetupConfigLog(log.id, newNotes);
                                 }
                              }}
                              rows={5}
                              placeholder="Escreva suas anotacoes aqui... (ex: Mudei o RR para 1:2, Ajustei a MM...)"
                              className="w-full bg-black/20 border rounded-lg p-3 text-[11px] font-medium outline-none focus:border-blue-400/60 resize-none leading-relaxed"
                              style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }}
                           />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            );
         })()}
      </div>
   );
}
