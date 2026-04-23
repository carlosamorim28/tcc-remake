# tcc-remake

Aplicação web (React + TypeScript + Vite) para **análise de enlaces ponto‑a‑ponto** usando **Google Maps (mapa + elevação do terreno)** e **gráficos**. A interface permite selecionar dois pontos (Torre A e Torre B), obter o perfil de elevação entre eles e calcular/visualizar métricas do enlace.

## Principais funcionalidades

- **Seleção de pontos no mapa** (clique para Torre A e Torre B)
- **Distância do enlace** e **azimute** (normal e inverso)
- **Perfil do terreno** (amostras de elevação ao longo do caminho)
- **Linha de visada**
- **Zona/Elipsoide de Fresnel** (com base na frequência)
- **Ponto de máxima obstrução**
- **Rugosidade** e **raio refletido** (inclui área de reflexão)
- **Balanço de potência** e cálculo de **margem de segurança** com interferentes

## Stack

- **React 19**, **TypeScript**, **Vite**
- **Google Maps**: `@react-google-maps/api` (libraries: `geometry`, `elevation`, etc.)
- **Gráficos**: `chart.js` + `react-chartjs-2`

## Requisitos

- **Node.js** (recomendado 18+; ideal 20+)
- **npm**

## Como rodar

Instalar dependências:

```bash
npm install
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Build e preview:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

## Como usar (fluxo rápido)

1. Abra o app.
2. Clique no mapa para definir a **Torre A** (origem).
3. Clique novamente para definir a **Torre B** (destino).
4. Navegue pelas abas no menu:
   - **Geral**: entradas e gráficos do perfil
   - **Dados do Enlace**: distância, azimute e máxima obstrução
   - **Rugosidade e Raio Refletido**: métricas e gráfico completo
   - **Balanço de potência**: cálculo de margem com perdas/ganhos/interferentes

## Estrutura do projeto (visão geral)

- `src/main.tsx`: ponto de entrada (renderiza `MapScreen`)
- `src/screens/MapScreen/MapScreen.tsx`: layout principal + sessões (abas)
- `src/components/Map/Map.tsx`: mapa, cliques, distância e elevação via Google APIs
- `src/controllers/DataController.tsx`: inputs/ações e integração com os cálculos
- `src/controllers/MapController.tsx`: estado geográfico e cálculos (azimute, Fresnel, etc.)
- `src/components/Graph/Graph.tsx`: gráficos do perfil (Chart.js)

## Google Maps API key (importante)

Atualmente a chave do Google Maps está **hardcoded** em `src/components/Map/Map.tsx`. Isso é um **risco de segurança** e pode gerar custos por abuso.

Recomendação (melhoria): mover para variável de ambiente do Vite, por exemplo:

- `VITE_GOOGLE_MAPS_API_KEY`

E ler via `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`.

Também é recomendado:
- habilitar **Maps JavaScript API** e **Elevation API** no Google Cloud
- aplicar restrições na chave (domínio/porta) e limites de quota

## Observações técnicas

- Para contornar o limite de amostras do Google Elevation (512), o código pode **segmentar** a consulta de elevação quando necessário.
- O gráfico usa o índice dos pontos como eixo X; o label atual multiplica por `0.5 km` (fixo). Se o intervalo real mudar, o rótulo pode ficar impreciso.

## Licença

Não definida.
