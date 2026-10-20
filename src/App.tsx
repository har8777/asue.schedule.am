import { useState, useRef, useEffect } from 'react';
import { useSchedule, ACADEMIC_YEARS, FACULTY_ACCOUNTS } from './modules/schedule/hooks/useSchedule';
import { FACULTIES } from './modules/schedule/schedule.constants';
import { ScheduleTable } from './modules/schedule/components/schedule-table';

function App() {
  const {
    userRole,
    setUserRole,
    adminFaculty,
    setAdminFaculty,
    activeFaculty,
    setActiveFaculty,
    selectedYear,
    setSelectedYear,
    timeSlots,
    isDarkMode,
    toggleDarkMode,
    canUndo,
    canRedo,
    undo,
    redo,
    changeLog,
    markLogAsRead,
    clearAllLogs,
    getRoomStatuses,
    generateIcsCalendar,
    searchGlobal,
    getGlobalConflicts,
    generateConflictReport,
    getLecturerSchedule,
    allLecturersList,
    isAdmin,
    isSuperAdmin,
    currentSchedule,
    updateCell,
    updateTimeSlot,
    exportBackup,
    importBackup,
    generateMockData,
    clearCurrentYear,
    clearFaculty,
    clearAllDatabase
  } = useSchedule();

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrorMsg, setLoginErrorMsg] = useState('');

  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const spotlightResults = searchGlobal(spotlightQuery);

  const [isFreeRoomsOpen, setIsFreeRoomsOpen] = useState(false);
  const [freeRoomDay, setFreeRoomDay] = useState('monday');
  const [freeRoomSlot, setFreeRoomSlot] = useState('1-2');
  const [freeRoomFaculty, setFreeRoomFaculty] = useState<string>('');
  
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);
  
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isLecturerModalOpen, setIsLecturerModalOpen] = useState(false);
  const [selectedLecturerForView, setSelectedLecturerForView] = useState<string>('');
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const unreadLogsCount = changeLog.filter((log) => !log.isRead).length;

  // Ճշգրիտ ստուգում՝ արդյոք Տնտեսագիտության տեսության ֆակուլտետում ենք
  const isEconomicTheory = Boolean(
    activeFaculty && (
      activeFaculty.includes('տեսութ') ||
      activeFaculty.includes('Տնտեսագիտության') ||
      activeFaculty.includes('Բնապահպանություն')
    )
  );

  // PDF Ներբեռնում
  const handleDownloadPDF = async () => {
    const element = document.getElementById('schedule-table-container');
    if (!element) return;

    document.body.style.cursor = 'wait';

    const table = element.querySelector('table');
    const scrollContainers = element.querySelectorAll('.overflow-x-auto');
    const headerBtn = element.querySelector('button');

    const origWidth = element.style.width;
    const origMaxWidth = element.style.maxWidth;
    const origBtnDisplay = headerBtn ? headerBtn.style.display : '';
    const origOverflows = Array.from(scrollContainers).map((c) => ({
      el: c as HTMLElement,
      overflow: (c as HTMLElement).style.overflow,
      width: (c as HTMLElement).style.width
    }));

    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const fullWidth = table ? Math.max(table.scrollWidth, table.offsetWidth, 1560) : 1560;

      element.style.width = `${fullWidth + 40}px`;
      element.style.maxWidth = 'none';
      if (headerBtn) headerBtn.style.display = 'none';

      origOverflows.forEach(({ el }) => {
        el.style.overflow = 'visible';
        el.style.width = `${fullWidth}px`;
      });

      await new Promise((r) => setTimeout(r, 120));

      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const margin = 3;
      const pdfWidth = 297;
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = contentWidth / (img.width / img.height);
      const pdfHeight = contentHeight + (margin * 2);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(dataUrl, 'PNG', margin, margin, contentWidth, contentHeight);
      pdf.save(`${activeFaculty}_${selectedYear}.pdf`.replace(/\s+/g, '_'));
    } catch (err) {
      console.error('PDF ստեղծման սխալ:', err);
      alert('Սխալ PDF ֆայլը ստեղծելիս: Խնդրում ենք կրկին փորձել:');
    } finally {
      element.style.width = origWidth;
      element.style.maxWidth = origMaxWidth;
      if (headerBtn) headerBtn.style.display = origBtnDisplay;
      origOverflows.forEach(({ el, overflow, width }) => {
        el.style.overflow = overflow;
        el.style.width = width;
      });
      document.body.style.cursor = 'default';
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((isAdmin || isSuperAdmin) && (e.ctrlKey || e.metaKey)) {
        if (e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
        else if (e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
        else if (e.key.toLowerCase() === 'k') { e.preventDefault(); setIsSpotlightOpen((prev) => !prev); }
      }
      if (e.key === 'Escape') { 
        setIsSpotlightOpen(false); setIsFreeRoomsOpen(false); setIsChangeLogOpen(false); 
        setIsConflictModalOpen(false); setIsLecturerModalOpen(false); setIsTelegramModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, isSuperAdmin, undo, redo]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = loginUsername.trim().toLowerCase();
    const p = loginPassword.trim();

    if (u === 'superadmin' && p === 'admin1') {
      setUserRole('superadmin'); setAdminFaculty(null); setShowAdminLogin(false); setLoginUsername(''); setLoginPassword(''); setLoginErrorMsg(''); return;
    }

    let matchedFaculty: string | null = null;
    let requiredPass = 'admin';

    for (const key of Object.keys(FACULTY_ACCOUNTS)) {
      const acc = FACULTY_ACCOUNTS[key];
      if (acc.aliases.includes(u)) { matchedFaculty = acc.faculty; requiredPass = acc.defaultPass; break; }
    }

    if (matchedFaculty && p === requiredPass) {
      setUserRole('admin'); setAdminFaculty(matchedFaculty); setActiveFaculty(matchedFaculty); setShowAdminLogin(false); setLoginUsername(''); setLoginPassword(''); setLoginErrorMsg(''); return;
    }

    setLoginErrorMsg('Սխալ մուտքանուն կամ գաղտնաբառ');
  };

  const handleLogout = () => {
    setUserRole(null); setAdminFaculty(null); setActiveFaculty(null); setSelectedYear('1-ին կուրս'); setLoginUsername(''); setLoginPassword(''); setShowAdminLogin(false);
  };

  const roomStatusesResult = freeRoomFaculty ? getRoomStatuses(freeRoomDay, freeRoomSlot, freeRoomFaculty) : {};
  const conflictReportResult = isConflictModalOpen ? generateConflictReport() : [];
  const lecturerScheduleResult = selectedLecturerForView ? getLecturerSchedule(selectedLecturerForView) : [];

  // 1. ՄՈՒՏՔԻ ԷՋ
  if (!userRole) {
    return (
      <div className={`relative min-h-screen flex flex-col items-center justify-center p-5 font-sans transition-colors ${
        isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-gradient-to-br from-[#f0f4f8] to-[#e2e8f0] text-gray-800'
      }`}>
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className={`cursor-pointer p-2.5 rounded-full border shadow-xs transition-colors ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-white border-gray-200 text-slate-700'
            }`}
            title="Գիշերային / Ցերեկային ռեժիմ"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <button 
            onClick={() => { setShowAdminLogin(!showAdminLogin); setLoginErrorMsg(''); }}
            className={`cursor-pointer text-sm font-semibold transition-colors flex items-center gap-2 px-4 py-2 rounded-full shadow-xs border ${
              isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            <span>🔐</span> Մուտք Ադմինիստրացիայի համար
          </button>

          {showAdminLogin && (
            <div className={`absolute top-12 right-0 mt-2 w-80 p-6 rounded-2xl shadow-2xl border z-50 ${
              isDarkMode ? 'bg-slate-850 border-slate-700 text-slate-200' : 'bg-white border-gray-200 text-gray-800'
            }`}>
              <h3 className="font-bold mb-3 text-center">Ադմինիստրատիվ Մուտք</h3>
              <form onSubmit={handleAdminLogin} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Մուտքանուն</label>
                  <input 
                    type="text" placeholder="օրինակ՝ karavarum, finans..." value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} required
                    className={`w-full p-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-gray-50 border-gray-200'}`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Գաղտնաբառ</label>
                  <input 
                    type="password" placeholder="Գաղտնաբառ" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required
                    className={`w-full p-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-gray-50 border-gray-200'}`}
                  />
                  {loginErrorMsg && <p className="text-[10px] text-red-500 mt-1 font-bold">{loginErrorMsg}</p>}
                </div>
                <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg text-xs font-bold shadow-md transition-all">
                  Մուտք գործել
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="text-center z-10 max-w-lg">
          <div className={`p-4 rounded-3xl shadow-xs inline-block mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <span className="text-5xl">🎓</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">ՀՊՏՀ ԴԱՍԱՑՈՒՑԱԿ</h1>
          <p className="text-gray-400 mb-10 text-base">Բարի գալուստ համալսարանի պաշտոնական դասացուցակի հարթակ:</p>
          <button onClick={() => setUserRole('student')} className="cursor-pointer px-8 py-4 bg-[#38a169] hover:bg-[#2f855a] text-white rounded-full text-lg font-bold shadow-xl hover:-translate-y-0.5 transition-all">
            Դիտել դասացուցակը →
          </button>
        </div>
      </div>
    );
  }

  // 2. ՖԱԿՈՒԼՏԵՏԻ ԸՆՏՐՈՒԹՅԱՆ ԷՋ
  if (!activeFaculty) {
    return (
      <div className={`min-h-screen p-5 font-sans transition-colors ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-[#f0f4f8] text-gray-800'}`}>
        <div className={`max-w-[1000px] mx-auto p-8 rounded-xl shadow-md mt-5 border ${isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-center border-b pb-4 mb-6 border-slate-700/40">
            <div className="font-bold flex items-center gap-2">
              <span>Բարի գալուստ,</span>
              {isSuperAdmin && <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-extrabold border border-amber-300">ԳԼԽԱՎՈՐ ԱԴՄԻՆ</span>}
              {!isAdmin && !isSuperAdmin && <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">ՈՒՍԱՆՈՂ</span>}
            </div>
            <button onClick={handleLogout} className="cursor-pointer px-5 py-2 bg-[#718096] hover:bg-[#4a5568] text-white rounded-md transition-colors text-xs font-semibold">Դուրս գալ</button>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-8">Ընտրել ֆակուլտետը</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {FACULTIES.map((faculty) => (
              <div 
                key={faculty}
                onClick={() => setActiveFaculty(faculty)}
                className="bg-gradient-to-br from-[#2c5282] to-[#3182ce] text-white p-6 rounded-xl text-center cursor-pointer font-bold shadow-md hover:-translate-y-1 hover:shadow-lg transition-all min-h-[100px] flex items-center justify-center"
              >
                {faculty}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 border-t border-slate-700/40 pt-6">
            <button onClick={() => setIsLecturerModalOpen(true)} className="cursor-pointer px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xs transition-colors flex items-center gap-2">
              <span>👨‍🏫</span> Դասախոսի անհատական դասացուցակ
            </button>
            {userRole === 'student' && (
              <button onClick={() => setIsTelegramModalOpen(true)} className="cursor-pointer px-5 py-2.5 bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-xl text-sm font-bold shadow-xs transition-colors flex items-center gap-2">
                <span>✈️</span> Ստանալ Telegram ծանուցումներ
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. ԴԱՍԱՑՈՒՑԱԿԻ ԷՋ
  return (
    <div className={`min-h-screen p-4 md:p-6 font-sans flex flex-col justify-between transition-colors ${
      isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#f0f4f8] text-gray-800'
    }`}>
      <div className="max-w-[1440px] w-full mx-auto">
        
        {/* ՎԵՐԵՎԻ ԿՈՃԱԿՆԵՐԻ ԳՈՏԻ */}
        <div className={`p-4 rounded-xl shadow-sm mb-4 flex flex-wrap justify-between items-center gap-3 border-b-2 print:hidden ${
          isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            {(userRole === 'student' || isSuperAdmin) && (
              <button onClick={() => setActiveFaculty(null)} className="cursor-pointer px-4 py-2 bg-[#718096] hover:bg-[#4a5568] text-white rounded-md transition-colors font-medium text-xs">
                ← Վերադառնալ
              </button>
            )}
            {(isAdmin || isSuperAdmin) && (
              <div className="flex items-center gap-1 border-l pl-2 border-slate-700/40">
                <button onClick={undo} disabled={!canUndo} className={`p-2 rounded-lg text-xs font-bold border transition-all ${canUndo ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`} title="Հետարկել (Ctrl+Z)">↩️</button>
                <button onClick={redo} disabled={!canRedo} className={`p-2 rounded-lg text-xs font-bold border transition-all ${canRedo ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`} title="Կրկնել (Ctrl+Y)">↪️</button>
              </div>
            )}
          </div>
          
          <div className="font-bold text-sm md:text-base text-center hidden xl:block">
            {isAdmin && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold mr-2">ԱԴՄԻՆ</span>}
            Ֆակուլտետ: <span className="text-blue-500 font-extrabold">{activeFaculty}</span>
          </div>

          <div className="flex items-center flex-wrap gap-2 justify-end flex-1 xl:flex-none">
            {(isAdmin || isSuperAdmin) && (
              <button onClick={() => setIsSpotlightOpen(true)} className={`cursor-pointer group flex items-center justify-between w-full sm:w-48 px-3 py-2 rounded-xl text-sm transition-all shadow-xs border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-blue-500 hover:text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-white hover:border-blue-400 hover:text-slate-800'}`}>
                <div className="flex items-center gap-2"><svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><span className="font-medium text-xs">Որոնել...</span></div>
                <kbd className={`hidden sm:inline-block font-mono text-[10px] px-1 py-0.5 rounded font-bold ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>Ctrl K</kbd>
              </button>
            )}

            {(isAdmin || isSuperAdmin) && (
              <button onClick={() => setIsConflictModalOpen(true)} className="cursor-pointer px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5" title="Ստուգել խաչվող դասերը համալսարանում">
                <span>🚨</span> Խաչվող դասեր
              </button>
            )}

            {(isAdmin || isSuperAdmin) && (
              <button onClick={() => { setFreeRoomFaculty(activeFaculty || FACULTIES[0]); setIsFreeRoomsOpen(true); }} className="cursor-pointer px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5" title="Լսարանների զբաղվածության քարտեզ">
                <span>🚪</span> Ազատ լսարաններ
              </button>
            )}

            <button onClick={() => setIsLecturerModalOpen(true)} className="cursor-pointer px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5" title="Դասախոսների ժամանակացույց">
              <span>👨‍🏫</span> Դասախոս
            </button>

            <button onClick={() => generateIcsCalendar('stream-1')} className="cursor-pointer px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5" title="Ավելացնել Google / Apple Calendar (.ics)">
              <span>📅</span> Օրացույց (.ics)
            </button>

            {(isAdmin || isSuperAdmin) && (
              <button onClick={() => setIsChangeLogOpen(true)} className="cursor-pointer relative p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-bold" title="Փոփոխությունների պատմություն">
                <span>🔔</span>
                {unreadLogsCount > 0 && <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{unreadLogsCount > 9 ? '9+' : unreadLogsCount}</span>}
              </button>
            )}

            {(isAdmin || isSuperAdmin) && (
              <>
                <button onClick={() => document.getElementById('excel-upload')?.click()} className="cursor-pointer px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 print:hidden" title="Ներբեռնել Excel ֆայլ">
                  <span>📊</span> Excel
                </button>
                <input 
                  id="excel-upload" type="file" accept=".xlsx, .xls" className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { alert("Excel ֆայլը ընտրված է: Այստեղ կկանչվի Import ֆունկցիան:"); }
                  }} 
                />
              </>
            )}

            <button onClick={handleDownloadPDF} className="cursor-pointer px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 print:hidden" title="Ավտոմատ ներբեռնել PDF">
              <span>📄</span> PDF
            </button>

            <button onClick={toggleDarkMode} className={`cursor-pointer p-2 rounded-lg border text-xs font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-300 text-slate-700'}`}>{isDarkMode ? '☀️' : '🌙'}</button>
            <button onClick={() => window.print()} className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"><span>🖨️</span> Տպել</button>
            <button onClick={handleLogout} className="cursor-pointer px-4 py-2 bg-[#718096] hover:bg-[#4a5568] text-white rounded-md transition-colors font-medium text-xs">Դուրս գալ</button>
          </div>
        </div>

        {/* ԿՈՒՐՍԵՐԻ ԸՆՏՐՈՒԹՅԱՆ ՏՈՂԸ (ԸՆՏՐԵՔ ԿՈՒՐՍԸ) */}
        <div className={`p-3 rounded-xl shadow-sm mb-4 flex items-center justify-between border print:hidden ${isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold opacity-60 uppercase pr-2">Ընտրեք Կուրսը:</span>
            {ACADEMIC_YEARS.map((yr) => (
              <button
                key={yr.id}
                onClick={() => setSelectedYear(yr.label)}
                className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedYear === yr.label
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600 ring-offset-1'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {yr.label}
              </button>
            ))}

            {/* «ԲՆԱՊԱՀՊԱՆՈՒԹՅՈՒՆ ԵՎ ԲՆՕԳՏԱԳՈՐԾՈՒՄ» ԿՈՃԱԿԸ՝ 5-ՐԴ ԿՈՒՐՍԻՑ ԱՆՄԻՋԱՊԵՍ ՀԵՏՈ */}
            {isEconomicTheory && (
              <button
                onClick={() => setSelectedYear('Բնապահպանություն և բնօգտագործում')}
                className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedYear === 'Բնապահպանություն և բնօգտագործում'
                    ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600 ring-offset-1'
                    : isDarkMode
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-700/60 hover:bg-slate-750'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                Բնապահպանություն և բնօգտագործում
              </button>
            )}
          </div>

          {userRole === 'student' && (
            <button onClick={() => setIsTelegramModalOpen(true)} className="cursor-pointer px-3 py-1.5 bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5">
              <span>✈️</span> Telegram Ծանուցումներ
            </button>
          )}
        </div>

        {/* ԴԱՍԱՑՈՒՑԱԿԻ ԱՂՅՈՒՍԱԿԸ */}
        <div id="schedule-table-container" className={`p-4 md:p-6 rounded-xl shadow-md mb-6 border print:shadow-none print:p-0 ${isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-gray-100'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 print:hidden">
            <div>
              <h2 className="text-xl md:text-2xl font-bold flex items-center flex-wrap gap-2">
                {activeFaculty} - <span className="text-blue-500">{selectedYear}</span>
                {selectedYear === '1-ին կուրս' && <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm ml-2">1-ին կիսամյակ</span>}
                {selectedYear === '2-րդ կուրս' && <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm ml-2">2-րդ կիսամյակ</span>}
                {selectedYear === '3-րդ կուրս' && <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm ml-2">3-րդ կիսամյակ</span>}
                {selectedYear === '4-րդ կուրս' && <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm ml-2">4-րդ կիսամյակ</span>}
                {selectedYear?.includes('5-րդ') && <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm ml-2">5-րդ կիսամյակ</span>}
                {selectedYear === 'Բնապահպանություն և բնօգտագործում' && (
                  <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-sm ml-2">
                    Առանձին դասացուցակ
                  </span>
                )}
              </h2>
            </div>
            {(isAdmin || isSuperAdmin) && (
              <button onClick={() => alert("Փոփոխությունները հաջողությամբ պահպանված են:")} className="cursor-pointer px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs text-xs transition-colors self-start sm:self-auto">Պահպանել փոփոխությունները</button>
            )}
          </div>

          <ScheduleTable 
            facultyName={activeFaculty} 
            selectedYear={selectedYear} 
            isAdmin={isAdmin} 
            isSuperAdmin={isSuperAdmin} 
            timeSlots={timeSlots} 
            isDarkMode={isDarkMode}
            onUpdateTimeSlot={updateTimeSlot} 
            scheduleData={currentSchedule} 
            onUpdateCell={updateCell} 
            getGlobalConflicts={getGlobalConflicts}
          />
        </div>

        {/* DEV TOOLBAR (SUPERADMIN) */}
        {isSuperAdmin && (
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 mt-4 mb-8 print:hidden">
            <span className="text-amber-400 font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-800 border border-slate-700">🛠️ DEV TOOLBAR (SUPERADMIN)</span>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={exportBackup} className="cursor-pointer px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-blue-500 transition-colors">📥 Backup JSON</button>
              <button onClick={() => jsonFileInputRef.current?.click()} className="cursor-pointer px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-600 transition-colors">📤 Վերականգնել</button>
              <input ref={jsonFileInputRef} type="file" accept=".json" onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} className="hidden" />
              <button onClick={generateMockData} className="cursor-pointer px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-500 transition-colors">🎲 Mock Data</button>
              <select onChange={(e) => { const val = e.target.value; if (val === 'year') clearCurrentYear(); if (val === 'faculty') clearFaculty(); if (val === 'all') clearAllDatabase(); e.target.value = ''; }} className="bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer" defaultValue="">
                <option value="" disabled>🧹 Մաքրել (Reset)...</option><option value="year">Մաքրել միայն այս կուրսը</option><option value="faculty">Մաքրել այս ֆակուլտետի բոլոր կուրսերը</option><option value="all">⚠️ Ջնջել ամբողջ համալսարանի բազան</option>
              </select>
            </div>
          </div>
        )}

      </div>

      {/* ԼՐԱՑՈՒՑԻՉ ՄՈԴԱԼՆԵՐ */}
      {isFreeRoomsOpen && (isAdmin || isSuperAdmin) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsFreeRoomsOpen(false)}>
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border p-5 sm:p-6 flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-slate-850 border-slate-700 text-slate-200' : 'bg-white border-gray-100 text-gray-800'}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-4 border-b border-slate-700/30 pb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">🚪 Լսարանների Զբաղվածության Քարտեզ</span>
                <button onClick={() => setIsFreeRoomsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold cursor-pointer">✕</button>
              </div>
              <div className="relative w-full">
                <select value={freeRoomFaculty} onChange={(e) => setFreeRoomFaculty(e.target.value)} className={`w-full text-base sm:text-lg font-black outline-none cursor-pointer appearance-none px-4 py-3 rounded-xl border-2 transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-600 text-blue-400 focus:border-blue-500 hover:bg-slate-750' : 'bg-slate-50 border-gray-200 text-blue-700 focus:border-blue-500 hover:bg-white'}`} style={{ backgroundImage: `url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${isDarkMode ? '%2360a5fa' : '%231d4ed8'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '20px' }}>
                  {FACULTIES.map((f) => (<option key={f} value={f} className={isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-gray-800'}>{f}</option>))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 my-4">
              <div>
                <label className="text-[10px] font-bold uppercase opacity-60 mb-1 block">Օր</label>
                <select value={freeRoomDay} onChange={(e) => setFreeRoomDay(e.target.value)} className={`w-full p-2.5 rounded-lg text-sm font-bold border outline-none shadow-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-gray-200 text-gray-800'}`}>
                  <option value="monday">Երկուշաբթի</option><option value="tuesday">Երեքշաբթի</option><option value="wednesday">Չորեքշաբթի</option><option value="thursday">Հինգշաբթի</option><option value="friday">Ուրբաթ</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase opacity-60 mb-1 block">Ժամ</label>
                <select value={freeRoomSlot} onChange={(e) => setFreeRoomSlot(e.target.value)} className={`w-full p-2.5 rounded-lg text-sm font-bold border outline-none shadow-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-gray-200 text-gray-800'}`}>
                  <option value="all">Ամբողջ օրը (Tutto il giorno)</option>{timeSlots.map((ts) => (<option key={ts} value={ts}>{ts}</option>))}
                </select>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {Object.keys(roomStatusesResult).length > 0 ? (
                Object.entries(roomStatusesResult).map(([floor, rooms]) => {
                  const freeCount = rooms.filter((r) => r.isFree).length;
                  return (
                    <div key={floor} className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50/50 border-gray-100'}`}>
                      <div className="text-[11px] font-bold uppercase tracking-wide mb-2.5 border-b border-slate-200 dark:border-slate-700 pb-1.5 flex justify-between items-center">
                        <span className="text-slate-500">{floor}</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${freeCount > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'}`}>{freeCount} ազատ / {rooms.length} ընդհանուր</span>
                      </div>
                      <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                        {rooms.map((r) => (
                          <div key={r.room} title={r.isFree ? 'Ազատ է' : 'Զբաղված է'} className={`py-2 px-1 text-xs font-bold font-mono rounded-lg text-center transition-all ${r.isFree ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-400 shadow-xs dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-600' : 'bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-60 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'}`}>{r.room}</div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (<div className="text-center py-8 opacity-60 text-xs">Լսարանների ցանկը դատարկ է այս ֆակուլտետի համար:</div>)}
            </div>
          </div>
        </div>
      )}

      {/* CHANGE LOG ՄՈԴԱԼ */}
      {isChangeLogOpen && (isAdmin || isSuperAdmin) && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs p-0" onClick={() => setIsChangeLogOpen(false)}>
          <div className={`w-full max-w-md h-full shadow-2xl p-5 flex flex-col border-l animate-slide-left ${isDarkMode ? 'bg-slate-850 border-slate-700 text-slate-200' : 'bg-white border-gray-200 text-gray-800'}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/30">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔔</span><h3 className="text-base font-bold">Վերջին փոփոխություններ</h3>
              </div>
              <div className="flex items-center gap-2">
                {changeLog.length > 0 && <button onClick={clearAllLogs} className="cursor-pointer text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 font-bold px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-800 transition-colors">🗑️ Մաքրել բոլորը</button>}
                <button onClick={() => setIsChangeLogOpen(false)} className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold opacity-60 hover:opacity-100">✕</button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-slate-700/30 pr-1 mt-2">
              {changeLog.length === 0 ? (<div className="text-center py-12 opacity-60 text-xs">Դեռևս փոփոխություններ չկան:</div>) : (
                changeLog.map((log) => (
                  <div key={log.id} onClick={() => markLogAsRead(log.id)} className={`py-3 space-y-1 text-xs text-left cursor-pointer transition-colors px-3 -mx-3 rounded-xl ${!log.isRead ? (isDarkMode ? 'bg-blue-900/30 hover:bg-blue-900/50' : 'bg-blue-50 hover:bg-blue-100') : (isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50')}`}>
                    <div className="flex justify-between items-center text-[10px] opacity-60"><div className="flex items-center gap-1.5">{!log.isRead && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>}<span>{log.faculty} • {log.year}</span></div><span className="font-mono">{log.timestamp}</span></div>
                    <div className="font-bold text-blue-500 pl-3">{log.day} • {log.time} ({log.stream})</div>
                    <div className="text-[11px] p-2 ml-3 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"><div className="line-through opacity-60 truncate">Նախկին՝ {log.oldValue}</div><div className="font-semibold text-emerald-600 dark:text-emerald-400 truncate">Նոր՝ {log.newValue}</div></div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SPOTLIGHT SEARCH ՄՈԴԱԼ */}
      {(isAdmin || isSuperAdmin) && isSpotlightOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setIsSpotlightOpen(false)}>
          <div className={`w-full max-w-3xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[80vh] transform transition-all animate-slide-up ${isDarkMode ? 'bg-slate-850 border-slate-700 text-slate-200 shadow-black/50' : 'bg-white border-gray-200 text-gray-800 shadow-slate-300/50'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`p-4 sm:p-5 flex items-center gap-4 border-b ${isDarkMode ? 'border-slate-700/60' : 'border-slate-100'}`}>
              <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Որոնել դասընթաց, դասախոս կամ լսարան..." value={spotlightQuery} onChange={(e) => setSpotlightQuery(e.target.value)} className="w-full text-lg sm:text-xl bg-transparent outline-none font-medium placeholder:opacity-40" autoFocus />
              <kbd className={`hidden sm:block text-[10px] px-2 py-1 rounded-md border font-mono font-bold flex-shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>ESC</kbd>
            </div>
            <div className={`overflow-y-auto flex-1 p-2 sm:p-3 ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
              {!spotlightQuery.trim() ? (
                <div className="flex flex-col items-center justify-center py-16 opacity-50"><span className="text-4xl mb-3">⌨️</span><p className="text-sm font-medium">Սկսեք մուտքագրել անվանումը որոնման համար</p></div>
              ) : spotlightResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 opacity-50 text-red-500 dark:text-red-400"><span className="text-4xl mb-3">🔍</span><p className="text-sm font-medium">Ոչինչ չի գտնվել «{spotlightQuery}» հարցումով</p></div>
              ) : (
                <div className="space-y-2">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider opacity-50">Գտնվել է {spotlightResults.length} արդյունք</div>
                  {spotlightResults.map((res, idx) => (
                    <div key={`${res.id || res.name}-${idx}`} onClick={() => { if (res.type === 'schedule') { setActiveFaculty(res.faculty); setSelectedYear(res.year); setIsSpotlightOpen(false); } }} className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col gap-2 text-left group ${res.type === 'schedule' ? 'cursor-pointer hover:scale-[1.005]' : 'cursor-default'} ${isDarkMode ? 'border-slate-700 bg-slate-800 hover:bg-slate-750 hover:border-blue-500/50' : 'border-slate-200 bg-white hover:bg-blue-50/40 hover:border-blue-300 hover:shadow-sm'}`}>
                      {res.type === 'schedule' ? (
                        <>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            <span className="truncate max-w-[180px] sm:max-w-none">{res.faculty}</span><span className="opacity-50">/</span><span>{res.year}</span><span className="opacity-50">/</span><span>{res.stream}</span><span className="opacity-50">/</span><span className={`px-2 py-0.5 rounded-full border ${isDarkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-100 border-blue-200'}`}>{res.day} • {res.time}</span>
                          </div>
                          <div className="text-sm sm:text-base font-bold leading-tight flex items-center justify-between"><span>{res.course}</span><span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Բացել դասացուցակը →</span></div>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs font-medium opacity-80 mt-0.5"><div className="flex items-start gap-1.5"><span className="opacity-60">👨‍🏫</span><span className="line-clamp-2">{res.prof}</span></div><div className="flex items-center gap-1.5"><span className="opacity-60">🚪</span><span className="font-mono bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{res.room}</span></div></div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between"><div><span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded mr-2 text-slate-600 dark:text-slate-300">{res.category} (Բազա)</span><span className="font-bold text-sm">{res.name}</span></div><span className="text-xs opacity-60">{res.faculty}</span></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ԿՈՆՖԼԻԿՏՆԵՐԻ ՄՈԴԱԼ */}
      {isConflictModalOpen && (isAdmin || isSuperAdmin) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsConflictModalOpen(false)}>
          <div className={`w-full max-w-3xl rounded-2xl shadow-2xl border p-5 sm:p-6 flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-slate-850 border-slate-700 text-slate-200' : 'bg-white border-gray-100 text-gray-800'}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-700/30 mb-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <span className="text-2xl">🚨</span><h3 className="text-lg font-black uppercase tracking-tight">Խաչվող Դասերի Հաշվետվություն</h3>
              </div>
              <button onClick={() => setIsConflictModalOpen(false)} className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold opacity-60 hover:opacity-100">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 pr-2">
              {conflictReportResult.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-emerald-600 dark:text-emerald-400">
                  <span className="text-5xl mb-4">✅</span><p className="text-lg font-bold">Հիանալի է: Համալսարանում խաչվող դասեր չկան:</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="px-2 text-xs font-bold text-rose-500 uppercase tracking-wider">Հայտնաբերվել է {conflictReportResult.length} կոնֆլիկտ</div>
                  {conflictReportResult.map((c, i) => (
                    <div key={i} className={`p-4 rounded-xl border-l-4 shadow-sm ${c.type === 'Prof' ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600' : 'border-l-rose-500 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-600'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-base flex items-center gap-2">
                          <span className="text-xl">{c.type === 'Prof' ? '👨‍🏫' : '🚪'}</span>{c.name}
                        </div>
                        <div className="text-xs font-bold px-2 py-1 rounded bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                          {c.day} • {c.time}
                        </div>
                      </div>
                      <div className="text-xs font-semibold opacity-70 mb-2">Այս {c.type === 'Prof' ? 'դասախոսը' : 'լսարանը'} միաժամանակ նշանակված է հետևյալ տեղերում.</div>
                      <ul className="space-y-1">
                        {c.details.map((det, j) => (
                          <li key={j} className="text-xs font-mono bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {det}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ԴԱՍԱԽՈՍԻ ՄՈԴԱԼ */}
      {isLecturerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setIsLecturerModalOpen(false)}>
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border p-5 flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-slate-850 border-slate-700 text-slate-200' : 'bg-white border-gray-100 text-gray-800'}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/30 mb-4">
              <div className="flex items-center gap-2"><span className="text-xl">👨‍🏫</span><h3 className="text-base font-bold">Դասախոսի Անհատական Դասացուցակ</h3></div>
              <button onClick={() => setIsLecturerModalOpen(false)} className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold opacity-60 hover:opacity-100">✕</button>
            </div>
            <div className="mb-4">
              <label className="text-[11px] font-bold uppercase opacity-60 mb-1 block">Ընտրեք Դասախոսին</label>
              <select value={selectedLecturerForView} onChange={(e) => setSelectedLecturerForView(e.target.value)} className={`w-full p-3 rounded-lg text-sm font-bold border outline-none shadow-xs cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500' : 'bg-slate-50 border-gray-200 focus:border-blue-500 text-gray-800'}`}>
                <option value="">-- Ընտրել ցանկից --</option>
                {allLecturersList.map((prof) => <option key={prof} value={prof}>{prof}</option>)}
              </select>
            </div>
            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {!selectedLecturerForView ? (
                <div className="text-center py-12 opacity-60 text-xs">Խնդրում ենք ընտրել դասախոս վերևի ցանկից:</div>
              ) : lecturerScheduleResult.length === 0 ? (
                <div className="text-center py-12 opacity-60 text-xs">Այս դասախոսի համար դասաժամեր չեն գտնվել համակարգում:</div>
              ) : (
                lecturerScheduleResult.map((sc, i) => (
                  <div key={i} className={`p-4 rounded-xl border transition-colors ${isDarkMode ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 shadow-sm hover:border-blue-300'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-black text-blue-700 dark:text-blue-400">{sc.day} • {sc.time}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sc.half.includes('Ամբողջ') ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700' : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700'}`}>{sc.half}</span>
                    </div>
                    <div className="font-bold text-base mb-3 text-slate-800 dark:text-slate-100">{sc.course}</div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className={`font-semibold px-2.5 py-1 rounded-md border ${isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>🏫 {sc.location}</span>
                      <span className={`font-mono font-bold px-2.5 py-1 rounded-md border ${isDarkMode ? 'bg-blue-900/40 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>🚪 Լս. {sc.room}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TELEGRAM ՄՈԴԱԼ */}
      {isTelegramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setIsTelegramModalOpen(false)}>
          <div className={`w-full max-w-md rounded-3xl shadow-2xl border p-8 flex flex-col items-center text-center transform transition-all animate-slide-up ${isDarkMode ? 'bg-slate-850 border-slate-700 text-slate-200' : 'bg-white border-gray-100 text-gray-800'}`} onClick={(e) => e.stopPropagation()}>
            <div className="w-24 h-24 bg-[#0088cc] rounded-full flex items-center justify-center text-5xl text-white shadow-xl shadow-[#0088cc]/30 mb-6">✈️</div>
            <h2 className="text-2xl font-black mb-3">Միացեք ASUE Bot-ին</h2>
            <p className="text-sm opacity-80 mb-8 leading-relaxed">
              Բաց մի թողեք դասացուցակի փոփոխությունները: Միացեք մեր պաշտոնական Telegram ալիքին և ստացեք անհապաղ ծանուցումներ Ձեր կուրսի դասաժամերի, լսարանների կամ դասախոսների ցանկացած փոփոխության վերաբերյալ:
            </p>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Telegram Bot Integration (Coming Soon!)'); setIsTelegramModalOpen(false); }} className="cursor-pointer w-full py-4 bg-[#0088cc] hover:bg-[#0077b3] active:bg-[#005c8a] text-white rounded-xl font-bold shadow-lg transition-all text-base mb-4 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.32-1.08-.68.02-.19.29-.39.81-.6 3.17-1.38 5.28-2.29 6.33-2.73 3-.1.35-.49.35-.74.34 0 .08.01.19.04.31z"/></svg>
              Բացել Telegram-ը
            </a>
            <button onClick={() => setIsTelegramModalOpen(false)} className="cursor-pointer text-xs font-bold opacity-50 hover:opacity-100 hover:underline transition-all">✕ Փակել պատուհանը</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
