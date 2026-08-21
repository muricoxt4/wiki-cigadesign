(function () {
    'use strict';

    window.CIGA_CATALOG = {
        'moon-walker': {
            name: 'Moon Walker Edition',
            collection: 'Aventur',
            image: 'imagens/produto-oficial.jpg',
            officialUrl: 'https://cigadesign.com/en-int/products/moonwalker',
            description: 'Uma homenagem ao primeiro passo de Neil Armstrong na Lua, com relevo lunar microgravado e um astronauta que percorre o mostrador.',
            highlights: ['Mostrador lunar microgravado com precisão de 0,03 mm', 'Detalhes da Apollo 11 revelados sob ampliação', 'Exibição autoral com astronauta em órbita'],
            prices: [{ variant: 'U055-TIGR-6B', price: 'R$ 16.990,00' }]
        },
        'blue-planet-black-star': {
            name: 'Blue Planet · Black Star Edition',
            collection: 'Aventur',
            image: 'imagens/produto-oficial.jpg',
            officialUrl: 'https://cigadesign.com/en-int/products/ciga-design-mechanical-watch-black-star',
            description: 'A colaboração CIGA design x Label Noir leva a arquitetura Blue Planet do relevo terrestre à profundidade do espaço.',
            highlights: ['Calibre automático suíço CD-04-S', 'Tecnologia proprietária Asynchronous-Follow', 'Edição especial desenvolvida com a Label Noir'],
            prices: [{ variant: 'U035-BB01-W6B', price: 'R$ 19.800,00' }]
        },
        'blue-planet-atlantic': {
            name: 'Blue Planet · Atlantic Ocean-Inspired',
            collection: 'Aventur',
            image: 'imagens/produto-oficial.jpg',
            officialUrl: 'https://cigadesign.com/en-int/products/atlantic',
            description: 'Uma interpretação do Blue Planet inspirada no Atlântico, preservando a leitura de hora e minuto por um único ponto de referência.',
            highlights: ['Mostrador tridimensional inspirado no Oceano Atlântico', 'Caixas de 43 mm e 46 mm', 'Opções em aço inoxidável e titânio'],
            prices: [
                { variant: 'Aço inoxidável · 43 ou 46 mm', price: 'R$ 11.990,00' },
                { variant: 'Titânio · 43 ou 46 mm', price: 'R$ 13.990,00' }
            ]
        },
        'hunter-tourbillon': {
            name: 'Hunter · Tourbillon',
            collection: 'Edge',
            image: 'imagens/produto-oficial.jpg',
            officialUrl: 'https://cigadesign.com/en-int/products/ciga-design-advanced-skeleton-complication-watch-hunter-tourbillon-edition',
            description: 'A arquitetura esqueletizada Hunter recebe um tourbillon de corda manual, caixa em titânio grau 5 e reserva de marcha ampliada.',
            highlights: ['Calibre próprio CD-011 com tourbillon', 'Reserva de marcha de 72 horas', 'Caixa tonneau em titânio grau 5'],
            prices: [
                { variant: 'Blue · Z037-TIBU-1T6B', price: 'R$ 19.990,00' },
                { variant: 'Carbon · Z037-TIGR-1G6B', price: 'R$ 19.990,00' },
                { variant: 'Silver · Z037-TT01-1T6B', price: 'R$ 19.990,00' }
            ]
        },
        'hunter-vintage': {
            name: 'Hunter Vintage',
            collection: 'Edge',
            image: 'imagens/produto-oficial.jpg',
            officialUrl: 'https://cigadesign.com/en-int/products/ciga-design-skeleton-automatic-watch-hunter-vintage',
            description: 'A construção aberta do Hunter em acabamentos de tons quentes, com calibre CD-07 visível pela frente e pelo verso.',
            highlights: ['Mostrador esqueletizado de frente a verso', 'Calibre próprio CD-07 a 4 Hz', 'Acabamentos Rose Gold, Sand Gold e Brown Gold'],
            prices: [
                { variant: 'Rose Gold', price: null },
                { variant: 'Sand Gold', price: null },
                { variant: 'Brown Gold', price: null }
            ]
        },
        'hunter-titanium': {
            name: 'Hunter Titanium',
            collection: 'Edge',
            image: 'imagens/produto-oficial.jpg',
            officialUrl: 'https://cigadesign.com/en-int/products/ciga-design-skeleton-automatic-watch-hunter-titanium',
            description: 'A silhueta octogonal do Hunter em titânio grau 5, com menor massa, chanfros mais definidos e visão mecânica contínua.',
            highlights: ['Caixa em titânio grau 5', 'Calibre esqueletizado automático CD-07', 'Super-LumiNova e resistência de 5 ATM'],
            prices: [
                { variant: 'Blue · Z041-TIBU-1T', price: 'R$ 8.990,00' },
                { variant: 'Carbon · Z041-TIGR-1G', price: 'R$ 8.990,00' },
                { variant: 'Silver · Z041-TT01-W1S', price: 'R$ 8.990,00' }
            ]
        },
        'vector': {
            name: 'Vector',
            collection: 'Edge',
            image: 'imagens/produto-oficial.jpg',
            officialUrl: 'https://cigadesign.com/en-int/products/ciga-design-racing-inspired-automatic-skeleton-watch-vector',
            description: 'Um relógio esqueletizado inspirado em competição, com arquitetura aberta, bezel em camadas e três execuções de caixa.',
            highlights: ['Mais de 50% de arquitetura aberta', 'Calibre automático próprio CD-02X', 'Construções em aço, titânio ou fibra de carbono'],
            prices: [
                { variant: 'Stainless Steel · V011-SISI-6B', price: 'R$ 6.990,00' },
                { variant: 'Titanium Alloy · V011-TIGR-6B', price: 'R$ 8.990,00' },
                { variant: 'Carbon Fiber · V011-TCGR-6B', price: 'R$ 10.990,00' }
            ]
        },
        'falcon': {
            name: 'Falcon',
            collection: 'Edge',
            image: 'imagens/produto-oficial.jpg',
            officialUrl: 'https://cigadesign.com/en-int/products/ciga-design-round-automatic-skeleton-watch-falcon',
            description: 'A mecânica aberta da CIGA design em uma caixa redonda de perfil fino, com bezel elevado e calibre suspenso em evidência.',
            highlights: ['Construção esqueletizada de frente a verso', 'Calibre próprio CD-02', 'Caixa redonda de 43,5 mm e 11 mm de espessura'],
            prices: [
                { variant: 'Carbon / Black Gold · Z039-GG01-1G', price: 'R$ 4.990,00' },
                { variant: 'Silver / Silver Red · Z039-SS01-1S', price: 'R$ 4.990,00' }
            ]
        },
        'everest-summit': {
            name: 'Everest Summit',
            collection: 'Everest',
            image: 'imagens/produto-oficial.jpg',
            officialUrl: 'https://cigadesign.com/en-int/products/central-tourbillon-watch-everest-summit',
            description: 'Tourbillon central com mostrador esculpido em rocha genuína do Everest e ponteiros inspirados no histórico machado de gelo da expedição.',
            highlights: ['Mostrador em rocha genuína do Everest', 'Tourbillon central com calibre próprio CD-05', 'Ponteiros com Swiss Super-LumiNova'],
            prices: [{ variant: 'U053-TT02-6B · 45 mm', price: 'R$ 26.990,00' }]
        },
        'everest-70th-anniversary': {
            name: 'Everest · 70th Anniversary Edition',
            collection: 'Everest',
            image: 'imagens/produto-oficial.jpg',
            officialUrl: 'https://cigadesign.com/en-int/products/mount-everest-homage-edition',
            description: 'Edição comemorativa dedicada ao Everest, construída ao redor de um raro tourbillon central e produzida em baixa escala.',
            highlights: ['Tourbillon central temático do Monte Everest', 'Opções de caixa Titanium e DLC', 'Produção especializada e limitada'],
            prices: [{ variant: 'Titanium', price: null }, { variant: 'DLC', price: null }]
        },
        'zodiac-dragon': {
            name: 'Chinese Zodiac · Year of the Dragon',
            collection: 'Zodiac',
            image: 'imagens/produto-oficial.jpg',
            officialUrl: 'https://cigadesign.com/en-int/products/ciga-design-mechanical-watch-dragon',
            description: 'Uma expressão do zodíaco chinês com mostrador super black, ponte de tourbillon em forma de dragão e elementos em ágata natural.',
            highlights: ['Mostrador Super Black', 'Ponte de tourbillon em forma de dragão dourado', 'Detalhes produzidos em ágata natural'],
            prices: [{ variant: 'Super Black', price: null }]
        },
        'zodiac-horse': {
            name: 'Chinese Zodiac · Year of the Horse',
            collection: 'Zodiac',
            image: 'imagens/produto-oficial.jpg',
            officialUrl: 'https://cigadesign.com/en-int/products/ciga-design-central-tourbillon-watch-chinese-zodiac-year-of-the-horse',
            description: 'Edição limitada a 199 peças, com cavalo escultural dourado a 24K e tourbillon central desenvolvido pela CIGA design.',
            highlights: ['Edição limitada a 199 peças', 'Escultura de cavalo com acabamento dourado a 24K', 'Tourbillon central com calibre CD-12-SI'],
            prices: [{ variant: 'Edição limitada', price: null }]
        },
        'time-cipher': {
            name: 'Time Cipher',
            collection: 'Outros / Legado',
            image: 'imagens/produto-oficial.jpg',
            officialUrl: 'https://cigadesign.com/en-int/products/automatic-wandering-hour-watch-time-cipher',
            description: 'Uma leitura de horas errantes sobre um mostrador super black que absorve 99,4% da luz e destaca somente o movimento do tempo.',
            highlights: ['Exibição de horas errantes', 'Calibre próprio CD-08 sobre base Miyota 9000', 'Mostrador Super Black de alta absorção luminosa'],
            prices: [
                { variant: 'Silver · T021-SISI-6B', price: 'R$ 8.990,00' },
                { variant: 'Carbon · T021-SIGR-6B', price: 'R$ 8.990,00' }
            ]
        },
        'aircraft-carrier': {
            name: 'Aircraft Carrier',
            collection: 'Outros / Legado',
            image: 'https://cdn2.jomashop.com/media/catalog/product/cache/b3e31d40bbb1abcc90b26106659d5d3f/c/i/ciga-design-zseries-aircraft-carrier-automatic-grey-dial-mens-watch-z061iptiw5bk_3.jpg?height=800&width=800',
            officialUrl: 'https://www.jomashop.com/ciga-design-aircraft-carrier-automatic-grey-dial-mens-watch-z061-ipti-w5bk.html',
            sourceNote: 'Modelo legado conferido pelo SKU da planilha brasileira. Imagem de revendedor internacional do produto.',
            sourceLinkLabel: 'Ver referência da imagem e do modelo ↗',
            description: 'Relógio esqueletizado da Série Z inspirado na estrutura de um porta-aviões, com caixa tonneau em camadas e pulseiras temáticas.',
            highlights: ['Caixa tonneau de aço em construção de duas camadas', 'Movimento automático esqueletizado visível pela frente', 'Pulseira de silicone com grafismos inspirados em aviação'],
            prices: [
                { variant: 'Black · Z061-IPTI-W5BK', price: 'R$ 3.890,00' },
                { variant: 'Blue · Z061-IPTI-W5BU', price: 'R$ 3.890,00' }
            ]
        },
        'everest-65th-anniversary': {
            name: 'Everest China · 65th Anniversary',
            collection: 'Everest',
            image: 'https://cdn.shopify.com/s/files/1/0997/6584/6280/files/ciga-design-mount-everest-chinese-edition-watch-u053-tt01-6b_5b93f846-5768-443e-9f83-44ccb7230c48.webp?v=1783100562',
            officialUrl: 'https://www.hypewatches.co.uk/products/ciga-design-mount-everest-chinese-edition-watch-u053-tt01-6b',
            sourceNote: 'Edição conferida pelo SKU da planilha brasileira. Imagem de revendedor autorizado do produto.',
            sourceLinkLabel: 'Ver referência da imagem e do modelo ↗',
            description: 'Edição de 45 mm dedicada aos 65 anos da ascensão chinesa do Everest, com mostrador montanhoso e composição mecânica escultórica.',
            highlights: ['Referência comemorativa U053-TT01-6B', 'Caixa de titânio de 45 mm', 'Mostrador temático com relevo do Everest e emblema de 65 anos'],
            prices: [{ variant: 'U053-TT01-6B · 45 mm', price: 'R$ 16.990,00' }]
        }
    };
})();
