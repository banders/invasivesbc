import React, { useCallback, useContext } from 'react';
import {
  Button,
} from '@material-ui/core';
import { DatabaseContext } from 'contexts/DatabaseContext';

const Settings: React.FC = (props) => {

  const databaseContext = useContext(DatabaseContext);

  const reset = useCallback(async () => {
    databaseContext.resetDatabase();
  }, [databaseContext.database]);

  return (
    <div>
      <h1>Settings</h1>
      <Button variant="contained" color="primary" onClick={reset}>Reset database</Button>
    </div>
  );
};

export default Settings;