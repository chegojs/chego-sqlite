import { OPEN_READONLY, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3'

export enum OpeningMode {
    READONLY = OPEN_READONLY,
    READWRITE = OPEN_READWRITE,
    CREATE = OPEN_CREATE
}

export type SQLiteConfig = { mode:OpeningMode, database:string }