import type AzimuthInterface from "./Azimith";
import type LatLng from "./LatLng";

export default interface MapControllerInterface {
  originPoint: LatLng
  destinationPoint: LatLng
  maxInterferencePoint: LatLng
  elevationPath: LatLng[]
  distanceInMeters: number
  sightLine: LatLng[]
  setOriginalPoint: (value: LatLng) => void
  setDestinationPoint: (value: LatLng) => void
  setElevationPath: (value: LatLng[]) => void
  setDistanceInMeters: (value: number) => void
  setSightLine: (value: LatLng[]) => void
  getMaxInterferencePoint: VoidFunction
  azimuthInDegrees: AzimuthInterface
  setAzimuthInDegrees: (value: AzimuthInterface) => void
  maxInterferencePointDistance: number
}