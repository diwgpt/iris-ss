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
import {
  AppSection,
  Behavior,
  FilterState,
  QueryFormData,
} from '@superset-ui/core';
import { RefObject } from 'react';
import { FilterBarOrientation } from 'src/dashboard/types';
import { PluginFilterHooks, PluginFilterStylesProps } from '../types';

// The 10 canonical preset labels. The numeric prefix keeps them sortable and
// matches the labels exposed by the `time_preset_values` dataset (id 231) that
// the dataset SQL maps back to ClickHouse interval expressions via
// filter_values('time_preset').
export const PRESET_LABELS = [
  '01. Last 15 minutes',
  '02. Last 30 minutes',
  '03. Last 1 hour',
  '04. Today',
  '05. Last 24 hours',
  '06. This week',
  '07. Last 7 days',
  '08. Last 30 days',
  '09. Last 90 days',
  '10. Last 1 year',
];

// Sentinel value selected in the dropdown to switch to the custom date range
// picker mode.
export const CUSTOM_RANGE_SENTINEL = '__custom_range__';

// The virtual column the preset value is emitted against (read by dataset SQL
// via filter_values('time_preset')).
export const PRESET_COLUMN = 'time_preset';

// Default selection when no defaultDataMask is configured.
export const DEFAULT_PRESET = '07. Last 7 days';

export interface PluginFilterPresetOrCustomCustomizeProps {
  defaultValue?: string | null;
  enableEmptyFilter?: boolean;
}

export type PluginFilterPresetOrCustomQueryFormData = QueryFormData &
  PluginFilterStylesProps &
  PluginFilterPresetOrCustomCustomizeProps;

export type PluginFilterPresetOrCustomProps = PluginFilterStylesProps & {
  behaviors: Behavior[];
  appSection: AppSection;
  formData: PluginFilterPresetOrCustomQueryFormData;
  filterState: FilterState;
  isRefreshing: boolean;
  showOverflow: boolean;
  parentRef?: RefObject<any>;
  inputRef?: RefObject<any>;
  filterBarOrientation?: FilterBarOrientation;
  isOverflowingFilterBar?: boolean;
} & PluginFilterHooks;

export const DEFAULT_FORM_DATA: PluginFilterPresetOrCustomCustomizeProps = {
  defaultValue: null,
  enableEmptyFilter: false,
};
