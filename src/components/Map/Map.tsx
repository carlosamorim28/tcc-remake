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



  async function getElevationWithInterval(
    originPoint: LatLng,
    destinationPoint: LatLng,
    intervalMeters = 500
  ) {
    const elevator = new google.maps.ElevationService();

    const origin = new google.maps.LatLng(originPoint.lat, originPoint.lng);
    const destination = new google.maps.LatLng(destinationPoint.lat, destinationPoint.lng);

    const totalDistance =
      google.maps.geometry.spherical.computeDistanceBetween(origin, destination);

    const totalSamples = Math.ceil(totalDistance / intervalMeters);

    const MAX_SAMPLES = 512;

    // Se estiver dentro do limite, faz direto
    if (totalSamples <= MAX_SAMPLES) {
      return requestElevation(origin, destination, totalSamples);
    }

    // 🔥 Divide em múltiplos segmentos
    const segmentCount = Math.ceil(totalSamples / MAX_SAMPLES);
    const results: LatLng[] = [];

    for (let i = 0; i < segmentCount; i++) {
      const startFraction = i / segmentCount;
      const endFraction = (i + 1) / segmentCount;

      const segmentStart =
        google.maps.geometry.spherical.interpolate(origin, destination, startFraction);

      const segmentEnd =
        google.maps.geometry.spherical.interpolate(origin, destination, endFraction);

      const segmentDistance =
        google.maps.geometry.spherical.computeDistanceBetween(segmentStart, segmentEnd);

      const segmentSamples = Math.ceil(segmentDistance / intervalMeters);

      const segmentResult = await requestElevation(
        segmentStart,
        segmentEnd,
        segmentSamples
      );

      // Evita duplicar ponto de junção
      if (i > 0) segmentResult.shift();

      results.push(...segmentResult);
    }

    return results;
  }

  function requestElevation(
    start: google.maps.LatLng,
    end: google.maps.LatLng,
    samples: number
  ): Promise<LatLng[]> {
    return new Promise((resolve, reject) => {
      const elevator = new google.maps.ElevationService();

      elevator.getElevationAlongPath(
        {
          path: [start, end],
          samples: samples,
        },
        (results, status) => {
          if (status === "OK" && results) {
            resolve(
              results.map((point) => ({
                lat: point.location.lat(),
                lng: point.location.lng(),
                elevation: point.elevation,
              }))
            );
          } else {
            reject(status);
          }
        }
      );
    });
  }


  useEffect(()=>{
    if(originPoint.lat && destinationPoint.lat){
    getElevationWithInterval(originPoint, destinationPoint).then((points)=>{
      setElevationPath(points)
    })
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