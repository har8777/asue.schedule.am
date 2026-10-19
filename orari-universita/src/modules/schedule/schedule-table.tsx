import React, { useState } from 'react';
import { EditCellModal } from './edit-cell-modal';

const DAYS = [
  { id: 'monday', label: 'Երկուշաբթի' },
  { id: 'tuesday', label: 'Երեքշաբթի' },
  { id: 'wednesday', label: 'Չորեքշաբթի' },
  { id: 'thursday', label: 'Հինգշաբթի' },
  { id: 'friday', label: 'Ուրբաթ' }
];

const TIMES = [
  '09:00 - 10:20',
  '10:30 - 11:50',
  '12:10 - 13:30',
  '13:40 - 15:00'
];

const STREAMS = [
  { id: 'stream-1', label: '1-ին հոսք' },
  { id: 'stream-2', label: '2-րդ հոսք' },
  { id: 'stream-3', label: '3-րդ հոսք' },
  { id: 'stream-4', label: '4-րդ հոսք' }
];

export const ScheduleTable = ({ scheduleData = {}, onUpdateCell }: any) => {
  const [selectedCell, setSelectedCell] = useState<any>(null);

  const handleCellClick = (dayId: string, time: string, streamId: string, dayLabel: string, streamLabel: string) => {
    const cellId = `${dayId}-${time}-${streamId}`;
    const existingData = scheduleData[cellId] || { subject: '', professor: '', room: '' };
    setSelectedCell({ cellId, day: dayLabel, time, stream: streamLabel, ...existingData });
  };

  return (
    <div className="w-full overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
      <table className="w-full min-w-[1100px] border-collapse text-center text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 w-10" rowSpan={2}>Օր</th>
            <th className="border border-gray-300 p-2 w-28" rowSpan={2}>Ժամ</th>
            {STREAMS.map(stream => (
              <th key={stream.id} colSpan={3} className="border border-gray-300 p-3 text-sm bg-gray-200 text-gray-800">
                {stream.label}
              </th>
            ))}
          </tr>
          <tr className="bg-gray-50 text-xs text-gray-600 font-medium">
            {STREAMS.map(stream => (
              <React.Fragment key={`${stream.id}-sub`}>
                <th className="border border-gray-300 p-2">Դասընթաց</th>
                <th className="border border-gray-300 p-2">Դասախոս</th>
                <th className="border border-gray-300 p-2">Լսարան</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map(day => (
            <React.Fragment key={day.id}>
              {TIMES.map((time, timeIndex) => (
                <tr key={`${day.id}-${time}`} className="hover:bg-blue-50/30 transition-colors">
                  {timeIndex === 0 && (
                    <td 
                      rowSpan={TIMES.length} 
                      className="border border-gray-300 p-2 font-bold bg-gray-50 text-gray-800 tracking-wide"
                      style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                    >
                      {day.label}
                    </td>
                  )}
                  <td className="border border-gray-300 p-2 text-xs font-mono text-gray-600 bg-gray-50 whitespace-nowrap">
                    {time}
                  </td>
                  {STREAMS.map(stream => {
                    const cellId = `${day.id}-${time}-${stream.id}`;
                    const cellData = scheduleData[cellId] || { subject: '', professor: '', room: '' };
                    const hasData = cellData.subject || cellData.professor || cellData.room;

                    return (
                      <React.Fragment key={cellId}>
                        <td 
                          onClick={() => handleCellClick(day.id, time, stream.id, day.label, stream.label)}
                          className={`border border-gray-300 p-2 cursor-pointer font-medium min-w-[120px] transition-colors ${hasData ? 'text-black' : 'text-gray-300 italic hover:bg-blue-100'}`}
                        >
                          {cellData.subject || '+'}
                        </td>
                        <td 
                          onClick={() => handleCellClick(day.id, time, stream.id, day.label, stream.label)}
                          className={`border border-gray-300 p-2 cursor-pointer text-xs transition-colors ${hasData ? 'text-gray-600' : 'text-gray-300 hover:bg-blue-100'}`}
                        >
                          {cellData.professor}
                        </td>
                        <td 
                          onClick={() => handleCellClick(day.id, time, stream.id, day.label, stream.label)}
                          className={`border border-gray-300 p-2 cursor-pointer font-bold text-xs transition-colors ${hasData ? 'text-red-600' : 'text-gray-300 hover:bg-blue-100'}`}
                        >
                          {cellData.room}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {selectedCell && (
        <EditCellModal 
          cellData={selectedCell} 
          onClose={() => setSelectedCell(null)} 
          onSave={(data: any) => {
            onUpdateCell(selectedCell.cellId, data);
            setSelectedCell(null);
          }}
          onDelete={() => {
            onUpdateCell(selectedCell.cellId, null);
            setSelectedCell(null);
          }}
        />
      )}
    </div>
  );
};