import os

table_path = "src/modules/schedule/components/schedule-table.tsx"

table_code = r"""import React, { useState, useEffect } from 'react';
import { EditCellModal } from './edit-cell-modal';

const DAYS = [
  { id: 'monday', label: 'Երկուշաբթի' },
  { id: 'tuesday', label: 'Երեքշաբթի' },
  { id: 'wednesday', label: 'Չորեքշաբթի' },
  { id: 'thursday', label: 'Հինգշաբթի' },
  { id: 'friday', label: 'Ուրբաթ' }
];

const DEFAULT_STREAMS = [
  { id: 'stream-1', label: '1-ին հոսք' },
  { id: 'stream-2', label: '2-րդ հոսք' },
  { id: 'stream-3', label: '3-րդ հոսք' },
  { id: 'stream-4', label: '4-րդ հոսք' }
];

interface ScheduleTableProps {
  facultyName?: string;
  selectedYear?: string;
  selectedDepartment?: string;
  scheduleData?: any;
  onUpdateCell: (cellId: string, data: any) => void;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  timeSlots?: string[];
  viewMode?: 'table' | 'cards';
  highlightedLecturer?: string;
  isDarkMode?: boolean;
  onUpdateTimeSlot?: (index: number, newTime: string) => void;
  getGlobalConflicts?: (
    dayId: string,
    time: string,
    faculty: string,
    year: string,
    streamId: string,
    fieldType: 'prof' | 'room'
  ) => { occupiedNames: string[]; conflictDetails: Record<string, string> };
}

export const ScheduleTable = ({
  facultyName = '',
  selectedYear = '1-ին կուրս',
  selectedDepartment = '',
  scheduleData = {},
  onUpdateCell,
  isAdmin = true,
  isSuperAdmin = false,
  timeSlots = ['1-2', '3-4', '5-6', '7-8'],
  viewMode = 'table',
  highlightedLecturer = '',
  isDarkMode = false,
  onUpdateTimeSlot,
  getGlobalConflicts
}: ScheduleTableProps) => {
  const [modalState, setModalState] = useState<{
    cellId: string;
    fieldType: 'course' | 'prof' | 'room';
    currentValue: any;
    metaInfo: { day: string; time: string; stream: string };
    occupiedValues: string[];
    conflictDetails: Record<string, string>;
    isCellAlreadySplit: boolean;
  } | null>(null);

  const [editingStream, setEditingStream] = useState<{ id: string; name: string } | null>(null);
  const [streamNames, setStreamNames] = useState<Record<string, string>>({});

  const storageKey = `asue_streams_${facultyName}_${selectedDepartment}_${selectedYear}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setStreamNames(JSON.parse(saved));
      } catch {
        setStreamNames({});
      }
    } else {
      setStreamNames({});
    }
  }, [storageKey]);

  const handleSaveStreamName = () => {
    if (!editingStream) return;
    const updated = { ...streamNames, [editingStream.id]: editingStream.name.trim() };
    setStreamNames(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setEditingStream(null);
  };

  const getStreamLabel = (streamId: string, defaultLabel: string) => {
    return streamNames[streamId] || defaultLabel;
  };

  // Calcolo opzioni ammesse: l'ultima ora calcolata NON deve mai superare il 18
  const slotsCount = timeSlots.length || 4;
  const maxAllowableEndForFirstSlot = 18 - (slotsCount - 1) * 2; // Per 4 slot: 18 - 6 = 12 (max 11-12)

  const allowedStartOptions: string[] = [];
  for (let end = 2; end <= maxAllowableEndForFirstSlot; end += 2) {
    allowedStartOptions.push(`${end - 1}-${end}`);
  }

  // Aggiornamento a catena con blocco rigoroso al valore 17-18
  const handleFirstSlotChange = (selectedSlot: string) => {
    if (!selectedSlot || !onUpdateTimeSlot) return;

    const match = selectedSlot.match(/^(\d+)-(\d+)$/);
    if (!match) return;

    const startNum = parseInt(match[1], 10);
    const endNum = parseInt(match[2], 10);

    timeSlots.forEach((_, idx) => {
      const calculatedStart = startNum + idx * 2;
      const calculatedEnd = endNum + idx * 2;

      // Protezione: blocca a 17-18 e non genera mai numeri superiori
      if (calculatedEnd <= 18) {
        onUpdateTimeSlot(idx, `${calculatedStart}-${calculatedEnd}`);
      } else {
        onUpdateTimeSlot(idx, '17-18');
      }
    });
  };

  const openFieldModal = (
    cellId: string,
    fieldType: 'course' | 'prof' | 'room',
    currentValue: any,
    dayId: string,
    dayLabel: string,
    time: string,
    streamId: string,
    streamLabel: string
  ) => {
    if (!isAdmin && !isSuperAdmin) return;

    let occupied: string[] = [];
    let conflictDetails: Record<string, string> = {};

    if (getGlobalConflicts && (fieldType === 'prof' || fieldType === 'room')) {
      const globalRes = getGlobalConflicts(dayId, time, facultyName, selectedYear, streamId, fieldType);
      occupied = globalRes.occupiedNames;
      conflictDetails = globalRes.conflictDetails;
    }

    const currentCell = scheduleData[cellId] || {};
    const isCellAlreadySplit =
      (currentCell.course && typeof currentCell.course === 'object' && currentCell.course.type === 'split') ||
      (currentCell.prof && typeof currentCell.prof === 'object' && currentCell.prof.type === 'split') ||
      (currentCell.room && typeof currentCell.room === 'object' && currentCell.room.type === 'split');

    setModalState({
      cellId,
      fieldType,
      currentValue,
      metaInfo: { day: dayLabel, time, stream: streamLabel },
      occupiedValues: occupied,
      conflictDetails,
      isCellAlreadySplit
    });
  };

  const handleFieldValueSave = (value: any) => {
    if (!modalState) return;
    const existing = scheduleData[modalState.cellId] || { course: '', prof: '', room: '' };
    onUpdateCell(modalState.cellId, { ...existing, [modalState.fieldType]: value });
  };

  const isRecentlyModified = (cell: any) => cell?._updatedAt && (Date.now() - cell._updatedAt < 48 * 60 * 60 * 1000);

  const renderCourseContent = (courseData: any, isNew: boolean) => {
    if (!courseData) return <span className={isDarkMode ? 'text-slate-600' : 'text-gray-300'}>{(isAdmin || isSuperAdmin) ? '+' : '-'}</span>;

    if (typeof courseData === 'object' && courseData.type === 'split') {
      return (
        <div className="relative flex flex-col h-full justify-between py-1 text-left">
          {isNew && <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-black px-1 rounded-full uppercase shadow-xs">Նոր</span>}
          <div className="flex items-start gap-1 pb-1">
            <span className="bg-amber-100 text-amber-900 text-[8px] font-extrabold px-1 py-0.5 rounded flex-shrink-0">1-ին</span>
            <span className={`text-[10px] font-semibold line-clamp-1 leading-tight break-words ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
              {courseData.part1 || <span className="opacity-40 italic">—</span>}
            </span>
          </div>
          <div className={`border-t border-dashed my-0.5 ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}`} />
          <div className="flex items-start gap-1 pt-0.5">
            <span className="bg-blue-100 text-blue-900 text-[8px] font-extrabold px-1 py-0.5 rounded flex-shrink-0">2-րդ</span>
            <span className={`text-[10px] font-semibold line-clamp-1 leading-tight break-words ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
              {courseData.part2 || <span className="opacity-40 italic">—</span>}
            </span>
          </div>
        </div>
      );
    }

    const title = typeof courseData === 'string' ? courseData : courseData.part1 || '';
    return (
      <div className="relative">
        {isNew && <span className="absolute -top-1.5 -right-1 bg-amber-500 text-white text-[8px] font-black px-1 rounded-full uppercase shadow-xs">Նոր</span>}
        <div className={`line-clamp-3 overflow-hidden break-words font-semibold text-[11px] leading-snug ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`} title={title}>
          {title || ((isAdmin || isSuperAdmin) ? '+' : '-')}
        </div>
      </div>
    );
  };

  const renderProfContent = (profData: any) => {
    if (!profData) return <span className={isDarkMode ? 'text-slate-600' : 'text-gray-300'}>{(isAdmin || isSuperAdmin) ? '+' : '-'}</span>;

    const renderProfBadges = (profString: string) => {
      const list = profString ? profString.split(',').map((p) => p.trim()).filter(Boolean) : [];
      if (list.length === 0) return <span className="opacity-40 italic font-normal text-[10px]">—</span>;

      return (
        <div className="flex flex-col gap-0.5">
          {list.map((prof, pIdx) => {
            const matchesThisProf = highlightedLecturer && prof.includes(highlightedLecturer);
            return (
              <span
                key={pIdx}
                className={`text-[9px] leading-tight px-1 py-0.5 rounded truncate font-medium block border ${
                  matchesThisProf
                    ? 'bg-amber-300 text-amber-950 font-black border-amber-500 shadow-xs'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'text-slate-700 bg-slate-100 border-slate-200/80'
                }`}
              >
                {prof}
              </span>
            );
          })}
        </div>
      );
    };

    if (typeof profData === 'object' && profData.type === 'split') {
      return (
        <div className="flex flex-col h-full justify-between py-1 text-left">
          <div className="flex items-start gap-1 pb-1">
            <span className="bg-amber-100 text-amber-900 text-[8px] font-extrabold px-1 py-0.5 rounded flex-shrink-0">1-ին</span>
            <div className="flex-1 min-w-0">{renderProfBadges(profData.part1)}</div>
          </div>
          <div className={`border-t border-dashed my-0.5 ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}`} />
          <div className="flex items-start gap-1 pt-0.5">
            <span className="bg-blue-100 text-blue-900 text-[8px] font-extrabold px-1 py-0.5 rounded flex-shrink-0">2-րդ</span>
            <div className="flex-1 min-w-0">{renderProfBadges(profData.part2)}</div>
          </div>
        </div>
      );
    }

    return renderProfBadges(typeof profData === 'string' ? profData : profData.part1 || '');
  };

  const renderRoomContent = (roomData: any) => {
    if (!roomData) return <span className={isDarkMode ? 'text-slate-600' : 'text-gray-300'}>{(isAdmin || isSuperAdmin) ? '+' : '-'}</span>;

    if (typeof roomData === 'object' && roomData.type === 'split') {
      return (
        <div className="flex flex-col h-full justify-between py-1 text-center">
          <div className="flex items-center justify-center gap-1 pb-1">
            <span className="bg-amber-100 text-amber-900 text-[8px] font-extrabold px-1 py-0.5 rounded flex-shrink-0">1-ին</span>
            <span className="text-[10px] font-bold text-blue-500 font-mono">{roomData.part1 || '—'}</span>
          </div>
          <div className={`border-t border-dashed my-0.5 ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}`} />
          <div className="flex items-center justify-center gap-1 pt-0.5">
            <span className="bg-blue-100 text-blue-900 text-[8px] font-extrabold px-1 py-0.5 rounded flex-shrink-0">2-րդ</span>
            <span className="text-[10px] font-bold text-blue-500 font-mono">{roomData.part2 || '—'}</span>
          </div>
        </div>
      );
    }

    return (
      <span className="text-xs font-bold font-mono text-blue-500">
        {typeof roomData === 'string' ? roomData : roomData.part1 || ((isAdmin || isSuperAdmin) ? '+' : '-')}
      </span>
    );
  };

  return (
    <div className={`w-full overflow-x-auto rounded-xl shadow-md border-2 transition-colors print:border-none print:shadow-none ${
      isDarkMode ? 'bg-slate-850 border-slate-700 text-slate-200' : 'bg-white border-slate-700 text-slate-800'
    }`}>
      <table className="w-full min-w-[1360px] table-fixed border-collapse text-center print:min-w-full">
        <colgroup>
          <col className="w-10" />
          <col className="w-20" />
          {DEFAULT_STREAMS.map((s) => (
            <React.Fragment key={s.id}>
              <col className="w-[160px]" />
              <col className="w-[140px]" />
              <col className="w-[60px]" />
            </React.Fragment>
          ))}
        </colgroup>

        <thead>
          <tr className={`h-10 border-b-2 border-slate-700 print:bg-gray-200 ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
            <th className="border-r-2 border-slate-600 p-2 font-bold text-xs" rowSpan={2}>Օր</th>
            <th className="border-r-2 border-slate-600 p-2 font-bold text-xs" rowSpan={2}>
              Ժամ {(isAdmin || isSuperAdmin) && <span className="text-amber-500 text-[10px] block font-normal print:hidden">(Խմբագրելի)</span>}
            </th>
            {DEFAULT_STREAMS.map((stream, idx) => {
              const label = getStreamLabel(stream.id, stream.label);
              return (
                <th
                  key={stream.id}
                  colSpan={3}
                  className={`p-2 text-xs font-bold ${isDarkMode ? 'bg-slate-750 text-slate-100' : 'bg-slate-200 text-slate-900'} ${
                    idx < DEFAULT_STREAMS.length - 1 ? 'border-r-2 border-r-slate-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>{label}</span>
                    {(isAdmin || isSuperAdmin) && (
                      <button
                        onClick={() => setEditingStream({ id: stream.id, name: label })}
                        className="cursor-pointer opacity-40 hover:opacity-100 text-xs p-1 hover:bg-slate-300 dark:hover:bg-slate-600 rounded transition-all print:hidden"
                        title="Փոխել հոսքի անվանումը"
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>

          <tr className={`text-[11px] font-semibold h-8 border-b-2 border-slate-700 ${isDarkMode ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
            {DEFAULT_STREAMS.map((stream, streamIdx) => (
              <React.Fragment key={`${stream.id}-sub`}>
                <th className={`border-r px-1 py-1 font-medium truncate ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}`}>Դասընթաց</th>
                <th className={`border-r px-1 py-1 font-medium truncate ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}`}>Դասախոս</th>
                <th className={`px-1 py-1 font-medium truncate ${streamIdx < DEFAULT_STREAMS.length - 1 ? 'border-r-2 border-r-slate-600' : ''}`}>Լսարան</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {DAYS.map((day, dayIndex) => (
            <React.Fragment key={day.id}>
              {timeSlots.map((time, timeIndex) => {
                const isLastSlotOfDay = timeIndex === timeSlots.length - 1;
                const bottomBorderClass = isLastSlotOfDay ? 'border-b-2 border-b-slate-700' : isDarkMode ? 'border-b border-slate-750' : 'border-b border-gray-200';

                // Solo la prima riga ha il selettore
                const isMasterSlotSelector = (isAdmin || isSuperAdmin) && dayIndex === 0 && timeIndex === 0;

                return (
                  <tr key={`${day.id}-${time}`} className={`min-h-[58px] transition-colors ${bottomBorderClass} ${isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-blue-50/25'}`}>
                    {timeIndex === 0 && (
                      <td
                        rowSpan={timeSlots.length}
                        className={`border-r-2 border-r-slate-600 border-b-2 border-b-slate-700 p-1 font-bold text-xs tracking-wider ${
                          isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-800'
                        }`}
                        style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                      >
                        {day.label}
                      </td>
                    )}

                    <td className={`border-r-2 border-slate-600 p-1 text-xs font-mono font-bold whitespace-nowrap ${isDarkMode ? 'bg-slate-800/50 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                      {isMasterSlotSelector ? (
                        <select
                          value={allowedStartOptions.includes(time) ? time : allowedStartOptions[0]}
                          onChange={(e) => handleFirstSlotChange(e.target.value)}
                          className="w-full text-center bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 focus:bg-white focus:text-gray-900 rounded px-1 py-1 border border-amber-300 text-xs font-mono font-bold outline-none cursor-pointer appearance-none shadow-xs"
                          title="Ընտրեք առաջին դասաժամը (մաքսիմում մինչև 11-12)"
                        >
                          {/* Se il valore attuale è fuori limite (es. 17-18 vecchio), lo mostriamo come avviso prima del reset */}
                          {!allowedStartOptions.includes(time) && (
                            <option value={time} disabled>{time} (Անվավեր)</option>
                          )}
                          {allowedStartOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="block text-center py-1">{time}</span>
                      )}
                    </td>

                    {DEFAULT_STREAMS.map((stream, streamIdx) => {
                      const cellId = `${day.id}-${time}-${stream.id}`;
                      const data = scheduleData[cellId] || { course: '', prof: '', room: '' };
                      const isLastStream = streamIdx === DEFAULT_STREAMS.length - 1;
                      const isNew = isRecentlyModified(data);
                      const currentStreamLabel = getStreamLabel(stream.id, stream.label);

                      return (
                        <React.Fragment key={cellId}>
                          <td
                            onClick={() => openFieldModal(cellId, 'course', data.course, day.id, day.label, time, stream.id, currentStreamLabel)}
                            className={`border-r px-1.5 py-1 align-middle transition-colors overflow-hidden ${
                              isDarkMode ? 'border-slate-700 hover:bg-blue-900/20' : 'border-gray-200 hover:bg-blue-50'
                            } ${(isAdmin || isSuperAdmin) ? 'cursor-pointer' : ''}`}
                          >
                            {renderCourseContent(data.course, isNew)}
                          </td>

                          <td
                            onClick={() => openFieldModal(cellId, 'prof', data.prof, day.id, day.label, time, stream.id, currentStreamLabel)}
                            className={`border-r px-1.5 py-1 align-middle transition-colors overflow-hidden ${
                              isDarkMode ? 'border-slate-700 hover:bg-blue-900/20' : 'border-gray-200 hover:bg-blue-50'
                            } ${(isAdmin || isSuperAdmin) ? 'cursor-pointer' : ''}`}
                          >
                            {renderProfContent(data.prof)}
                          </td>

                          <td
                            onClick={() => openFieldModal(cellId, 'room', data.room, day.id, day.label, time, stream.id, currentStreamLabel)}
                            className={`p-1 text-xs font-bold align-middle transition-colors ${
                              !isLastStream ? 'border-r-2 border-r-slate-600' : ''
                            } ${isDarkMode ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50'} ${(isAdmin || isSuperAdmin) ? 'cursor-pointer' : ''}`}
                          >
                            {renderRoomContent(data.room)}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* POPUP MODIFICA NOME FLUSSO */}
      {editingStream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setEditingStream(null)}>
          <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl border ${isDarkMode ? 'bg-slate-850 border-slate-700 text-slate-100' : 'bg-white border-gray-200 text-gray-800'}`} onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <span>✏️</span> Փոխել հոսքի անվանումը
            </h3>
            <p className="text-xs opacity-70 mb-4 leading-relaxed">
              Մուտքագրեք հոսքի նոր անվանումը:
            </p>
            <input
              type="text"
              value={editingStream.name}
              onChange={(e) => setEditingStream({ ...editingStream, name: e.target.value })}
              className={`w-full p-2.5 rounded-lg border font-bold text-sm mb-5 outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-gray-300'}`}
              autoFocus
            />
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingStream(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Չեղարկել (Annulla)
              </button>
              <button
                type="button"
                onClick={handleSaveStreamName}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Պահպանել (Salva)
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState && (
        <EditCellModal
          facultyName={facultyName}
          fieldType={modalState.fieldType}
          currentValue={modalState.currentValue}
          metaInfo={modalState.metaInfo}
          occupiedValues={modalState.occupiedValues}
          conflictDetails={modalState.conflictDetails}
          isCellAlreadySplit={modalState.isCellAlreadySplit}
          onSave={handleFieldValueSave}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
};
"""

with open(table_path, "w", encoding="utf-8") as f:
    f.write(table_code)

print("✅ Limite 17-18 applicato: opzioni oltre 11-12 bloccate nel menu di avvio!")