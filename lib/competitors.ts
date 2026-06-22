import { Athlete } from "./types";

// ==========================================================================
//  COMPETIDORES (atletas) — TOP 50 do ranking OFICIAL PBR Brasil 2026.
//  Fonte: https://pbrbrazil.com/series/etapas/standings/?season=2026
//
//  A seção "Competidores que mais engajam" cruza estes nomes (e os @ quando
//  conhecidos) com a legenda dos posts dos ÚLTIMOS 15 DIAS e soma o
//  engajamento (interactions). Só aparece quem foi citado/marcado nos posts.
//
//  A página oficial NÃO traz o @ do Instagram. Os @ abaixo foram deduzidos
//  das marcações reais das legendas da PBR. Os marcados "// confirmar" são
//  prováveis — vale conferir. Para captar mais atletas no ranking de
//  engajamento, basta preencher o @instagram de cada um (campo instagram).
//  O comentário ao lado mostra a posição oficial e os pontos da temporada.
// ==========================================================================

export const COMPETITORS: Athlete[] = [
  { id: "joaopaulovelasco", name: "João Paulo Velasco", instagram: "@joaopaulo.velasco.rzt", hashtags: [] }, // #1 · 860
  { id: "warleyoliveira", name: "Warley Oliveira da Silva", instagram: "@warley.kafeofc", hashtags: [] }, // #2 · 621,5 — confirmar @
  { id: "cleberhenrique", name: "Cleber Henrique Marques", instagram: "@cleberhenriquemarques", hashtags: [] }, // #3 · 494
  { id: "gabrielhenrique", name: "Gabriel Henrique da Silva", instagram: "", hashtags: [] }, // #4 · 437
  { id: "alexoliveira", name: "Alex Oliveira", instagram: "", hashtags: [] }, // #5 · 418,67
  { id: "jhoncarlos", name: "Jhon Carlos Moreira", instagram: "", hashtags: [] }, // #6 · 414,5
  { id: "adenilson", name: "Adenilson dos Santos", instagram: "", hashtags: [] }, // #7 · 370
  { id: "dimasneto", name: "Dimas Neto", instagram: "", hashtags: [] }, // #8 · 347
  { id: "lucasaraujo", name: "Lucas Aráujo", instagram: "", hashtags: [] }, // #9 · 335,5
  { id: "mariodenegri", name: "Mario de Negri", instagram: "", hashtags: [] }, // #10 · 334,5
  { id: "alissondesouza", name: "Alisson De Souza", instagram: "@alissondesouza2707", hashtags: [] }, // #11 · 267
  { id: "paulohenrique", name: "Paulo Henrique da Silva", instagram: "", hashtags: [] }, // #12 · 266,5
  { id: "cladsonrodolfo", name: "Cladson Rodolfo", instagram: "", hashtags: [] }, // #13 · 265,5
  { id: "gabrielmorais", name: "Gabriel Morais", instagram: "", hashtags: [] }, // #14 · 248,17
  { id: "carlosandre", name: "Carlos André de Oliveira", instagram: "", hashtags: [] }, // #15 · 247
  { id: "josedecastro", name: "José de Castro", instagram: "@josealbertocastro_ofc", hashtags: [] }, // #16 · 235,5 — confirmar @
  { id: "gilvanfreitas", name: "Gilvan Freitas", instagram: "", hashtags: [] }, // #17 · 214,5
  { id: "yanvictor", name: "Yan Victor Cunha", instagram: "", hashtags: [] }, // #18 · 202,5
  { id: "wingsonhenrique", name: "Wingson Henrique da Silva", instagram: "", hashtags: [] }, // #19 · 189,5
  { id: "marcosvinicios", name: "Marcos Vinicios dos Santos", instagram: "", hashtags: [] }, // #20 · 177,5
  { id: "hidelvan", name: "Hidelvan Ribeiro", instagram: "", hashtags: [] }, // #21 · 163
  { id: "rogeriovenancio", name: "Rogério Venâncio", instagram: "", hashtags: [] }, // #22 · 159,5
  { id: "wesleimendes", name: "Weslei Mendes", instagram: "", hashtags: [] }, // #23 · 149,5
  { id: "rubensbarbosa", name: "Rubens Barbosa", instagram: "", hashtags: [] }, // #24 · 148,5
  { id: "saislandesouza", name: "Saislan de Souza", instagram: "", hashtags: [] }, // #25 · 142,5
  { id: "jeandersondesouza", name: "Jeanderson de Souza", instagram: "", hashtags: [] }, // #26 · 141
  { id: "edneliorodrigues", name: "Ednélio Rodrigues", instagram: "@ednelio_r_almeida", hashtags: [] }, // #27 · 129 — confirmar @
  { id: "joaovictorgarcia", name: "João Victor Garcia dos Santos", instagram: "", hashtags: [] }, // #28 · 127
  { id: "danielfeitosa", name: "Daniel Feitosa", instagram: "", hashtags: [] }, // #29 · 122,5
  { id: "lucasjunio", name: "Lucas Junio da Silveira", instagram: "", hashtags: [] }, // #30 · 121
  { id: "evertonsantos", name: "Everton dos Santos", instagram: "", hashtags: [] }, // #31 · 119
  { id: "maikoncalixton", name: "Maikon Calixton Rocha", instagram: "", hashtags: [] }, // #31 · 119
  { id: "gustavoluiz", name: "Gustavo Luiz da Silva", instagram: "", hashtags: [] }, // #33 · 109,5
  { id: "higormoises", name: "Higor Moises Pereira", instagram: "", hashtags: [] }, // #34 · 97,5
  { id: "josemarcosfilho", name: "José Marcos Filho", instagram: "", hashtags: [] }, // #35 · 96
  { id: "arthurdasilva", name: "Arthur da Silva", instagram: "", hashtags: [] }, // #36 · 85
  { id: "andersonoliveira", name: "Anderson de Oliveira", instagram: "", hashtags: [] }, // #37 · 80
  { id: "fredericomargarido", name: "Frederico Araujo Margarido", instagram: "", hashtags: [] }, // #38 · 72,5
  { id: "talesxavier", name: "Tales Xavier", instagram: "", hashtags: [] }, // #39 · 64,5
  { id: "carlossouzafilho", name: "Carlos Souza Filho", instagram: "", hashtags: [] }, // #40 · 59
  { id: "alandesouza", name: "Alan de Souza", instagram: "@alandesouza2707", hashtags: [] }, // #41 · 58,5
  { id: "caiosilva", name: "Caio Silva", instagram: "", hashtags: [] }, // #42 · 57,5
  { id: "jeandafonseca", name: "Jean da Fonseca", instagram: "", hashtags: [] }, // #43 · 55
  { id: "ricardorosavais", name: "Ricardo Rosa Vais", instagram: "", hashtags: [] }, // #43 · 55
  { id: "otnieldasilva", name: "Otniel da Silva", instagram: "", hashtags: [] }, // #45 · 51
  { id: "leandrodasilva", name: "Leandro da Silva", instagram: "", hashtags: [] }, // #46 · 50,5
  { id: "niltonbatista", name: "Nilton Batista", instagram: "", hashtags: [] }, // #47 · 48,5
  { id: "lauronunes", name: "Lauro Nunes Vieira", instagram: "", hashtags: [] }, // #48 · 47
  { id: "wemersonalves", name: "Wemerson Alves", instagram: "", hashtags: [] }, // #49 · 45,5
  { id: "vitormanoeldias", name: "Vitor Manoel Dias", instagram: "", hashtags: [] }, // #50 · 43,17
];
