import { AnglerInterview } from 'models/angler-interview';

/*
  Save the given form data as a record to the DB.  
  if the document's id doesn't yet exist, a new document is added.  if 
  the document's id already exists, the document is updated.
*/
export async function saveAnglerInterviewToDB(
  databaseContext: any,
  anglerInterview: AnglerInterview
  ): Promise<AnglerInterview> {

  if (anglerInterview){
    await databaseContext.database.upsert(
      anglerInterview._id, 
      (existing) => {
        const d = Object.assign({}, anglerInterview.toClasslessObj(), {createTime: existing.createTime || anglerInterview.createTime, updateTime: new Date()}); 
        return d;
      }
    );  
  }
  else {
    console.log("nothing to save")
  }
  
  return anglerInterview;
}

export async function loadAnglerInterviewFromDB(
  databaseContext: any, 
  anglerInterviewId: string
  ): Promise<AnglerInterview> {

    let anglerInterview: AnglerInterview = await databaseContext.database.get(anglerInterviewId);
    
    return anglerInterview;
}

export async function deleteAnglerInterviewFromDB(
  databaseContext: any, 
  anglerInterview: AnglerInterview
  ) {

    await databaseContext.database.remove(anglerInterview._id, anglerInterview._rev);

}

