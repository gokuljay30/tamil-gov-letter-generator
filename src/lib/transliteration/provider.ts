export interface TransliterationProvider {
  transliterate(text: string): Promise<string>;
}

