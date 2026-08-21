# Auditoria de preços e fotos — 21/08/2026

## Fontes conferidas

- Planilha local: `CIGA PRICCING.xlsx`, aba `Distribuidor`, coluna I `BRAZIL WEB`.
- Catálogo global atual: `https://cigadesign.com/en-int/products.json?limit=250`.
- Catálogo publicado no projeto: 28 páginas de relógios.

## Resultado

- 24 dos 28 relógios publicados têm preço com correspondência segura na coluna `BRAZIL WEB`.
- A variante Hunter Black Gold foi corrigida de `Sob consulta` para `R$ 4.990,00` (SKU `Z035-BB02-W1B`).
- Os demais preços com correspondência exata já estavam corretos.
- As 26 imagens anteriores existem localmente, carregam corretamente e são arquivos distintos.
- Aircraft Carrier e Everest China 65th Anniversary foram adicionados com imagens externas conferidas pelo SKU, pois a coluna `Foto` da planilha está vazia e esses itens não aparecem no catálogo oficial atual.

## Preços que não constam na planilha

| Página publicada | Variante | O que falta |
|---|---|---|
| Hunter Vintage | Rose Gold, Sand Gold e Brown Gold | Preço `BRAZIL WEB` e SKU de cada variante |
| Everest 70th Anniversary | Titanium e DLC | Preço `BRAZIL WEB` e SKU de cada variante |
| Chinese Zodiac Year of the Dragon | Super Black | Preço `BRAZIL WEB` e SKU |
| Chinese Zodiac Year of the Horse | Edição limitada | Preço `BRAZIL WEB` e SKU |

Esses quatro relógios já possuem foto oficial publicada. Falta somente a informação comercial brasileira.

## Produtos recuperados da planilha

| Produto da planilha | SKU | BRAZIL WEB | Fonte da foto |
|---|---|---:|---|
| Aircraft Carrier — Black | `Z061-IPTI-W5BK` | R$ 3.890,00 | [Jomashop](https://www.jomashop.com/ciga-design-aircraft-carrier-automatic-grey-dial-mens-watch-z061-ipti-w5bk.html) |
| Aircraft Carrier — Blue | `Z061-IPTI-W5BU` | R$ 3.890,00 | Página compartilhada com a variante Black; preço individual preservado |
| Everest China 65th Anniversary — Automaton, 45 mm | `U053-TT01-6B` | R$ 16.990,00 | [HYPE Watches](https://www.hypewatches.co.uk/products/ciga-design-mount-everest-chinese-edition-watch-u053-tt01-6b) |

O Everest China 65th Anniversary foi mantido separado do Everest 70th Anniversary porque são edições diferentes. As páginas informam que as imagens vieram de referências comerciais externas, não do catálogo oficial atual.

## Cópia da planilha no Google Sheets

O Apps Script recebeu uma importação protegida por hash que cria/atualiza a aba `Tabela de Preços`, separada da aba `Vendas`. A importação envia as 60 linhas de produtos e as colunas A a J sem armazenar esses dados no repositório público.
