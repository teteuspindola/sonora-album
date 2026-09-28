# SONORA — Music Experience · by Omatheusrec®

Player online do álbum **Nossa História — Matheus & Kelly**.

▶️ **Ouça:** https://teteuspindola.github.io/sonora-album/

## Arquivos

| Arquivo | O que é |
| --- | --- |
| `index.html` | Estrutura da página |
| `style.css` | Visual (brandbook SONORA) e layouts desktop/celular |
| `app.js` | Player — os dados do álbum ficam em `albumData`, no topo |
| `cover.jpg` | Capa (1:1) · `cover-512.jpg` é a versão leve para a prévia do link |
| `tracks/` | Faixas em MP3 |

## Trocar o álbum

1. Coloque os MP3 em `tracks/` e a capa em `cover.jpg`.
2. Edite `albumData` no topo de `app.js` (título, artista e faixas: `id`, `title`, `duration`, `url`;
   `artist` e `feat` são opcionais).
3. Atualize o título e as tags `og:` em `index.html` (é o que aparece ao compartilhar o link).

## Como funciona

- **Desktop (≥ 768px):** 2 colunas — capa, controles e visualizador à esquerda; tracklist à direita.
- **Celular:** tela cheia (`100dvh`) com safe areas; a tracklist abre em gaveta pelo botão "A seguir".
- Toca em ordem, 01 → última faixa. O botão de repetir alterna: desligado → loop do álbum → repetir faixa.
- Tenta tocar sozinho ao abrir; se o navegador bloquear, mostra o botão **Ouvir álbum**.
- Tocar no tempo total alterna para o tempo restante.
- Controles na tela de bloqueio e nos fones (Media Session).
- Atalhos no computador: `espaço` · `←/→` (±10s) · `N`/`P` · `M`.
