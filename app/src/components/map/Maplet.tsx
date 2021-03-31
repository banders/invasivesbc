import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapContextMenuData } from 'features/home/map/MapContextMenu';
import { Feature } from 'geojson';
import * as L from 'leaflet';
import 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.mapbox.css';
import 'leaflet.offline';
import 'leaflet/dist/leaflet.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { notifySuccess } from 'utils/NotificationUtils';
import { interactiveGeoInputData } from './GeoMeta';
import './MapContainer.css';
import * as turf from '@turf/turf';

//workaround leaflet marker icon bug when used with webpack:
//  see: https://github.com/Leaflet/Leaflet/issues/4968
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export type MapControl = (map: any, ...args: any) => void;

const DEFAULT_START_LOCATION = [49.5701, -116.8312]; //kootenay lake
const DEFAULT_ZOOM = 8;

export interface IMapletProps {
  classes?: any;
  mapId: string; 
  initialLatLon?: number[]; 
  initialZoom?: number;
  markerLatLon?: number[];
  onClick?: any;
}

const Maplet: React.FC<IMapletProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const mapRef = useRef(null);
  const markers = useRef(null);

  const [drawnItems, setDrawnItems] = useState(new L.FeatureGroup());

  const getESRIBaseLayer = () => {
    return L.tileLayer.offline(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 24,
        maxNativeZoom: 17,
        attribution:
          '&copy; <a href="https://www.esri.com/en-us/arcgis/products/location-services/services/basemaps">ESRI Basemap</a>'
      }
    );
  };

  const getBCGovBaseLayer = () => {
    return L.tileLayer('https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 24,
      useCache: true,
      cacheMaxAge: 6.048e8 // 1 week
    });
  };

  const addZoomControls = () => {
    const zoomControlOptions = { position: 'topleft' };

    mapRef.current.addControl(L.control.zoom(zoomControlOptions));
  };

  /*
  const addDrawControls = () => {
    const drawControlOptions = new L.Control.Draw({
      position: 'topright',
      draw: {
        marker: false,
        circle: true
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
        edit: true
      }
    });
    mapRef.current.addControl(drawControlOptions);
  };
  */

  const addLocateControls = () => {
    const locateControlOptions = {
      icon: 'bullseye',
      flyTo: true,
      iconElementTag: 'div'
    };

    mapRef.current.addControl(L.control.locate(locateControlOptions));
  };

  const addSaveTilesControl = (layerToSave: any) => {
    mapRef.current.addControl(
      L.control.savetiles(layerToSave, {
        zoomlevels: [13, 14, 15, 16, 17],
        position: 'bottomleft',
        confirm(layer, succescallback) {
          if (window.confirm(`Save ${layer._tilesforSave.length} tiles`)) {
            succescallback(notifySuccess(databaseContext, `Saved ${layer._tilesforSave.length} tiles`));
          }
        },
        confirmRemoval(layer, succescallback) {
          if (window.confirm('Remove all the stored tiles')) {
            succescallback(notifySuccess(databaseContext, `Removed tiles`));
          }
        },
        saveText: '<span title="Save me some basemap">&#128190;</span>',
        rmText: '<span title="Delete all stored basemap tiles">&#128465;</span>'
      })
    );
  };

  const setMapBounds = (extent) => {
    if (!extent) {
      return;
    }

    const bounds = [
      [extent._northEast.lat, extent._northEast.lng],
      [extent._southWest.lat, extent._southWest.lng]
    ];

    mapRef.current.fitBounds(bounds);
  };

  const addLayerControls = (baseLayerControlOptions: any, overlayControlOptions: any) => {
    mapRef.current.addControl(L.control.layers(baseLayerControlOptions, overlayControlOptions));
  };

  const initMap = () => {
    console.log("init map")
    mapRef.current = L.map(props.mapId, { zoomControl: false, attributionControl: false })
      .setView(props.initialLatLon || DEFAULT_START_LOCATION, props.initialZoom || DEFAULT_ZOOM);

    markers.current = L.layerGroup([]).addTo(mapRef.current);

    updateMarker();    

    addZoomControls();

    //addLocateControls();

    //addDrawControls();

    const esriBaseLayer = getESRIBaseLayer();
    const bcBaseLayer = getBCGovBaseLayer();

    // Set initial base map
    bcBaseLayer.addTo(mapRef.current);

    const basemaps = {
      'BC Government': bcBaseLayer,
      'Esri Imagery': esriBaseLayer      
    };

    //const steepSlopes = getSteepSlopes();
    const overlays = {
    //  'Steep Slopes': steepSlopes
    };

    addLayerControls(basemaps, overlays);

    addSaveTilesControl(bcBaseLayer);

    //setMapBounds(mapRef.current.getBounds());

    mapRef.current.on('dragend', () => {
      //props.extentState.setExtent(mapRef.current.getBounds());
    });

    mapRef.current.on('click', (e) => {
      if(props.onClick) {
        const latLon = e.latlng ? [e.latlng.lat, e.latlng.lng] : null;
        props.onClick(latLon);
      }
    });

    mapRef.current.on('zoomend', () => {
      //props.extentState.setExtent(mapRef.current.getBounds());
    });

  };

  const updateMarker = () => {
    if (!mapRef.current || !markers.current) {
      return;
    }

    //remove any pre-existing markers
    markers.current.clearLayers();
    

    if (props.markerLatLon) {
       L.marker(props.markerLatLon).addTo(markers.current)  
    }
  }

  useEffect(() => {
    initMap();

    return () => {
      if (!mapRef.current) {
        return;
      }

      mapRef.current.remove();
    };
  }, [databaseContext]);

  
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    mapRef.current.setView(props.initialLatLon || DEFAULT_START_LOCATION, props.initialZoom || DEFAULT_ZOOM);
  }, [props.initialLatLon, props.initialZoom]);
  
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    updateMarker();    
  }, [props.markerLatLon]);
  

  /*
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (!props.geometryState?.geometry) {
      return;
    }

    updateMapOnGeometryChange();
  }, [props.geometryState.geometry, props?.interactiveGeometryState?.interactiveGeometry]);
  */
  
  /*
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (!props.extentState?.extent) {
      return;
    }

    setMapBounds(props.extentState.extent);
  }, [props.extentState.extent]);
  */

  return <div 
      id={props.mapId} 
      className={props.classes.map} 
    />;
};

export default Maplet;
