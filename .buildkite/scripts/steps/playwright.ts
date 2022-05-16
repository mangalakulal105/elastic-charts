/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';

import { exec, downloadArtifacts, startGroup, yarnInstall, getNumber, decompress, compress, bkEnv } from '../../utils';
import { ENV_URL } from '../../utils/constants';

const jobIndex = getNumber(process.env.BUILDKITE_PARALLEL_JOB);
const shardIndex = jobIndex ? jobIndex + 1 : 1;
const jobTotal = getNumber(process.env.BUILDKITE_PARALLEL_JOB_COUNT);

const pwFlags = ['--project=Chrome'];

if (bkEnv.updateScreenshots) {
  pwFlags.push('--update-snapshots');
}

if (jobIndex !== null && jobTotal !== null) {
  pwFlags.push(`--shard=${shardIndex}/${jobTotal}`);
}

async function compressNewScreenshots() {
  exec('git add e2e/screenshots');
  const output = exec(`git --no-pager diff --cached --name-only --diff-filter=ACMRU e2e/screenshots | cat`, {
    stdio: 'pipe',
  });
  const updatedScreenshotFiles = output.trim().split(/\n/).filter(Boolean);

  console.log(updatedScreenshotFiles);

  if (updatedScreenshotFiles.length > 0) {
    const uploadDir = 'e2e/screenshots/__upload';
    updatedScreenshotFiles
      .filter((f) => f.endsWith('.png'))
      .forEach((file) => {
        const dest = file.replace('e2e/screenshots', uploadDir);
        console.log(dest);
        fs.mkdirSync(path.dirname(dest), { recursive: true });

        fs.copyFileSync(file, dest);
      });

    await compress({
      src: uploadDir,
      dest: `.buildkite/artifacts/screenshots/shard_${shardIndex}.gz`,
    });
    console.log(`Updated ${updatedScreenshotFiles.length} screenshot${updatedScreenshotFiles.length === 1 ? '' : 's'}`);
  } else {
    console.log('No screenshots to be updated');
  }
}

void (async () => {
  yarnInstall('e2e');
  const src = '.buildkite/artifacts/e2e_server.gz';
  downloadArtifacts(src, 'e2e_server', undefined, '528d33e8-4b68-4953-b42d-55aed8dfd8d8');
  await decompress({
    src,
    dest: 'e2e/server',
  });
  startGroup('Generating test examples.json');
  // TODO Fix this duplicate script that allows us to skip root node install on all e2e test runners
  exec('node ./e2e/scripts/extract_examples.js');
  startGroup('Running e2e playwright job');
  const reportDir = `reports/report_${shardIndex}`;
  async function postCommandTasks() {
    await compress({
      src: path.join('e2e', reportDir),
      dest: `.buildkite/artifacts/e2e_reports/report_${shardIndex}.gz`,
    });

    if (bkEnv.updateScreenshots) {
      await compressNewScreenshots();
    }
  }
  const command = `yarn playwright test ${pwFlags.join(' ')}`;
  try {
    exec(command, {
      cwd: 'e2e',
      env: {
        [ENV_URL]: 'http://127.0.0.1:9002',
        PLAYWRIGHT_HTML_REPORT: reportDir,
        PLAYWRIGHT_JSON_OUTPUT_NAME: `reports/json/report_${shardIndex}.json`,
      },
    });
    await postCommandTasks();
  } catch (error) {
    await postCommandTasks();
    throw error;
  }
})();
