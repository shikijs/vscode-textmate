/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { BalancedBracketSelectors, createGrammar, Grammar, IGrammarRepository, IThemeProvider, AttributedScopeStack } from './grammar';
import { IRawGrammar } from './rawGrammar';
import { IGrammar, IEmbeddedLanguagesMap, ITokenTypeMap } from '.';
import { ScopeStack, Theme, StyleAttributes, ScopeName } from './theme';
import { IOnigLib } from './onigLib';

export class SyncRegistry implements IGrammarRepository, IThemeProvider {
	private readonly _grammars = new Map<ScopeName, Grammar>();
	private readonly _rawGrammars = new Map<ScopeName, IRawGrammar>();
	private readonly _injectionGrammars = new Map<ScopeName, ScopeName[]>();
	private _theme: Theme;

	constructor(theme: Theme, private readonly _onigLib: IOnigLib) {
		this._theme = theme;
	}

	public dispose(): void {
		for (const grammar of this._grammars.values()) {
			grammar.dispose();
		}
	}

	public setTheme(theme: Theme): void {
		this._theme = theme;
	}

	public getColorMap(): string[] {
		return this._theme.getColorMap();
	}

	/**
	 * Add `grammar` to registry and return a list of referenced scope names
	 */
	public addGrammar(grammar: IRawGrammar, injectionScopeNames?: ScopeName[]): void {
		this._rawGrammars.set(grammar.scopeName, grammar);

		if (injectionScopeNames) {
			this._injectionGrammars.set(grammar.scopeName, injectionScopeNames);
		}
	}

	/**
	 * Lookup a raw grammar.
	 */
	public lookup(scopeName: ScopeName): IRawGrammar | undefined {
		return this._rawGrammars.get(scopeName)!;
	}

	/**
	 * Returns the injections for the given grammar
	 */
	public injections(targetScope: ScopeName): ScopeName[] {
		return this._injectionGrammars.get(targetScope)!;
	}

	/**
	 * Get the default theme settings
	 */
	public getDefaults(): StyleAttributes {
		return this._theme.getDefaults();
	}

	/**
	 * Match a scope in the theme.
	 */
	public themeMatch(scopePath: ScopeStack): StyleAttributes | null {
		return this._theme.match(scopePath);
	}

	/**
	 * Lookup a grammar.
	 */
	public grammarForScopeName(
		scopeName: ScopeName,
		initialLanguage: number,
		embeddedLanguages: IEmbeddedLanguagesMap | null,
		tokenTypes: ITokenTypeMap | null,
		balancedBracketSelectors: BalancedBracketSelectors | null
	): IGrammar | null {
		if (!this._grammars.has(scopeName)) {
			let rawGrammar = this._rawGrammars.get(scopeName)!;
			if (!rawGrammar) {
				return null;
			}
			this._grammars.set(scopeName, createGrammar(
				scopeName,
				rawGrammar,
				initialLanguage,
				embeddedLanguages,
				tokenTypes,
				balancedBracketSelectors,
				this,
				this._onigLib
			));
		}
		return this._grammars.get(scopeName)!;
	}
}
