import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapContextMenuData } from 'features/home/map/MapContextMenu';
import { Feature } from 'geojson';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
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

export type MapControl = (map: any, ...args: any) => void;

export interface IMapContainerProps {
  classes?: any;
  mapId: string;
  geometryState: { geometry: any[]; setGeometry: (geometry: Feature[]) => void };
  interactiveGeometryState?: {
    interactiveGeometry: any[];
    setInteractiveGeometry: (interactiveGeometry: interactiveGeoInputData[]) => void;
  };
  extentState: { extent: any; setExtent: (extent: any) => void };
  contextMenuState: {
    state: MapContextMenuData;
    setContextMenuState: (contextMenuState: MapContextMenuData) => void;
  };
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const mapRef = useRef(null);

  const [drawnItems, setDrawnItems] = useState(new L.FeatureGroup());

  const addContextMenuClickListener = () => {
    mapRef.current.on('contextmenu', (e) => {
      props.contextMenuState.setContextMenuState({ isOpen: true, lat: e.latlng.lat, lng: e.latlng.lng });
    });
  };

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

  const getSteepSlopes = () => {
    return L.tileLayer.offline('https://forest-bridges.s3.amazonaws.com/steep-areas/{z}/{x}/{y}.png', {
      maxZoom: 24,
      tms: true,
      opacity: 0.5,
      maxNativeZoom: 15
    });
  };

  const addZoomControls = () => {
    const zoomControlOptions = { position: 'bottomleft' };

    mapRef.current.addControl(L.control.zoom(zoomControlOptions));
  };

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
    mapRef.current = L.map(props.mapId, { zoomControl: false }).setView([55, -128], 10);

    addContextMenuClickListener();

    addZoomControls();

    addLocateControls();

    addDrawControls();

    const esriBaseLayer = getESRIBaseLayer();
    const bcBaseLayer = getBCGovBaseLayer();

    // Set initial base map
    esriBaseLayer.addTo(mapRef.current);

    const basemaps = {
      'Esri Imagery': esriBaseLayer,
      'BC Government': bcBaseLayer
    };

    const steepSlopes = getSteepSlopes();
    const overlays = {
      'Steep Slopes': steepSlopes
    };

    addLayerControls(basemaps, overlays);

    addSaveTilesControl(esriBaseLayer);

    setMapBounds(mapRef.current.getBounds());

    mapRef.current.on('dragend', () => {
      props.extentState.setExtent(mapRef.current.getBounds());
    });

    mapRef.current.on('zoomend', () => {
      props.extentState.setExtent(mapRef.current.getBounds());
    });

    mapRef.current.on('draw:created', (feature) => {
      let aGeo = feature.layer.toGeoJSON();

      if (feature.layerType === 'circle') {
        aGeo = { ...aGeo, properties: { ...aGeo.properties, radius: feature.layer.getRadius() } };
      } else if (feature.layerType === 'rectangle') {
        aGeo = { ...aGeo, properties: { ...aGeo.properties, isRectangle: true } };
      }

      aGeo = convertLineStringToPoly(aGeo);

      // Drawing one geo wipes all others
      props.geometryState.setGeometry([aGeo]);
    });

    const convertLineStringToPoly = (aGeo: any) => {
      if (aGeo.geometry.type === 'LineString') {
        const shouldConvertToPoly = window.confirm('Convert to buffered polygon?');

        if (!shouldConvertToPoly) {
          return aGeo;
        }

        const buffer = prompt('Enter buffer width (total) in meters', '5');
        const buffered = turf.buffer(aGeo.geometry, parseInt(buffer) / 1000, { units: 'kilometers', steps: 1 });
        const result = turf.featureCollection([buffered, aGeo.geometry]);

        return { ...aGeo, geometry: result.features[0].geometry };
      }

      return aGeo;
    };

    mapRef.current.on('draw:editstop', async function () {
      // The current feature isn't passed to this function, so grab it from the acetate layer
      let aGeo = drawnItems?.toGeoJSON()?.features[0];

      // If this is a circle feature... Grab the radius and store in the GeoJSON
      if (drawnItems.getLayers()[0]._mRadius) {
        const radius = drawnItems.getLayers()[0]?.getRadius();
        aGeo = { ...aGeo, properties: { ...aGeo.properties, radius: radius } };
      }

      aGeo = convertLineStringToPoly(aGeo);

      // Save edited feature
      if (aGeo) {
        props.geometryState.setGeometry([aGeo]);
      }
    });

    mapRef.current.on('draw:deleted', function () {
      const aGeo = drawnItems?.toGeoJSON()?.features[0];

      props.geometryState.setGeometry(
        props.geometryState.geometry?.filter((geo) => JSON.stringify(geo) === JSON.stringify(aGeo))
      );
    });
  };

  const updateMapOnGeometryChange = () => {
    // Clear the drawn features
    setDrawnItems(drawnItems.clearLayers());

    if (props.geometryState) {
      // For each geometry, add a new layer to the drawn features
      props.geometryState.geometry.forEach((collection) => {
        const style = {
          weight: 4,
          opacity: 0.65
        };

        const markerStyle = {
          radius: 10,
          weight: 4,
          stroke: true
        };

        L.geoJSON(collection, {
          style: style,
          pointToLayer: (feature: any, latLng: any) => {
            if (feature.properties.radius) {
              return L.circle(latLng, { radius: feature.properties.radius });
            } else {
              return L.circleMarker(latLng, markerStyle);
            }
          },
          onEachFeature: function (feature: any, layer: any) {
            drawnItems.addLayer(layer);
          }
        });
      });
    }
    if (props.interactiveGeometryState) {
      props.interactiveGeometryState.interactiveGeometry.forEach((interactObj) => {
        const style = {
          color: interactObj.color,
          weight: 4,
          opacity: 0.65
        };

        const markerStyle = {
          radius: 10,
          weight: 4,
          stroke: true
        };

        L.geoJSON(interactObj.geometry, {
          style: style,
          pointToLayer: (feature: any, latLng: any) => {
            if (feature.properties.radius) {
              return L.circle(latLng, { radius: feature.properties.radius });
            } else {
              return L.circleMarker(latLng, markerStyle);
            }
          },
          onEachFeature: function (feature: any, layer: any) {
            drawnItems.addLayer(layer);
            let content = interactObj.popUpComponent(interactObj.description);
            layer.on('click', function () {
              // Fires on click of single feature
              interactObj.onClickCallback();
              if (feature.geometry.type !== 'Polygon') {
                L.popup()
                  .setLatLng([feature.geometry.coordinates[1], feature.geometry.coordinates[0]])
                  .setContent(content)
                  .openOn(mapRef.current);
              } else {
                // If polygon use the first point as the coordinate for popup
                L.popup()
                  .setLatLng([feature.geometry.coordinates[0][0][1], feature.geometry.coordinates[0][0][0]])
                  .setContent(content)
                  .openOn(mapRef.current);
              }
            });
          }
        });
      });
    }

    // Update the drawn featres
    setDrawnItems(drawnItems);

    // Update the map with the new drawn feaures
    mapRef.current = mapRef.current.addLayer(drawnItems);
  };

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

    if (!props.geometryState?.geometry) {
      return;
    }

    updateMapOnGeometryChange();
  }, [props.geometryState.geometry, props?.interactiveGeometryState?.interactiveGeometry]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (!props.extentState?.extent) {
      return;
    }

    setMapBounds(props.extentState.extent);
  }, [props.extentState.extent]);

  return <div id={props.mapId} className={props.classes.map} />;
};

export default MapContainer;
