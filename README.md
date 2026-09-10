# AR Explorer

Mini-jogo em primeira pessoa que roda direto no navegador, sem build e sem
dependencia instalada (o Three.js vem por CDN). Tudo esta em `index.html`.

**Jogue agora:** <https://dong0s.github.io/ar-explorer/>

O jogo **nao usa a camera**. O celular entra so como sensor de movimento: o
giroscopio gira a cabeca dentro do jogo, e o fundo e sempre o cenario 3D
montado no proprio `index.html`, nunca o ambiente real.

## Como rodar localmente

```bash
node server.js
```

Depois abra <http://localhost:8080>.

Como nao ha mais camera nem WebXR, abrir o `index.html` com duplo clique
(`file://`) tambem funciona — o servidor local so e util para testar no celular
pela rede.

## Como se joga

Dois botoes: **Jogar deitado (paisagem)** e **Jogar em pe**. Os dois pedem
permissao para os sensores de movimento (obrigatorio no iOS); se voce recusar,
da para olhar arrastando o dedo.

O primeiro entra em tela cheia e trava a orientacao em paisagem. Isso importa
porque, com a rotacao automatica do celular desligada, a pagina continua
desenhada em pe por mais que voce vire o aparelho — e o jogo fica com o
horizonte de lado. A tela cheia e a unica forma de a pagina girar sem depender
do ajuste do sistema. Se o navegador nao deixar travar (o Safari do iOS nao
deixa), a dica no rodape pede para ligar a rotacao automatica.

Nem todo navegador entrega os sensores: o **Brave** bloqueia por padrao, no
escudo contra fingerprinting, e navegador aberto dentro de outro app
(WhatsApp, Instagram) costuma bloquear tambem. No Chrome funciona.

- **Olhar** — gire o celular (giroscopio) ou arraste o mouse no PC.
- **Andar** — ande de verdade, com o celular na mao: o jogo conta seus passos pelo
  acelerometro e avanca 0,7 m na direcao em que voce esta olhando. No PC, `W A S D`
  / setas. A area e um circulo de 2,5 m de raio, marcado no chao; voce nao consegue
  sair dele.
  O joystick de toque so aparece se o acelerometro do aparelho nao responder.
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
const VELOCIDADE = 1.4;    // m/s do joystick e do W A S D

const PASSO        = .7;   // metros que cada passo detectado anda
const LIMIAR_PASSO = 1.2;  // m/s2 acima do repouso para contar um passo
const PAUSA_PASSO  = 300;  // ms minimos entre dois passos
```

`LIMIAR_PASSO` e o botao a girar se a contagem sair errada: **suba** se o jogo
andar sozinho com o celular parado na mao, **desca** se ele perder passos.

## Se o celular nao responder

Abra o jogo com `?diag=1` no fim do endereco —
<https://dong0s.github.io/ar-explorer/?diag=1> — e um painel no canto mostra qual
fonte de sensor esta em uso, quantas leituras chegaram, os angulos crus, quantos
passos foram contados e o estado da permissao. E por ali que da para saber se o
problema e permissao, falta de sensor ou o limiar dos passos.

Para a orientacao o jogo tenta quatro caminhos, e basta um responder:
`deviceorientation`, `deviceorientationabsolute`, `RelativeOrientationSensor` e
`AbsoluteOrientationSensor`. Os dois primeiros sao eventos antigos; os dois
ultimos, a Generic Sensor API, que so entra se os eventos ficarem mudos. A
`Absolute` importa em celular **sem giroscopio**: ela se vira com acelerometro
+ bussola. Se nada responder, o arraste do dedo assume e a dica no rodape avisa.

A linha `eventos` do painel separa os casos: `orient 0 / abs 0 / motion 0`
significa que o navegador nao esta entregando sensor nenhum (permissao, ou
navegador dentro de outro app); `orient 0 / abs 240` significa que existe
bussola mas nao giroscopio; `sem alfa` alto significa sensor sem bussola, em
que so a inclinacao funciona.

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

O domo do ceu e o terreno amplo de 34 m entram sempre, fechando o mundo em
volta do jogador — e o cenario que faz o fundo, em qualquer aparelho.

As setas ficam sempre em `+X` e `-X`. A funcao `livre(angulo)` mantem um
corredor limpo nessas duas direcoes, para o cenario nunca nascer na frente de
uma seta e esconde-la — por isso o Museu tem duas passagens abertas na parede.
Se voce criar um cenario novo, use `if(!livre(a)) continue;` nos lacos que
distribuem coisas em circulo.

## Testar no celular

O jeito mais simples e abrir <https://dong0s.github.io/ar-explorer/> direto no
celular.

Para testar uma versao **ainda nao publicada**: o giroscopio, como a camera
antes dele, so e liberado em `https://` ou `http://localhost` — entao
`http://SEU_IP:8080` abre o jogo no celular, mas sem sensor (so o arraste do
dedo funciona). Para testar com sensor:

1. **Tunel https** — `npx localtunnel --port 8080` (ou ngrok) e abrir a URL https no celular.
2. **Flag do Chrome** — em `chrome://flags/#unsafely-treat-insecure-origin-as-secure`,
   adicionar `http://SEU_IP:8080` e reiniciar o navegador.

## Publicar uma alteracao

O site sai do branch `main`, pasta raiz. Entao publicar e so:

```bash
git add -A
git commit -m "o que mudou"
git push
```

O GitHub Pages reconstroi sozinho em cerca de um minuto.
