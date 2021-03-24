import React, { useContext, useCallback, useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import { Link } from "react-router-dom";
import { DatabaseContext } from 'contexts/DatabaseContext';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DocType } from 'constants/database';
import { AnglerInterview } from 'models/angler-interview';
import { deleteAnglerInterviewFromDB } from 'utils/anglerInterviewDataAccess';
import { saveAs } from 'file-saver';
import moment from 'moment';

const InterviewList: React.FC = (props) => {

  const [anglerInterviews, setAnglerInterviews] = useState([]);
  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const getAnglerInterviews = useCallback(async () => {
    
    let docs = await databaseContext.database.find({
      selector: {
      	docType: {$eq: DocType.ANGLER_INTERVIEW},
        createTime: {$exists: true}
      },
      //note there is a sorting bug in pouchdb-find:
      //  https://github.com/pouchdb/pouchdb/issues/6258
      //the second sort column cannot be descending unless the first is also descending.
      //in this case, it's no problem for the first column to be descending because the
      //selector is requesting just a single value for that column.
      sort: [{docType: "desc"}, {createTime: "desc"}]
    });
    
    //let alldocs = await databaseContext.database.allDocs({include_docs: true})
    //console.log(alldocs)

  	setAnglerInterviews([...docs.docs]);

  }, [databaseChangesContext, databaseContext.database]);


  const refreshAnglerInterviews = () => {
    getAnglerInterviews();
  };

  const exportAnglerInterviews = (anglerInterviews: AnglerInterview[]) => {
    //implementation note:
    //uses the 'file saver' tool from here: https://github.com/eligrey/FileSaver.js
    const data = [];
    anglerInterviews.forEach(anglerInterview => {
      data.push(anglerInterview);
    })
    var blob = new Blob([JSON.stringify(data)], {type: "application/json;charset=utf-8"});
    saveAs(blob, "angler-interviews.json");
  };

  const deleted = () => {
    refreshAnglerInterviews();
  }

  useEffect(() => {    
    refreshAnglerInterviews();
  }, [databaseChangesContext, getAnglerInterviews]);

  return (
    <div>
      <div>
        {anglerInterviews.map((anglerInterview, index) => {
          return (          
            <InterviewRow 
              key={anglerInterview._id} 
              anglerInterview={anglerInterview}
              onDelete={deleted}
              ></InterviewRow>
          )
        })}
      </div>
      <Button
            variant="contained"
            color="default"
            size="small"
            onClick={() => {exportAnglerInterviews(anglerInterviews)}}>
            Export all <SaveAltIcon />
          </Button>
    </div>
  );
};

export interface IInterviewRowProps {
  anglerInterview: AnglerInterview;
  onDelete?: Function;
}

const InterviewRow: React.FC<IInterviewRowProps> = (props) => {

  const anglerInterview = props.anglerInterview;
  const databaseContext = useContext(DatabaseContext);

  const deleteAnglerInterview = useCallback(async (anglerInterview: AnglerInterview) => {
    deleteAnglerInterviewFromDB(databaseContext, anglerInterview)
    if (props.onDelete) {
      props.onDelete()
    }
  }, [databaseContext.database]);

  return (  
    <Grid container spacing={3}>
        <Grid item xs={9}>
          {moment(anglerInterview.createTime).format("MMM D, YYYY h:mm A")}
          <Link style={{marginLeft: 20}} to={`/home/interview-entry/${anglerInterview._id}`}>Open</Link>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="default"
            size="small"
            onClick={() => {deleteAnglerInterview(anglerInterview)}}>
            <DeleteIcon />
          </Button>
        </Grid>  
    </Grid>    
  );
}

export default InterviewList;