import React, { useCallback, useContext } from 'react';
import {
  Button,
} from '@material-ui/core';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { DocType } from 'constants/database';
import { IAnglerInterview } from 'interfaces/angler-interview-interfaces';
import { formDataToAnglerInterview, saveAnglerInterviewToDB } from 'utils/saveAnglerInterview';
import FormContainer, { IFormContainerProps } from 'components/form/FormContainer';

const InterviewForm: React.FC = (props: any) => {
  const interviewId = props.match.params.interviewId;

  const databaseContext = useContext(DatabaseContext);

  const save = useCallback(async () => {
  	const doc: IAnglerInterview = formDataToAnglerInterview({})
  	console.log(doc)
    saveAnglerInterviewToDB(databaseContext, doc);
  }, [databaseContext.database]);

  return (
  	<div>
    	<FormContainer {...{ ...props, anglerInterview: null, isDisabled: true }} />
    	<Button variant="contained" color="primary" onClick={save}>Save</Button>
    </div>
  );
};

export default InterviewForm;