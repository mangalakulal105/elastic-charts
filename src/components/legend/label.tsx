/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import classNames from 'classnames';
import React, { MouseEventHandler } from 'react';

interface LabelProps {
  label: string;
  extra: string | number | undefined;
  onClick?: MouseEventHandler;
}
/**
 * Label component used to display text in legend item
 * @internal
 */
export function Label({ label, extra, onClick }: LabelProps) {
  const labelClassNames = classNames('echLegendItem__label', {
    'echLegendItem__label--clickable': Boolean(onClick),
  });
  const labelWithExtra = getExtra(label, extra);
  return (
    <button
      type="button"
      className={labelClassNames}
      title={labelWithExtra}
      onClick={onClick}
      aria-label={labelWithExtra}
    >
      {label}
    </button>
  );
}

/**
 * @internal
 */
function getExtra(label: string, extra: string | number | undefined) {
  if (extra !== undefined) {
    return `${label} ${extra}`;
  }
  return `${label}`;
}
