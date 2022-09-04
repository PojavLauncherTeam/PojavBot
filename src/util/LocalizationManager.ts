import MessageFormat from '@messageformat/core';
import type Strings from '../strings/en-US.json';

export type GetStringFunctionOptions = {
  locale: PojavLocale;
  variables: Record<string, number | string>;
};

export enum PojavLocale {
  EnglishUS = 'en-US',
  Russian = 'ru',
}

export type GetStringFunction = (key: keyof PojavStringsFile, options?: Partial<GetStringFunctionOptions>) => string;

export type PojavStringsFile = typeof Strings;

export class LocalizationManager {
  public locales = new Map<PojavLocale, Partial<PojavStringsFile>>();

  public async load() {
    for (const locale of Object.values(PojavLocale)) {
      const strings = (await import(`../strings/${locale}.json`, { assert: { type: 'json' } }).then(
        (res) => res.default
      )) as Partial<PojavStringsFile>;
      this.locales.set(locale, strings);
    }
  }

  public getString(
    key: keyof PojavStringsFile,
    { locale = PojavLocale.EnglishUS, variables }: Partial<GetStringFunctionOptions> = {}
  ) {
    let string = this.locales.get(locale)?.[key] ?? this.locales.get(PojavLocale.EnglishUS)![key]!;

    if (variables) {
      string = new MessageFormat(
        {
          [locale]: (value: number | string, ord?: boolean) =>
            new Intl.PluralRules(locale, { type: ord ? 'ordinal' : 'cardinal' }).select(Number(value)),
        }[locale]!
      ).compile(string)(variables);
    }

    return string;
  }
}
