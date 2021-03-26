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
import { Plugins } from '@capacitor/core';
import moment from 'moment';

const { Geolocation } = Plugins;

export interface IGeoLocationPickerProps {
  initialLocation?: any;
  onLocationChanged?: any;
}

export interface IGeometry {
  type: string;
  coordinates: number[];
}

const GeoLocationPicker: React.FC<IGeoLocationPickerProps> = (props) => {

  var [selectedGeoLocation, setSelectedGeoLocation] = useState<IGeometry>(null);

  const onGeoLocationFetched = (resp) => {
    var geometry: IGeometry = null;
    if (resp) {
      geometry = {
        "type": "Point",
        "coordinates": [
          resp.coords.longitude,
          resp.coords.latitude
        ]
      }
    }
    setSelectedGeoLocation(geometry);
    if (props.onLocationChanged) {
      props.onLocationChanged(geometry)
    }
  }

  const setSelectedGeoLocationToCurrentGeoLocation = () => {
    const geometry: any = Geolocation.getCurrentPosition().then(onGeoLocationFetched);    
  }

  return (
    <div>      
        <div>
          GPS Location: {selectedGeoLocation ? `${selectedGeoLocation.coordinates[0]}, ${selectedGeoLocation.coordinates[1]}` : "No location selected"}
        </div>
        <Button
            variant="contained"
            color="default"
            size="small"
            onClick={() => {setSelectedGeoLocationToCurrentGeoLocation()}}>
            Use my current location
          </Button>

    </div>
  );
};


export default GeoLocationPicker;