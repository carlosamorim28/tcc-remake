import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from "chart.js";
import type { toLineHeight } from "chart.js/helpers";
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
  maxYScale?: number
};

export default function Graph({ naturalPath, straightLine, topFresnelElipsoid, bottomFresnelElipsoid, reflexiveRay,  maxYScale }: Props) {

  const labels = naturalPath.map((_, index) => index);

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    scales: {
      x: {
        title: {
          display: true,
          text: "Distância ao longo do perfil (km)",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        

        ticks: {
          // Formata os valores do eixo X
          callback: (value: number) => {
            return `${value * 0.5} km`;
          },

          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },

      y: {
        title: {
          display: true,
          text: "Elevação (m)",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        min: 0,
        max: maxYScale,  

        ticks: {
          // Ex: arredondar e adicionar unidade
          callback: (value: number) => {
            return `${Math.round(value)} m`;
          },
        },
      },
    },

    plugins: {
      legend: {
        labels:{
        boxHeight: 1,
        padding: 20,
        font: {
          size: 13,
          lineHeight: 1.5, // 🔥 controla o espaçamento vertical do texto
        },
        generateLabels: (chart) => {
          return chart.data.datasets.map((dataset, i) => ({
            text: dataset.label,
            strokeStyle: dataset.borderColor,
            fillStyle: dataset.borderColor, // remove o fundo
            lineWidth: 2, // espessura da "linha"
            // hidden: !chart.isDatasetVisible(i),
            index: i,
          }));
        },
        },
        position: "top",
        
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(
              2
            )} m`;
          },
        },
      },
    },
  };

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
    <div style={{ width: "100%", background: "#FFF", height: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}