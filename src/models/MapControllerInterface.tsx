import type AzimuthInterface from "./Azimith";
import type LatLng from "./LatLng";

export default interface MapControllerInterface {
  originPoint: LatLng
  destinationPoint: LatLng
  maxInterferencePoint: LatLng
  topFresnelElipsoid: LatLng[]
  bottomFresnelElipsoid: LatLng[]
  elevationPath: LatLng[]
  sightLine: LatLng[]
  distanceInMeters: number
  azimuthInDegrees: AzimuthInterface
  maxInterferencePointDistance: number
  setOriginalPoint: (value: LatLng) => void
  setDestinationPoint: (value: LatLng) => void
  setElevationPath: (value: LatLng[]) => void
  setDistanceInMeters: (value: number) => void
  setSightLine: (value: LatLng[]) => void
  getMaxInterferencePoint: VoidFunction
  setAzimuthInDegrees: (value: AzimuthInterface) => void
  
}