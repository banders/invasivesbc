import React, { useContext, useCallback, useState, useEffect } from 'react';
import { Paper, Button, Grid,  makeStyles, Theme } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import { Link } from "react-router-dom";
import { DatabaseContext } from 'contexts/DatabaseContext';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DocType } from 'constants/database';
import { AnglerInterview } from 'models/angler-interview';
import Maplet from 'components/map/Maplet';
import { deleteAnglerInterviewFromDB } from 'utils/anglerInterviewDataAccess';
import { saveAs } from 'file-saver';
import { Plugins } from '@capacitor/core';
import { IGeometry } from 'interfaces/geometry-interface';
import moment from 'moment';

const { Geolocation } = Plugins;
const DEFAULT_START_LOCATION = [49.5701, -116.8312];

export interface IGeoLocationPickerProps {
  initialLocation?: any;
  onLocationChanged?: any;
}

const GeoLocationPicker: React.FC<IGeoLocationPickerProps> = (props) => {

  const useStyles = makeStyles((theme: Theme) => ({
    map: {
      height: '400px',
      width: '100%',
      overflow: "hidden"
    }
  }));
  const classes = useStyles();

  var [selectedGeoLocation, setSelectedGeoLocation] = useState<IGeometry>(null);

  useEffect(() => { 
    setSelectedGeoLocation(props.initialLocation) ; 
  }, [props.initialLocation]);

  const onGeoLocationFetched = (resp) => {
    var geometry: IGeometry = null;
    if (resp) {
      geometry = latLngToGeometry([resp.coords.latitude, resp.coords.longitude])
    }
    pickGeometry(geometry);
  }

  const pickGeometry = (geometry: IGeometry) => {
    setSelectedGeoLocation(geometry);
    if (props.onLocationChanged) {
      props.onLocationChanged(geometry)
    }
  }

  const geometryToLatLon = (geometry: IGeometry) => {
    if (!geometry) {
      return null;
    }
    const latLon = [geometry.coordinates[1], geometry.coordinates[0]];
    return latLon;
  }

  const setSelectedGeoLocationToCurrentGeoLocation = () => {
    const geometry: any = Geolocation.getCurrentPosition().then(onGeoLocationFetched);    
  }

  const latLngToGeometry = (latLng: number[]) : IGeometry => {
    const geometry: IGeometry = {
        "type": "Point",
        "coordinates": [
          latLng[1],
          latLng[0]
        ]
      }
      return geometry;
  }

  const onMapClicked = (latLng) => {
    const geometry = latLngToGeometry(latLng);
    pickGeometry(geometry);
  }

  return (
    <div>   

        <Paper>
          <Maplet
            mapId="geolocation_picker_map"
            classes={classes}
            initialLatLon={props.initialLocation ? geometryToLatLon(props.initialLocation) : DEFAULT_START_LOCATION}
            markerLatLon={props.initialLocation ? geometryToLatLon(props.initialLocation) : null}
            onClick={(latLng) => {onMapClicked(latLng)}}
          />
        </Paper>

        <div>
          Interview location: {selectedGeoLocation ? `${selectedGeoLocation.coordinates[0]}, ${selectedGeoLocation.coordinates[1]}` : "No location selected"}
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