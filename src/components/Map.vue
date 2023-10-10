<script setup>
import { onMounted, ref } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import bikeSvg from '../assets/ubike.png';

mapboxgl.accessToken =
  'pk.eyJ1IjoibWF5NzMzMSIsImEiOiJjbG45eGxwY2cwYmFwMmtxbXRmcGh3MmltIn0.Er9Ez0ILNfmsLmdl43pQng';

const map = ref(null);
const start = [121.524538, 25.052329];

onMounted(() => {
  map.value = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/may7331/clna7lge9009t01r7ac569bbl',
    center: [121.524538, 25.052329],
    zoom: 16,
    scrollZoom: true,
  });

  map.value.addControl(
    new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      controls: {
        profileSwitcher: false,
        // instructions: false,
      },
      unit: 'metric',
      profile: 'mapbox/cycling',
    }),
    'top-left',
  );

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
            address: item.ar,
            stationArea: item.sarea,
            stationName: item.sna,
            id: item.sno,
            address: item.ar,
            status: item.act,
            totalParkingSpace: item.tot,
            currentBikeNum: item.sbi,
            emptySpace: item.bemp,
            updateTime: item.updateTime,
          },
        })),
      };

      map.value.on('load', () => {
        map.value.loadImage(bikeSvg, (error, image) => {
          if (error) throw error;

          map.value.addImage('bike', image);
          map.value.addLayer({
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

          // Add a click event listener to the location layer
          map.value.on('mouseenter', 'locations', (e) => {
            // Get the clicked feature's properties
            const { properties } = e.features[0];

            const popUps = document.getElementsByClassName('mapboxgl-popup');
            /** Check if there is already a popup on the map and if so, remove it */
            if (popUps[0]) popUps[0].remove();

            // Update the popupData with the clicked station's information
            // Create and open a popup
            const popup = new mapboxgl.Popup({ closeOnClick: true })
              .setLngLat(e.features[0].geometry.coordinates)
              .setHTML(
                `
                <h1 class="bg-primary text-white p-2.5 rounded-t font-semibold text-center text-2xl">${
                  properties.stationName.split('_')[1]
                }</h1>
                <div class="p-2.5">
                  <p>Status: ${properties.status}</p>
                  <p>Total Parking Space: ${properties.totalParkingSpace}</p>
                  <p>Current Bike Number: ${properties.currentBikeNum}</p>
                  <p>Empty Space: ${properties.emptySpace}</p>
                  <p>Last Update: ${properties.updateTime}</p>
                </div>
                `,
              )
              .addTo(map.value);
          });
        });
      });
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
});

async function getRoute(start, end) {
  // make a directions request using cycling profile
  // an arbitrary start will always be the same
  // only the end or destination will change
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' },
  );
  const json = await query.json();
  const data = json.routes[0];
  const route = data.geometry.coordinates;
  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route,
    },
  };
  // if the route already exists on the map, we'll reset it using setData
  if (map.value.getSource('route')) {
    map.value.getSource('route').setData(geojson);
  }
  // otherwise, we'll make a new request
  else {
    map.value.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geojson,
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75,
      },
    });
  }
  // add turn instructions here at the end
}
</script>

<template>
  <div class="h-screen" id="map" ref="map"></div>
  <div id="instructions"></div>
  <!-- <div class="popup-template" style="display: none"></div> -->
</template>
