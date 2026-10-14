// Cartela de cores do simulador. Os códigos Pantone/TCX são a referência de
// produção; o hexadecimal é uma aproximação para exibição na tela.
export const CORES = [
  { id: 'branco', nome: 'Branco', ref: '', hex: '#FFFFFF' },
  { id: 'cinza-claro', nome: 'Cinza Claro', ref: 'Cool Gray 3 C', hex: '#C8C9C7' },
  { id: 'cinza-medio', nome: 'Cinza Médio', ref: 'Cool Gray 7 C', hex: '#97999B' },
  { id: 'cinza-escuro', nome: 'Cinza Escuro', ref: 'Cool Gray 10 C', hex: '#63666A' },
  { id: 'grafite', nome: 'Grafite', ref: '432 C', hex: '#333F48' },
  { id: 'chumbo', nome: 'Chumbo', ref: 'Black C', hex: '#2D2926' },
  { id: 'preto', nome: 'Preto', ref: '', hex: '#111111' },
  { id: 'amarelo-claro', nome: 'Amarelo Claro', ref: '100 C', hex: '#F6EB61' },
  { id: 'amarelo-canario', nome: 'Amarelo Canário', ref: '012 C', hex: '#FFD700' },
  { id: 'amarelo-mostarda', nome: 'Amarelo Mostarda', ref: '124 C', hex: '#EAAA00' },
  { id: 'ocre-escuro', nome: 'Ocre Escuro', ref: '126 C', hex: '#B58500' },
  { id: 'dourado-escuro', nome: 'Dourado Escuro', ref: '871 C', hex: '#84754E' },
  { id: 'laranja-claro', nome: 'Laranja Claro', ref: '1365 C', hex: '#FFB25B' },
  { id: 'laranja-vivo', nome: 'Laranja Vivo', ref: '151 C', hex: '#FF8200' },
  { id: 'terracota', nome: 'Terracota', ref: '159 C', hex: '#CB6015' },
  { id: 'coral', nome: 'Coral', ref: '178 C', hex: '#FF585D' },
  { id: 'vermelho-vivo', nome: 'Vermelho Vivo', ref: '032 C', hex: '#EF3340' },
  { id: 'vermelho-escarlate', nome: 'Vermelho Escarlate', ref: '199 C', hex: '#D50032' },
  { id: 'vermelho-medio', nome: 'Vermelho Médio', ref: '19-1763 TCX', hex: '#B51723' },
  { id: 'vinho', nome: 'Vinho', ref: '195 C', hex: '#782F40' },
  { id: 'bordo', nome: 'Bordô', ref: '4975 C', hex: '#4E1F26' },
  { id: 'rosa-claro', nome: 'Rosa Claro', ref: '189 C', hex: '#F8A3BC' },
  { id: 'rosa', nome: 'Rosa', ref: '212 C', hex: '#F04E98' },
  { id: 'pink', nome: 'Pink', ref: '219 C', hex: '#DA1884' },
  { id: 'magenta', nome: 'Magenta', ref: 'Rhodamine Red C', hex: '#E10098' },
  { id: 'magenta-escuro', nome: 'Magenta Escuro', ref: '228 C', hex: '#890C58' },
  { id: 'lavanda', nome: 'Lavanda', ref: '263 C', hex: '#D7C6E6' },
  { id: 'lilas', nome: 'Lilás', ref: '2587 C', hex: '#8246AF' },
  { id: 'violeta', nome: 'Violeta', ref: 'Violet C', hex: '#440099' },
  { id: 'roxo-escuro', nome: 'Roxo Escuro', ref: '2695 C', hex: '#2E1A47' },
  { id: 'azul-claro', nome: 'Azul Claro', ref: '290 C', hex: '#B9D9EB' },
  { id: 'azul-turquesa', nome: 'Azul Turquesa', ref: '15-5217 TCX', hex: '#53B0AE' },
  { id: 'azul-ciano', nome: 'Azul Ciano', ref: '16-4529 TCX', hex: '#3BAFED' },
  { id: 'azul-celeste', nome: 'Azul Celeste', ref: '299 C', hex: '#00A3E0' },
  { id: 'azul-royal', nome: 'Azul Royal', ref: '293 C', hex: '#003DA5' },
  { id: 'azul-escuro', nome: 'Azul Escuro', ref: '2757 C', hex: '#001E60' },
  { id: 'azul-marinho', nome: 'Azul Marinho', ref: '282 C', hex: '#041E42' },
  { id: 'verde-limao', nome: 'Verde Limão', ref: '375 C', hex: '#97D700' },
  { id: 'verde-claro', nome: 'Verde Claro', ref: '360 C', hex: '#6CC24A' },
  { id: 'verde-esmeralda', nome: 'Verde Esmeralda', ref: '347 C', hex: '#009A44' },
  { id: 'verde-bandeira', nome: 'Verde Bandeira', ref: '356 C', hex: '#007A33' },
  { id: 'verde-musgo', nome: 'Verde Musgo', ref: '364 C', hex: '#4A7729' },
  { id: 'verde-escuro', nome: 'Verde Escuro', ref: '357 C', hex: '#215732' },
  { id: 'areia', nome: 'Areia', ref: '467 C', hex: '#B9975B' },
  { id: 'bege', nome: 'Bege', ref: '465 C', hex: '#C1A875' },
  { id: 'marrom-claro', nome: 'Marrom Claro', ref: '729 C', hex: '#B58150' },
  { id: 'marrom-escuro', nome: 'Marrom Escuro', ref: 'Black 5 C', hex: '#3E2B2E' },
  { id: 'chocolate', nome: 'Chocolate', ref: '4625 C', hex: '#4F2C1D' },
];

const POR_ID = Object.fromEntries(CORES.map((c) => [c.id, c]));

export const cor = (id) => POR_ID[id] ?? POR_ID.branco;
export const hex = (id) => cor(id).hex;
export const rotulo = (id) => {
  const c = cor(id);
  return c.ref ? `${c.nome} (${c.ref})` : c.nome;
};

function rgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Cor da cartela mais próxima de um hexadecimal qualquer.
export function maisProxima(h) {
  if (!h || !/^#[0-9a-f]{6}$/i.test(h)) return null;
  const [r, g, b] = rgb(h);
  let melhor = null;
  let dist = Infinity;
  for (const c of CORES) {
    const [r2, g2, b2] = rgb(c.hex);
    const d = 2 * (r - r2) ** 2 + 4 * (g - g2) ** 2 + 3 * (b - b2) ** 2;
    if (d < dist) { dist = d; melhor = c.id; }
  }
  return melhor;
}

// Luminância relativa, usada para escolher contornos e textos legíveis.
export function luminancia(id) {
  const [r, g, b] = rgb(hex(id)).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
