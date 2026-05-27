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
import { Behavior, ChartMetadata, ChartPlugin, t } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';

export default class PresetOrCustomFilterPlugin extends ChartPlugin {
  constructor() {
    const metadata = new ChartMetadata({
      name: t('Preset or custom range'),
      description: t(
        'Time filter offering a fixed list of preset ranges plus a custom date range picker',
      ),
      behaviors: [Behavior.InteractiveChart, Behavior.NativeFilter],
      enableNoResults: false,
      tags: [t('Experimental')],
      // Required by ChartMetadataConfig. Native filters never render in the viz
      // gallery, so an empty thumbnail is fine.
      thumbnail: '',
    });

    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./PresetOrCustomFilterPlugin'),
      metadata,
      transformProps,
    });
  }
}
