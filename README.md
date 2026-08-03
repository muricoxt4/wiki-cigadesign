# Ciga design Brasil — Presskit

Site estático criado como presskit digital da CIGA design Brasil para influenciadores, criadores de conteúdo e parceiros. A proposta do projeto é centralizar, em uma única navegação, os materiais de divulgação dos relógios da marca e direcionar o usuário para páginas individuais com narrativa, ficha técnica, diretrizes de comunicação, galeria e link direto para compra.

## Objetivo

A home funciona como vitrine e índice de acesso. Cada card representa um modelo da coleção e leva para um presskit próprio. Em vez de um e-commerce, o site atua como base editorial/comercial para consulta rápida de argumentos de venda, posicionamento da marca e materiais de apoio para produção de conteúdo. O link de compra é direcionado ao site oficial brasileiro (`usecigadesign.com.br`).

## Navegação

### Página inicial (`index.html`)

A home organiza a experiência em cinco blocos:

- `Hero`: apresenta a marca, o contexto do presskit e os números de destaque.
- `Coleção`: exibe os 13 modelos em grid responsivo, com badge "+N VERSÕES" nos cards que possuem variantes.
- `Manual`: banner de acesso rápido ao Manual do Usuário em português.
- `Sobre a CIGA`: contexto institucional da marca e do prêmio GPHG 2021.
- `Contato`: canais oficiais da equipe (WhatsApp, e-mail, Instagram).
- `Footer`: identificação institucional e nota de uso interno.

### Filtro da coleção

Filtro front-end por gênero (`Todos`, `Masculino`, `Feminino`) usando o atributo `data-gender` de cada card.

### Páginas de presskit

Cada modelo tem sua própria pasta com `index.html`, `style.css`, `script.js` e `imagens/`. Estrutura padrão:

1. `Hero` do produto
2. `O Produto`
3. `Especificações` (Detalhes Técnicos)
4. `Diretrizes` de comunicação
5. `Direcionamentos` estratégicos para creators
6. `Galeria` com lightbox clicável
7. `Variantes` (modelos com mais de uma versão)
8. `Comprar no Site Oficial`
9. `Voltar ao Menu`

### Modelos com múltiplas variantes

| Modelo | Variantes |
|---|---|
| Edge | 7 (Black, Blue, DLC Black, Gold, Red, Titanium Black, Titanium Orange) |
| Gorilla | 5 (Black Gold, Cyber Blue, Neon Purple, Orange, Silver) |
| Eastern Jade, Hunter, Legend of Serpent, Machina, Magician, Skeleton, Skeleton Edge Exploration | 2 cada |

## Interações

### Home

- Header muda de estilo ao rolar a página
- Rolagem suave entre âncoras
- Filtro de cards por gênero
- Animações de entrada com `IntersectionObserver`
- Resposta a `prefers-reduced-motion`

### Presskits

- Header com scroll effect
- Rolagem suave
- Animações `fade-in`
- **Lightbox**: clique em qualquer imagem da galeria para ampliar (fecha com `Esc` ou clique fora)
- **Botão "Voltar ao Menu"** no topo da nav e no rodapé

### cigaBluePlanet

- Hero com vídeo autoplay
- Toggle de áudio do vídeo

## Manual do Usuário

A pasta `manual-usuario/` contém o guia oficial de instalação, ajuste e cuidados do relógio mecânico automático em português. Inclui três passos de instalação com diagramas técnicos, três frentes de cuidado diário e informações de garantia.

## Estrutura do projeto

```text
wiki.cigaDesign/
├── index.html              # Home
├── style.css
├── script.js
├── imagens/                # Assets compartilhados (logo, hero, troféu)
├── manualMarca/            # Fontes Helvetica Neue LT Pro (4 pesos)
├── manual-usuario/         # Manual técnico do usuário
├── cigaBluePlanet/         # Blue Planet II (vencedor GPHG 2021)
├── blue-planet-ii-gilded-age/
├── skeleton/
├── skeleton-edge-exploration/
├── edge/
├── hunter/
├── eye-of-horus/
├── legend-of-serpent/
├── magician/
├── eastern-jade/
├── machina/
├── gorilla/
└── ice-age/
```

## Responsividade

Breakpoints implementados (do maior pro menor):

| Largura | Adaptação |
|---|---|
| `>1500px` | Layout completo, featured cards span 2 cols |
| `1101-1500px` | Featured cards full-row (laptops 13-15") |
| `≤1100px` | Cards e grids empilham 1 coluna |
| `≤992px` | Nav-links escondem, hero vertical |
| `≤768px` | Padding e tipografia reduzidos, tabela estratégica vira card-stack |
| `≤480px` | Otimização para smartphones (logo menor, badges escondidas) |
| `≤380px` | Smartphones muito pequenos |

## Como abrir

Site estático. Basta abrir `index.html` no navegador, ou rodar um servidor local:

```powershell
python -m http.server 8000
```

## Deploy

Hospedado via GitHub Pages com domínio próprio (`CNAME` configurado).

## Identidade Visual

- Tipografia: Helvetica Neue LT Pro (Light, Medium, Bold, Bold Condensed)
- Paleta:
  - Fundo: `#050505`
  - Acento (azul): `#2E7BC4`
  - Dourado: `#C9A962`
  - Texto: `#ffffff`
- Identidade dark-luxury alinhada com a marca CIGA design global

## Distribuição no Brasil

JG Importadora Ltda · CNPJ 54.869.919/0001-45 · Foz do Iguaçu/PR
