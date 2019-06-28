import { IDatabaseDriver, IQuery, Fn, QuerySyntaxEnum, IQueryResult } from '@chego/chego-api';
import { parseSchemeToSQL, newSqlExecutor, SQLQuery, newQueryResult, } from '@chego/chego-database-boilerplate'
import { templates } from './templates';
import { sqlite3, verbose, Database, OPEN_READWRITE } from 'sqlite3';
import { SQLiteConfig } from '../api/api';
import { functions } from './functions';

const asyncQuery = (sql:SQLQuery | string, db:Database) => new Promise((resolve, reject) => {
    if(typeof sql === 'string') {
        db.run(sql, (error:Error) => error ? reject(error) : resolve(true));
    } else if(sql.type === QuerySyntaxEnum.Select) {
        db.all(sql.body, (error:Error, rows:any[]) => error ? reject(error) : resolve(rows));
    } else {
        db.run(sql.body, (error:Error) => error ? reject(error) : resolve(true));
    }
});


const newTransactionHandle = (db: Database) => (queries: IQuery[]) => 
    new Promise((resolve, reject) => {
        db.serialize(async () => {
            try {
                const result: IQueryResult = newQueryResult();
                await asyncQuery('START TRANSACTION', db);
                for (const query of queries) {
                    const sql: SQLQuery = parseSchemeToSQL(query.scheme, templates, functions);
                    await asyncQuery(sql, db).then(data => { result.setData(data); })
                    .catch((error:Error) => { throw error; });
                }
                await asyncQuery('COMMIT', db);
                return resolve(result.getData());
            } catch (e) {
                await asyncQuery('ROLLBACK', db);
                return reject(e);
            }
        });
});

const newQueryHandle = (db: Database) => (query: IQuery) =>
    new Promise((resolve, reject) => {
        const sql: SQLQuery = parseSchemeToSQL(query.scheme, templates, functions);
        if(sql.type === QuerySyntaxEnum.Select) {
            db.all(sql.body, (error:Error, rows:any[]) => error ? reject(error) : resolve(rows));
        } else {
            db.run(sql.body, (error:Error) => error ? reject(error) : resolve(true));
        }
    });

export const chegoSQLite = (): IDatabaseDriver => {
    let initialized: boolean = false;
    let client: sqlite3;
    let db: Database;
    let dbConfig:SQLiteConfig;

    const driver = {
        initialize(config?: SQLiteConfig): IDatabaseDriver {
            client = verbose();
            dbConfig = config;
            initialized = true;
            return driver;
        },
        execute: async (queries: IQuery[]): Promise<any> => new Promise((resolve, reject) => {
            if (!initialized) {
                throw new Error('Driver not initialized');
            }
            
            const queryHandle: Fn<Promise<any>> = newQueryHandle(db);
            const transactionHandle: Fn<Promise<any>> = newTransactionHandle(db);

            return newSqlExecutor()
                .withQueryHandle(queryHandle)
                .withTransactionsHandle(transactionHandle)
                .execute(queries)
                .then(resolve)
                .catch(reject);
        }),
        connect: (): Promise<any> => new Promise((resolve, reject) => {
            const database:string = dbConfig.database || ':memory:';
            const mode:number = dbConfig.mode || OPEN_READWRITE;
            db = new client.Database(database, mode, (error:Error) => error ? reject(error) : resolve());
        }),
        disconnect: (): Promise<any> => new Promise((resolve, reject) => {
            db.close((error:Error) => error ? reject(error) : resolve());
        })
    }
    return driver;
}