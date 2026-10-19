import { useState, useMemo } from 'react';
import { FACULTY_LISTS, FACULTY_ROOMS } from '../schedule.constants';

const MAX_PROFS_LIMIT = 3; // Massimo 3 professori per ogni metà

interface EditCellModalProps {
  facultyName: string;
  fieldType: 'course' | 'prof' | 'room';
  currentValue: any;
  metaInfo: { day: string; time: string; stream: string };
  occupiedValues: string[];
  conflictDetails?: Record<string, string>;
  isCellAlreadySplit?: boolean;
  onSave: (value: any) => void;
  onClose: () => void;
}

export const EditCellModal = ({
  facultyName,
  fieldType,
  currentValue,
  metaInfo,
  occupiedValues,
  conflictDetails = {},
  isCellAlreadySplit = false,
  onSave,
  onClose
}: EditCellModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [showManualSection, setShowManualSection] = useState(false);

  const isInitialSplit = (typeof currentValue === 'object' && currentValue?.type === 'split') || isCellAlreadySplit;
  const [mode, setMode] = useState<'full' | 'split'>(isInitialSplit ? 'split' : 'full');
  const [activeHalf, setActiveHalf] = useState<'part1' | 'part2'>('part1');

  const otherHalf = activeHalf === 'part1' ? 'part2' : 'part1';

  // 1. Materie (distinte per part1 e part2)
  const [splitCourses, setSplitCourses] = useState<{ part1: string; part2: string }>({
    part1: typeof currentValue === 'object' ? currentValue.part1 || '' : (typeof currentValue === 'string' ? currentValue : ''),
    part2: typeof currentValue === 'object' ? currentValue.part2 || '' : ''
  });

  const parseProfArray = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  };

  // 2. Docenti (fino a 3 per metà)
  const [fullProfs, setFullProfs] = useState<string[]>(() => {
    return !isInitialSplit ? parseProfArray(currentValue) : [];
  });

  const [splitProfs, setSplitProfs] = useState<{ part1: string[]; part2: string[] }>({
    part1: typeof currentValue === 'object' && currentValue?.type === 'split' 
      ? parseProfArray(currentValue.part1) 
      : parseProfArray(currentValue),
    part2: typeof currentValue === 'object' && currentValue?.type === 'split' 
      ? parseProfArray(currentValue.part2) 
      : []
  });

  // 3. Aule
  const [splitRooms, setSplitRooms] = useState<{ part1: string; part2: string }>({
    part1: typeof currentValue === 'object' ? currentValue.part1 || '' : (typeof currentValue === 'string' ? currentValue : ''),
    part2: typeof currentValue === 'object' ? currentValue.part2 || '' : ''
  });

  if (!FACULTY_LISTS[facultyName]) {
    FACULTY_LISTS[facultyName] = { courses: [], profs: [] };
  }
  if (!FACULTY_ROOMS[facultyName]) {
    FACULTY_ROOMS[facultyName] = {};
  }

  const lists = FACULTY_LISTS[facultyName];
  const roomsByFloor = FACULTY_ROOMS[facultyName];

  const titles = {
    course: 'Ընտրել Դասընթաց',
    prof: 'Ընտրել Դասախոսներ',
    room: 'Ընտրել Լսարան'
  };

  const activeList = fieldType === 'course' ? lists.courses : lists.profs;

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return activeList;
    return activeList.filter((item) =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeList, searchQuery]);

  // CANCELLAZIONE DI UNA SINGOLA METÀ (1ª O 2ª ORA)
  const handleClearSpecificHalf = (half: 'part1' | 'part2') => {
    if (fieldType === 'course') {
      setSplitCourses((prev) => ({ ...prev, [half]: '' }));
    } else if (fieldType === 'prof') {
      setSplitProfs((prev) => ({ ...prev, [half]: [] }));
    } else {
      setSplitRooms((prev) => ({ ...prev, [half]: '' }));
    }
  };

  // SELEZIONE E DESELEZIONE AL CLIC PER LE MATERIE
  const handleSelectCourse = (courseName: string) => {
    if (mode === 'full') {
      if (splitCourses.part1 === courseName) {
        setSplitCourses((prev) => ({ ...prev, part1: '' }));
      } else {
        onSave(courseName);
        onClose();
      }
    } else {
      // Se già selezionato nell'altra metà, blocca
      if (splitCourses[otherHalf] === courseName) {
        const otherTitle = otherHalf === 'part1' ? '1-ին' : '2-րդ';
        alert(`⚠️ Զգուշացում: «${courseName}»-ն արդեն ընտրված է ${otherTitle} ժամի համար:`);
        return;
      }
      // Se clicco sulla materia già selezionata per questa metà, DESELEZIONA
      setSplitCourses((prev) => ({
        ...prev,
        [activeHalf]: prev[activeHalf] === courseName ? '' : courseName
      }));
    }
  };

  // SELEZIONE E DESELEZIONE AL CLIC PER LE AULE
  const handleSelectRoom = (roomName: string) => {
    if (mode === 'full') {
      if (splitRooms.part1 === roomName) {
        setSplitRooms((prev) => ({ ...prev, part1: '' }));
      } else {
        onSave(roomName);
        onClose();
      }
    } else {
      // Se clicco sull'aula già selezionata, DESELEZIONA
      setSplitRooms((prev) => ({
        ...prev,
        [activeHalf]: prev[activeHalf] === roomName ? '' : roomName
      }));
    }
  };

  // GESTIONE DOCENTI (TOGGLE + LIMITE 3 + BLOCCO DUPLICATO NELL'ALTRA METÀ)
  const toggleProfSelection = (profName: string) => {
    if (mode === 'full') {
      setFullProfs((prev) => {
        if (prev.includes(profName)) return prev.filter((p) => p !== profName);
        if (prev.length >= MAX_PROFS_LIMIT) {
          alert(`⚠️ Զգուշացում: Կարող եք ընտրել առավելագույնը ${MAX_PROFS_LIMIT} դասախոս:`);
          return prev;
        }
        return [...prev, profName];
      });
    } else {
      if (splitProfs[otherHalf].includes(profName)) {
        const otherTitle = otherHalf === 'part1' ? '1-ին' : '2-րդ';
        alert(`⚠️ Զգուշացում: «${profName}»-ն արդեն ընտրված է ${otherTitle} ժամի համար:`);
        return;
      }

      setSplitProfs((prev) => {
        const currentList = prev[activeHalf];
        if (currentList.includes(profName)) {
          return { ...prev, [activeHalf]: currentList.filter((p) => p !== profName) };
        }
        if (currentList.length >= MAX_PROFS_LIMIT) {
          const halfTitle = activeHalf === 'part1' ? '1-ին' : '2-րդ';
          alert(`⚠️ Զգուշացում: ${halfTitle} ժամի համար կարող եք ընտրել առավելագույնը ${MAX_PROFS_LIMIT} դասախոս:`);
          return prev;
        }
        return { ...prev, [activeHalf]: [...currentList, profName] };
      });
    }
  };

  const checkManualConflict = (val: string) => {
    if (occupiedValues.includes(val)) {
      const loc = conflictDetails[val] ? ` (${conflictDetails[val]})` : '';
      alert(`⚠️ ԶԳՈՒՇԱՑՈՒՄ: «${val}» արդեն զբաղված է այս ժամին${loc}:`);
      return true;
    }
    return false;
  };

  const handleApplyTemporary = () => {
    const val = manualInput.trim();
    if (!val) return;
    if (checkManualConflict(val)) return;

    if (fieldType === 'prof') {
      toggleProfSelection(val);
      setManualInput('');
    } else if (fieldType === 'course') {
      handleSelectCourse(val);
      setManualInput('');
    } else {
      handleSelectRoom(val);
      setManualInput('');
    }
  };

  const handleAddToDatabaseAndApply = () => {
    const val = manualInput.trim();
    if (!val) return;
    if (checkManualConflict(val)) return;

    if (fieldType === 'room') {
      let floorKey = '1-ին հարկ (100)';
      const numMatch = val.match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0], 10);
        if (num >= 200 && num < 300) floorKey = '2-րդ հարկ (200)';
        else if (num >= 300 && num < 400) floorKey = '3-րդ հարկ (300)';
      }

      if (!roomsByFloor[floorKey]) roomsByFloor[floorKey] = [];
      if (!roomsByFloor[floorKey].includes(val)) {
        roomsByFloor[floorKey].push(val);
        roomsByFloor[floorKey].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      }
      localStorage.setItem('APP_FACULTY_ROOMS', JSON.stringify(FACULTY_ROOMS));

      if (mode === 'full') {
        onSave(val);
        onClose();
      } else {
        setSplitRooms((prev) => ({ ...prev, [activeHalf]: val }));
        setManualInput('');
      }
    } else {
      const targetArray = fieldType === 'course' ? lists.courses : lists.profs;
      if (!targetArray.includes(val)) {
        targetArray.push(val);
        targetArray.sort((a, b) => a.localeCompare(b));
      }
      localStorage.setItem('APP_FACULTY_LISTS', JSON.stringify(FACULTY_LISTS));

      if (fieldType === 'prof') {
        toggleProfSelection(val);
        setManualInput('');
      } else {
        handleSelectCourse(val);
        setManualInput('');
      }
    }
  };

  // SALVATAGGIO FINALE
  const handleSaveFinal = () => {
    if (mode === 'full') {
      if (fieldType === 'course') onSave(splitCourses.part1.trim());
      else if (fieldType === 'prof') onSave(fullProfs.join(', '));
      else onSave(splitRooms.part1.trim());
    } else {
      const p1Course = splitCourses.part1.trim();
      const p2Course = splitCourses.part2.trim();
      const p1Prof = splitProfs.part1.join(', ').trim();
      const p2Prof = splitProfs.part2.join(', ').trim();
      const p1Room = splitRooms.part1.trim();
      const p2Room = splitRooms.part2.trim();

      if (fieldType === 'course') {
        if (!p1Course && !p2Course) onSave('');
        else onSave({ type: 'split', part1: p1Course, part2: p2Course });
      } else if (fieldType === 'prof') {
        if (!p1Prof && !p2Prof) onSave('');
        else onSave({ type: 'split', part1: p1Prof, part2: p2Prof });
      } else {
        if (!p1Room && !p2Room) onSave('');
        else onSave({ type: 'split', part1: p1Room, part2: p2Room });
      }
    }
    onClose();
  };

  const currentProfListForCheck = mode === 'full' ? fullProfs : splitProfs[activeHalf];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl h-[88vh] max-h-[720px] flex flex-col border border-gray-150 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header (Altezza fissa) */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-shrink-0 bg-white">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 truncate">
              {titles[fieldType]}
            </h3>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 truncate inline-block">
                {metaInfo.day} • {metaInfo.time} • {metaInfo.stream}
              </span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center font-bold text-sm flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* 2. Pannello Controlli Superiore (Fisso, non genera doppio scroll) */}
        <div className="p-3.5 pb-2 space-y-2.5 flex-shrink-0 bg-white">
          {/* Selettore 90 min vs 45 min */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setMode('full')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'full' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              ⏱️ 90 րոպե (Լրիվ դաս)
            </button>
            <button
              type="button"
              onClick={() => setMode('split')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'split' ? 'bg-white text-amber-700 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              ⏳ 45 րոպե (Կիսված դաս)
            </button>
          </div>

          {/* Schede 1ª ora e 2ª ora con pulsante individuale ✕ di cancellazione */}
          {mode === 'split' && (
            <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-200">
              <div className="text-[10px] font-bold text-amber-900 mb-1 flex justify-between items-center">
                <span>Ընտրեք որ ժամն եք լրացնում.</span>
                <span className="text-amber-800 font-semibold">
                  (Ջնջելու համար սեղմեք ✕-ի վրա)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* Scheda 1-ին ժամ */}
                <div
                  onClick={() => setActiveHalf('part1')}
                  className={`p-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all relative ${
                    activeHalf === 'part1'
                      ? 'bg-white border-amber-500 ring-2 ring-amber-400/30 shadow-xs'
                      : 'bg-white/60 border-amber-200 text-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-700 uppercase">1-ին ժամ (45 ր)</span>
                    {/* Pulsante per eliminare solo la prima ora */}
                    {((fieldType === 'course' && splitCourses.part1) ||
                      (fieldType === 'prof' && splitProfs.part1.length > 0) ||
                      (fieldType === 'room' && splitRooms.part1)) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearSpecificHalf('part1');
                        }}
                        className="w-4 h-4 rounded-full bg-red-100 hover:bg-red-500 text-red-600 hover:text-white flex items-center justify-center text-[10px] font-black transition-colors"
                        title="Մաքրել միայն 1-ին ժամը"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="truncate font-bold text-gray-800 mt-0.5 text-xs">
                    {fieldType === 'course' && (splitCourses.part1 || <span className="text-gray-400 font-normal italic">Դատարկ</span>)}
                    {fieldType === 'prof' && (splitProfs.part1.length > 0 ? splitProfs.part1.join(', ') : <span className="text-gray-400 font-normal italic">Դատարկ</span>)}
                    {fieldType === 'room' && (splitRooms.part1 || <span className="text-gray-400 font-normal italic">Դատարկ</span>)}
                  </div>
                </div>

                {/* Scheda 2-րդ ժամ */}
                <div
                  onClick={() => setActiveHalf('part2')}
                  className={`p-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all relative ${
                    activeHalf === 'part2'
                      ? 'bg-white border-blue-500 ring-2 ring-blue-400/30 shadow-xs'
                      : 'bg-white/60 border-amber-200 text-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">2-րդ ժամ (45 ր)</span>
                    {/* Pulsante per eliminare solo la seconda ora */}
                    {((fieldType === 'course' && splitCourses.part2) ||
                      (fieldType === 'prof' && splitProfs.part2.length > 0) ||
                      (fieldType === 'room' && splitRooms.part2)) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearSpecificHalf('part2');
                        }}
                        className="w-4 h-4 rounded-full bg-red-100 hover:bg-red-500 text-red-600 hover:text-white flex items-center justify-center text-[10px] font-black transition-colors"
                        title="Մաքրել միայն 2-րդ ժամը"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="truncate font-bold text-gray-800 mt-0.5 text-xs">
                    {fieldType === 'course' && (splitCourses.part2 || <span className="text-gray-400 font-normal italic">Դատարկ</span>)}
                    {fieldType === 'prof' && (splitProfs.part2.length > 0 ? splitProfs.part2.join(', ') : <span className="text-gray-400 font-normal italic">Դատարկ</span>)}
                    {fieldType === 'room' && (splitRooms.part2 || <span className="text-gray-400 font-normal italic">Դատարկ</span>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Badge Docenti selezionati (con rimozione per singolo nome) */}
          {fieldType === 'prof' && (
            <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100 flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1 items-center flex-1 overflow-hidden">
                <span className="text-[10px] font-bold text-blue-900 mr-1 flex-shrink-0">
                  {mode === 'split' ? `${activeHalf === 'part1' ? '1-ին' : '2-րդ'} ժամ:` : 'Ընտրված:'}
                </span>
                {currentProfListForCheck.length === 0 ? (
                  <span className="text-xs text-gray-400 italic">Դասախոս ընտրված չէ (առավելագույնը 3)</span>
                ) : (
                  currentProfListForCheck.map((prof) => (
                    <span 
                      key={prof} 
                      className="bg-white text-blue-900 border border-blue-200 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <span className="truncate max-w-[120px]">{prof}</span>
                      <button 
                        type="button" 
                        onClick={() => toggleProfSelection(prof)} 
                        className="text-gray-400 hover:text-red-500 font-black text-xs leading-none"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>
              {currentProfListForCheck.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => {
                    if (mode === 'full') setFullProfs([]);
                    else setSplitProfs((prev) => ({ ...prev, [activeHalf]: [] }));
                  }} 
                  className="text-[10px] text-red-600 font-bold hover:underline flex-shrink-0"
                >
                  Մաքրել
                </button>
              )}
            </div>
          )}

          {/* Barra Ricerca + Pulsante "Գրել նորը" (visibile e accessibile subito in alto) */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="🔍 Որոնել ցանկից..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" 
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Pulsante aggiunta manuale integrato in alto */}
            <button
              type="button"
              onClick={() => setShowManualSection(!showManualSection)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 flex-shrink-0 ${
                showManualSection
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Մուտքագրել նոր անվանում ձեռքով"
            >
              <span>✍️</span>
              <span>Գրել նորը</span>
            </button>
          </div>

          {/* Riquadro compatto per l'inserimento manuale (appare subito qui in alto) */}
          {showManualSection && (
            <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                <span>✍️ Մուտքագրել նոր անվանում.</span>
                <button type="button" onClick={() => setShowManualSection(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Գրեք անվանումը..." 
                  value={manualInput} 
                  onChange={(e) => setManualInput(e.target.value)} 
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 font-medium" 
                  autoFocus
                />
                <button 
                  type="button" 
                  onClick={handleApplyTemporary} 
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-lg border border-gray-300 shadow-2xs flex-shrink-0"
                >
                  ⚡ Կիրառել
                </button>
                <button 
                  type="button" 
                  onClick={handleAddToDatabaseAndApply} 
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs flex-shrink-0"
                >
                  ➕ Բազայում
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. LISTA ELEMENTI (È L'UNICA AREA CHE SCORRE - NESSUN DOPPIO SCROLL!) */}
        <div className="px-3.5 flex-1 min-h-0 overflow-y-auto">
          {/* Elenco Corsi / Docenti */}
          {(fieldType === 'course' || fieldType === 'prof') && (
            <div className="space-y-1.5 pb-2">
              {filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const isOccupiedGlobally = occupiedValues.includes(item);
                  const conflictLoc = conflictDetails[item] || '';

                  const isSelected = fieldType === 'prof'
                    ? currentProfListForCheck.includes(item)
                    : (mode === 'split' ? splitCourses[activeHalf] === item : splitCourses.part1 === item);

                  const isChosenInOtherHalf = mode === 'split' && (
                    fieldType === 'prof' 
                      ? splitProfs[otherHalf].includes(item)
                      : splitCourses[otherHalf] === item
                  );

                  const isLimitReached = fieldType === 'prof' && !isSelected && currentProfListForCheck.length >= MAX_PROFS_LIMIT;
                  const isDisabled = isOccupiedGlobally || isLimitReached || isChosenInOtherHalf;

                  return (
                    <button
                      key={item}
                      type="button"
                      disabled={isDisabled}
                      title={
                        isOccupiedGlobally 
                          ? `Զբաղված է (${conflictLoc})` 
                          : isChosenInOtherHalf 
                            ? `Արդեն ընտրված է ${otherHalf === 'part1' ? '1-ին' : '2-րդ'} ժամի համար`
                            : isLimitReached 
                              ? `Առավելագույն սահմանաչափը (${MAX_PROFS_LIMIT}) լրացված է` 
                              : ''
                      }
                      onClick={() => {
                        if (fieldType === 'prof') toggleProfSelection(item);
                        else handleSelectCourse(item);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between min-h-[40px] ${
                        isOccupiedGlobally
                          ? 'bg-red-50/70 text-gray-400 cursor-not-allowed border border-red-100'
                          : isChosenInOtherHalf
                            ? 'bg-amber-50/70 text-amber-800 cursor-not-allowed border border-amber-200'
                            : isLimitReached
                              ? 'bg-gray-100/60 text-gray-400 cursor-not-allowed opacity-60'
                              : isSelected
                                ? 'bg-blue-600 text-white font-bold shadow-xs'
                                : 'bg-white text-gray-800 border border-gray-150 hover:bg-blue-50 active:bg-blue-100'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate pr-2">
                        {fieldType === 'prof' && (
                          <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px] ${
                            isSelected ? 'border-white bg-white text-blue-600 font-black' : 'border-gray-400 bg-white'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </span>
                        )}
                        <span className="truncate">{item}</span>
                      </span>

                      {isOccupiedGlobally && (
                        <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0">
                          Զբաղված
                        </span>
                      )}
                      {isChosenInOtherHalf && (
                        <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0">
                          Ընտրված է {otherHalf === 'part1' ? '1-ին' : '2-րդ'} ժամում
                        </span>
                      )}
                      {isSelected && fieldType !== 'prof' && (
                        <span className="font-bold text-xs bg-white/20 px-2 py-0.5 rounded-full">✓ Ընտրված</span>
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400 p-6 text-center">Արդյունք չգտնվեց:</p>
              )}
            </div>
          )}

          {/* Griglia Aule */}
          {fieldType === 'room' && (
            <div className="space-y-3 pb-3">
              {Object.keys(roomsByFloor).length > 0 ? (
                Object.entries(roomsByFloor).map(([floor, rooms]) => (
                  <div key={floor}>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 border-l-2 border-blue-500 pl-2">
                      {floor}
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {rooms.map((room) => {
                        const isOccupied = occupiedValues.includes(room);
                        const isSelected = mode === 'split' 
                          ? splitRooms[activeHalf] === room 
                          : splitRooms.part1 === room;

                        return (
                          <button
                            key={room}
                            type="button"
                            disabled={isOccupied}
                            onClick={() => handleSelectRoom(room)}
                            className={`min-h-[40px] py-1 px-1 text-xs font-bold rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                              isOccupied 
                                ? 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-75'
                                : isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-white text-blue-700 border-blue-100 hover:bg-blue-50 active:bg-blue-600 active:text-white'
                            }`}
                          >
                            <span>{room}</span>
                            {isOccupied && <span className="text-[8px] uppercase tracking-tighter text-red-500">Զբաղված</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic py-2">Լսարանների ցանկ չկա:</p>
              )}
            </div>
          )}
        </div>

        {/* 4. Footer (Fisso in basso con pulsanti chiari per svuotare) */}
        <div className="p-3 px-4 bg-gray-50 border-t border-gray-150 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            {mode === 'split' ? (
              <>
                {/* Svuota solo la metà attualmente selezionata */}
                <button 
                  type="button" 
                  onClick={() => handleClearSpecificHalf(activeHalf)} 
                  className="text-xs text-amber-700 hover:text-amber-800 font-bold px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
                  title="Մաքրել միայն ընտրված ժամը"
                >
                  ✕ Մաքրել {activeHalf === 'part1' ? '1-ին' : '2-րդ'} ժամը
                </button>
                {/* Svuota completamente la cella */}
                <button 
                  type="button" 
                  onClick={() => { onSave(''); onClose(); }} 
                  className="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Ջնջել երկու կեսերն էլ"
                >
                  Դատարկել ամբողջը
                </button>
              </>
            ) : (
              <button 
                type="button" 
                onClick={() => { onSave(''); onClose(); }} 
                className="text-xs text-red-600 hover:text-red-700 font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                ✕ Դատարկել
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="text-xs text-gray-600 font-bold px-3 py-2 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              Չեղարկել
            </button>
            <button 
              type="button" 
              onClick={handleSaveFinal}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <span>💾</span> Պահպանել
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};