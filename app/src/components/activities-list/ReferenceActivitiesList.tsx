import {
  Box,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  makeStyles,
  Paper,
  SvgIcon,
  Theme,
  Typography
} from '@material-ui/core';
import { ActivityTypeIcon } from 'constants/activities';
import { DocType } from 'constants/database';
import { MediumDateFormat } from 'constants/misc';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  activitiesContent: {},
  activityList: {},
  activitiyListItem: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    border: '1px solid',
    borderColor: theme.palette.grey[300],
    borderRadius: '6px'
  },
  activityListItem_Grid: {
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  activitiyListItem_Typography: {
    [theme.breakpoints.down('sm')]: {
      display: 'inline',
      marginRight: '1rem'
    }
  },
  actionsBar: {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginBottom: '2rem'
  }
}));

interface IReferenceActivityListItem {
  disable?: boolean;
  activity: any;
}

const ReferenceActivityListItem: React.FC<IReferenceActivityListItem> = (props) => {
  const classes = useStyles();

  return (
    <Grid className={classes.activityListItem_Grid} container spacing={2}>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Box overflow="hidden" textOverflow="ellipsis" title={props.activity.activitySubtype.split('_')[2]}>
          <Typography className={classes.activitiyListItem_Typography}>Type</Typography>
          {props.activity.activitySubtype}
        </Box>
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Box overflow="hidden" textOverflow="ellipsis" title={props.activity.activityType.split('_')[2]}>
          <Typography className={classes.activitiyListItem_Typography}>Type</Typography>
          {props.activity.activityType}
        </Box>
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Typography className={classes.activitiyListItem_Typography}>Created</Typography>
        {moment(props.activity.dateCreated).format(MediumDateFormat)}
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Typography className={classes.activitiyListItem_Typography}>Last Updated</Typography>
        {(props.activity.dateUpdated && moment(props.activity.dateUpdated).format(MediumDateFormat)) || 'n/a'}
      </Grid>
    </Grid>
  );
};

interface IReferenceActivityList {
  disable?: boolean;
}

// TODO change any to a type that defines the overall items being displayed
const ReferenceActivityList: React.FC<IReferenceActivityList> = (props) => {
  const classes = useStyles();

  const history = useHistory();

  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [docs, setDocs] = useState<any[]>([]);

  const updateActivityList = async () => {
    const activityResult = await databaseContext.database.find({
      selector: { docType: DocType.REFERENCE_ACTIVITY }
    });

    setDocs([...activityResult.docs]);
  };

  useEffect(() => {
    const updateComponent = () => {
      updateActivityList();
    };

    updateComponent();
  }, [databaseChangesContext]);

  const navigateToActivityPage = async (doc: any) => {
    history.push(`/home/references/activity/${doc._id}`);
  };

  return (
    <List className={classes.activityList}>
      {docs.map((doc) => {
        return (
          <Paper elevation={1} key={doc._id}>
            <ListItem button className={classes.activitiyListItem} onClick={() => navigateToActivityPage(doc)}>
              <ListItemIcon>
                <SvgIcon fontSize="large" component={ActivityTypeIcon[doc.activityType]} />
              </ListItemIcon>
              <ReferenceActivityListItem disable={props.disable} activity={doc} />
            </ListItem>
          </Paper>
        );
      })}
    </List>
  );
};

const ReferenceActivitiesList: React.FC = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);

  return (
    <>
      <div>
        <div className={classes.actionsBar}></div>
        <div className={classes.activitiesContent}>
          <div>
            <Typography variant="h5">Reference Activities</Typography>
          </div>
          <div>
            <ReferenceActivityList disable={true} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferenceActivitiesList;