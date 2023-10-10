import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import bikeSvg from '../assets/ubike.png';

export function createMap() {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWF5NzMzMSIsImEiOiJjbG45eGxwY2cwYmFwMmtxbXRmcGh3MmltIn0.Er9Ez0ILNfmsLmdl43pQng';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/may7331/clna7lge9009t01r7ac569bbl',
    center: [121.524538, 25.052329],
    zoom: 16,
    scrollZoom: true,
  });

  axios
    .get(
      'https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json',
    )
    .then((res) => {
      const geoJsonData = {
        type: 'FeatureCollection',
        features: res.data.map((item) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [item.lng, item.lat],
          },
          properties: {
            id: item.sno,
            address: item.ar,
            status: item.act,
            totalParkingSpace: item.tot,
            currentBikeNum: item.sbi,
            emptySpace: item.bemp,
            updateTime: item.updateTime,
            // ...locationAttributes.value,
          },
        })),
      };

      map.on('load', () => {
        map.loadImage(bikeSvg, (error, image) => {
          if (error) throw error;

          map.addImage('bike', image);
          map.addLayer({
            id: 'locations',
            type: 'symbol',
            source: {
              type: 'geojson',
              data: geoJsonData,
            },
            layout: {
              'icon-image': 'bike', // Use the custom marker icon
              'icon-size': 0.5, // Adjust the marker size as needed
            },
          });
        });
      });
    });

  return map;
}

export function addStations(map, features) {
  features.forEach((station) => {
    const el = document.createElement('div');
    el.id = `marker-${station.properties.id}`;
    el.className = 'marker';

    new mapboxgl.Marker(el, { offset: [0, -23] })
      .setLngLat(station.geometry.coordinates)
      .addTo(map);

    el.addEventListener('click', () => {
      flyToStation(map, station);
      createPopUp(map, station);
      // highlightListing(station);
    });
  });
}

function flyToStation(map, currentFeature) {
  map.flyTo({
    center: currentFeature.geometry.coordinates,
    zoom: 15,
  });
}

function createPopUp(currentFeature) {
  const popUps = document.getElementsByClassName('mapboxgl-popup');
  if (popUps[0]) popUps[0].remove();

  const popup = new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(`<h3>Sweetgreen</h3><h4>${currentFeature.properties.address}</h4>`)
    .addTo(map);
}

// export function createPopUp(currentFeature) {
//   const popUps = document.getElementsByClassName('mapboxgl-popup');
//   /** Check if there is already a popup on the map and if so, remove it */
//   if (popUps[0]) popUps[0].remove();

//   const popup = new mapboxgl.Popup({ closeOnClick: false })
//     .setLngLat(currentFeature.geometry.coordinates)
//     .setHTML(`<h3>Sweetgreen</h3><h4>${currentFeature.properties.address}</h4>`)
//     .addTo(map);
// }
