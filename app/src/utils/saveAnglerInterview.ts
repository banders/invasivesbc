import { v4 as uuidv4 } from 'uuid';
//import moment from 'moment';
//import { Feature } from 'geojson';
import { DocType } from 'constants/database';
import { IAnglerInterview } from 'interfaces/angler-interview-interfaces';

/*
  converts form data from an angler interview into IAnglerInterview instance
*/
export function formDataToAnglerInterview(
  formData: any  
  ): IAnglerInterview {
  const id = uuidv4();

  return {
    _id: id,
    docType: DocType.ANGLER_INTERVIEW,
    createTime: new Date()
    //todo: all the other angler interview fields here
  };
}

/*
  Save the given form data as a record to the DB.  
  if the document's id doesn't yet exist, a new document is added.  if 
  the document's id already exists, the document is updated.
*/
export async function saveAnglerInterviewToDB(
  databaseContext: any,
  doc: IAnglerInterview
  ): Promise<IAnglerInterview> {

  console.log("upsert")

  await databaseContext.database.upsert(doc._id, (existing) => {const d = Object.assign({}, existing, doc); console.log(d); return d;});

  return doc;
}


