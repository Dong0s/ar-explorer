# AR Explorer

Mini-jogo de realidade aumentada que roda direto no navegador, sem build e sem
dependencia instalada (o Three.js vem por CDN). Tudo esta em `index.html`.

## Como rodar

```bash
node ar-game/server.js
```

Depois abra <http://localhost:8080>.

A camera do navegador so e liberada em `http://localhost` ou em `https://` — por isso
o servidor local. Abrir o arquivo com duplo clique (`file://`) nao funciona.

## Os tres modos de entrada

| Botao | Quando aparece | O que faz |
|---|---|---|
| **Iniciar em AR real (WebXR)** | so quando o aparelho suporta `immersive-ar` (Chrome no Android, headsets) | AR de verdade: a posicao do seu corpo move a camera |
| **Iniciar com a camera** | sempre | usa a camera traseira como fundo + giroscopio para olhar |
| **Jogar sem camera (modo teste)** | sempre | fundo escuro, so mouse e teclado — bom para testar no PC |

## Como se joga

- **Olhar** — gire o celular (giroscopio) ou arraste o mouse no PC.
- **Andar** — joystick no canto inferior esquerdo (toque) ou `W A S D` / setas (PC).
  A area e um circulo de 2,5 m de raio, marcado no chao; voce nao consegue sair dele.
- **Observar um objeto** — deixe a mira central sobre ele por ~1,2 s. O anel verde
  fecha, o nome aparece e o contador sobe.
- **Trocar de cenario** — encare uma das setas laterais por **3 segundos**
  (anel amarelo). Sao 4 areas em ciclo: Jardim → Museu → Laboratorio → Espaco.

## Mexer no jogo

Tudo que da pra ajustar rapido esta no topo do `<script type="module">`:

```js
const RAIO_AREA  = 2.5;    // tamanho da area caminhavel, em metros
const DWELL_OBJ  = 1200;   // ms encarando um objeto para observa-lo
const DWELL_SETA = 3000;   // ms encarando a seta para trocar de area
const VELOCIDADE = 1.4;    // m/s
```

Para criar cenarios ou objetos novos, edite a lista `AREAS`. Cada objeto e montado
com pecas primitivas:

```js
{ nome:'Cogumelo', desc:'texto que aparece ao observar',
  partes:[
    {g:'cyl', a:[.06,.08,.3,12], p:[0,.15,0], c:0xf3e9d6},
    {g:'sph', a:[.22,18,12],     p:[0,.32,0], c:0xe0544a, e:[1,.62,1]}
  ] }
```

- `g` — geometria: `box` `sph` `cyl` `con` `tor` `oct` `dod`
- `a` — argumentos da geometria do Three.js
- `p` — posicao local `[x,y,z]` (y = 0 e o chao)
- `c` — cor, `r` — rotacao em radianos, `e` — escala (ambos opcionais)

As setas e o contador se adaptam sozinhos ao numero de areas e de objetos.

## Cenarios

Cada area tem um cenario proprio montado na secao **3B** do script: arvores e
arbustos no Jardim, colunas e paredes no Museu, racks e tanques no Laboratorio,
plataforma flutuante e asteroides no Espaco. Nada disso e interativo — a mira
so reconhece os objetos e as setas.

A ambientacao vem dos campos no topo de cada area:

```js
cenario:'jardim',                  // qual funcao de cenario usar
ceu:[0x6fbcf0, 0xdaf0b6],          // degrade do domo (topo, horizonte)
sol:[0xfff2d8, 2.2],               // cor e forca da luz direcional
amb:1.8,                           // luz ambiente: quanto menor, mais dramatico
chao:0x2f6b38,                     // cor do piso e do terreno
```

Duas coisas mudam conforme o modo:

- **No AR / com camera** o domo do ceu e o terreno amplo nao sao criados, e o
  piso da area fica translucido — quem faz o papel de chao e de fundo e o seu
  ambiente real, que aparece pela camera. Voce ve so as estruturas em volta,
  como um cenario holografico sobreposto ao comodo.
- **No modo sem camera** o domo e o terreno entram, fechando o mundo.

As setas ficam sempre em `+X` e `-X`. A funcao `livre(angulo)` mantem um
corredor limpo nessas duas direcoes, para o cenario nunca nascer na frente de
uma seta e esconde-la — por isso o Museu tem duas passagens abertas na parede.
Se voce criar um cenario novo, use `if(!livre(a)) continue;` nos lacos que
distribuem coisas em circulo.

## Testar no celular

Como celular nao e `localhost`, o navegador vai bloquear a camera em `http://IP:8080`.
Duas saidas:

1. **Tunel https** — `npx localtunnel --port 8080` (ou ngrok) e abrir a URL https no celular.
2. **Flag do Chrome** — em `chrome://flags/#unsafely-treat-insecure-origin-as-secure`,
   adicionar `http://SEU_IP:8080` e reiniciar o navegador.
