import React, { useContext, useCallback, useState, useEffect } from 'react';
import { Button } from '@material-ui/core';
import { PostAdd } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from "react-router-dom";
import { DatabaseContext } from 'contexts/DatabaseContext';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DocType } from 'constants/database';
import InterviewList from 'components/interview-list/InterviewList'
import moment from 'moment';

const useStyles = makeStyles({
  superBtn: {
    width: 180,
    height: 180    
  }
});

const Welcome: React.FC = (props) => {

  const history = useHistory();
  const classes = useStyles();
  
  const startNewInterview = () => {    
    history.push('/home/interview-entry')
  }

  return (
    <div> 
      <div style={{paddingTop: 20, textAlign: "left"}}>
        <Button           
          variant="contained" 
          color="primary"           
          className={classes.superBtn} 
          onClick={startNewInterview}>
            <PostAdd />
            Start a new interview
        </Button>
      </div>

      <h1>Recent Interviews</h1>
      <InterviewList></InterviewList>
      
    </div>
  );
};

export default Welcome;