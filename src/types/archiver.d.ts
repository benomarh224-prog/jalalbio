declare module 'archiver' {
  export interface ArchiverOptions {
    zlib?: { level?: number }
    statConcurrency?: number
  }

  export interface EntryData {
    name: string
    prefix?: string
    stats?: import('fs').Stats
    date?: Date | string
    mode?: number
  }

  export class Archiver {
    constructor(format?: string, options?: ArchiverOptions)
    file(filepath: string, data: EntryData): this
    directory(dirpath: string, destpath?: string | false, data?: EntryData | ((entry: EntryData) => EntryData | void)): this
    append(content: import('stream').Readable | Buffer | string, data: EntryData): this
    finalize(): Promise<void> | void
    on(event: 'data', listener: (chunk: Buffer) => void): this
    on(event: 'end' | 'error' | 'close' | 'warning', listener: (arg?: unknown) => void): this
    on(event: string, listener: (...args: unknown[]) => void): this
    pointer(): number
  }

  export class ZipArchive extends Archiver {
    constructor(options?: ArchiverOptions)
  }

  export class TarArchive extends Archiver {
    constructor(options?: ArchiverOptions)
  }

  export class JsonArchive extends Archiver {
    constructor(options?: ArchiverOptions)
  }

  const archiver: {
    (format?: string, options?: ArchiverOptions): Archiver
    create(format: string, options?: ArchiverOptions): Archiver
  }

  export default archiver
}
