export interface TTSProvider {
  synthesize: (script: string) => Promise<string>
}
