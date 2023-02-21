// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

import * as path from "path";
import { MultipleLifetimesAppWorker } from "./debugger/appWorker";
import { JsDebugConfigAdapter } from "./debugger/jsDebugConfigAdapter";
import * as nls from "vscode-nls";
import mkdirp from "mkdirp";

const localize = nls.loadMessageBundle();
const pwd = process.env.RN_DEBBUGER_WD as string;
export const getProjectRoot = () => pwd
const sourcesStoragePath = path.join(getProjectRoot(), ".vscode", ".react");
export const getSourcesStoragePath = () => sourcesStoragePath
const attachArgs = {
  cwd: getProjectRoot(), /* Automatically set by VS Code to the currently opened folder */
  useHermesEngine: false,
  sourceMaps: true,
  port: 8081,
};

const attachConfiguration = JsDebugConfigAdapter.createDebuggingConfigForPureRN(
  attachArgs,
  35000, //TODO: update this later,
  "0", //TODO: update this later
);

export const getLogger = () => ({ ...console, logWithCustomTag: console.log })
const logger = console;


const doit = async () => {

  logger.log(
    localize(
      "StartingDebuggerAppWorker",
      "Starting debugger app worker on directory: {0}",
      pwd,
    ),
  );

  // Create folder if not exist to avoid problems if
  // RN project root is not a ${workspaceFolder}
  mkdirp.sync(sourcesStoragePath);

  const appWorker = new MultipleLifetimesAppWorker(
    attachConfiguration,
    sourcesStoragePath,
    getProjectRoot(),
    undefined,
  );
  appWorker.on("connected", (port: number) => {
    logger.log(
      localize(
        "DebuggerWorkerLoadedRuntimeOnPort",
        "Debugger worker loaded runtime on port {0}",
        port,
      ),
    );

  });
  appWorker.start();
}

doit();
