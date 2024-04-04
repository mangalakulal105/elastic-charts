/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  docs: [{ type: 'autogenerated', dirName: 'docs' }],
  api: [
    { type: 'autogenerated', dirName: 'api' },
    {
      // TODO: this needs a lot of improvement, the typedoc defaults are too verbose
      // and end up very chaotic. I'm just adding it here for completeness and to be able
      // to reference types until they are built into our full docs.
      type: 'category',
      label: 'All Types',
      items: [
        {
          type: 'category',
          label: 'Interfaces',
          items: [{ type: 'autogenerated', dirName: 'all-types/interfaces' }],
        },
        {
          type: 'category',
          label: 'Functions',
          items: [{ type: 'autogenerated', dirName: 'all-types/functions' }],
        },
        {
          type: 'category',
          label: 'Variables',
          items: [{ type: 'autogenerated', dirName: 'all-types/variables' }],
        },
        {
          type: 'category',
          label: 'Type Aliases',
          items: [{ type: 'autogenerated', dirName: 'all-types/type-aliases' }],
        },
      ],
      description: 'Autogenerated type docs',
    },
  ],
  examples: [{ type: 'autogenerated', dirName: 'examples' }],
};

export default sidebars;
