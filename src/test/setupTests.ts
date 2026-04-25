import '@testing-library/jest-dom'

function ensureWindowGoogleStub() {
  const w = window as any
  if (w.google) return

  const latLngFactory = (lat: number, lng: number) => ({
    lat: () => lat,
    lng: () => lng,
  })

  w.google = {
    maps: {
      LatLng: function LatLng(lat: number, lng: number) {
        return latLngFactory(lat, lng)
      },
      ElevationService: function ElevationService() {
        return {
          getElevationAlongPath: (
            _request: any,
            cb: (results: any[], status: string) => void,
          ) => {
            cb([], 'OK')
          },
        }
      },
      geometry: {
        spherical: {
          computeDistanceBetween: () => 0,
          interpolate: (a: any, _b: any, _fraction: number) => a,
        },
      },
    },
  }
}

ensureWindowGoogleStub()

