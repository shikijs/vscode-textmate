/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { IOnigLib } from '../onigLib';
import { RegExpString } from '../rawGrammar';
import * as vscodeOniguruma from 'vscode-oniguruma';
import fs from 'fs'
import { fileURLToPath } from 'url';

// CJS bundle: depending on the loader, the exports live on the namespace or on `default`
const vscodeOnigurumaModule: typeof vscodeOniguruma = (vscodeOniguruma as any).default ?? vscodeOniguruma;

let onigurumaLib: Promise<IOnigLib> | null = null;

export function getOniguruma(): Promise<IOnigLib> {
	if (!onigurumaLib) {
		const wasmPath = fileURLToPath(new URL('../../node_modules/vscode-oniguruma/release/onig.wasm', import.meta.url));
		const wasmBin = fs.readFileSync(wasmPath).buffer;
		onigurumaLib = (<Promise<any>>vscodeOnigurumaModule.loadWASM(wasmBin)).then((_: any) => {
			return {
				createOnigScanner(patterns: RegExpString[]) { return new vscodeOnigurumaModule.OnigScanner(patterns.map(i=>typeof i === 'string' ? i : i.source)); },
				createOnigString(s: string) { return new vscodeOnigurumaModule.OnigString(s); }
			};
		});
	}
	return onigurumaLib;
}
