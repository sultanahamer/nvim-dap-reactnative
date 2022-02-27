// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

import * as path from "path";
import { MultipleLifetimesAppWorker } from "./debugger/appWorker";
import { JsDebugConfigAdapter } from "./debugger/jsDebugConfigAdapter";
import * as nls from "vscode-nls";
import { ReactNativeCDPProxy } from "./cdp-proxy/reactNativeCDPProxy";
import { RnCDPMessageHandler } from "./cdp-proxy/CDPMessageHandlers/rnCDPMessageHandler";
import { LogLevel } from "./extension/log/LogHelper";
import mkdirp from "mkdirp";

const localize = nls.loadMessageBundle();
const pwd = "/Users/sultanm/Projects/react-native-app/rnapp/";
export const getProjectRoot = () => pwd
const sourcesStoragePath = path.join(getProjectRoot(), ".vscode", ".react");
const attachArgs = {
  cwd: getProjectRoot(), /* Automatically set by VS Code to the currently opened folder */
  useHermesEngine: false,
  sourceMaps: true,
  port: 8081
};

const cdpport = 35000;
const attachConfiguration = JsDebugConfigAdapter.createDebuggingConfigForPureRN(
  attachArgs,
  8081, //TODO: update this later,
  "0", //TODO: update this later
);

export const getLogger = () => ({ ...console, logWithCustomTag: console.log })
const rnCdpProxy = new ReactNativeCDPProxy("127.0.0.1", cdpport);
const logger = console;


const doit = async () => {
  await rnCdpProxy.initializeServer(
    new RnCDPMessageHandler(),
    LogLevel.Custom,
  );

  // if (attachArgs.request === "attach") { TODO: might not be other options later
  // await preparePackagerBeforeAttach(attachArgs, versions);
  // }

  logger.log(
    localize("StartingDebuggerAppWorker", "Starting debugger app worker."),
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
    // if (this.cancellationTokenSource.token.isCancellationRequested) {
    //   return this.appWorker?.stop();
    // }

    logger.log(
      localize(
        "DebuggerWorkerLoadedRuntimeOnPort",
        "Debugger worker loaded runtime on port {0}",
        port,
      ),
    );

    rnCdpProxy.setApplicationTargetPort(port)

  });
  appWorker.start();

}

doit();
