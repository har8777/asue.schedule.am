import { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { FACULTIES, FACULTY_LISTS, FACULTY_ROOMS, type FacultyLists } from '../schedule.constants';

export type UserRole = 'student' | 'admin' | 'superadmin' | null;

export const ACADEMIC_YEARS = [
  { id: '1', label: '1-ին կուրս' },
  { id: '2', label: '2-րդ կուրս' },
  { id: '3', label: '3-րդ կուրս' },
  { id: '4', label: '4-րդ կուրս' },
  { id: '5', label: '5-րդ կուրս (Մագիստրատուրա)' }
];

export interface ChangeLogEntry {
  id: string;
  timestamp: string;
  faculty: string;
  year: string;
  day: string;
  time: string;
  stream: string;
  field: string;
  oldValue: string;
  newValue: string;
  isRead?: boolean;
}

export const FACULTY_ACCOUNTS: Record<string, { faculty: string; defaultPass: string; aliases: string[] }> = {
  karavarum: {
    faculty: 'Կառավարման ֆակուլտետ',
    defaultPass: 'admin',
    aliases: ['karavarum', 'կառավարում', 'management']
  },
  finans: {
    faculty: 'Ֆինանսական ֆակուլտետ',
    defaultPass: 'admin',
    aliases: ['finans', 'ֆինանս', 'finance']
  },
  tntesagitutyun: {
    faculty: 'Տնտեսագիտության տեսության ֆակուլտետ',
    defaultPass: 'admin',
    aliases: ['tntesagitutyun', 'տնտեսագիտություն', 'theory']
  },
  marketing: {
    faculty: 'Շուկայագիտության և բիզնեսի կազմակերպման ֆակուլտետ',
    defaultPass: 'admin',
    aliases: ['marketing', 'մարքեթինգ']
  },
  hashvapah: {
    faculty: 'Հաշվապահական հաշվառման և աուդիտի ֆակուլտետ',
    defaultPass: 'admin',
    aliases: ['hashvapah', 'հաշվապահություն', 'audit']
  },
  informatika: {
    faculty: 'Ինֆորմատիկայի և վիճակագրության ֆակուլտետ',
    defaultPass: 'admin',
    aliases: ['informatika', 'ինֆորմատիկա', 'statistics']
  }
};

export function useSchedule() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [adminFaculty, setAdminFaculty] = useState<string | null>(null);
  const [activeFaculty, setActiveFaculty] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('1-ին կուրս');
  const [highlightedLecturer, setHighlightedLecturer] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('APP_DARK_MODE') === 'true';
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('APP_DARK_MODE', String(next));
      return next;
    });
  };

  const [allSchedules, setAllSchedules] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('APP_ALL_SCHEDULES');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [historyPast, setHistoryPast] = useState<any[]>([]);
  const [historyFuture, setHistoryFuture] = useState<any[]>([]);

  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('APP_CHANGE_LOG');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [timeSlots, setTimeSlots] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('APP_TIME_SLOTS');
      return saved ? JSON.parse(saved) : ['1-2', '3-4', '5-6', '7-8'];
    } catch {
      return ['1-2', '3-4', '5-6', '7-8'];
    }
  });

  useEffect(() => {
    localStorage.setItem('APP_ALL_SCHEDULES', JSON.stringify(allSchedules));
  }, [allSchedules]);

  useEffect(() => {
    localStorage.setItem('APP_TIME_SLOTS', JSON.stringify(timeSlots));
  }, [timeSlots]);

  useEffect(() => {
    localStorage.setItem('APP_CHANGE_LOG', JSON.stringify(changeLog));
  }, [changeLog]);

  const isAdmin = userRole === 'admin';
  const isSuperAdmin = userRole === 'superadmin';
  const currentSchedule = (activeFaculty && allSchedules[activeFaculty]?.[selectedYear]) || {};

  const undo = () => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, historyPast.length - 1);
    setHistoryFuture((prev) => [allSchedules, ...prev]);
    setHistoryPast(newPast);
    setAllSchedules(previous);
  };

  const redo = () => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);
    setHistoryPast((prev) => [...prev, allSchedules]);
    setHistoryFuture(newFuture);
    setAllSchedules(next);
  };

  const markLogAsRead = (logId: string) => {
    setChangeLog((prev) => prev.map((log) => log.id === logId ? { ...log, isRead: true } : log));
  };

  const clearAllLogs = () => {
    if (confirm('Համոզվա՞ծ եք, որ ցանկանում եք ջնջել բոլոր ծանուցումները:')) {
      setChangeLog([]);
    }
  };

  const updateCell = (cellId: string, data: any) => {
    if (!activeFaculty || (!isAdmin && !isSuperAdmin)) return;

    setHistoryPast((prev) => [...prev.slice(-25), allSchedules]);
    setHistoryFuture([]);

    const oldCellData = allSchedules[activeFaculty]?.[selectedYear]?.[cellId] || {};

    const parts = cellId.split('-');
    const day = parts[0];
    const time = parts[1];
    const stream = parts.slice(2).join('-');

    const formatVal = (v: any) => {
      if (!v) return '—';
      if (typeof v === 'object' && v.type === 'split') {
        return `[1-ին: ${v.part1 || '—'} | 2-րդ: ${v.part2 || '—'}]`;
      }
      return String(v);
    };

    const newLogEntry: ChangeLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString('hy-AM', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      faculty: activeFaculty,
      year: selectedYear,
      day,
      time,
      stream,
      field: 'Դասացուցակ',
      oldValue: `${formatVal(oldCellData.course)} / ${formatVal(oldCellData.prof)} / ${formatVal(oldCellData.room)}`,
      newValue: data ? `${formatVal(data.course)} / ${formatVal(data.prof)} / ${formatVal(data.room)}` : 'Ջնջված',
      isRead: false
    };

    setChangeLog((prev) => [newLogEntry, ...prev.slice(0, 50)]);

    setAllSchedules((prev: any) => {
      const facultyData = { ...(prev[activeFaculty] || {}) };
      const yearSchedule = { ...(facultyData[selectedYear] || {}) };

      if (data === null || data === '') {
        delete yearSchedule[cellId];
      } else {
        yearSchedule[cellId] = {
          ...data,
          _updatedAt: Date.now()
        };
      }

      facultyData[selectedYear] = yearSchedule;
      return { ...prev, [activeFaculty]: facultyData };
    });
  };

  const updateTimeSlot = (index: number, newTime: string) => {
    const updated = [...timeSlots];
    updated[index] = newTime;
    setTimeSlots(updated);
  };

  const getRoomStatuses = useCallback(
    (dayId: string, time: string | 'all', faculty: string) => {
      const facultyRoomsDict = FACULTY_ROOMS[faculty] || {};
      const occupiedRooms = new Set<string>();

      Object.keys(allSchedules).forEach((fac) => {
        Object.keys(allSchedules[fac] || {}).forEach((yr) => {
          Object.keys(allSchedules[fac][yr] || {}).forEach((cId) => {
            if (cId.startsWith(`${dayId}-`)) {
              const matchesTime = time === 'all' ? true : cId.startsWith(`${dayId}-${time}-`);

              if (matchesTime) {
                const cell = allSchedules[fac][yr][cId];
                if (cell?.room) {
                  if (typeof cell.room === 'string') {
                    cell.room.split(',').forEach((r: string) => occupiedRooms.add(r.trim()));
                  } else if (typeof cell.room === 'object' && cell.room.type === 'split') {
                    if (cell.room.part1) occupiedRooms.add(cell.room.part1.trim());
                    if (cell.room.part2) occupiedRooms.add(cell.room.part2.trim());
                  }
                }
              }
            }
          });
        });
      });

      const statusesByFloor: Record<string, Array<{ room: string; isFree: boolean }>> = {};
      Object.entries(facultyRoomsDict).forEach(([floor, rooms]) => {
        statusesByFloor[floor] = rooms.map((room) => ({
          room,
          isFree: !occupiedRooms.has(room)
        }));
      });

      return statusesByFloor;
    },
    [allSchedules]
  );

  const generateIcsCalendar = (streamId: string) => {
    if (!activeFaculty) return;
    const schedule = allSchedules[activeFaculty]?.[selectedYear] || {};

    const dayOffsets: Record<string, number> = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 };
    const timeMap: Record<string, { start: string; end: string }> = { '1-2': { start: '093000', end: '110000' }, '3-4': { start: '111500', end: '124500' }, '5-6': { start: '131500', end: '144500' }, '7-8': { start: '150000', end: '163000' } };
    
    let icsContent = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ASUE//Academic Schedule//HY', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diffToMonday));

    const formatDate = (date: Date, timeStr: string) => `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}T${timeStr}`;

    Object.entries(schedule).forEach(([cellId, cell]: [string, any]) => {
      if (!cell || !cellId.endsWith(streamId)) return;
      const [dayId, timeSlot] = cellId.split('-');
      const offset = dayOffsets[dayId];
      if (!offset) return;

      const eventDate = new Date(monday);
      eventDate.setDate(monday.getDate() + offset - 1);
      const times = timeMap[timeSlot] || { start: '093000', end: '110000' };

      const addEvent = (summary: string, prof: string, room: string, startT: string, endT: string) => {
        if (!summary) return;
        icsContent.push('BEGIN:VEVENT', `UID:${cellId}-${startT}@asue.am`, `DTSTAMP:${formatDate(new Date(), '000000')}Z`, `DTSTART:${formatDate(eventDate, startT)}`, `DTEND:${formatDate(eventDate, endT)}`, `RRULE:FREQ=WEEKLY;COUNT=16`, `SUMMARY:${summary} (${activeFaculty})`, `DESCRIPTION:Դասախոս՝ ${prof || '—'} | Կուրս՝ ${selectedYear}`, `LOCATION:Լսարան ${room || '—'}`, 'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', `DESCRIPTION:Դասի հիշեցում՝ ${summary}`, 'END:VALARM', 'END:VEVENT');
      };

      if (typeof cell.course === 'object' && cell.course?.type === 'split') {
        const midTime = timeSlot === '1-2' ? '101500' : '120000';
        addEvent(cell.course.part1, typeof cell.prof === 'object' ? cell.prof.part1 : cell.prof, typeof cell.room === 'object' ? cell.room.part1 : cell.room, times.start, midTime);
        addEvent(cell.course.part2, typeof cell.prof === 'object' ? cell.prof.part2 : '', typeof cell.room === 'object' ? cell.room.part2 : '', midTime, times.end);
      } else {
        addEvent(typeof cell.course === 'string' ? cell.course : '', typeof cell.prof === 'string' ? cell.prof : '', typeof cell.room === 'string' ? cell.room : '', times.start, times.end);
      }
    });

    icsContent.push('END:VCALENDAR');
    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `asue_schedule_${streamId}.ics`; link.click(); URL.revokeObjectURL(url);
  };

  const generateConflictReport = useCallback(() => {
    const conflicts: Array<{ type: 'Prof' | 'Room', name: string, day: string, time: string, details: string[] }> = [];
    const tracker: Record<string, Record<'prof'|'room', Record<string, string[]>>> = {};

    const dayLabels: Record<string, string> = { monday: 'Երկուշաբթի', tuesday: 'Երեքշաբթի', wednesday: 'Չորեքշաբթի', thursday: 'Հինգշաբթի', friday: 'Ուրբաթ' };

    const addTrack = (day: string, time: string, half: string, type: 'prof'|'room', name: string, location: string) => {
      if (!name || name === '—') return;
      const key = `${day}-${time}-${half}`;
      if (!tracker[key]) tracker[key] = { prof: {}, room: {} };
      
      const names = name.split(',').map(n => n.trim()).filter(Boolean);
      names.forEach(n => {
        if (!tracker[key][type][n]) tracker[key][type][n] = [];
        tracker[key][type][n].push(location);
      });
    };

    Object.entries(allSchedules).forEach(([fac, facData]) => {
      if (!facData) return;
      Object.entries(facData as Record<string, any>).forEach(([yr, yrData]) => {
        if (!yrData) return;
        Object.entries(yrData as Record<string, any>).forEach(([cId, cell]) => {
          if (!cell) return;
          const parts = cId.split('-');
          const day = dayLabels[parts[0]] || parts[0];
          const time = parts[1];
          const stream = `${parts[parts.length - 1]}-ին հոսք`;
          const location = `${fac.replace(' ֆակուլտետ', '')} | ${yr} | ${stream}`;

          if (typeof cell.prof === 'object' && cell.prof?.type === 'split') {
            addTrack(day, time, 'part1', 'prof', cell.prof.part1, location);
            addTrack(day, time, 'part2', 'prof', cell.prof.part2, location);
          } else if (typeof cell.prof === 'string') {
            addTrack(day, time, 'part1', 'prof', cell.prof, location);
            addTrack(day, time, 'part2', 'prof', cell.prof, location);
          }

          if (typeof cell.room === 'object' && cell.room?.type === 'split') {
            addTrack(day, time, 'part1', 'room', cell.room.part1, location);
            addTrack(day, time, 'part2', 'room', cell.room.part2, location);
          } else if (typeof cell.room === 'string') {
            addTrack(day, time, 'part1', 'room', cell.room, location);
            addTrack(day, time, 'part2', 'room', cell.room, location);
          }
        });
      });
    });

    Object.entries(tracker).forEach(([key, types]) => {
      const [day, time, half] = key.split('-');
      const halfLabel = half === 'part1' ? '1-ին կես (45ր)' : '2-րդ կես (45ր)';
      
      Object.entries(types.prof).forEach(([prof, locs]) => {
        if (locs.length > 1) conflicts.push({ type: 'Prof', name: prof, day, time: `${time} ${halfLabel}`, details: locs });
      });
      Object.entries(types.room).forEach(([room, locs]) => {
        if (locs.length > 1) conflicts.push({ type: 'Room', name: room, day, time: `${time} ${halfLabel}`, details: locs });
      });
    });

    return conflicts;
  }, [allSchedules]);

  // Restituisce l'orario specifico del professore ricercato (ordinato cronologicamente)
  const getLecturerSchedule = useCallback((profName: string) => {
    const sched: Array<{ day: string, time: string, half: string, course: string, room: string, location: string }> = [];
    const dayLabels: Record<string, string> = { monday: 'Երկուշաբթի', tuesday: 'Երեքշաբթի', wednesday: 'Չորեքշաբթի', thursday: 'Հինգշաբթի', friday: 'Ուրբաթ' };
    const dayOrder: Record<string, number> = { 'Երկուշաբթի': 1, 'Երեքշաբթի': 2, 'Չորեքշաբթի': 3, 'Հինգշաբթի': 4, 'Ուրբաթ': 5 };

    Object.entries(allSchedules).forEach(([fac, facData]) => {
      if (!facData) return;
      Object.entries(facData as Record<string, any>).forEach(([yr, yrData]) => {
        if (!yrData) return;
        Object.entries(yrData as Record<string, any>).forEach(([cId, cell]) => {
          if (!cell) return;
          const parts = cId.split('-');
          const day = dayLabels[parts[0]] || parts[0];
          const time = parts[1];
          const stream = `${parts[parts.length - 1]}-ին հոսք`;
          const location = `${fac.replace(' ֆակուլտետ', '')} / ${yr} / ${stream}`;

          const checkAndPush = (profVal: string, courseVal: string, roomVal: string, halfLabel: string) => {
            if (profVal && profVal.includes(profName)) {
              sched.push({ day, time, half: halfLabel, course: courseVal || '—', room: roomVal || '—', location });
            }
          };

          if (typeof cell.prof === 'object' && cell.prof?.type === 'split') {
            checkAndPush(cell.prof.part1, cell.course?.part1 || (typeof cell.course === 'string' ? cell.course : ''), cell.room?.part1 || (typeof cell.room === 'string' ? cell.room : ''), '1-ին կես (45ր)');
            checkAndPush(cell.prof.part2, cell.course?.part2 || (typeof cell.course === 'string' ? cell.course : ''), cell.room?.part2 || (typeof cell.room === 'string' ? cell.room : ''), '2-րդ կես (45ր)');
          } else if (typeof cell.prof === 'string') {
            checkAndPush(cell.prof, typeof cell.course === 'string' ? cell.course : '', typeof cell.room === 'string' ? cell.room : '', 'Ամբողջ (90ր)');
          }
        });
      });
    });

    // Ordinamento cronologico per Giorno e Ora
    sched.sort((a, b) => {
      if (dayOrder[a.day] !== dayOrder[b.day]) return (dayOrder[a.day] || 9) - (dayOrder[b.day] || 9);
      return a.time.localeCompare(b.time);
    });

    return sched;
  }, [allSchedules]);

  const getGlobalConflicts = useCallback(
    (dayId: string, time: string, currentFaculty: string, currentYear: string, currentStreamId: string, fieldType: 'prof' | 'room') => {
      const occupiedNames: string[] = [];
      const conflictDetails: Record<string, string> = {};

      Object.keys(allSchedules).forEach((fac) => {
        Object.keys(allSchedules[fac] || {}).forEach((yr) => {
          Object.keys(allSchedules[fac][yr] || {}).forEach((cId) => {
            if (cId.startsWith(`${dayId}-${time}-`)) {
              const streamPart = cId.replace(`${dayId}-${time}-`, '');
              if (fac === currentFaculty && yr === currentYear && streamPart === currentStreamId) return;

              const cell = allSchedules[fac][yr][cId];
              if (!cell || !cell[fieldType]) return;

              const val = cell[fieldType];
              const locationInfo = `${fac.replace(' ֆակուլտետ', '')} • ${yr} • ${streamPart.replace('stream-', '') + '-րդ հոսք'}`;

              const addValue = (str: string) => {
                if (typeof str === 'string' && str.trim()) {
                  str.split(',').map((x) => x.trim()).filter(Boolean).forEach((item) => {
                    occupiedNames.push(item);
                    conflictDetails[item] = locationInfo;
                  });
                }
              };

              if (typeof val === 'string') addValue(val);
              else if (typeof val === 'object' && val?.type === 'split') { addValue(val.part1); addValue(val.part2); }
            }
          });
        });
      });

      return { occupiedNames, conflictDetails };
    },
    [allSchedules]
  );

  const searchGlobal = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const results: Array<any> = [];

      const dayLabels: Record<string, string> = { monday: 'Երկուշաբթի', tuesday: 'Երեքշաբթի', wednesday: 'Չորեքշաբթի', thursday: 'Հինգշաբթի', friday: 'Ուրբաթ' };

      const extractAllText = (val: any): string => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'number') return String(val);
        if (Array.isArray(val)) return val.map(extractAllText).join(' ');
        if (typeof val === 'object') return Object.values(val).map(extractAllText).join(' ');
        return '';
      };

      Object.entries(allSchedules).forEach(([fac, facData]: [string, any]) => {
        if (!facData || typeof facData !== 'object') return;
        Object.entries(facData).forEach(([yr, yrData]: [string, any]) => {
          if (!yrData || typeof yrData !== 'object') return;
          Object.entries(yrData).forEach(([cId, cell]: [string, any]) => {
            if (!cell || typeof cell !== 'object') return;

            const courseText = extractAllText(cell.course);
            const profText = extractAllText(cell.prof);
            const roomText = extractAllText(cell.room);

            const allCellContent = `${courseText} ${profText} ${roomText} ${fac} ${yr}`.toLowerCase();

            if (allCellContent.includes(q)) {
              const parts = cId.split('-');
              const day = dayLabels[parts[0]] || parts[0];
              const time = parts[1];
              const stream = `${parts[parts.length - 1]}-ին հոսք`;

              results.push({
                type: 'schedule', id: cId, faculty: fac, year: yr, day, time, stream,
                course: typeof cell.course === 'object' && cell.course?.type === 'split' ? `${cell.course.part1 || '—'} / ${cell.course.part2 || '—'}` : cell.course || '—',
                prof: typeof cell.prof === 'object' && cell.prof?.type === 'split' ? `1-ին: ${cell.prof.part1 || '—'} | 2-րդ: ${cell.prof.part2 || '—'}` : cell.prof || '—',
                room: typeof cell.room === 'object' && cell.room?.type === 'split' ? `${cell.room.part1 || '—'} / ${cell.room.part2 || '—'}` : cell.room || '—'
              });
            }
          });
        });
      });

      Object.entries(FACULTY_LISTS).forEach(([fac, lists]) => {
        lists.courses.forEach((course) => { if (course.toLowerCase().includes(q)) results.push({ type: 'catalog', category: 'Դասընթաց', name: course, faculty: fac }); });
        lists.profs.forEach((prof) => { if (prof.toLowerCase().includes(q)) results.push({ type: 'catalog', category: 'Դասախոս', name: prof, faculty: fac }); });
      });

      Object.entries(FACULTY_ROOMS).forEach(([fac, floors]) => {
        Object.entries(floors).forEach(([floor, rooms]) => {
          rooms.forEach((room) => { if (room.toLowerCase().includes(q)) results.push({ type: 'catalog', category: 'Լսարան', name: room, faculty: `${fac} (${floor})` }); });
        });
      });

      return results.slice(0, 45);
    },
    [allSchedules]
  );

  // Lista professori recuperata SIA dal database di default (FACULTY_LISTS) SIA dalle tabelle orarie
  const allLecturersList = useMemo(() => {
    const set = new Set<string>();

    // 1. Carica dal database globale (costanti e localStorage)
    try {
      const raw = localStorage.getItem('APP_FACULTY_LISTS');
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.values(parsed).forEach((fac: any) => {
          if (fac.profs) fac.profs.forEach((p: string) => set.add(p.trim()));
        });
      }
    } catch (e) {}

    Object.values(FACULTY_LISTS).forEach((fac: any) => {
      if (fac.profs) fac.profs.forEach((p: string) => set.add(p.trim()));
    });

    // 2. Carica da ciò che è effettivamente scritto nella tabella
    const addProf = (str: any) => {
      if (typeof str === 'string') {
        str.split(',').forEach((p) => { if (p.trim()) set.add(p.trim()); });
      } else if (typeof str === 'object' && str?.type === 'split') {
        addProf(str.part1);
        addProf(str.part2);
      }
    };

    Object.values(allSchedules).forEach((facData: any) => {
      Object.values(facData || {}).forEach((yrData: any) => {
        Object.values(yrData || {}).forEach((cell: any) => {
          if (cell?.prof) addProf(cell.prof);
        });
      });
    });

    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [allSchedules]);

  const exportBackup = () => {
    const backupData = {
      version: '8.0',
      exportedAt: new Date().toISOString(),
      allSchedules,
      timeSlots,
      changeLog
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asue_schedule_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.allSchedules) setAllSchedules(data.allSchedules);
        if (data.timeSlots) setTimeSlots(data.timeSlots);
        if (data.changeLog) setChangeLog(data.changeLog);
        alert('✅ Backup-ը հաջողությամբ վերականգնված է:');
      } catch {
        alert('❌ Սխալ: Անվավեր JSON ֆայլ:');
      }
    };
    reader.readAsText(file);
  };

  const generateMockData = () => {
    if (!activeFaculty) return;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const streams = ['stream-1', 'stream-2', 'stream-3', 'stream-4'];
    const sampleCourses = ['Միկրոտնտեսագիտություն-1', 'Մաթեմատիկա տնտեսագետների համար-1', 'Բանկային գործ', 'Ֆինանսական հաշվառում', 'Մենեջմենթ', 'Էկոնոմետրիկա'];
    const sampleProfs = ['Աբգարյան Մերի', 'Ադամյան Մարինե', 'Ալավերդյան Կարեն', 'Առաքելյան Արթուր', 'Գաբրիելյան Հովհաննես'];
    const sampleRooms = ['101', '104', '201', '205', '302', '311'];

    setHistoryPast((prev) => [...prev, allSchedules]);
    const newFacultyData = { ...(allSchedules[activeFaculty] || {}) };
    const newYearSchedule: Record<string, any> = {};

    days.forEach((day, dIdx) => {
      timeSlots.forEach((slot, sIdx) => {
        streams.forEach((stream, stIdx) => {
          const cellId = `${day}-${slot}-${stream}`;
          const seed = dIdx * 7 + sIdx * 3 + stIdx;

          if (seed % 3 === 0) {
            newYearSchedule[cellId] = {
              course: { type: 'split', part1: sampleCourses[seed % sampleCourses.length], part2: sampleCourses[(seed + 1) % sampleCourses.length] },
              prof: { type: 'split', part1: sampleProfs[seed % sampleProfs.length], part2: sampleProfs[(seed + 2) % sampleProfs.length] },
              room: { type: 'split', part1: sampleRooms[seed % sampleRooms.length], part2: sampleRooms[(seed + 1) % sampleRooms.length] },
              _updatedAt: Date.now()
            };
          } else {
            newYearSchedule[cellId] = {
              course: sampleCourses[seed % sampleCourses.length],
              prof: sampleProfs[seed % sampleProfs.length],
              room: sampleRooms[seed % sampleRooms.length]
            };
          }
        });
      });
    });

    newFacultyData[selectedYear] = newYearSchedule;
    setAllSchedules((prev: any) => ({ ...prev, [activeFaculty]: newFacultyData }));
  };

  const clearCurrentYear = () => {
    if (!activeFaculty) return;
    if (confirm(`Մաքրե՞լ ${activeFaculty}-ի ${selectedYear}-ի դասացուցակը:`)) {
      setHistoryPast((prev) => [...prev, allSchedules]);
      setAllSchedules((prev: any) => {
        const facultyData = { ...(prev[activeFaculty] || {}) };
        delete facultyData[selectedYear];
        return { ...prev, [activeFaculty]: facultyData };
      });
    }
  };

  const clearFaculty = () => {
    if (!activeFaculty) return;
    if (confirm(`ԶԳՈՒՇԱՑՈՒՄ: Մաքրե՞լ ${activeFaculty}-ի ԲՈԼՈՐ կուրսերի դասացուցակները:`)) {
      setHistoryPast((prev) => [...prev, allSchedules]);
      setAllSchedules((prev: any) => {
        const updated = { ...prev };
        delete updated[activeFaculty];
        return updated;
      });
    }
  };

  const clearAllDatabase = () => {
    if (confirm('ՎՏԱՆԳ: Ցանկանո՞ւմ եք ջնջել ամբողջ համալսարանի պահպանված բոլոր դասացուցակները:')) {
      setHistoryPast((prev) => [...prev, allSchedules]);
      localStorage.removeItem('APP_ALL_SCHEDULES');
      setAllSchedules({});
    }
  };

  const importExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        let storedLists: Record<string, FacultyLists> = {};
        const raw = localStorage.getItem('APP_FACULTY_LISTS');
        if (raw) storedLists = JSON.parse(raw);

        if (workbook.SheetNames.includes('Ընդհանուր բազա')) {
          const sheet = workbook.Sheets['Ընդհանուր բազա'];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet);
          rows.forEach((row) => {
            const faculty = row['Ֆակուլտետ']?.toString().trim();
            const type = row['Տեսակ']?.toString().trim();
            const name = row['Անվանում']?.toString().trim();
            if (faculty && type && name && FACULTIES.includes(faculty)) {
              if (!storedLists[faculty]) storedLists[faculty] = { courses: [], profs: [] };
              const key = type === 'Դասընթաց' ? 'courses' : 'profs';
              if (!storedLists[faculty][key].includes(name)) storedLists[faculty][key].push(name);
            }
          });
        }
        localStorage.setItem('APP_FACULTY_LISTS', JSON.stringify(storedLists));
        alert('✅ Excel ֆայլը հաջողությամբ ներմուծվեց:');
        location.reload();
      } catch {
        alert('❌ Սխալ: Excel ֆայլը չհաջողվեց կարդալ:');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return {
    userRole,
    setUserRole,
    adminFaculty,
    setAdminFaculty,
    activeFaculty,
    setActiveFaculty,
    selectedYear,
    setSelectedYear,
    timeSlots,
    isAdmin,
    isSuperAdmin,
    currentSchedule,
    viewMode,
    setViewMode,
    isDarkMode,
    toggleDarkMode,
    canUndo: historyPast.length > 0,
    canRedo: historyFuture.length > 0,
    undo,
    redo,
    changeLog,
    markLogAsRead,
    clearAllLogs,
    getRoomStatuses,
    generateIcsCalendar,
    getLecturerSchedule,
    generateConflictReport,
    highlightedLecturer,
    setHighlightedLecturer,
    allLecturersList,
    getGlobalConflicts,
    searchGlobal,
    updateCell,
    updateTimeSlot,
    exportBackup,
    importBackup,
    generateMockData,
    clearCurrentYear,
    clearFaculty,
    clearAllDatabase,
    importExcelFile
  };
}