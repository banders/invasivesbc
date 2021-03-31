import { DocType } from 'constants/database';
import { v4 as uuidv4 } from 'uuid';

export class AnglerInterview {
  _id: string;
  _rev: string;
  docType: string;
  createTime: Date;
  updateTime: Date;
  formData: any;
  interviewLocation: any;

  constructor(data: any = {}) {
	  this._id = data._id || uuidv4();
	  this._rev = data._rev || null;
  	this.docType = DocType.ANGLER_INTERVIEW;
  	this.createTime = data.createTime || new Date();
  	this.updateTime = data.updateTime || this.createTime;
  	this.formData = data.formData || null;
    this.interviewLocation = data.interviewLocation
  }

  public toClasslessObj(): any {
  	return {
  		_id: this._id,
  		_rev: this._rev,
  		docType: this.docType,
  		createTime: this.createTime,
  		updateTime: this.updateTime,
  		formData: this.formData,
      interviewLocation: this.interviewLocation
  	}
  }
  
}
