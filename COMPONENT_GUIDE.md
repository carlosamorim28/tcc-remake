# Guia de criação de componentes (padrão do projeto)

Este documento descreve **como criar componentes novos** neste projeto respeitando a **estrutura** e a **tipagem** já adotadas.

## Convenções gerais

- **Estrutura por responsabilidade**
  - **UI (componentes)** em `src/components/<NomeComponente>/`
  - **Estado/ações (controllers)** em `src/controllers/`
  - **Contratos de tipagem (interfaces/types)** em `src/models/`
  - **Telas/páginas (screens)** em `src/screens/`
  - **Funções utilitárias** em `src/helpers/`
- **Nomeação**
  - Componentes e pastas: `PascalCase` (ex.: `Button`, `DinamicGroupInput`)
  - Controllers: `PascalCase` e geralmente função *factory* (ex.: `MenuController()`, `MapController()`)
  - Arquivos: `Nome.tsx` e `Nome.css` dentro da pasta do componente
- **CSS**
  - Cada componente importa seu próprio CSS: `import './Nome.css'`
- **Imports de tipos**
  - Preferir `import type ...` quando o import for apenas tipagem.

## Padrão “Component + Controller + Model”

O padrão mais comum no projeto é:

1) Criar um **contrato** em `src/models/` (interface do controller)  
2) Criar um **controller** em `src/controllers/` (hook/factory que mantém estado e expõe ações)  
3) Criar o **componente** em `src/components/` que recebe o controller via props e renderiza a UI

### 1) Model (contrato) — `src/models/<Nome>Controller.tsx`

- Use `export default interface ...` quando for o padrão do arquivo (observado em `ButtonController`).
- Use `export interface ...` quando fizer sentido exportar múltiplos tipos (observado em `InputController`).

Exemplo (similar ao `ButtonController`):

```ts
export default interface ExampleControllerInterface {
  title: string
  onClick: VoidFunction
}
```

### 2) Controller (estado/ações) — `src/controllers/<Nome>Controller.tsx`

- O controller geralmente é uma função que **retorna um objeto** com estado e funções.
- Pode usar hooks (`useState`, `useEffect`) internamente.
- Deve **tipar o retorno** usando a interface do `src/models/`.

Exemplo (similar ao `ButtonController` / `InputController`):

```ts
import { useState } from 'react'
import type ExampleControllerInterface from '../models/ExampleController'

export default function ExampleController(title: string): ExampleControllerInterface {
  const [enabled, setEnabled] = useState(true)

  return {
    title,
    onClick: () => {
      if (!enabled) return
      setEnabled(false)
    },
  }
}
```

### 3) Componente (UI) — `src/components/<Nome>/<Nome>.tsx`

- O padrão mais comum é receber **um único prop chamado `controller`**.
- Tipar a prop com a interface do `src/models/`.
- Importar o CSS do componente.
- Preferir `export default function Nome(...) { ... }` (padrão já usado em vários componentes).

Template (alinhado ao padrão atual):

```tsx
import type ExampleControllerInterface from '../../models/ExampleController'
import './Example.css'

type Props = {
  controller: ExampleControllerInterface
}

export default function Example({ controller }: Props) {
  return (
    <div className="example-container">
      <button onClick={controller.onClick}>{controller.title}</button>
    </div>
  )
}
```

E o CSS em `src/components/Example/Example.css`:

```css
.example-container {
  display: flex;
}
```

## Padrão para “screens” (telas)

Em `src/screens/`, os componentes de tela normalmente:

- Recebem dependências como `dataController` via props:
  - `({ dataController }: { dataController: ReturnType<typeof DataController> })`
- Podem declarar explicitamente retorno:
  - `: React.ReactElement`

Template:

```tsx
import type DataController from '../../controllers/DataController'

export default function ExampleScreen({
  dataController,
}: {
  dataController: ReturnType<typeof DataController>
}): React.ReactElement {
  return <div>...</div>
}
```

## Regras de tipagem (práticas recomendadas no projeto)

- **Sempre tipar props**, mesmo que simples.
- **Evitar `any`** (há um uso pontual em tooltip no gráfico; para novos códigos, prefira tipos do Chart.js quando possível).
- Para dependências de controller em props, preferir:
  - `ReturnType<typeof MeuController>` para manter a tipagem consistente com a implementação.

## O que evitar (para manter consistência)

- **Misturar estado dentro do componente de UI** quando já existe o padrão de `controller`.
- Criar componentes sem pasta/CSS quando o restante do projeto segue “componente com CSS local”.
- Colocar “contratos” (interfaces) dentro de componentes: preferir `src/models/`.

## Observação importante (segurança)

Evite “hardcode” de chaves/segredos em componentes (ex.: API keys). Para Vite, use variáveis `VITE_*` e acesse via `import.meta.env`.

