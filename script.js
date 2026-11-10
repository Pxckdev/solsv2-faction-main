// SOLS Factions site. Settings and questions live in config.js, not here.

const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let toastTimer;
function toast(msg) {
  $('toast').textContent = msg;
  $('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2200);
}

// ===== Tabs (Faction information / Apply) =====
function showTab(name) {
  document.querySelectorAll('.tab').forEach((t) => {
    const on = t.dataset.tab === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on);
  });
  document.querySelectorAll('.panel').forEach((p) => (p.hidden = p.dataset.panel !== name));
  document.body.classList.toggle('applying', name === 'apply'); // makes the page wider for the form
}
document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
document.querySelectorAll('.topbar-nav a[data-tab]').forEach((a) => {
  a.addEventListener('click', (e) => {
    showTab(a.dataset.tab);
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});
if (location.hash === '#apply') showTab('apply');

// ===== Fancy fonts (Unicode letters, so they show up in Discord) =====
function shift(upper, lower, digits, holes = {}) {
  return (ch) => {
    if (holes[ch]) return holes[ch];
    const c = ch.codePointAt(0);
    if (c >= 65 && c <= 90) return String.fromCodePoint(upper + c - 65);
    if (c >= 97 && c <= 122) return String.fromCodePoint(lower + c - 97);
    if (digits && c >= 48 && c <= 57) return String.fromCodePoint(digits + c - 48);
    return ch;
  };
}
const SMALL_CAPS = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ';
const FONTS = {
  script: shift(0x1D4D0, 0x1D4EA),
  gothic: shift(0x1D56C, 0x1D586),
  double: shift(0x1D538, 0x1D552, 0x1D7D8, { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' }),
  bold: shift(0x1D5D4, 0x1D5EE, 0x1D7EC),
  italic: shift(0x1D608, 0x1D622),
  mono: shift(0x1D670, 0x1D68A, 0x1D7F6),
  smallcaps: (ch) => (/[a-z]/i.test(ch) ? SMALL_CAPS[ch.toLowerCase().charCodeAt(0) - 97] : ch),
  wide: (ch) => {
    const c = ch.codePointAt(0);
    if (c === 32) return '　';
    return c >= 33 && c <= 126 ? String.fromCodePoint(c + 0xFEE0) : ch;
  },
};
const fontify = (text, font) => [...text].map(FONTS[font]).join('');

// ===== Preview: turns Discord formatting into HTML so players see roughly what staff will see =====
function mediaFor(url) {
  const clean = url.split('?')[0].toLowerCase();
  if (/\.(png|jpe?g|gif|webp)$/.test(clean)) return `<img src="${esc(url)}" alt="" loading="lazy">`;
  if (/\.(mp4|webm|mov)$/.test(clean)) return `<video src="${esc(url)}" controls preload="metadata"></video>`;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/);
  if (yt) return `<div class="pv-video"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" allowfullscreen loading="lazy"></iframe></div>`;
  const sb = url.match(/streamable\.com\/(?:e\/)?([\w]+)/);
  if (sb) return `<div class="pv-video"><iframe src="https://streamable.com/e/${sb[1]}" allowfullscreen loading="lazy"></iframe></div>`;
  return '';
}
function inline(s) {
  return s
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/__(.+?)__/g, '<u>$1</u>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/(^|[\s>])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
}
function renderPreview(text) {
  const media = [];
  const lines = text.split('\n').map((raw) => {
    (raw.match(/https?:\/\/[^\s)]+/g) || []).forEach((u) => { const m = mediaFor(u); if (m) media.push(m); });
    const line = esc(raw);
    let m;
    if ((m = line.match(/^### (.*)/))) return `<h5>${inline(m[1])}</h5>`;
    if ((m = line.match(/^## (.*)/))) return `<h4>${inline(m[1])}</h4>`;
    if ((m = line.match(/^# (.*)/))) return `<h3>${inline(m[1])}</h3>`;
    if ((m = line.match(/^-# (.*)/))) return `<small>${inline(m[1])}</small>`;
    if ((m = line.match(/^&gt; (.*)/))) return `<blockquote>${inline(m[1])}</blockquote>`;
    return line ? `<p>${inline(line)}</p>` : '<br>';
  });
  return lines.join('') + media.join('');
}

// ===== Build the questions =====
const filesFor = new Map(); // question index -> File[]

function questionHTML(q, i) {
  const id = `q-${i}`;
  const req = q.required ? ' <span class="req">*</span>' : '';
  const help = q.help ? `<small>${esc(q.help)}</small>` : '';
  let input;
  if (q.type === 'select') {
    input = `<select id="${id}"><option value="">Choose one…</option>${(q.options || []).map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
  } else if (q.type === 'short') {
    input = `<input id="${id}" type="text" maxlength="300" autocomplete="off">`;
  } else if (q.type === 'long') {
    input = `<textarea id="${id}" rows="7" maxlength="6000"></textarea>`;
  } else {
    input = `<div class="editor" data-i="${i}">
      <div class="toolbar">
        <select data-act="size" title="Text size">
          <option value="">Size</option>
          <option value="# ">Big</option>
          <option value="## ">Medium</option>
          <option value="### ">Small heading</option>
          <option value="-# ">Tiny</option>
          <option value="none">Normal</option>
        </select>
        <select data-act="font" title="Font">
          <option value="">Font</option>
          <option value="script">𝓢𝓬𝓻𝓲𝓹𝓽</option>
          <option value="gothic">𝕲𝖔𝖙𝖍𝖎𝖈</option>
          <option value="double">𝔻𝕠𝕦𝕓𝕝𝕖</option>
          <option value="bold">𝗕𝗼𝗹𝗱</option>
          <option value="italic">𝘐𝘵𝘢𝘭𝘪𝘤</option>
          <option value="mono">𝙼𝚘𝚗𝚘</option>
          <option value="smallcaps">ꜱᴍᴀʟʟ ᴄᴀᴘꜱ</option>
          <option value="wide">Ｗｉｄｅ</option>
        </select>
        <button type="button" data-wrap="**" title="Bold"><b>B</b></button>
        <button type="button" data-wrap="*" title="Italic"><i>I</i></button>
        <button type="button" data-wrap="__" title="Underline"><u>U</u></button>
        <button type="button" data-wrap="~~" title="Strikethrough"><s>S</s></button>
        <button type="button" data-act="link" title="Add a link">🔗 Link</button>
        <button type="button" data-act="media" title="Add an image, GIF or video by link">🖼️ Media link</button>
        <label class="upload" title="Upload photos, GIFs or videos">📎 Upload<input type="file" multiple accept="image/*,video/*"></label>
        <button type="button" data-act="preview" class="pv-btn">👁 Preview</button>
      </div>
      <textarea id="${id}" rows="12" maxlength="6000" placeholder="Type here. Highlight text, then pick a font or size."></textarea>
      <div class="file-list"></div>
      <div class="preview" hidden></div>
    </div>`;
  }
  return `<div class="field"><label for="${id}">${i + 1}. ${esc(q.label)}${req}</label>${input}${help}</div>`;
}
$('questions').innerHTML = QUESTIONS.map(questionHTML).join('');

// ===== Editor toolbar =====
function replaceSelection(ta, fn) {
  const { selectionStart: s, selectionEnd: e, value } = ta;
  const out = fn(value.slice(s, e));
  ta.setRangeText(out, s, e, 'select');
  ta.focus();
  ta.dispatchEvent(new Event('input'));
}
function insertAtCursor(ta, text) {
  const s = ta.selectionStart;
  const before = ta.value.slice(0, s);
  const pad = before && !before.endsWith('\n') ? '\n' : '';
  ta.setRangeText(`${pad}${text}\n`, s, ta.selectionEnd, 'end');
  ta.focus();
  ta.dispatchEvent(new Event('input'));
}
function applySize(ta, prefix) {
  const v = ta.value;
  const start = v.lastIndexOf('\n', ta.selectionStart - 1) + 1;
  let end = v.indexOf('\n', ta.selectionEnd);
  if (end === -1) end = v.length;
  const lines = v.slice(start, end).split('\n')
    .map((l) => l.replace(/^(#{1,3} |-# )/, ''))
    .map((l) => (prefix === 'none' || !l.trim() ? l : prefix + l));
  ta.setRangeText(lines.join('\n'), start, end, 'select');
  ta.focus();
  ta.dispatchEvent(new Event('input'));
}

function renderFiles(editor) {
  const i = +editor.dataset.i;
  const files = filesFor.get(i) || [];
  editor.querySelector('.file-list').innerHTML = files.map((f, n) =>
    `<span class="file-chip">${f.type.startsWith('video') ? '🎬' : '🖼️'} ${esc(f.name)} <small>${(f.size / 1048576).toFixed(1)} MB</small><button type="button" data-remove="${n}" aria-label="Remove ${esc(f.name)}">✕</button></span>`).join('');
}

document.querySelectorAll('.editor').forEach((editor) => {
  const ta = editor.querySelector('textarea');
  const preview = editor.querySelector('.preview');
  const i = +editor.dataset.i;

  editor.querySelector('.toolbar').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.wrap) {
      const w = b.dataset.wrap;
      replaceSelection(ta, (sel) => `${w}${sel || 'text'}${w}`);
    } else if (b.dataset.act === 'link') {
      const url = prompt('Paste the link (starts with https://)');
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) return toast('Links need to start with https://');
      const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
      const label = sel || prompt('Text to show for the link (optional)') || '';
      if (sel) replaceSelection(ta, () => `[${label}](${url})`);
      else insertAtCursor(ta, label ? `[${label}](${url})` : url);
    } else if (b.dataset.act === 'media') {
      const url = prompt('Paste an image, GIF or video link (Imgur, Tenor, Giphy, YouTube, Streamable, Medal…)');
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) return toast('Links need to start with https://');
      insertAtCursor(ta, url);
      toast('Added. It will show as an image or video in Discord.');
    } else if (b.dataset.act === 'preview') {
      preview.hidden = !preview.hidden;
      b.classList.toggle('on', !preview.hidden);
      if (!preview.hidden) preview.innerHTML = renderPreview(ta.value) || '<p class="muted">Nothing to preview yet.</p>';
    } else if (b.dataset.remove !== undefined) {
      // handled below
    }
  });

  editor.querySelector('[data-act="size"]').addEventListener('change', (e) => {
    if (e.target.value) applySize(ta, e.target.value);
    e.target.value = '';
  });
  editor.querySelector('[data-act="font"]').addEventListener('change', (e) => {
    const font = e.target.value;
    e.target.value = '';
    if (!font) return;
    if (ta.selectionStart === ta.selectionEnd) return toast('Highlight some text first, then pick a font.');
    replaceSelection(ta, (sel) => fontify(sel, font));
  });

  ta.addEventListener('input', () => {
    if (!preview.hidden) preview.innerHTML = renderPreview(ta.value) || '<p class="muted">Nothing to preview yet.</p>';
  });

  editor.querySelector('input[type=file]').addEventListener('change', (e) => {
    const list = filesFor.get(i) || [];
    for (const f of e.target.files) {
      if (!/^(image|video)\//.test(f.type)) { toast(`${f.name} isn't a photo or video.`); continue; }
      if (f.size > SITE.maxFileMB * 1048576) { toast(`${f.name} is over ${SITE.maxFileMB} MB.`); continue; }
      if (list.length >= SITE.maxFilesPerQuestion) { toast(`Max ${SITE.maxFilesPerQuestion} files per question.`); break; }
      list.push(f);
    }
    filesFor.set(i, list);
    e.target.value = '';
    renderFiles(editor);
  });

  editor.querySelector('.file-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    const list = filesFor.get(i) || [];
    list.splice(+b.dataset.remove, 1);
    renderFiles(editor);
  });
});

// ===== Sending to Discord =====
async function sendToWebhook(query, payload, files = []) {
  const url = SITE.webhookUrl + (SITE.webhookUrl.includes('?') ? '&' : '?') + query;
  for (let attempt = 0; attempt < 6; attempt++) {
    let opts;
    if (files.length) {
      const fd = new FormData();
      fd.append('payload_json', JSON.stringify(payload));
      files.forEach((f, n) => fd.append(`files[${n}]`, f, f.name));
      opts = { method: 'POST', body: fd };
    } else {
      opts = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) };
    }
    const res = await fetch(url, opts);
    if (res.status === 429) {
      const body = await res.json().catch(() => ({}));
      await wait((body.retry_after || 1) * 1000 + 300);
      continue;
    }
    if (!res.ok) throw new Error(`Discord error ${res.status}`);
    return res.json();
  }
  throw new Error('Discord is busy. Try again in a minute.');
}

// Discord messages max out at 2000 characters, so long answers get split up
function chunk(text, size = 1900) {
  const out = [];
  let cur = '';
  for (const line of text.split('\n')) {
    let l = line;
    while (l.length > size) { if (cur) { out.push(cur); cur = ''; } out.push(l.slice(0, size)); l = l.slice(size); }
    if ((cur + '\n' + l).length > size) { out.push(cur); cur = l; } else { cur = cur ? `${cur}\n${l}` : l; }
  }
  if (cur) out.push(cur);
  return out.length ? out : [''];
}

function answerOf(q, i) {
  const el = $(`q-${i}`);
  return el ? el.value.trim() : '';
}

function showError(msg) {
  $('formError').textContent = msg;
  $('formError').hidden = !msg;
}

const COOLDOWN_KEY = 'sols-faction-app-sent';
function lastSent() {
  try { return Number(localStorage.getItem(COOLDOWN_KEY)) || 0; } catch (_) { return 0; }
}

$('appForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  showError('');
  document.querySelectorAll('.field.bad').forEach((f) => f.classList.remove('bad'));

  if (document.querySelector('.hp').value) return; // bot

  const discord = $('f-discord').value.trim().replace(/^@/, '');
  const faction = $('f-faction').value.trim();
  const missing = [];
  if (!discord) missing.push($('f-discord'));
  if (!faction) missing.push($('f-faction'));
  QUESTIONS.forEach((q, i) => {
    const hasFiles = (filesFor.get(i) || []).length > 0;
    if (q.required && !answerOf(q, i) && !hasFiles) missing.push($(`q-${i}`));
  });
  if (missing.length) {
    missing.forEach((el) => el.closest('.field').classList.add('bad'));
    missing[0].closest('.field').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return showError(`Please answer all required questions (${missing.length} left).`);
  }

  if (!SITE.webhookUrl) return showError('Applications are not open yet. Please check back later.');

  const mins = (Date.now() - lastSent()) / 60000;
  if (mins < SITE.cooldownMinutes) {
    return showError(`You already sent an application. You can send another in ${Math.ceil(SITE.cooldownMinutes - mins)} minute(s).`);
  }

  const btn = $('submitBtn');
  btn.disabled = true;
  const progress = $('progress');
  progress.hidden = false;

  const base = {
    username: 'SOLS Faction Applications',
    avatar_url: new URL('logo.png', location.href).href,
    allowed_mentions: { parse: [] }, // never let an application ping @everyone or roles
  };

  try {
    // 1. Start the thread with the applicant info
    progress.textContent = 'Sending your application…';
    const first = await sendToWebhook('wait=true', {
      ...base,
      thread_name: `${faction} | ${discord}`.slice(0, 100),
      embeds: [{
        title: '📝 New Faction Application',
        color: 0x8b5cf6,
        fields: [
          { name: 'Discord', value: discord.slice(0, 100), inline: true },
          { name: 'Faction', value: faction.slice(0, 100), inline: true },
        ],
        footer: { text: 'SOLS-APP-START' },
        timestamp: new Date().toISOString(),
      }],
    });
    const threadId = first.channel_id;

    // 2. One message (or more if it's long) per answer, with uploads attached
    const answered = QUESTIONS.map((q, i) => ({ q, i })).filter(({ q, i }) => answerOf(q, i) || (filesFor.get(i) || []).length);
    for (let n = 0; n < answered.length; n++) {
      const { q, i } = answered[n];
      progress.textContent = `Sending answer ${n + 1} of ${answered.length}…`;
      const files = filesFor.get(i) || [];
      const parts = chunk(`### ${i + 1}. ${q.label}\n${answerOf(q, i) || '-# (see attached)'}`);
      for (let p = 0; p < parts.length; p++) {
        await sendToWebhook(`wait=true&thread_id=${threadId}`, { ...base, content: parts[p] }, p === 0 ? files : []);
        await wait(350);
      }
    }

    // 3. End marker so the bot knows the application is complete and adds the Accept / Deny buttons
    await sendToWebhook(`wait=true&thread_id=${threadId}`, {
      ...base,
      embeds: [{ description: '✅ **End of application.** Waiting for review.', color: 0x2ee86a, footer: { text: 'SOLS-APP-END' } }],
    });

    try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch (_) { /* private mode */ }
    $('apply').hidden = true;
    $('done').hidden = false;
    $('done').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    showError(`Your application couldn't be sent (${err.message}). Please try again, or open a ticket in the Discord.`);
  } finally {
    btn.disabled = false;
    progress.hidden = true;
  }
});
