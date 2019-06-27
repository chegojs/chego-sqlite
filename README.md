# chego-sqlite

This is a SQLite driver for Chego library.

## Install
```
npm install --save @chego/chego-mysql
```

## Usage
Create a new Chego object using the `chegoSQLite` and configuration object. 

The configuration object - `SQLiteConfig` - is optional, if you don't provide one, sqlite will set `:memory:` as a database storage.

```
const { newChego, newQuery } = require("@chego/chego");
const { chegoSQLite } = require("@chego/chego-sqlite");
const chego = newChego(chegoSQLite, {
  database : 'filepath',
  mode     : OpeningMode.OPEN_READWRITE
});

...

const query = newQuery();

await chego.connect();

query.select('*').from('superheroes').where('origin').is.eq('Gotham City').limit(10);

chego.execute(query)
.then(result => { 
    console.log('RESULT:', JSON.stringify(result));
    chego.disconnect();
})
.catch(error => { 
    console.log('ERROR:', error); 
    chego.disconnect();
});

...

```

Under the hood it uses Node.js `sqlite3` module, so please refer to this [link](https://github.com/mapbox/node-sqlite3) for more information on the configuration. 

For more information on how `Chego` works with database drivers, please read [Chego Usage guide](https://github.com/chegojs/chego/blob/master/README.md).

## API
```
enum OpeningMode {
    READONLY = sqlite3.OPEN_READONLY,
    READWRITE = sqlite3.OPEN_READWRITE,
    CREATE = sqlite3.OPEN_CREATE
}

type SQLiteConfig = { mode:OpeningMode, database:string }
```

## Contribute
There is still a lot to do, so if you want to be part of the Chego project and make it better, it's great.
Whether you find a bug or have a feature request, please contact us. With your help, we'll make it a great tool.

[How to contribute](https://github.com/orgs/chegojs/chego/CONTRIBUTING.md)

Follow our kanban boards to be up to date

[Kanban board](https://github.com/orgs/chegojs/projects/3)

Join the team, feel free to catch any task or suggest a new one.

## License

Copyright (c) 2019 [Chego Team](https://github.com/orgs/chegojs/people)

Licensed under the [MIT license](LICENSE).