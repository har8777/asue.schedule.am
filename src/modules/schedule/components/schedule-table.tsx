import React, { useState } from 'react';
import { EditCellModal } from './edit-cell-modal';

const DAYS = [
  { id: 'monday', label: 'Երկուշաբթի' },
  { id: 'tuesday', label: 'Երեքշաբթի' },
  { id: 'wednesday', label: 'Չորեքշաբթի' },
  { id: 'thursday', label: 'Հինգշաբթի' },
  { id: 'friday', label: 'Ուրբաթ' }
];

const STREAMS = [
  { id: 'stream-1', label: '1-ին հոսք' },
  { id: 'stream-2', label: '2-րդ հոսք' },
  { id: 'stream-3', label: '3-րդ հոսք' },
  { id: 'stream-4', label: '4-րդ հոսք' }
];

interface ScheduleTableProps {
  facultyName?: string;
  selectedYear?: string;
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

  const [activeMobileStream, setActiveMobileStream] = useState<string>('stream-1');

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
          {STREAMS.map((s) => (
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
              Ժամ {isSuperAdmin && <span className="text-amber-500 text-[10px] block font-normal print:hidden">(Խմբագրելի)</span>}
            </th>
            {STREAMS.map((stream, idx) => (
              <th
                key={stream.id}
                colSpan={3}
                className={`p-2 text-xs font-bold ${isDarkMode ? 'bg-slate-750 text-slate-100' : 'bg-slate-200 text-slate-900'} ${
                  idx < STREAMS.length - 1 ? 'border-r-2 border-r-slate-600' : ''
                }`}
              >
                {stream.label}
              </th>
            ))}
          </tr>

          <tr className={`text-[11px] font-semibold h-8 border-b-2 border-slate-700 ${isDarkMode ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
            {STREAMS.map((stream, streamIdx) => (
              <React.Fragment key={`${stream.id}-sub`}>
                <th className={`border-r px-1 py-1 font-medium truncate ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}`}>Դասընթաց</th>
                <th className={`border-r px-1 py-1 font-medium truncate ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}`}>Դասախոս</th>
                <th className={`px-1 py-1 font-medium truncate ${streamIdx < STREAMS.length - 1 ? 'border-r-2 border-r-slate-600' : ''}`}>Լսարան</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {DAYS.map((day) => (
            <React.Fragment key={day.id}>
              {timeSlots.map((time, timeIndex) => {
                const isLastSlotOfDay = timeIndex === timeSlots.length - 1;
                const bottomBorderClass = isLastSlotOfDay ? 'border-b-2 border-b-slate-700' : isDarkMode ? 'border-b border-slate-750' : 'border-b border-gray-200';

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

                    <td className={`border-r-2 border-r-slate-600 p-1 text-xs font-mono font-bold whitespace-nowrap ${isDarkMode ? 'bg-slate-800/50 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                      {isSuperAdmin ? (
                        <input
                          type="text"
                          value={time}
                          onChange={(e) => onUpdateTimeSlot && onUpdateTimeSlot(timeIndex, e.target.value)}
                          className="w-full text-center bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 focus:bg-white focus:text-gray-900 rounded px-1 py-0.5 border border-amber-300 text-xs font-mono font-bold"
                        />
                      ) : (
                        time
                      )}
                    </td>

                    {STREAMS.map((stream, streamIdx) => {
                      const cellId = `${day.id}-${time}-${stream.id}`;
                      const data = scheduleData[cellId] || { course: '', prof: '', room: '' };
                      const isLastStream = streamIdx === STREAMS.length - 1;
                      const isNew = isRecentlyModified(data);

                      return (
                        <React.Fragment key={cellId}>
                          <td
                            onClick={() => openFieldModal(cellId, 'course', data.course, day.id, day.label, time, stream.id, stream.label)}
                            className={`border-r px-1.5 py-1 align-middle transition-colors overflow-hidden ${
                              isDarkMode ? 'border-slate-700 hover:bg-blue-900/20' : 'border-gray-200 hover:bg-blue-50'
                            } ${(isAdmin || isSuperAdmin) ? 'cursor-pointer' : ''}`}
                          >
                            {renderCourseContent(data.course, isNew)}
                          </td>

                          <td
                            onClick={() => openFieldModal(cellId, 'prof', data.prof, day.id, day.label, time, stream.id, stream.label)}
                            className={`border-r px-1.5 py-1 align-middle transition-colors overflow-hidden ${
                              isDarkMode ? 'border-slate-700 hover:bg-blue-900/20' : 'border-gray-200 hover:bg-blue-50'
                            } ${(isAdmin || isSuperAdmin) ? 'cursor-pointer' : ''}`}
                          >
                            {renderProfContent(data.prof)}
                          </td>

                          <td
                            onClick={() => openFieldModal(cellId, 'room', data.room, day.id, day.label, time, stream.id, stream.label)}
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