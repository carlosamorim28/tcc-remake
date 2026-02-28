import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

type GeoPoint = {
  lat: number
  lng: number
  elevation: number
}

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

type Props = {
  naturalPath: GeoPoint[];
  straightLine: GeoPoint[];
  topFresnelElipsoid: GeoPoint[];
  bottomFresnelElipsoid: GeoPoint[];
  reflexiveRay: GeoPoint[]
};

export default function Graph({ naturalPath, straightLine, topFresnelElipsoid, bottomFresnelElipsoid, reflexiveRay }: Props) {

  const labels = naturalPath.map((_, index) => index);

  const data = {
    labels,
    datasets: [
      {
        label: "Linha de visada",
        data: straightLine.map(p => p.elevation),
        borderColor: "black",
        tension: 0.3,
      },
      {
        label: "Relevo Natural",
        data: naturalPath.map(p => p.elevation),
        borderColor: "blue",
        tension: 0.3,
      },

      {
        label: "Elipsoide de fresnel",
        data: topFresnelElipsoid.map(p => p.elevation),
        borderColor: "gray",
        tension: 0.3,
      },
      {
        label: "Elipsoide de fresnel",
        data: bottomFresnelElipsoid.map(p => p.elevation),
        borderColor: "gray",
        tension: 0.3,
      },
      {
        label: "raio refletido",
        data: reflexiveRay.map(p => p.elevation),
        borderColor: "pourple",
        tension: 0.3,
      },
      
    ]
  };
  
  return (
    <div style={{ width: "100%", backgroundColor: 'pink' }}>
      <Line data={data} />
    </div>
  );
}