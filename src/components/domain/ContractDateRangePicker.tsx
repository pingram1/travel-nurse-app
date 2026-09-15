import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { Button } from '@/components/ui';
import { COLORS } from '@/constants/theme';

export interface ContractDateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onSave: (startDate: string, endDate: string) => void;
  error?: string | null;
}

type MarkedDates = Record<
  string,
  {
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    textColor?: string;
    disabled?: boolean;
    disableTouchEvent?: boolean;
  }
>;

function enumerateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${start}T12:00:00.000Z`);
  const last = new Date(`${end}T12:00:00.000Z`);
  while (cursor.getTime() <= last.getTime()) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function buildMarkedDates(start: string | null, end: string | null): MarkedDates {
  if (!start) return {};
  if (!end || end === start) {
    return {
      [start]: {
        startingDay: true,
        endingDay: true,
        color: COLORS.medical[600],
        textColor: '#ffffff',
      },
    };
  }

  const rangeStart = start <= end ? start : end;
  const rangeEnd = start <= end ? end : start;
  const marked: MarkedDates = {};

  for (const day of enumerateRange(rangeStart, rangeEnd)) {
    marked[day] = {
      color: COLORS.medical[100],
      textColor: COLORS.medical[900],
    };
  }

  marked[rangeStart] = {
    startingDay: true,
    color: COLORS.medical[600],
    textColor: '#ffffff',
  };
  marked[rangeEnd] = {
    endingDay: true,
    color: COLORS.medical[600],
    textColor: '#ffffff',
  };

  return marked;
}

export function ContractDateRangePicker({
  startDate,
  endDate,
  onSave,
  error,
}: ContractDateRangePickerProps) {
  const [draftStart, setDraftStart] = useState<string | null>(startDate);
  const [draftEnd, setDraftEnd] = useState<string | null>(endDate);

  const markedDates = useMemo(() => buildMarkedDates(draftStart, draftEnd), [draftStart, draftEnd]);

  const handleDayPress = (day: DateData) => {
    const selected = day.dateString;

    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(selected);
      setDraftEnd(null);
      return;
    }

    if (selected < draftStart) {
      setDraftEnd(draftStart);
      setDraftStart(selected);
      return;
    }

    setDraftEnd(selected);
  };

  const canSave = Boolean(draftStart && draftEnd && draftEnd >= draftStart);

  return (
    <View className="gap-3">
      <Text className="text-sm text-slate-600">
        Tap a start date, then an end date. Drag isn’t required — the range fills between taps.
      </Text>
      <Calendar
        markingType="period"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        enableSwipeMonths
        theme={{
          backgroundColor: COLORS.surface.light,
          calendarBackground: COLORS.surface.light,
          textSectionTitleColor: COLORS.neutral[500],
          selectedDayBackgroundColor: COLORS.medical[600],
          selectedDayTextColor: '#ffffff',
          todayTextColor: COLORS.medical[600],
          dayTextColor: COLORS.neutral[900],
          textDisabledColor: COLORS.neutral[200],
          arrowColor: COLORS.medical[600],
          monthTextColor: COLORS.medical[900],
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
        }}
      />
      <View className="rounded-2xl bg-medical-50 px-3 py-2.5">
        <Text className="text-sm font-semibold text-medical-800">
          {draftStart && draftEnd
            ? `Selected ${draftStart} — ${draftEnd}`
            : draftStart
              ? `Start ${draftStart} · tap an end date`
              : 'No dates selected yet'}
        </Text>
      </View>
      {error ? <Text className="text-sm font-medium text-danger-600">{error}</Text> : null}
      <Button
        label="Save contract dates"
        disabled={!canSave}
        onPress={() => {
          if (draftStart && draftEnd) onSave(draftStart, draftEnd);
        }}
      />
    </View>
  );
}
