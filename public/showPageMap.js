maptilersdk.config.apiKey = maptilerKey;
const map = new maptilersdk.Map({
  container: 'map', // container's id or the HTML element to render the map
  style: maptilersdk.MapStyle.STREETS,
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});

new maptilersdk.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
      new maptilersdk.Popup({ offset: 10 })
          .setHTML(
              `<h5>${campground.title}</h5><p>${campground.location}</p>`
          )
  )
  .addTo(map);