const BASE = location.port === '3000' ? '/api' : 'http://localhost:3000/api';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = s => isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00';
const cv = seed => { let h = 0; for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) % 360; return `background:radial-gradient(circle at 30% 25%,hsl(${h} 85% 68%),hsl(${(h + 50) % 360} 70% 38%) 55%,hsl(${(h + 95) % 360} 60% 14%))`; };
const ic = { play: 'M6 4l14 8-14 8z', pause: 'M6 4h4v16H6zM14 4h4v16h-4z', prev: 'M19 5L9 12l10 7zM6 5v14', next: 'M5 5l10 7-10 7zM18 5v14', vol: 'M4 9v6h4l5 4V5L8 9zM17 8a5 5 0 010 8', mute: 'M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6', home: 'M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z', music: 'M9 18V5l11-2v13M6 21a3 3 0 100-6 3 3 0 000 6zM17 19a3 3 0 100-6 3 3 0 000 6z', disc: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 15a3 3 0 100-6 3 3 0 000 6z', user: 'M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8z', out: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9', mic: 'M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3zM19 11a7 7 0 01-14 0M12 18v4', search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3', eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 100-6 3 3 0 000 6z', up: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12' };
const I = (n, fill) => `<svg class="i" viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${ic[n]}"/></svg>`;
const toast = (m, bad) => { const t = Object.assign(document.createElement('div'), { className: 'toast' + (bad ? ' bad' : ''), textContent: m }); $('#toasts').append(t); setTimeout(() => t.remove(), 4500); };


const SESSION = { 401: 'Your session has expired. Please log in again.', 403: "You don't have permission to access this section." };
async function req(path, o = {}) {
  const { raw, ...init } = o;
  let r;
  try { r = await fetch(BASE + path, { credentials: 'include', ...init }); }
  catch { throw Object.assign(new Error('Unable to connect to the server. Make sure the backend is running on port 3000.'), { status: 0 }); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const own = d.errors?.length ? d.errors.map(e => e.msg).join('. ') : (d.message || '').trim();
    throw Object.assign(new Error((raw ? own : SESSION[r.status] || own) || 'Something went wrong.'), { status: r.status, raw });
  }
  return d;
}
const post = (p, b, raw) => req(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b), raw });
const api = {
  login: b => post('/auth/login', b, true), register: b => post('/auth/register', b, true), logout: () => post('/auth/logout', {}, true),
  music: () => req('/music').then(d => d.musics || []), discover: (q = '', tag = '', page = 1) => req(`/music/discover?q=${encodeURIComponent(q)}&tag=${encodeURIComponent(tag)}&page=${page}`).then(d => d.musics || []),
  albums: () => req('/music/albums').then(d => d.albums || []),
  album: id => req('/music/albums/' + id).then(d => d.album), createAlbum: (title, music) => post('/music/album', { title, music }),
  upload: (title, file, onProgress) => new Promise((res, rej) => { // XHR for upload progress
    const x = new XMLHttpRequest(), f = new FormData(); f.append('title', title); f.append('music', file);
    x.open('POST', BASE + '/music/upload'); x.withCredentials = true;
    x.upload.onprogress = e => e.lengthComputable && onProgress(e.loaded / e.total);
    x.onerror = () => rej(new Error('Unable to connect to the server. Make sure the backend is running on port 3000.'));
    x.onload = () => { let d = {}; try { d = JSON.parse(x.responseText); } catch { } x.status < 300 ? res(d) : rej(Object.assign(new Error(SESSION[x.status] || d.message || 'Upload failed. Please try again.'), { status: x.status })); };
    x.send(f);
  }),
};


const S = {
  get user() { try { return JSON.parse(localStorage.getItem('sn_user')); } catch { return null; } },
  set user(u) { u ? localStorage.setItem('sn_user', JSON.stringify(u)) : localStorage.removeItem('sn_user'); },
  get mine() { try { return JSON.parse(localStorage.getItem('sn_up_' + this.user.id)) || []; } catch { return []; } },
  addMine(t) { localStorage.setItem('sn_up_' + this.user.id, JSON.stringify([...this.mine, t])); },
};
const go = p => { location.hash = '#/' + p; };
async function logout() { try { await api.logout(); } catch { } P.stop(); S.user = null; go(''); }


const who = m => m?.artist?.userName || m?.artistName || 'Unknown artist';
const art = m => m?.cover ? `background:center/cover url('${esc(m.cover)}')` : cv(m?._id || m?.id);

const P = (() => {
  const au = new Audio(); au.preload = 'metadata';
  let q = [], qi = -1; const D = {};
  const c = () => q[qi], id = m => m?._id || m?.id;
  $('#prev').innerHTML = I('prev', 1); $('#next').innerHTML = I('next', 1);
  const paint = () => {
    const m = c(); if (!m) return;
    $('#pt').textContent = m.title; $('#pa').textContent = who(m); $('#pc').style.cssText = art(m);
    $('#pp').innerHTML = I(au.paused ? 'play' : 'pause', 1); $('#mute').innerHTML = I(au.muted || !au.volume ? 'mute' : 'vol');
    mark();
  };
  const mark = () => document.querySelectorAll('.row').forEach(r => { r.classList.toggle('on', r.dataset.id === id(c())); r.querySelector('.pl').innerHTML = I(r.dataset.id === id(c()) && !au.paused ? 'pause' : 'play', 1); r.querySelector('.d').textContent = D[r.dataset.id] ? fmt(D[r.dataset.id]) : ''; });
  const play = (list, i) => {
    if (list[i] === c() && q === list) return toggle();
    q = list; qi = i; au.src = c().uri; $('#player').hidden = false; au.play().catch(() => { }); paint();
  };
  const toggle = () => au.paused ? au.play().catch(() => { }) : au.pause();
  const next = async () => {
    if (qi < q.length - 1) return play(q, qi + 1);
    if (q.more) { const n = await q.more().catch(() => 0); if (n && qi < q.length - 1) return play(q, qi + 1); }
    au.pause(); au.currentTime = 0;
  };
  const prev = () => au.currentTime > 3 || qi < 1 ? (au.currentTime = 0) : play(q, qi - 1);
  au.onplay = au.onpause = paint;
  au.onwaiting = () => { $('#pp').classList.add('busy'); $('#pa').textContent = 'Buffering…'; };
  au.onplaying = () => { $('#pp').classList.remove('busy'); $('#pa').textContent = who(c()); };
  au.onloadedmetadata = () => { D[id(c())] = au.duration; $('#dur').textContent = fmt(au.duration); mark(); };
  au.ontimeupdate = () => { $('#cur').textContent = fmt(au.currentTime); if (au.duration) $('#seek').value = au.currentTime / au.duration * 1000; };
  au.onended = next;
  au.onerror = () => { $('#pp').classList.remove('busy'); toast(`"${c()?.title}" couldn't be played. The audio file may be missing or unreachable.`, 1); };
  $('#pp').onclick = toggle; $('#next').onclick = next; $('#prev').onclick = prev;
  $('#seek').oninput = e => { if (au.duration) au.currentTime = e.target.value / 1000 * au.duration; };
  $('#vol').oninput = e => { au.volume = e.target.value / 100; au.muted = false; paint(); };
  $('#mute').onclick = () => { au.muted = !au.muted; paint(); };
  au.volume = .8;
  return { play, mark, stop() { au.pause(); au.removeAttribute('src'); q = []; qi = -1; $('#player').hidden = true; } };
})();

const app = $('#app');
const sk = n => '<div class="sk"></div>'.repeat(n);
const empty = (t, s) => `<div class="empty"><b>${t}</b>${s}</div>`;
const rows = l => l.map((m, i) => `<div class="row" data-id="${m._id || m.id}" data-i="${i}" tabindex="0"><button class="pl" tabindex="-1" aria-label="Play ${esc(m.title)}">${I('play', 1)}</button><div class="cv" style="${art(m)}"></div><div class="tt"><b>${esc(m.title)}</b><small>${esc(who(m))}</small></div><span class="d"></span></div>`).join('');
const bind = (el, l) => { el.querySelectorAll('.row').forEach(r => { const f = () => P.play(l, +r.dataset.i); r.onclick = f; r.onkeydown = e => e.key === 'Enter' && f(); }); P.mark(); };
const cards = l => l.map(a => `<a class="al" href="#/albums/${a._id}"><div class="cv big" style="${cv(a._id)}"></div><b>${esc(a.title)}</b><small>${esc(a.artist?.userName || 'Unknown artist')}</small></a>`).join('');
const NAV = () => [['home', 'Home', 'home'], ['music', 'Music', 'music'], ['discover', 'Discover', 'search'], ['albums', 'Albums', 'disc'], ...(S.user.role === 'artist' ? [['artist', 'Studio', 'mic']] : []), ['profile', 'Profile', 'user']];
function shell(active, body) {
  const links = NAV().map(([p, t, i]) => `<a class="nv ${p === active ? 'on' : ''}" href="#/${p}">${I(i)}<span>${t}</span></a>`).join('');
  app.innerHTML = `<div class="shell"><aside class="side"><a class="logo" href="#/home"><i></i>Sonora</a><nav>${links}</nav><button class="nv" id="out">${I('out')}Log out</button></aside><main class="main">${body}</main><nav class="mnav">${links}</nav></div>`;
  $('#out').onclick = logout; scrollTo(0, 0);
}
async function load(el, fn) { 
  try { await fn(); } catch (e) {
    if (e.status === 401 || e.status === 403) { P.stop(); S.user = null; go('login'); return toast(e.message, 1); }
    el.innerHTML = `<div class="empty"><b>Couldn't load this section</b>${esc(e.message)}<br><br><button class="btn ghost" id="retry">Try again</button></div>`; $('#retry').onclick = () => { el.innerHTML = sk(4); load(el, fn); };
  }
}
const search = ph => `<div class="search">${I('search')}<input id="q" placeholder="${ph}" aria-label="${ph}"></div>`;
const noMusic = () => empty('No music available yet.', 'Tracks appear here as soon as artists upload them.');


function landing() {
  app.innerHTML = `<section class="hero"><header class="logo"><i></i>Sonora</header><div><h1>Press play on something new.</h1><p>Stream tracks and full albums from independent artists, or upload your own and share them with listeners.</p><div class="cta"><a class="btn" href="#/register">Create an account</a><a class="btn ghost" href="#/login">Log in</a></div></div><div class="rec" aria-hidden="true"></div></section>`;
}
const pw = (id, l) => `<label for="${id}">${l}</label><div class="f"><input id="${id}" type="password" autocomplete="${id === 'pw' ? 'current-password' : 'new-password'}"><button type="button" data-eye aria-label="Show or hide password">${I('eye')}</button></div>`;
function authPage(mode) {
  const reg = mode === 'register';
  app.innerHTML = `<div class="auth"><form class="card" novalidate><a class="logo" href="#/"><i></i>Sonora</a><h1>${reg ? 'Create your account' : 'Welcome back'}</h1><p>${reg ? 'Listen to new music or share your own.' : 'Log in to keep listening.'}</p><div id="err"></div>
  ${reg ? `<label for="un">Username</label><div class="f"><input id="un" autocomplete="username"></div><label for="em">Email</label><div class="f"><input id="em" type="email" autocomplete="email"></div>${pw('pw', 'Password')}<div class="rules" id="rules"></div>${pw('pw2', 'Confirm password')}
  <label>I am a</label><div class="roles"><label><input type="radio" name="role" value="user" checked><span>Listener</span></label><label><input type="radio" name="role" value="artist"><span>Artist</span></label></div>`
      : `<label for="id">Username or email</label><div class="f"><input id="id" autocomplete="username"></div>${pw('pw', 'Password')}`}
  <button class="btn" id="go">${reg ? 'Create account' : 'Log in'}</button><p class="alt">${reg ? 'Have an account? <a href="#/login">Log in</a>' : 'New here? <a href="#/register">Create an account</a>'}</p></form></div>`;
  document.querySelectorAll('[data-eye]').forEach(b => b.onclick = () => { const i = b.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; });
  const rules = v => [[v.length >= 8 && v.length <= 72, '8–72 characters'], [/[a-z]/.test(v), 'lowercase'], [/[A-Z]/.test(v), 'uppercase'], [/[0-9]/.test(v), 'number']];
  const drawRules = () => { if (reg) $('#rules').innerHTML = rules($('#pw').value).map(([ok, t]) => `<span class="${ok ? 'ok' : ''}">${ok ? '✓' : '○'} ${t}</span>`).join(''); };
  if (reg) { drawRules(); $('#pw').oninput = drawRules; }
  $('form').onsubmit = async e => {
    e.preventDefault(); const err = m => $('#err').innerHTML = m ? `<div class="err" role="alert">${esc(m)}</div>` : '', v = id => $('#' + id).value.trim(), p = $('#pw').value; err('');
    let body;
    if (reg) {
      if (!/^[a-zA-Z0-9_.]{3,30}$/.test(v('un'))) return err('Username must be 3–30 characters: letters, numbers, _ and .');
      if (!/^\S+@\S+\.\S+$/.test(v('em'))) return err('Enter a valid email address.');
      if (rules(p).some(r => !r[0])) return err('Password needs 8–72 characters with a lowercase letter, an uppercase letter and a number.');
      if (p !== $('#pw2').value) return err('Passwords do not match.');
      body = { userName: v('un'), email: v('em'), password: p, role: $('[name=role]:checked').value };
    } else {
      if (!v('id') || !p) return err('Enter your username or email and your password.');
      body = { [v('id').includes('@') ? 'email' : 'userName']: v('id'), password: p };
    }
    const b = $('#go'), t = b.textContent; b.disabled = true; b.textContent = 'Please wait…';
    try { const d = await (reg ? api.register : api.login)(body); S.user = d.user; toast(reg ? 'Account created. Welcome to Sonora!' : `Welcome back, ${d.user.userName}!`); go(d.user.role === 'artist' ? 'artist' : 'home'); }
    catch (x) { err(x.message); b.disabled = false; b.textContent = t; }
  };
}
function home() {
  shell('home', `<h1>Hello, ${esc(S.user.userName)}</h1><p class="sub">Here's what's playing on Sonora.</p><h2>Latest tracks</h2><div id="t" class="list">${sk(4)}</div><h2>Albums</h2><div id="a" class="grid">${sk(1)}</div>`);
  load($('#t'), async () => {
    const [m, a] = await Promise.all([api.music(), api.albums()]), l = m.slice(0, 6);
    $('#t').innerHTML = l.length ? rows(l) : noMusic(); bind($('#t'), l);
    $('#a').innerHTML = a.length ? cards(a.slice(0, 6)) : empty('No albums yet.', 'Albums will appear here once artists create them.');
  });
}
function music() {
  shell('music', `<h1>Music</h1>${search('Search songs or artists')}<div id="l" class="list">${sk(6)}</div>`);
  load($('#l'), async () => {
    const all = await api.music();
    const draw = () => { const t = $('#q').value.toLowerCase(), f = all.filter(m => (m.title + ' ' + (m.artist?.userName || '')).toLowerCase().includes(t)); $('#l').innerHTML = f.length ? rows(f) : all.length ? empty('No matches.', 'Try a different title or artist.') : noMusic(); bind($('#l'), f); };
    $('#q').oninput = draw; draw();
  });
}
const GENRES = ['', 'pop', 'rock', 'lofi', 'electronic', 'jazz', 'hiphop', 'classical', 'ambient', 'chill'];
function discover() {
  shell('discover', `<h1>Discover</h1><p class="sub">Fresh songs streamed live from the Jamendo music library.</p>${search('Search any song or artist')}<div class="chips" id="ch">${GENRES.map(g => `<button class="chip ${g ? '' : 'on'}" data-g="${g}">${g || 'Popular'}</button>`).join('')}</div><div id="l" class="list">${sk(6)}</div><div id="mo" style="margin-top:16px"></div>`);
  let list = [], page = 1, tag = '', term = '', busy = false, done = false, run = 0;
  const seen = new Set();
  const more = Object.assign(document.createElement('button'), { className: 'btn ghost', textContent: 'Load more' });
  const fetchPage = async () => { // adds new songs to `list`, returns how many were new
    if (busy || done) return 0; busy = true; const my = run;
    try {
      const t = await api.discover(term, tag, page);
      if (my !== run) return 0;                       // a newer search replaced this one
      page++; if (t.length < 20) done = true;
      const fresh = t.filter(m => !seen.has(m.id) && seen.add(m.id)); list.push(...fresh); return fresh.length;
    } finally { busy = false; }
  };
  const paintList = () => {
    $('#l').innerHTML = list.length ? rows(list) : empty('No songs found.', 'Try another search or genre.');
    bind($('#l'), list); $('#mo').innerHTML = ''; if (!done && list.length) $('#mo').append(more);
  };
  const loadMore = async () => { const n = await fetchPage(); if (n) { const y = scrollY; paintList(); scrollTo(0, y); } return n; };
  const reset = () => {
    run++; list = []; page = 1; done = false; busy = false; seen.clear();
    list.more = loadMore;                             // player calls this when the queue ends -> endless playback
    $('#l').innerHTML = sk(6); $('#mo').innerHTML = '';
    load($('#l'), async () => { await fetchPage(); paintList(); });
  };
  more.onclick = async () => { more.disabled = true; try { await loadMore(); } catch (e) { toast(e.message, 1); } more.disabled = false; };
  $('#q').onkeydown = e => { if (e.key === 'Enter') { term = e.target.value.trim(); reset(); } };
  $('#ch').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; tag = b.dataset.g; document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); reset(); };
  reset();
}
function albums() {
  shell('albums', `<h1>Albums</h1>${search('Search albums or artists')}<div id="l" class="grid">${sk(3)}</div>`);
  load($('#l'), async () => {
    const all = await api.albums();
    const draw = () => { const t = $('#q').value.toLowerCase(), f = all.filter(a => (a.title + ' ' + (a.artist?.userName || '')).toLowerCase().includes(t)); $('#l').innerHTML = f.length ? cards(f) : empty(all.length ? 'No matches.' : 'No albums yet.', all.length ? 'Try a different title or artist.' : 'Albums will appear here once artists create them.'); };
    $('#q').oninput = draw; draw();
  });
}
function albumDetails(id) {
  shell('albums', `<p><a href="#/albums" class="sub">← Back to albums</a></p><div id="l">${sk(5)}</div>`);
  load($('#l'), async () => {
    const a = await api.album(id);
    if (!a) return void ($('#l').innerHTML = empty('Album not found.', 'It may have been removed.'));
    const l = (a.musics || []).map(m => ({ ...m, artist: a.artist }));
    $('#l').innerHTML = `<div class="top"><div class="cv xl" style="${cv(a._id)}"></div><div><small>Album</small><h1>${esc(a.title)}</h1><p class="sub">${esc(a.artist?.userName || 'Unknown artist')} · ${l.length} song${l.length === 1 ? '' : 's'}</p>${l.length ? `<button class="btn" id="all">${I('play', 1)} Play album</button>` : ''}</div></div><div id="r" class="list">${l.length ? rows(l) : empty('This album is empty.', 'No songs have been added yet.')}</div>`;
    bind($('#r'), l); if (l.length) $('#all').onclick = () => P.play(l, 0);
  });
}
function artist() {
  shell('artist', `<h1>Artist studio</h1><p class="sub">Upload tracks and group them into albums.</p>
  <form class="panel" id="up" novalidate><h2 style="margin:0 0 4px">Upload a track</h2><div id="e1"></div><label for="ti">Title</label><div class="f"><input id="ti" maxlength="120"></div><label style="margin-top:14px">Audio file</label>
  <label class="drop" id="dz">${I('up')}<br><span id="fn">Drag an audio file here, or click to browse</span><input type="file" id="fi" accept="audio/*"></label><div class="prog"><i id="pg"></i></div><button class="btn" id="ub" style="margin-top:18px">Upload track</button></form>
  <form class="panel" id="al" style="margin-top:24px" novalidate><h2 style="margin:0 0 4px">Create an album</h2><div id="e2"></div><label for="at">Album title</label><div class="f"><input id="at" maxlength="120"></div><label>Choose songs</label><div id="pk" class="list">${sk(2)}</div><button class="btn" id="ab">Create album</button></form>`);
  const uid = S.user.id; let file = null;
  const fi = $('#fi'), dz = $('#dz'), pick = f => { if (f && !f.type.startsWith('audio/')) return toast('Choose an audio file (MP3, WAV, etc.).', 1); file = f; $('#fn').textContent = f ? `${f.name} (${(f.size / 1048576).toFixed(1)} MB)` : 'Drag an audio file here, or click to browse'; };
  fi.onchange = () => pick(fi.files[0]);
  ['dragover', 'dragenter'].forEach(n => dz.addEventListener(n, e => { e.preventDefault(); dz.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(n => dz.addEventListener(n, e => { e.preventDefault(); dz.classList.remove('over'); }));
  dz.addEventListener('drop', e => pick(e.dataTransfer.files[0]));
  const chooser = () => load($('#pk'), async () => { // /music is capped at 10 items by the backend, so merge with tracks uploaded from this browser
    const seen = new Set(), l = [...(await api.music()).filter(m => m.artist?._id === uid), ...S.mine].filter(m => { const k = m._id || m.id; return !seen.has(k) && seen.add(k); });
    $('#pk').innerHTML = l.length ? l.map(m => `<label class="pick"><input type="checkbox" value="${m._id || m.id}"><div class="cv" style="${cv(m._id || m.id)}"></div><span>${esc(m.title)}</span></label>`).join('') : empty('No tracks yet.', 'Upload a track above, then add it to an album.');
  });
  chooser();
  $('#up').onsubmit = async e => {
    e.preventDefault(); const t = $('#ti').value.trim(), er = $('#e1'); er.innerHTML = '';
    const bad = m => er.innerHTML = `<div class="err" role="alert">${m}</div>`;
    if (!t) return bad('Give your track a title.'); if (!file) return bad('Choose an audio file to upload.');
    const b = $('#ub'); b.disabled = true; b.textContent = 'Uploading…';
    try {
      const d = await api.upload(t, file, r => $('#pg').style.width = r * 100 + '%'); const m = d.music;
      S.addMine({ _id: m.id, title: m.title, uri: m.uri, artist: { _id: uid, userName: S.user.userName } });
      toast(`"${m.title}" uploaded.`); $('#ti').value = ''; pick(null); fi.value = ''; chooser();
    } catch (x) { bad(esc(x.message)); }
    b.disabled = false; b.textContent = 'Upload track'; $('#pg').style.width = 0;
  };
  $('#al').onsubmit = async e => {
    e.preventDefault(); const t = $('#at').value.trim(), er = $('#e2'), ids = [...document.querySelectorAll('#pk input:checked')].map(i => i.value); er.innerHTML = '';
    const bad = m => er.innerHTML = `<div class="err" role="alert">${m}</div>`;
    if (!t) return bad('Give your album a title.'); if (!ids.length) return bad('Select at least one song.');
    const b = $('#ab'); b.disabled = true; b.textContent = 'Creating…';
    try { await api.createAlbum(t, ids); toast(`Album "${t}" created.`); $('#at').value = ''; document.querySelectorAll('#pk input').forEach(i => i.checked = false); }
    catch (x) { bad(esc(x.message)); }
    b.disabled = false; b.textContent = 'Create album';
  };
}
function profile() {
  const u = S.user;
  shell('profile', `<h1>Profile</h1><div class="panel"><div class="cv xl" style="${cv(u.id)};margin-bottom:20px"></div><dl class="kv"><dt>Username</dt><dd>${esc(u.userName)}</dd><dt>Email</dt><dd>${esc(u.email)}</dd><dt>Account type</dt><dd>${u.role === 'artist' ? 'Artist' : 'Listener'}</dd></dl><button class="btn ghost" id="lo">${I('out')} Log out</button></div>`);
  $('#lo').onclick = logout;
}
const notice = (t, s, home = 'home') => { S.user ? shell('', empty(t, s + `<br><br><a class="btn" href="#/${home}">Back to home</a>`)) : (app.innerHTML = `<div class="auth"><div class="card">${empty(t, s)}</div></div>`); };


function route() {
  const [p, id] = (location.hash.slice(2) || '').split('/'), u = S.user;
  if (['', 'login', 'register'].includes(p)) return u && p ? go(u.role === 'artist' ? 'artist' : 'home') : p ? authPage(p) : landing();
  if (!u) return go('login');
  if (p === 'artist' && u.role !== 'artist') return notice('Artists only', "This section is for artist accounts. You don't have permission to access it.");
  const pages = { home, music, discover, albums: () => id ? albumDetails(id) : albums(), artist, profile };
  (pages[p] || (() => notice('Page not found', "We couldn't find that page.")))();
}
addEventListener('hashchange', route);
route();