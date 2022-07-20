import MessageFormat from '@messageformat/core';

export class LocalizationManager {
  public locales = new Map<PojavLocale, Partial<PojavStringsFile>>();

  async load() {
    for (const locale of Object.values(PojavLocale)) {
      const strings = (await import(`../strings/${locale}.json`, { assert: { type: 'json' } }).then((res) => res.default)) as Partial<PojavStringsFile>;
      this.locales.set(locale, strings);
    }
  }

  getString(
    key: keyof PojavStringsFile,
    { locale = PojavLocale.EnglishUS, variables }: Partial<GetStringFunctionOptions> = {}
  ) {
    let string = this.locales.get(locale)?.[key] ?? this.locales.get(PojavLocale.EnglishUS)![key]!;

    if (variables) {
      string = new MessageFormat(
        {
          [locale]: (value: string | number, ord?: boolean) =>
            new Intl.PluralRules(locale, { type: ord ? 'ordinal' : 'cardinal' }).select(Number(value)),
        }[locale]!
      ).compile(string)(variables);
    }

    return string;
  }
}

export interface GetStringFunctionOptions {
  locale: PojavLocale;
  variables: Record<string, string | number>;
}

export enum PojavLocale {
  EnglishUS = 'en-US',
  Russian = 'ru',
}

export type GetStringFunction = (key: keyof PojavStringsFile, options?: Partial<GetStringFunctionOptions>) => string;

export type PojavStringsFile = typeof import('../strings/en-US.json');
