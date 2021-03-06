// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

import * as fs from "fs";
import * as nls from "vscode-nls";
import { fromEntries } from "../util";
import { ValidationCategoryE, IValidation, ValidationResultT } from "./types";

nls.config({
    messageFormat: nls.MessageFormat.bundle,
    bundleFormat: nls.BundleFormat.standalone,
})();

const toLocale = nls.loadMessageBundle();

// convert windows variables in string to actual values
const convertPathWithVars = (str: string) =>
    str.replace(/%([^%]+)%/g, (_, n) => process.env[n] || _);

async function test(): Promise<ValidationResultT> {
    const envVars = {
        ANDROID_HOME: process.env.ANDROID_HOME,
    };

    const resolvedEnv = fromEntries(
        Object.entries(envVars).map(([key, val]) => [
            key,
            { original: val, resolved: val && convertPathWithVars(val) },
        ]),
    );

    const notFoundVariable = Object.entries(resolvedEnv).find(([, val]) => !val.original)?.[0];

    if (notFoundVariable) {
        return {
            status: "failure",
            comment:
                `"${notFoundVariable}" not found in path. ` +
                `Ensure all variables are set up accroding to this guide - https://reactnative.dev/docs/environment-setup`,
        };
    }

    const notFoundPath = Object.entries(resolvedEnv).find(
        ([, val]) => val.resolved && !fs.existsSync(val.resolved),
    )?.[0];

    if (notFoundPath) {
        return {
            status: "failure",
            comment: `"${notFoundPath}" does not point to an existing path`,
        };
    }

    const valUsesEnv = Object.entries(resolvedEnv).find(
        ([key, val]) => val.original !== val.resolved,
    )?.[0];

    if (valUsesEnv) {
        return {
            status: "partial-success",
            comment: `"${valUsesEnv}" uses environment variable in its path. This may cause errors`,
        };
    }

    return {
        status: "success",
    };
}

const androidHome: IValidation = {
    label: "ANDROID_HOME Env",
    description: toLocale(
        "AndroidHomeEnvCheckDescription",
        "Required for launching React Native apps",
    ),
    category: ValidationCategoryE.Android,
    exec: test,
};

export { androidHome };
