/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/* eslint-disable no-param-reassign */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { DataMask, ExtraFormData, styled, t } from '@superset-ui/core';
import { FormItem, Select, RangePicker } from '@superset-ui/core/components';
import {
  PluginFilterPresetOrCustomProps,
  PRESET_LABELS,
  PRESET_COLUMN,
  CUSTOM_RANGE_SENTINEL,
} from './types';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.sizeUnit}px;
  width: 100%;
`;

// Build the dataMask for a preset selection.
function presetDataMask(label: string): DataMask {
  const extraFormData: ExtraFormData = {
    filters: [{ col: PRESET_COLUMN, op: 'IN', val: [label] }],
  };
  return {
    extraFormData,
    filterState: { value: [label], label },
  };
}

// Build the dataMask for a custom date range. Superset's time_range string
// format is "<from> : <to>" (ISO-ish), consumed by datasets via from_dttm/to_dttm.
function customDataMask(range: [Dayjs, Dayjs]): DataMask {
  const [from, to] = range;
  const fromStr = from.format('YYYY-MM-DDTHH:mm:ss');
  const toStr = to.format('YYYY-MM-DDTHH:mm:ss');
  const timeRange = `${fromStr} : ${toStr}`;
  return {
    extraFormData: { time_range: timeRange },
    filterState: {
      value: timeRange,
      label: `${from.format('YYYY-MM-DD')} – ${to.format('YYYY-MM-DD')}`,
    },
  };
}

export default function PresetOrCustomFilterPlugin(
  props: PluginFilterPresetOrCustomProps,
) {
  const {
    formData,
    filterState,
    setDataMask,
    setFocusedFilter,
    unsetFocusedFilter,
    setHoveredFilter,
    unsetHoveredFilter,
  } = props;

  const { defaultValue } = formData;
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine initial selection: a stored preset label, or custom mode if the
  // stored value is a time_range string (contains " : ").
  const initialValue =
    (Array.isArray(filterState?.value)
      ? filterState?.value?.[0]
      : filterState?.value) ??
    defaultValue ??
    undefined;

  const isInitialCustom =
    typeof initialValue === 'string' && initialValue.includes(' : ');

  const [selected, setSelected] = useState<string | undefined>(
    isInitialCustom ? CUSTOM_RANGE_SENTINEL : (initialValue as string),
  );
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(() => {
    if (isInitialCustom) {
      const [f, tStr] = (initialValue as string).split(' : ');
      const fd = dayjs(f);
      const td = dayjs(tStr);
      if (fd.isValid() && td.isValid()) return [fd, td];
    }
    return null;
  });

  const options = useMemo(
    () => [
      ...PRESET_LABELS.map(label => ({ label, value: label })),
      { label: t('Custom range…'), value: CUSTOM_RANGE_SENTINEL },
    ],
    [],
  );

  const emit = useCallback(
    (mask: DataMask) => {
      setDataMask(mask);
    },
    [setDataMask],
  );

  // Sync initial state to the parent once on mount.
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (isInitialCustom && range) {
      emit(customDataMask(range));
    } else if (selected && selected !== CUSTOM_RANGE_SENTINEL) {
      emit(presetDataMask(selected));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = useCallback(
    (value: string) => {
      setSelected(value);
      if (value === CUSTOM_RANGE_SENTINEL) {
        // Wait for a range to be picked before emitting.
        if (range) emit(customDataMask(range));
      } else {
        emit(presetDataMask(value));
      }
    },
    [emit, range],
  );

  const handleRangeChange = useCallback(
    (values: any) => {
      if (values && values[0] && values[1]) {
        const next: [Dayjs, Dayjs] = [values[0], values[1]];
        setRange(next);
        emit(customDataMask(next));
      } else {
        setRange(null);
      }
    },
    [emit],
  );

  // Portal the calendar into the nearest .ant-popover (so it isn't clipped or
  // dismissed inside overflow:hidden containers — e.g. inline chart headers).
  const getCalendarContainer = useCallback((): HTMLElement => {
    let el: HTMLElement | null = containerRef.current;
    while (el) {
      if (el.classList?.contains('ant-popover')) return el;
      el = el.parentElement;
    }
    return document.body;
  }, []);

  return (
    <Wrapper
      ref={containerRef}
      onMouseEnter={setHoveredFilter}
      onMouseLeave={unsetHoveredFilter}
      onFocus={setFocusedFilter}
      onBlur={unsetFocusedFilter}
    >
      <FormItem noStyle>
        <Select
          value={selected}
          options={options}
          onChange={handleSelect as any}
          placeholder={t('Select time range')}
          allowClear={false}
        />
      </FormItem>
      {selected === CUSTOM_RANGE_SENTINEL && (
        <FormItem noStyle>
          <RangePicker
            showTime={false}
            value={range !== null ? (range as any) : undefined}
            onChange={handleRangeChange}
            getPopupContainer={getCalendarContainer}
            allowClear
          />
        </FormItem>
      )}
    </Wrapper>
  );
}
