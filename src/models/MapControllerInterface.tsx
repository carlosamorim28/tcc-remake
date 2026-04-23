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
  fresnalElipsoidRatio: number[]
  originPointNoObstructed: LatLng
  destinationPointNoObstructed: LatLng
  topFresnelElipsoidNoObstructed: LatLng[]
  bottomFresnelElipsoidNoObstructed: LatLng[]
  sightLineNoObstructed: LatLng[]
  reflexiveRay: LatLng[]
  setOriginalPoint: (value: LatLng) => void
  setDestinationPoint: (value: LatLng) => void
  setElevationPath: (value: LatLng[]) => void
  setDistanceInMeters: (value: number) => void
  setSightLine: (value: LatLng[]) => void
  getMaxInterferencePoint: VoidFunction
  setAzimuthInDegrees: (value: AzimuthInterface) => void
  calculateNoObstructedValues: (frequence: number, setheightTwoerA: (value: string) => void, setheightTwoerB: (value: string) => void, towerAHeigth: number, towerBHeigth: number) => void
  calculateReflexiveRay: (kFactor: number, precision: number) => void
  calculateAzimuthInDegrees: () => void
  genereteFresnelElipsoid: (frequency?: number) => void
  generateSightLine: () => void
  midRoughness: number, 
  setMidRoughness: (value: number) => void,
  roughnessAtPoint: number, 
  setRoughnessAtPoint: (value: number) => void
  calculateRoughness: () => void
  calculateRoughnessAtPoint: (frequency: number) => void
  reflexivePoint: LatLng
  reflexiveAngle: number
  reflexivePointIndex: number
  calculateReflexiveArea: () => number
  maxScaleValue: number, setMaxScaleValue: (value: number) => void
  
}