import type { ScheduleDayKey, ScheduleSlotKey } from './schedule.constants';

export type { ScheduleDayKey, ScheduleSlotKey };
export type DayKey = ScheduleDayKey;
export type SlotKey = ScheduleSlotKey;

export interface CellSplitValue {
  type: 'split';
  part1: string;
  part2: string;
  [key: string]: any;
}

export type CellFieldValue = string | CellSplitValue | any;

export interface ScheduleCellData {
  course?: CellFieldValue;
  prof?: CellFieldValue;
  room?: CellFieldValue;
  _updatedAt?: number;
  [key: string]: any;
}

// Supporta sia 'Prof'/'Room' sia 'CLASSROOM_OVERLAP'/'LECTURER_OVERLAP' e dettagli come stringa o array
export interface ScheduleConflict {
  type: 'Prof' | 'Room' | 'CLASSROOM_OVERLAP' | 'LECTURER_OVERLAP' | string;
  name?: string;
  day?: string | ScheduleDayKey;
  time?: string;
  details?: string | string[];
  message?: string;
  faculty?: string;
  stream?: string;
  room?: string;
  lecturer?: string;
  [key: string]: any;
}

export type ScheduleGridState = Record<string, ScheduleCellData | any>;

export interface UpdateCellPayload {
  cellId: string;
  data: ScheduleCellData | null | any;
  [key: string]: any;
}

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

export interface MetaInfo {
  day: string;
  time: string;
  stream: string;
}

export interface FreeRoomStatus {
  room: string;
  isFree: boolean;
}

export interface LecturerScheduleItem {
  day: string;
  time: string;
  half: string;
  course: string;
  room: string;
  location: string;
}