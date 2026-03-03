let dictionary = [];

    async function loadDictionary() {
      const res = await fetch('dictionary.txt');
      const text = await res.text();
      dictionary = text.split('\n')
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length > 0 && /^[a-z]+$/.test(w));
      document.getElementById('dict-size').textContent = dictionary.length.toLocaleString('et-EE');
    }

    const SETTINGS_COOKIE = 'pp_settings';

    function saveSettings(obj) {
      const val = encodeURIComponent(JSON.stringify(obj));
      document.cookie = `${SETTINGS_COOKIE}=${val};max-age=31536000;path=/;SameSite=Lax`;
    }

    function loadSettings() {
      const match = document.cookie.split(';').find(c => c.trim().startsWith(SETTINGS_COOKIE + '='));
      if (!match) return null;
      try { return JSON.parse(decodeURIComponent(match.split('=')[1])); }
      catch { return null; }
    }

    const SPECIAL_CHARS = '€!@#%&*/:()_?'.split('');
    const RANDOM_SEPS = [' ', '-', '.', '/'];

    function secureRandInt(max) {
      const arr = new Uint32Array(1);
      const limit = Math.floor(0xFFFFFFFF / max) * max;
      let r;
      do { crypto.getRandomValues(arr); r = arr[0]; } while (r >= limit);
      return r % max;
    }

    function calcEntropy(wordCount, dictSize) {
      return Math.floor(wordCount * Math.log2(dictSize));
    }

    function entropyLabel(bits) {
      if (bits < 38) return { label: 'Nõrk', cls: 'weak' };
      if (bits < 50) return { label: 'Piisav', cls: 'good' };
      if (bits < 70) return { label: 'Tugev', cls: 'strong' };
      return { label: 'Väga tugev', cls: 'verystrong' };
    }

    function generatePassphrase(wordCount, separator, addSpecial, randCap, endDigit, dict) {
      const picked = Array.from({ length: wordCount }, () => dict[secureRandInt(dict.length)]);
      const capIdx = randCap ? secureRandInt(wordCount) : 0;
      picked[capIdx] = picked[capIdx][0].toUpperCase() + picked[capIdx].slice(1);
      const digit = String(secureRandInt(10));
      if (!endDigit) {
        const digitPos = secureRandInt(wordCount + 1);
        picked.splice(digitPos, 0, digit);
      }

      let phrase;
      if (separator === 'number') {
        phrase = picked.map((w, i) => i < picked.length - 1 ? w + String(secureRandInt(10)) : w).join('');
      } else if (separator === 'random') {
        phrase = picked.map((w, i) => i < picked.length - 1 ? w + RANDOM_SEPS[secureRandInt(RANDOM_SEPS.length)] : w).join('');
      } else {
        const sep = { colon: ':', dash: '-', dot: '.', slash: '/', under: '_' }[separator] || ' ';
        phrase = picked.join(sep);
      }

      if (endDigit) {
        const endSep = separator === 'number' ? String(secureRandInt(10))
                     : separator === 'random' ? RANDOM_SEPS[secureRandInt(RANDOM_SEPS.length)]
                     : { colon: ':', dash: '-', dot: '.', slash: '/', under: '_' }[separator] || ' ';
        phrase = phrase + endSep + String(secureRandInt(100));
      }

      if (addSpecial) {
        const count = 3;
        const chars = Array.from({ length: count }, () => SPECIAL_CHARS[secureRandInt(SPECIAL_CHARS.length)]).join('');
        phrase = phrase + chars;
      }

      return phrase;
    }

    async function copyToClipboard(text) {
      try { await navigator.clipboard.writeText(text); return true; }
      catch {
        const ta = Object.assign(document.createElement('textarea'), { value: text });
        Object.assign(ta.style, { position: 'fixed', opacity: '0' });
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta); return ok;
      }
    }

    function updateEntropy() {
      const words = parseInt(document.querySelector('input[name="wordcount"]:checked').value);
      const addSpecial = document.getElementById('extra-special').checked;
      const specialBits = addSpecial ? Math.floor(4 * Math.log2(SPECIAL_CHARS.length)) : 0;
      const bits = calcEntropy(words, dictionary.length) + specialBits;
      const { label, cls } = entropyLabel(bits);
      const pct = Math.min(100, Math.round((bits / 128) * 100));
      document.getElementById('entropy-bar').style.width = pct + '%';
      document.getElementById('entropy-bar').className = 'entropy-fill ' + cls;
      document.getElementById('entropy-text').textContent = `${bits} bitti — ${label}`;
    }

    const GEN_BTN_LABEL = '↻ Genereeri';
    let genBtnTimer = null;

    function showCopied(auto = false) {
      const copyBtn = document.getElementById('copy-btn');
      const genBtn = document.getElementById('generate-btn');
      copyBtn.classList.add('copied');
      setTimeout(() => { copyBtn.classList.remove('copied'); }, 2000);
      if (auto) {
        if (genBtnTimer) clearTimeout(genBtnTimer);
        genBtn.textContent = '✓ Lõikelauale kopeeritud';
        genBtnTimer = setTimeout(() => { genBtn.textContent = GEN_BTN_LABEL; genBtnTimer = null; }, 2000);
      }
    }

    let firstLoad = true;

    function generate() {
      const genBtn = document.getElementById('generate-btn');
      if (genBtnTimer) { clearTimeout(genBtnTimer); genBtnTimer = null; genBtn.textContent = GEN_BTN_LABEL; }
      const words = parseInt(document.querySelector('input[name="wordcount"]:checked').value);
      const separator = document.querySelector('input[name="separator"]:checked').value;
      const addSpecial = document.getElementById('extra-special').checked;
      const randCap = document.getElementById('extra-randcap').checked;
      const endDigit = document.getElementById('extra-enddigit').checked;
      const maxLen = parseInt(document.querySelector('input[name="maxlen"]:checked').value);

      let phrase = generatePassphrase(words, separator, addSpecial, randCap, endDigit, dictionary);

      if (maxLen > 0 && phrase.length > maxLen) {
        const sep = (separator === 'number' || separator === 'random')
          ? '.' : ({ colon: ':', dash: '-', dot: '.', slash: '/', under: '_' }[separator] || '.');
        const endNum = String(secureRandInt(10));
        const parts = [];
        // jäta ruumi: eraldaja + number lõpus
        let budget = maxLen - sep.length - endNum.length;
        let first = true;

        for (let i = 0; i < 20; i++) {
          const w = dictionary[secureRandInt(dictionary.length)];
          const word = first ? w[0].toUpperCase() + w.slice(1) : w;
          const needed = (first ? 0 : sep.length) + word.length;
          if (needed > budget) break;
          parts.push(word);
          budget -= needed;
          first = false;
        }

        if (parts.length === 0) {
          // ei mahu ükski sõna — võta mis mahub
          const w = dictionary[secureRandInt(dictionary.length)];
          const word = (w[0].toUpperCase() + w.slice(1)).slice(0, budget);
          parts.push(word);
          budget -= word.length;
        }

        let result = parts.join(sep) + sep + endNum;

        // täida ülejäänud ruum
        const remaining = maxLen - result.length;
        if (remaining > 0 && remaining < 3) {
          // vähem kui 3 märki — täida erimärkidega
          const extra = Array.from({ length: remaining },
            () => SPECIAL_CHARS[secureRandInt(SPECIAL_CHARS.length)]).join('');
          result = result + extra;
        } else if (remaining >= 3) {
          // 3+ märki — lisa uus sõna (lõigatud)
          const w = dictionary[secureRandInt(dictionary.length)];
          const word = (w[0].toUpperCase() + w.slice(1)).slice(0, remaining - sep.length);
          result = result + sep + word;
          // täida mis üle jäi erimärkidega
          const rem2 = maxLen - result.length;
          if (rem2 > 0) {
            result = result + Array.from({ length: rem2 },
              () => SPECIAL_CHARS[secureRandInt(SPECIAL_CHARS.length)]).join('');
          }
        }

        phrase = result.slice(0, maxLen);
      }

      const output = document.getElementById('output');
      output.textContent = phrase;
      output.style.color = '';
      output.title = '';

      if (!firstLoad) {
        copyToClipboard(phrase).then(ok => { if (ok) showCopied(true); });
      }
      firstLoad = false;
      updateEntropy();
      saveSettings({ words, separator, addSpecial, randCap: document.getElementById('extra-randcap').checked, endDigit: document.getElementById('extra-enddigit').checked, maxLen: parseInt(document.querySelector('input[name="maxlen"]:checked').value) });
    }

    document.addEventListener('DOMContentLoaded', async () => {
      await loadDictionary();

      const saved = loadSettings();
      if (saved?.words) {
        const r = document.querySelector(`input[name="wordcount"][value="${saved.words}"]`);
        if (r) r.checked = true;
      }
      if (saved?.separator) {
        const r = document.querySelector(`input[name="separator"][value="${saved.separator}"]`);
        if (r) r.checked = true;
      }

      if (saved?.endDigit !== false) document.getElementById('extra-enddigit').checked = true;
      if (saved?.maxLen != null) {
        const r = document.querySelector(`input[name="maxlen"][value="${saved.maxLen}"]`);
        if (r) r.checked = true;
      }
      if (saved?.addSpecial) document.getElementById('extra-special').checked = true;
      if (saved?.randCap) document.getElementById('extra-randcap').checked = true;

      document.getElementById('generate-btn').addEventListener('click', generate);
      document.getElementById('copy-btn').addEventListener('click', async () => {
        const text = document.getElementById('output').textContent;
        if (!text || text === '—') return;
        if (await copyToClipboard(text)) showCopied(false);
      });
      document.querySelectorAll('input[name="wordcount"], input[name="separator"], input[name="maxlen"]').forEach(el => {
        el.addEventListener('change', () => generate());
      });
      ['extra-enddigit', 'extra-randcap', 'extra-special'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => generate());
      });

      generate();

      // külastuste loendur
      fetch('counter.php')
        .then(r => r.json())
        .then(d => {
          const el = document.getElementById('visit-count');
          if (el) el.textContent = d.count.toLocaleString('et-EE') + ' külastust alates 02.2026';
        })
        .catch(() => {});
    });
