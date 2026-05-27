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
import { buildQueryContext, BuildQuery } from '@superset-ui/core';
import { PluginFilterPresetOrCustomQueryFormData } from './types';

// This filter hardcodes its options client-side, but the native-filter framework
// still issues a buildQuery call for filters with a dataset target. We return the
// minimum query the backend will accept; the component ignores queriesData entirely.
//
// helpers.py:1755 raises "Empty query?" when metrics+columns+groupby are all empty,
// and row_limit=0 is falsy so it produces an unlimited scan. So we send one constant
// SQL column with row_limit=1 — ClickHouse evaluates `SELECT 1 FROM ds LIMIT 1` in
// microseconds.
const buildQuery: BuildQuery<PluginFilterPresetOrCustomQueryFormData> =
  formData =>
    buildQueryContext(formData, baseQueryObject => [
      {
        ...baseQueryObject,
        columns: [
          {
            label: 'noop',
            sqlExpression: '1',
            expressionType: 'SQL',
          } as any,
        ],
        metrics: [],
        row_limit: 1,
      },
    ]);

export default buildQuery;
