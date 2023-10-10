<script setup>
const props = defineProps({
  info: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div>
    <h3>{{ info.stationName }}</h3>
    <p>Address: {{ info.address }}</p>
    <p>Status: {{ info.status }}</p>
    <p>Total Parking Space: {{ info.totalParkingSpace }}</p>
    <p>Current Bike Number: {{ info.currentBikeNum }}</p>
    <p>Empty Space: {{ info.emptySpace }}</p>
    <p>Last Update: {{ info.updateTime }}</p>
  </div>
</template>
