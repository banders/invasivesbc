import PouchDB from 'pouchdb-core';
import PouchDBFind from 'pouchdb-find';
import PouchDBUpsert from 'pouchdb-upsert';
import React, { useEffect, useState, useCallback } from 'react';

const DB_SCHEMA = process.env.REACT_APP_DB_SCHEMA || 'river_guardian';

export type IDatabaseContext = {
  database: PouchDB.Database<any>;
  resetDatabase: () => void;
};

export const DatabaseContext = React.createContext<IDatabaseContext>({ database: null, resetDatabase: () => {} });

/**
 * Provides access to the database and to related functions to manipulate the database instance.
 *
 * @param {*} props
 */
export const DatabaseContextProvider: React.FC = (props) => {
  console.log("create DatabaseContextProvider")
  const [databaseContext, setDatabaseContext] = useState<IDatabaseContext>({ database: null, resetDatabase: () => {} });

  /**
   * Create the database using mobile plugins/settings.
   */
  const createMobileDatabase = (): PouchDB.Database<any> => {
    console.log("create mobile db")
    PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite')); // adds mobile adapter

    return new PouchDB(DB_SCHEMA, {
      adapter: 'cordova-sqlite',
      // See https://www.npmjs.com/package/cordova-sqlite-storage for details on the below options
      iosDatabaseLocation: 'default',
      androidDatabaseProvider: 'system'
    } as any);
  };

  /**
   * Create the database using standard (non-mobile) plugins/settings.
   */
  const createDatabase = (): PouchDB.Database<any> => {
    console.log("create non-mobile db")    
    PouchDB.plugin(require('pouchdb-adapter-idb').default); // add sbrowser adapter

    return new PouchDB(DB_SCHEMA, { adapter: 'idb' });
  };

  /**
   * Create the database.
   */
  const setupDatabase = useCallback(async () => {
    let db = databaseContext.database;

    if (db) {
      console.log("database already exists")
      db.info().then(function (info) {
        console.log(info);
      })
      return;
    }

    PouchDB.plugin(PouchDBFind); // adds find query support
    PouchDB.plugin(PouchDBUpsert); // adds upsert query support


    if (window['cordova']) {
      db = createMobileDatabase();
    } else {
      db = createDatabase();
    }

    //add an index 
    db.createIndex({
      index: {
        fields: ['docType', 'createTime']
      }
    })

    console.log("schema: "+DB_SCHEMA)

    /**
     * Destroy and re-create the database.
     */
    const resetDatabase = async (database) => {
      if (!database) {
        return;
      }

      await database.destroy();
      await setupDatabase();
    };

    setDatabaseContext({ database: db, resetDatabase: () => resetDatabase(db) });
  }, [databaseContext.database]);

  /**
   * Close the database.
   *
   * Note: This only closes any active connections/listeners, and does not destory the actual database or its content.
   */
  const cleanupDatabase = useCallback(async () => {
    let db = databaseContext.database;

    if (!db) {
      return;
    }

    await db.close();
  }, []);

  useEffect(() => {
    setupDatabase();

    return async () => {
      await cleanupDatabase();
    };
  }, [setupDatabase, cleanupDatabase]);

  return <DatabaseContext.Provider value={databaseContext}>{props.children}</DatabaseContext.Provider>;
};
