import React, { useCallback, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";
import type MapControllerInterface from "../../models/MapControllerInterface";
import { calcularDistanciaHaversine } from "../../helpers/helper";

const containerStyle = {
  width: "100%",
  height: "100%"
};

const center = {
  lat: -3.7319,   // Fortaleza 👀
  lng: -38.5267
};

type LatLng = {
  lat: number;
  lng: number;
  elevation: number;

};

function Map({controller}: {controller: MapControllerInterface}) {
  const {destinationPoint, originPoint, setDestinationPoint, setDistanceInMeters, setElevationPath, setOriginalPoint, distanceInMeters} = controller
// useEffect(() => {
//   setDistanceInMeters(distanceInMeters);
// }, [distanceInMeters, setDistanceInMeters]);
  useEffect(()=>{
    if(destinationPoint.lat && originPoint.lat) {
      // const distance = google.maps.geometry.spherical.computeDistanceBetween(
      //   new google.maps.LatLng(originPoint.lat, originPoint.lng),
      //   new google.maps.LatLng(destinationPoint.lat, destinationPoint.lng)
      // )
      const distance = calcularDistanciaHaversine(originPoint.lat, originPoint.lng, destinationPoint.lat, destinationPoint.lng)
      setDistanceInMeters(distance)
    }

  },[destinationPoint, originPoint])

  useEffect(()=>{
    if(originPoint.lat && destinationPoint.lat){
      const elevator = new google.maps.ElevationService();
      const points:LatLng[] = []
    elevator.getElevationAlongPath(
      {
        path: [originPoint, destinationPoint],
        samples: 100, 
      },
      (results, status) => {
        if (status === "OK" && results) {
          results.forEach((point) => {
            points.push({
              lat: point.location?.lat() ?? 0,
              lng: point.location?.lng() ?? 0,
              elevation: point.elevation
            })
          });
          // console.log(points)
          setElevationPath(points)
        }
      }
    );
  }
  },[destinationPoint, originPoint])
  
  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      const elevationService = new google.maps.ElevationService();
      const lat = event.latLng.lat();
      const lng = event.latLng.lng()
      elevationService.getElevationForLocations(
      { locations: [{ lat, lng }] },
      (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const elevation = results[0].elevation;

          const newPoint: LatLng = {
            lat,
            lng,
            elevation,
          };

          if (originPoint.lat === 0 && originPoint.lng === 0) {
            setOriginalPoint(newPoint);
          } else {
            setDestinationPoint(newPoint);
          } 
        } else {
          console.error("Erro ao obter elevação:", status);
        }
      })

    },
    
    [originPoint, setOriginalPoint, setDestinationPoint]
  );

  return (
    <LoadScript googleMapsApiKey="AIzaSyD-t7gvEszDIvgZkT7ZC6HlY0tE8a9DLz8" libraries={['geometry', 'elevation', "core", "drawing"]} >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        onClick={handleMapClick}

        zoom={12}
        
      >
        <Marker key={'origin'} position={originPoint} />
        <Marker key={'destination'} position={destinationPoint} />
        {/* {markers.map((marker, index) => (
          <Marker key={index} position={marker} />
        ))} */}
        
        <Polyline
            path={[originPoint, destinationPoint]}
            options={{
              strokeColor: "#1E90FF", // azul
              strokeOpacity: (originPoint.lat === 0 || destinationPoint.lat === 0) ? 0 : 1,
              strokeWeight: 4,
            }}
          />
      </GoogleMap>
    </LoadScript>
  );
}

export default Map;