/**
 * SONORA — Music Experience · by Omatheusrec®
 * Player de álbum em JavaScript puro (sem build), pronto para o GitHub Pages.
 */

/* ============================================================================
 * 🎵 DADOS DO ÁLBUM — edite aqui
 * ----------------------------------------------------------------------------
 * title    Título do álbum
 * artist   Artista principal (aparece quando a faixa não define o seu)
 * cover    Caminho da capa (quadrada, 1:1)
 * tracks   Faixas, na ordem em que tocam:
 *   id        Número da faixa ("01", "02"…)
 *   title     Nome da faixa
 *   artist    (opcional) Artista da faixa — substitui o do álbum
 *   feat      (opcional) Artista convidado — aparece como "feat. Nome"
 *   duration  Duração exibida antes do áudio carregar ("m:ss");
 *             o player troca pelo valor real assim que lê o arquivo
 *   url       Caminho do MP3 (ex.: "tracks/01-faixa.mp3")
 * ========================================================================== */
const albumData = {
  title: "Nossa História",
  artist: "Matheus & Kelly",
  cover: "cover.jpg",
  tracks: [
    { id: "01", title: "O Começo", duration: "4:29", url: "tracks/01-o-comeco.mp3" },
    { id: "02", title: "Eu Nunca Deixei de Te Amar", duration: "4:28", url: "tracks/02-eu-nunca-deixei-de-te-amar.mp3" },
    { id: "03", title: "Daquele Apartamento", duration: "3:28", url: "tracks/03-daquele-apartamento.mp3" },
    { id: "04", title: "O Dia em que Verei Sua", duration: "4:31", url: "tracks/04-o-dia-em-que-verei-sua.mp3" },
    { id: "05", title: "Agora Somos Três", duration: "4:32", url: "tracks/05-agora-somos-tres.mp3" },
    { id: "06", title: "Nosso Maior Sonho", duration: "4:28", url: "tracks/06-nosso-maior-sonho.mp3" },
    { id: "07", title: "Nossa História, Nosso Pra", duration: "6:24", url: "tracks/07-nossa-historia-nosso-pra.mp3" },
  ],
};

(() => {
  "use strict";

  /* ---------------------------------------------------------------- ícones (traços do Lucide) */
  const ICONS = {
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    "skip-back": '<polygon points="19 20 9 12 19 4 19 20"/><line x1="5" x2="5" y1="19" y2="5"/>',
    "skip-forward": '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    "repeat-1":
      '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><path d="M11 10h1v4"/>',
    "volume-2":
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    "volume-1": '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
    "volume-x": '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',
    "list-music":
      '<path d="M21 15V6"/><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M12 12H3"/><path d="M16 6H3"/><path d="M12 18H3"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  };
  const setIcon = (svg, name) => {
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.dataset.icon = name;
    svg.innerHTML = ICONS[name];
  };
  const iconSvg = (name, cls = "") => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (cls) svg.setAttribute("class", cls);
    setIcon(svg, name);
    return svg;
  };
  document.querySelectorAll("svg[data-icon]").forEach((svg) => setIcon(svg, svg.dataset.icon));

  // Símbolo SONORA: 7 barras com o gradiente oficial e um brilho suave
  const LOGO_BARS = [0.28, 0.5, 0.78, 1, 0.78, 0.5, 0.28];
  document.querySelectorAll("[data-wavemark]").forEach((svg, n) => {
    const id = `wm${n}`;
    const bars = LOGO_BARS.map((h, i) => {
      const height = h * 44;
      return `<rect x="${3 + i * 10}" y="${24 - height / 2}" width="4.4" height="${height}" rx="2.2"/>`;
    }).join("");
    svg.innerHTML = `
      <defs>
        <linearGradient id="${id}"><stop offset="0" stop-color="#57C8BC"/><stop offset="1" stop-color="#E9A33C"/></linearGradient>
        <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter>
      </defs>
      <g fill="url(#${id})" filter="url(#${id}b)" opacity=".7">${bars}</g>
      <g fill="url(#${id})">${bars}</g>`;
  });

  /* ---------------------------------------------------------------- utilidades */
  const $ = (id) => document.getElementById(id);
  const fmt = (s) => {
    if (!Number.isFinite(s) || s < 0) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };
  const parseDuration = (str) => (str ? str.split(":").reduce((acc, p) => acc * 60 + Number(p), 0) : 0);
  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
  const CYAN = [87, 200, 188];
  const AMBER = [233, 163, 60];

  const album = albumData;
  const tracks = album.tracks;
  const audio = $("audio");
  const root = document.documentElement;
  const desktopMQ = window.matchMedia("(min-width: 768px)");

  const state = {
    index: 0,
    wantPlay: true, // a página abre já tentando tocar
    entered: false,
    loop: "off", // "off" (01 → fim) | "all" (loop do álbum) | "one" (repete a faixa)
    showRemaining: false,
    scrub: null, // 0..1 enquanto arrasta
    durations: {},
    volume: 0.85,
  };

  const durationOf = (t) => state.durations[t.id] || parseDuration(t.duration);
  const artistLine = (t) => [t.artist || album.artist, t.feat && `feat. ${t.feat}`].filter(Boolean).join(" · ");
  const hasNext = () => state.index < tracks.length - 1 || state.loop !== "off";
  const nextTrack = () => tracks[(state.index + 1) % tracks.length];

  // iOS ignora audio.volume (só os botões físicos mudam o volume): lá mostramos apenas o mudo
  const probe = document.createElement("audio");
  probe.volume = 0.5;
  if (probe.volume !== 0.5) root.classList.add("no-volume");

  /* ---------------------------------------------------------------- conteúdo fixo */
  document.querySelectorAll("img[data-cover]").forEach((img) => (img.src = album.cover));
  $("cover-img").alt = `Capa de ${album.title}`;
  $("album-title").textContent = album.title;
  $("list-album").textContent = album.title;
  $("welcome-title").textContent = album.title;
  $("welcome-sub").textContent = `${album.artist} · ${tracks.length} faixas`;
  $("next-up-count").textContent = `${tracks.length} faixas`;

  const updateAlbumSub = () => {
    const total = tracks.reduce((sum, t) => sum + durationOf(t), 0);
    $("list-sub").textContent = `${album.artist} · ${tracks.length} faixas · ${fmt(total)}`;
  };

  // Tracklist
  const list = $("tracks");
  const rows = tracks.map((t, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "track";
    btn.innerHTML = `
      <span class="track-num"><span class="n">${t.id}</span></span>
      <span class="track-text">
        <span class="track-title"></span>
        <span class="track-artist"></span>
      </span>
      <span class="track-time"></span>`;
    btn.querySelector(".track-title").textContent = t.title;
    btn.querySelector(".track-artist").textContent = artistLine(t);
    btn.querySelector(".track-num").appendChild(iconSvg("play", "solid hover-play"));
    btn.addEventListener("click", () => (i === state.index ? togglePlay() : goTo(i)));
    li.appendChild(btn);
    list.appendChild(li);
    return btn;
  });

  const renderDurations = () => {
    rows.forEach((row, i) => (row.querySelector(".track-time").textContent = fmt(durationOf(tracks[i]))));
    updateAlbumSub();
  };

  // Visualizador
  const VIZ_BARS = 40;
  const viz = $("viz");
  const vizBars = Array.from({ length: VIZ_BARS }, (_, i) => {
    const span = document.createElement("span");
    span.style.background = mix(CYAN, AMBER, i / (VIZ_BARS - 1));
    viz.appendChild(span);
    return span;
  });
  const levels = new Float32Array(VIZ_BARS);

  /* ---------------------------------------------------------------- render da faixa atual */
  const renderTrack = () => {
    const t = tracks[state.index];
    const title = $("track-title");
    title.textContent = t.title;
    title.classList.remove("swap");
    void title.offsetWidth; // reinicia a animação de entrada
    title.classList.add("swap");
    $("track-artist").textContent = artistLine(t);
    $("track-pos").textContent = `Faixa ${t.id} de ${String(tracks.length).padStart(2, "0")}`;
    document.title = `${t.title} · ${album.artist} — SONORA`;

    rows.forEach((row, i) => {
      const active = i === state.index;
      row.classList.toggle("active", active);
      row.toggleAttribute("aria-current", active);
      const num = row.querySelector(".track-num");
      const eq = num.querySelector(".eq");
      if (active && !eq) {
        num.querySelector(".n").style.display = "none";
        num.insertAdjacentHTML("afterbegin", '<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>');
      } else if (!active && eq) {
        eq.remove();
        num.querySelector(".n").style.display = "";
      }
    });
    renderNext();
    scrollActiveIntoList();
    updateMediaSession();
  };

  const renderNext = () => {
    const label = hasNext() ? nextTrack().title : "Fim do álbum";
    $("next-up-title").textContent = label;
    $("list-next").textContent = label;
  };

  // Rola só a lista (scrollIntoView rolaria a página inteira no celular)
  const scrollActiveIntoList = () => {
    if (!desktopMQ.matches && !root.classList.contains("sheet-open")) return;
    const row = rows[state.index].parentElement;
    list.scrollTo({ top: Math.max(0, row.offsetTop - list.clientHeight / 2 + row.clientHeight / 2), behavior: "smooth" });
  };

  const renderPlayState = () => {
    const playing = !audio.paused;
    root.classList.toggle("is-playing", playing);
    root.classList.toggle("paused", !playing);
    $("status-text").textContent = playing ? "Ao vivo" : "Pausado";
    const btn = $("btn-play");
    btn.setAttribute("aria-label", playing ? "Pausar" : "Tocar");
    setIcon(btn.querySelector("svg"), playing ? "pause" : "play");
  };

  const shownDuration = () => audio.duration || durationOf(tracks[state.index]);

  const renderTime = () => {
    const dur = shownDuration();
    const time = state.scrub != null ? state.scrub * dur : audio.currentTime;
    const p = dur ? Math.min(1, time / dur) : 0;
    $("fill").style.width = `${p * 100}%`;
    $("thumb").style.left = `${p * 100}%`;
    $("time-current").textContent = fmt(time);
    $("time-total").textContent = state.showRemaining ? `-${fmt(dur - time)}` : fmt(dur);
    const s = $("scrubber");
    s.setAttribute("aria-valuemax", Math.round(dur));
    s.setAttribute("aria-valuenow", Math.round(time));
    s.setAttribute("aria-valuetext", `${fmt(time)} de ${fmt(dur)}`);
    const lit = Math.floor(p * VIZ_BARS);
    vizBars.forEach((b, i) => b.classList.toggle("on", i <= lit && p > 0));
  };

  const renderLoop = () => {
    const btn = $("btn-loop");
    const labels = { off: "Loop do álbum: desligado", all: "Loop do álbum: ligado", one: "Repetindo a faixa" };
    btn.classList.toggle("on", state.loop !== "off");
    btn.setAttribute("aria-label", labels[state.loop]);
    btn.title = labels[state.loop];
    setIcon(btn.querySelector("svg"), state.loop === "one" ? "repeat-1" : "repeat");
    const mode = $("list-mode");
    mode.textContent = { off: "Em ordem", all: "Álbum em loop", one: "Faixa em loop" }[state.loop];
    mode.classList.toggle("on", state.loop !== "off");
    renderNext();
  };

  const renderVolume = () => {
    const v = audio.muted ? 0 : state.volume;
    const input = $("volume");
    input.value = v;
    input.style.setProperty("--vol-track", `linear-gradient(90deg, #57C8BC, #E9A33C ${v * 100}%, rgba(255,255,255,.12) ${v * 100}%)`);
    const mute = $("btn-mute");
    setIcon(mute.querySelector("svg"), v === 0 ? "volume-x" : v < 0.5 ? "volume-1" : "volume-2");
    mute.setAttribute("aria-label", audio.muted ? "Ativar som" : "Silenciar");
  };

  /* ---------------------------------------------------------------- reprodução */
  const play = async () => {
    state.wantPlay = true;
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    try {
      await audio.play();
      state.entered = true;
      $("welcome").hidden = true;
    } catch (err) {
      // NotAllowedError = o navegador bloqueou o autoplay com som
      if (err && err.name === "NotAllowedError" && !state.entered) showWelcome();
    }
  };

  const pause = () => {
    state.wantPlay = false;
    audio.pause();
  };

  const togglePlay = () => (audio.paused ? play() : pause());

  const load = (i) => {
    state.index = i;
    audio.src = tracks[i].url;
    audio.load();
    renderTrack();
    renderTime();
    if (state.wantPlay) play();
  };

  const goTo = (i, autoplay = true) => {
    const n = tracks.length;
    const target = ((i % n) + n) % n;
    state.wantPlay = autoplay;
    if (target === state.index && audio.src) {
      audio.currentTime = 0;
      if (autoplay) play();
      return;
    }
    load(target);
  };

  const next = () => goTo(state.index + 1);
  const prev = () => {
    // Como nos players clássicos: depois de 3s, "voltar" reinicia a faixa atual
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    goTo(state.index - 1);
  };

  const seekTo = (ratio) => {
    const dur = shownDuration();
    if (!dur) return;
    audio.currentTime = Math.max(0, Math.min(1, ratio)) * dur;
    renderTime();
  };

  audio.addEventListener("play", renderPlayState);
  audio.addEventListener("pause", renderPlayState);
  audio.addEventListener("timeupdate", () => state.scrub == null && renderTime());
  audio.addEventListener("loadedmetadata", () => {
    state.durations[tracks[state.index].id] = audio.duration;
    renderDurations();
    renderTime();
  });
  // Ordem estrita: 01 → 02 → … → fim do álbum (ou recomeça, com o loop ligado)
  audio.addEventListener("ended", () => {
    if (state.loop === "one") {
      audio.currentTime = 0;
      play();
    } else if (hasNext()) {
      next();
    } else {
      state.wantPlay = false;
      renderPlayState();
    }
  });

  /* ---------------------------------------------------------------- boas-vindas */
  const showWelcome = () => {
    const w = $("welcome");
    w.hidden = false;
    $("btn-start").focus();
  };
  $("btn-start").addEventListener("click", () => goTo(0));

  /* ---------------------------------------------------------------- controles */
  $("btn-play").addEventListener("click", togglePlay);
  $("btn-next").addEventListener("click", next);
  $("btn-prev").addEventListener("click", prev);
  $("btn-loop").addEventListener("click", () => {
    state.loop = { off: "all", all: "one", one: "off" }[state.loop];
    renderLoop();
  });
  $("btn-mute").addEventListener("click", () => {
    if (audio.muted && state.volume === 0) state.volume = 0.6;
    audio.muted = !audio.muted;
    audio.volume = state.volume;
    renderVolume();
  });
  $("volume").addEventListener("input", (e) => {
    state.volume = Number(e.target.value);
    audio.volume = state.volume;
    audio.muted = state.volume === 0;
    renderVolume();
  });
  $("time-total").addEventListener("click", () => {
    state.showRemaining = !state.showRemaining;
    renderTime();
  });

  // Barra de progresso: clicar ou arrastar
  const scrubber = $("scrubber");
  const ratioFrom = (e) => {
    const r = scrubber.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  };
  scrubber.addEventListener("pointerdown", (e) => {
    scrubber.setPointerCapture(e.pointerId);
    scrubber.classList.add("dragging");
    state.scrub = ratioFrom(e);
    renderTime();
  });
  scrubber.addEventListener("pointermove", (e) => {
    if (state.scrub == null) return;
    state.scrub = ratioFrom(e);
    renderTime();
  });
  const endScrub = (e, commit) => {
    if (state.scrub == null) return;
    scrubber.classList.remove("dragging");
    const r = commit ? ratioFrom(e) : null;
    state.scrub = null;
    if (r != null) seekTo(r);
    else renderTime();
  };
  scrubber.addEventListener("pointerup", (e) => endScrub(e, true));
  scrubber.addEventListener("pointercancel", (e) => endScrub(e, false));
  scrubber.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 30 : 5;
    const dur = shownDuration();
    if (e.key === "ArrowRight") seekTo((audio.currentTime + step) / dur);
    else if (e.key === "ArrowLeft") seekTo((audio.currentTime - step) / dur);
    else if (e.key === "Home") seekTo(0);
    else if (e.key === "End") seekTo(0.999);
    else return;
    e.preventDefault();
  });

  // Atalhos de teclado (desktop)
  window.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, [role=slider]")) return;
    const k = e.key.toLowerCase();
    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    } else if (e.key === "ArrowRight") audio.currentTime = Math.min(shownDuration(), audio.currentTime + 10);
    else if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 10);
    else if (k === "n") next();
    else if (k === "p") prev();
    else if (k === "m") $("btn-mute").click();
    else if (e.key === "Escape") closeSheet();
  });

  /* ---------------------------------------------------------------- gaveta da tracklist (celular) */
  const sheet = $("tracklist");
  const openSheet = () => {
    root.classList.add("sheet-open");
    $("btn-open-list").setAttribute("aria-expanded", "true");
    requestAnimationFrame(scrollActiveIntoList);
  };
  const closeSheet = () => {
    root.classList.remove("sheet-open");
    $("btn-open-list").setAttribute("aria-expanded", "false");
  };
  $("btn-open-list").addEventListener("click", openSheet);
  $("btn-close-list").addEventListener("click", closeSheet);
  $("scrim").addEventListener("click", closeSheet);

  // Arrastar a alça para baixo fecha a gaveta
  const grip = $("sheet-grip");
  let dragStart = null;
  let dragY = 0;
  grip.addEventListener("pointerdown", (e) => {
    if (desktopMQ.matches || e.target.closest("button")) return;
    dragStart = e.clientY;
    grip.setPointerCapture(e.pointerId);
    sheet.classList.add("dragging");
  });
  grip.addEventListener("pointermove", (e) => {
    if (dragStart == null) return;
    dragY = Math.max(0, e.clientY - dragStart);
    sheet.style.setProperty("--drag", `${dragY}px`);
  });
  const endDrag = () => {
    if (dragStart == null) return;
    dragStart = null;
    sheet.classList.remove("dragging");
    sheet.style.removeProperty("--drag");
    if (dragY > 90) closeSheet();
    dragY = 0;
  };
  grip.addEventListener("pointerup", endDrag);
  grip.addEventListener("pointercancel", endDrag);

  desktopMQ.addEventListener("change", () => {
    closeSheet();
    scrollActiveIntoList();
  });

  /* ---------------------------------------------------------------- visualizador */
  // No computador a análise é real (Web Audio). No celular usamos uma animação:
  // passar o áudio pelo AudioContext faz o iOS cortar a música com a tela bloqueada.
  let ctx = null;
  let analyser = null;
  const freq = new Uint8Array(128);
  const canAnalyse = window.matchMedia("(pointer: fine)").matches && (window.AudioContext || window.webkitAudioContext);
  audio.addEventListener("play", () => {
    if (!canAnalyse || ctx) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      ctx = new Ctx();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
    } catch {
      analyser = null;
    }
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frame = (t) => {
    const playing = !audio.paused;
    if (analyser && playing) analyser.getByteFrequencyData(freq);
    for (let i = 0; i < VIZ_BARS; i++) {
      const dist = Math.abs(i - (VIZ_BARS - 1) / 2) / (VIZ_BARS / 2); // 0 no meio, 1 nas pontas
      const center = 1 - dist;
      let target;
      if (!playing || reduceMotion) {
        target = 0.08 + center * 0.06;
      } else if (analyser) {
        const bin = Math.floor(Math.pow(dist, 1.4) * 90) + 1; // graves no meio, agudos nas pontas
        target = Math.max(0.08, (freq[bin] / 255) * (0.55 + center * 0.45));
      } else {
        const s = t / 1000;
        const wave = 0.5 + 0.28 * Math.sin(s * 2.1 + i * 0.35) + 0.18 * Math.sin(s * 5.3 - i * 0.8) + 0.12 * Math.sin(s * 9.7 + i * 1.9);
        target = Math.max(0.08, wave * (0.75 + 0.25 * Math.sin(s * 4.2)) * (0.35 + center * 0.65));
      }
      levels[i] += (target - levels[i]) * (target > levels[i] ? 0.35 : 0.12);
      vizBars[i].style.transform = `scaleY(${levels[i].toFixed(3)})`;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  /* ---------------------------------------------------------------- tela de bloqueio / fones */
  const updateMediaSession = () => {
    if (!("mediaSession" in navigator)) return;
    const t = tracks[state.index];
    const art = new URL(album.cover, location.href).href;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title,
      artist: artistLine(t),
      album: album.title,
      artwork: [{ src: art, sizes: "1254x1254", type: "image/jpeg" }],
    });
  };
  if ("mediaSession" in navigator) {
    const handlers = {
      play,
      pause,
      nexttrack: next,
      previoustrack: prev,
      seekto: (d) => d.seekTime != null && (audio.currentTime = d.seekTime),
    };
    Object.entries(handlers).forEach(([action, fn]) => {
      try {
        navigator.mediaSession.setActionHandler(action, fn);
      } catch {
        /* ação não suportada neste navegador */
      }
    });
  }

  /* ---------------------------------------------------------------- início */
  audio.volume = state.volume;
  renderDurations();
  renderLoop();
  renderVolume();
  renderPlayState();
  load(0); // tenta tocar a faixa 01 assim que a página abre
})();
