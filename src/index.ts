import { promises as fs } from 'fs';
import * as core from '@actions/core';

async function getSigntoolLocation() {
  const windowsKitsFolder = 'C:/Program Files (x86)/Windows Kits/10/bin/';
  const folders = await fs.readdir(windowsKitsFolder);
  let fileName = '';
  let maxVersion = 0;
  for (const folder of folders) {
      if (!folder.endsWith('.0')) {
          continue;
      }
      const folderVersion = parseInt(folder.replace(/\./g,''));
      if (folderVersion > maxVersion) {
          const signtoolFilename = `${windowsKitsFolder}${folder}/x64/signtool.exe`;
          try {
              const stat = await fs.stat(signtoolFilename);
              if (stat.isFile()) {
                  fileName = signtoolFilename;
                  maxVersion = folderVersion;
              }
          }
          catch {
              console.warn('Skipping %s due to error.', signtoolFilename);
          }
      }
  }
  if(fileName == '') {
      throw new Error('Unable to find signtool.exe in ' + windowsKitsFolder);
  }

  console.log(`Signtool location is ${fileName}.`);
  return fileName;
}

async function run() {
    try {
       const path = await getSigntoolLocation();
       core.setOutput('path', path);
    } catch (err) {
        if (err instanceof Error) {
            core.setFailed(err);
        } else {
            core.setFailed(`Action failed with response: ${err}`);
        }
    }
}

run();