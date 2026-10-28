// Рисунки игры: портреты губернаторов, значки инструментов, объекты карты, сцены событий.
// Всё — SVG-строки, без внешних картинок.
(function (root) {
  'use strict';

  // ---------- портреты (аниме) ----------
  // mood: 1 — рад (глаза-дуги «^^», улыбка), 0 — спокоен, -1 — расстроен (брови домиком, слеза).
  // Голова одна на всех: лицо с острым подбородком, большие глаза с бликами; различаются
  // причёска, шапка, одежда и мелочи (очки, пластырь, усы).
  const LINE = '#2B1D1A';
  const PEOPLE = {
    A: { bg: '#DCE4F0', skin: '#FBE0CC', hair: '#3B2620', iris: '#7A4A2A', cloth: '#1F2E4D', fem: true },   // столица: каре, очки
    B: { bg: '#CFE0EE', skin: '#F5D3B5', hair: '#1E1A24', iris: '#2B5C8A', cloth: '#1F3F66' },              // порт: капитан
    C: { bg: '#EDE3CC', skin: '#F2CBA8', hair: '#6B3E22', iris: '#3F7D4A', cloth: '#E07A2E' },              // ресурсы: каска
    D: { bg: '#E3DDD6', skin: '#F0C9A6', hair: '#B5AFA6', iris: '#5F5A52', cloth: '#6B5844', old: true },  // старопром: седой директор
    E: { bg: '#E6E9CF', skin: '#F5D2B4', hair: '#2A1E22', iris: '#5A3A2A', cloth: '#4F7D3A', fem: true },   // граница: хвостик
    M: { bg: '#FBE3EA', skin: '#FBE2D0', hair: '#F28BA8', iris: '#C2416B', cloth: '#FFFDF8', fem: true }    // советница Мэй
  };
  const f = n => n.toFixed(1);

  function eye(cx, cy, p, mood, side) {
    if (p.old || mood > 0) {
      // Прищур: у радости — дуга вверх, иначе — мягкая линия.
      const up = mood > 0 ? -5.5 : -2.5;
      return `<path d="M${f(cx - 5.4)},${f(cy + 1.4)} Q${f(cx)},${f(cy + up)} ${f(cx + 5.4)},${f(cy + 1.4)}" fill="none" stroke="${LINE}" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    const lash = p.fem ? `<path d="M${f(cx + side * 6.2)},${f(cy - 4.6)} l${f(side * 2.6)},-2.2" stroke="${LINE}" stroke-width="1.8" stroke-linecap="round"/>` : '';
    return `<ellipse cx="${cx}" cy="${cy}" rx="5.6" ry="6.6" fill="#FFFFFF"/>` +
      `<ellipse cx="${cx}" cy="${f(cy + 0.8)}" rx="4.6" ry="5.8" fill="${p.iris}"/>` +
      `<path d="M${f(cx - 4.6)},${f(cy + 0.8)} A4.6,5.8 0 0 1 ${f(cx + 4.6)},${f(cy + 0.8)} Z" fill="#000" opacity=".28"/>` +
      `<ellipse cx="${cx}" cy="${f(cy + 1.4)}" rx="2" ry="2.8" fill="#1A1010"/>` +
      `<circle cx="${f(cx - 1.9)}" cy="${f(cy - 1.6)}" r="1.9" fill="#FFFFFF"/><circle cx="${f(cx + 1.9)}" cy="${f(cy + 3.3)}" r=".9" fill="#FFFFFF"/>` +
      `<path d="M${f(cx - 6.4)},${f(cy - 3.6)} Q${f(cx)},${f(cy - 8.8)} ${f(cx + 6.4)},${f(cy - 4)}" fill="none" stroke="${LINE}" stroke-width="2.5" stroke-linecap="round"/>` + lash +
      `<path d="M${f(cx - 3.4)},${f(cy + 6.8)} Q${cx},${f(cy + 7.6)} ${f(cx + 3.4)},${f(cy + 6.8)}" fill="none" stroke="${LINE}" stroke-width=".9" opacity=".55"/>`;
  }
  function face(p, mood, ey) {
    const L = 41, R = 59;
    const bc = p.old ? p.hair : LINE, bw = p.old ? 3.2 : 1.6;
    const bro = mood < 0
      ? `M${L - 5},${ey - 9} Q${L},${ey - 9.5} ${L + 5},${ey - 12.5} M${R - 5},${ey - 12.5} Q${R},${ey - 9.5} ${R + 5},${ey - 9}`
      : mood > 0
        ? `M${L - 5},${ey - 10} Q${L},${ey - 14} ${L + 5},${ey - 11} M${R - 5},${ey - 11} Q${R},${ey - 14} ${R + 5},${ey - 10}`
        : `M${L - 5},${ey - 10} Q${L},${ey - 12.5} ${L + 5},${ey - 11} M${R - 5},${ey - 11} Q${R},${ey - 12.5} ${R + 5},${ey - 10}`;
    const my = p.old ? 68 : 66;
    const mouth = mood > 0
      ? `<path d="M44,${my - 1.5} Q50,${my + 6.5} 56,${my - 1.5} Z" fill="#8E2A2A" stroke="${LINE}" stroke-width="1.1" stroke-linejoin="round"/><path d="M46.6,${my + 1.6} Q50,${my + 4.6} 53.4,${my + 1.6} Q50,${my + 0.8} 46.6,${my + 1.6} Z" fill="#E87A7A"/>`
      : mood < 0
        ? `<path d="M46,${my + 1.8} Q50,${my - 1.6} 54,${my + 1.8}" fill="none" stroke="${LINE}" stroke-width="1.5" stroke-linecap="round"/>`
        : `<path d="M46.5,${my} Q50,${my + 1.8} 53.5,${my}" fill="none" stroke="${LINE}" stroke-width="1.5" stroke-linecap="round"/>`;
    const blushOp = mood > 0 ? .6 : .3;
    const hatch = mood > 0 ? `<path d="M34,61.5 l1.6,-2.4 M36.6,61.5 l1.6,-2.4 M61.8,61.5 l1.6,-2.4 M64.4,61.5 l1.6,-2.4" stroke="#E5605F" stroke-width=".9" stroke-linecap="round"/>` : '';
    const tear = mood < 0 ? `<path d="M${R + 3.4},${ey + 6} q-2.2,4.2 0,6.2 q2.2,-2 0,-6.2 Z" fill="#9AD0F5" stroke="#4A8AC0" stroke-width=".6"/>` : '';
    return `<path d="M29,44 C29,25 71,25 71,44 L71,54 C71,67 60,77 50,80 C40,77 29,67 29,54 Z" fill="${p.skin}" stroke="${LINE}" stroke-width="1.4"/>` +
      `<ellipse cx="36.5" cy="61" rx="4.4" ry="2.3" fill="#FF8A8A" opacity="${blushOp}"/><ellipse cx="63.5" cy="61" rx="4.4" ry="2.3" fill="#FF8A8A" opacity="${blushOp}"/>` + hatch +
      eye(L, ey, p, mood, -1) + eye(R, ey, p, mood, 1) +
      `<path d="${bro}" fill="none" stroke="${bc}" stroke-width="${bw}" stroke-linecap="round"/>` +
      `<path d="M50,${ey + 6} L49,${ey + 8.6} L50.8,${ey + 8.8}" fill="none" stroke="${LINE}" stroke-width=".9" opacity=".6" stroke-linejoin="round"/>` +
      mouth + tear;
  }
  // Плечи, шея, уши — общие; «воротник» рисует каждый персонаж сам.
  function body(p) {
    return `<path d="M10,104 C12,88 30,82 50,82 C70,82 88,88 90,104 Z" fill="${p.cloth}" stroke="${LINE}" stroke-width="1.4"/>` +
      `<path d="M44,70 L44,85 L56,85 L56,70 Z" fill="${p.skin}" stroke="${LINE}" stroke-width="1.2"/><path d="M44,73 Q50,79 56,73 L56,77 Q50,82 44,77 Z" fill="#000" opacity=".1"/>` +
      `<ellipse cx="29.5" cy="54" rx="3.6" ry="5" fill="${p.skin}" stroke="${LINE}" stroke-width="1.2"/><ellipse cx="70.5" cy="54" rx="3.6" ry="5" fill="${p.skin}" stroke="${LINE}" stroke-width="1.2"/>`;
  }
  const shine = (d, w) => `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-opacity=".3" stroke-width="${w || 3}" stroke-linecap="round"/>`;
  const hairPath = (d, p) => `<path d="${d}" fill="${p.hair}" stroke="${LINE}" stroke-width="1.3" stroke-linejoin="round"/>`;

  // Для каждого: [за головой, одежда, поверх лица (чёлка, шапка, мелочи)], высота глаз.
  const LOOKS = {
    A: p => ({
      ey: 53,
      back: hairPath('M24,48 C22,22 38,13 50,13 C62,13 78,22 76,48 L77,71 C72,74 67,72 65,67 L35,67 C33,72 28,74 23,71 Z', p),
      wear: `<path d="M41,83 L50,98 L59,83 Z" fill="#FFFDF8"/><path d="M36,84 L46,100 M64,84 L54,100" stroke="#14213D" stroke-width="1.6"/><path d="M43,83 Q50,89 57,83 L55,91 L50,88 L45,91 Z" fill="#A13A2C" stroke="${LINE}" stroke-width="1"/>`,
      front: hairPath('M27,50 C26,27 38,17 50,17 C62,17 74,27 73,50 L70,50 L69,40 L65,43 L62,35 L58,42 L54,34 L50,41 L46,34 L42,42 L38,35 L35,43 L31,40 L30,50 Z', p) + shine('M37,25 Q50,19 63,25') +
        `<g fill="#FFFFFF" fill-opacity=".14" stroke="#1F2E4D" stroke-width="1.6"><rect x="33.5" y="46" width="15" height="13" rx="4.5"/><rect x="51.5" y="46" width="15" height="13" rx="4.5"/></g><path d="M48.5,51.5 H51.5" stroke="#1F2E4D" stroke-width="1.6"/>`
    }),
    B: p => ({
      ey: 54,
      back: hairPath('M27,54 C26,42 30,36 35,35 L65,35 C70,36 74,42 73,54 L70,62 L68,48 L32,48 L30,62 Z', p),
      wear: `<path d="M34,83 L50,96 L66,83" fill="none" stroke="#FFFDF8" stroke-width="3"/><path d="M38,85 L50,95 L62,85" fill="none" stroke="#FFFDF8" stroke-width="1.2"/><circle cx="50" cy="99" r="1.6" fill="#C9D3E3"/>`,
      front: hairPath('M30,45 L33,37 L37,45 L41,38 L45,45 L50,38 L55,45 L59,38 L63,45 L67,37 L70,45 L70,38 L30,38 Z', p) +
        `<path d="M22,32 C22,15 78,15 78,32 L73,37 L27,37 Z" fill="#FFFDF8" stroke="${LINE}" stroke-width="1.4"/><path d="M26,31 L74,31 L73,38 L27,38 Z" fill="#14213D" stroke="${LINE}" stroke-width="1.2"/>` +
        `<path d="M29,38 Q50,47 71,38 L71,41 Q50,50 29,41 Z" fill="#1B2433" stroke="${LINE}" stroke-width="1"/>` +
        `<circle cx="50" cy="27" r="4" fill="#A13A2C" stroke="${LINE}" stroke-width=".8"/><path d="M50,24.3 l.8,1.8 1.9,.2 -1.4,1.3 .4,1.9 -1.7,-1 -1.7,1 .4,-1.9 -1.4,-1.3 1.9,-.2 Z" fill="#FFFDF8"/>` + shine('M32,22 Q50,15 68,22', 2.5)
    }),
    C: p => ({
      ey: 54,
      back: hairPath('M26,52 L23,42 L29,44 L27,36 L33,40 L33,33 L67,33 L67,40 L73,36 L71,44 L77,42 L74,52 Z', p),
      wear: `<path d="M12,97 L88,97" stroke="#D9DEE6" stroke-width="3.2"/><path d="M40,83 L50,92 L60,83" fill="none" stroke="#B8582A" stroke-width="2.4"/>`,
      front: hairPath('M30,40 L33,47 L36,41 L40,48 L44,41 L48,47 L52,41 L56,48 L60,41 L64,47 L67,41 L70,40 Z', p) +
        `<path d="M24,37 C24,13 76,13 76,37 Z" fill="#F2A33A" stroke="${LINE}" stroke-width="1.4"/><rect x="19" y="35" width="62" height="5.5" rx="2.7" fill="#F2A33A" stroke="${LINE}" stroke-width="1.3"/>` +
        `<path d="M50,14 V35" stroke="#C9781E" stroke-width="3"/>` + shine('M32,24 Q40,17 48,16', 2.5) +
        `<g transform="rotate(-22 65 64)"><rect x="60" y="62" width="10" height="4.2" rx="1.2" fill="#F6DCC0" stroke="${LINE}" stroke-width=".7"/><path d="M64,63.4 v1.4 M66,63.4 v1.4" stroke="#C9A27E" stroke-width=".7"/></g>`
    }),
    D: p => ({
      ey: 55,
      back: hairPath('M27,58 C25,44 27,38 31,36 L33,58 Z', p) + hairPath('M73,58 C75,44 73,38 69,36 L67,58 Z', p),
      wear: `<path d="M42,83 L50,97 L58,83 Z" fill="#FFFDF8"/><path d="M48,85 L52,85 L53,99 L50,102 L47,99 Z" fill="#A13A2C" stroke="${LINE}" stroke-width=".8"/><path d="M36,84 L46,102 M64,84 L54,102" stroke="#4E3F30" stroke-width="1.6"/>`,
      front: `<path d="M24,38 C24,22 72,19 75,33 L84,37 C72,42 40,42 24,38 Z" fill="#6E675E" stroke="${LINE}" stroke-width="1.4"/><circle cx="50" cy="24" r="2" fill="#56504A"/>` + shine('M32,29 Q46,22 62,24', 2.5) +
        `<path d="M40,63.5 Q45,59.5 50,62.5 Q55,59.5 60,63.5 Q55,67 50,64.8 Q45,67 40,63.5 Z" fill="${p.hair}" stroke="${LINE}" stroke-width=".9"/>` +
        `<path d="M32,55 l-3,-1.5 M32,57 l-3,0.5 M68,55 l3,-1.5 M68,57 l3,0.5" stroke="${LINE}" stroke-width=".8" opacity=".55" stroke-linecap="round"/>`
    }),
    E: p => ({
      ey: 54,
      back: hairPath('M27,52 C26,26 40,15 50,15 C62,15 74,26 73,52 Z', p) + hairPath('M64,28 C86,26 92,52 80,74 C80,58 76,44 62,38 Z', p) +
        `<circle cx="68" cy="30" r="3.4" fill="#A13A2C" stroke="${LINE}" stroke-width=".9"/>`,
      wear: `<path d="M40,83 L50,93 L60,83 L56,82 L50,88 L44,82 Z" fill="#FFFDF8" stroke="${LINE}" stroke-width=".9"/><path d="M50,93 V104" stroke="#3B5F2B" stroke-width="1.4"/>`,
      front: hairPath('M27,53 C25,28 40,17 52,18 C66,19 75,30 73,50 L70,41 C64,43 58,39 54,32 C50,41 40,45 32,43 L30,53 Z', p) + shine('M38,24 Q50,19 62,23') +
        `<rect x="34" y="34" width="8" height="2.6" rx="1.3" fill="#F2C94C" stroke="${LINE}" stroke-width=".6" transform="rotate(-28 38 35)"/>`
    }),
    M: p => ({
      ey: 54,
      back: hairPath('M26,54 C25,27 40,16 50,16 C60,16 75,27 74,54 L75,66 L68,60 L32,60 L25,66 Z', p) +
        `<circle cx="29" cy="21" r="9.5" fill="${p.hair}" stroke="${LINE}" stroke-width="1.3"/><circle cx="71" cy="21" r="9.5" fill="${p.hair}" stroke="${LINE}" stroke-width="1.3"/>` +
        shine('M24,17 Q28,13 33,15', 2) + shine('M66,15 Q71,13 75,17', 2),
      wear: `<path d="M38,83 L50,92 L62,83" fill="none" stroke="#D8D2C6" stroke-width="1.4"/><path d="M41,83 L50,91 L59,83 L56,82 L50,87 L44,82 Z" fill="#C8102E" stroke="${LINE}" stroke-width=".9"/>` +
        `<path d="M48,89 L44,101 L49,98 Z M52,89 L56,101 L51,98 Z" fill="#C8102E" stroke="${LINE}" stroke-width=".9" stroke-linejoin="round"/>`,
      front: hairPath('M27,52 C26,28 38,19 50,19 C62,19 74,28 73,52 L70,42 L66,46 L63,37 L58,44 L54,36 L50,43 L46,36 L42,44 L37,37 L34,46 L30,42 Z', p) + shine('M37,26 Q50,21 63,26') +
        hairPath('M28,46 L25,74 L31,67 Z', p) + hairPath('M72,46 L75,74 L69,67 Z', p)
    })
  };

  let portraitSeq = 0;
  function portrait(id, mood, size) {
    const p = PEOPLE[id], s = size || 64, L = LOOKS[id](p);
    const cid = 'pc' + (++portraitSeq);
    return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true" class="portrait">` +
      `<clipPath id="${cid}"><circle cx="50" cy="50" r="50"/></clipPath>` +
      `<circle cx="50" cy="50" r="50" fill="${p.bg}"/><g clip-path="url(#${cid})">` +
      L.back + body(p) + L.wear + face(p, mood, L.ey) + L.front + `</g></svg>`;
  }

  // ---------- значки инструментов ----------
  const TOOL_ICON = {
    dot: `<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="37" rx="14" ry="5" fill="#9A6F28"/><rect x="10" y="29" width="28" height="8" fill="#C8963E"/><ellipse cx="24" cy="29" rx="14" ry="5" fill="#E2B865"/><rect x="10" y="21" width="28" height="8" fill="#C8963E"/><ellipse cx="24" cy="21" rx="14" ry="5" fill="#E2B865"/><rect x="10" y="13" width="28" height="8" fill="#C8963E"/><ellipse cx="24" cy="13" rx="14" ry="5" fill="#F0CD84"/><path d="M19,13 H29" stroke="#9A6F28" stroke-width="2" stroke-linecap="round"/></svg>`,
    road: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17,44 L22,6 H26 L31,44 Z" fill="#5A5048"/><path d="M24,40 V34 M24,28 V22 M24,17 V12" stroke="#F7F5F0" stroke-width="2.2" stroke-linecap="round"/><path d="M4,44 L16,6" stroke="#8DBF6A" stroke-width="6"/><path d="M44,44 L32,6" stroke="#8DBF6A" stroke-width="6"/><path d="M38,40 l3,-7 l3,7 Z" fill="#F2A33A"/></svg>`,
    tax: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8,10 H30 L42,22 L28,36 L8,16 Z" fill="#A13A2C" transform="rotate(8 24 24)"/><circle cx="14" cy="15" r="3" fill="#FFFDF8"/><text x="27" y="30" font-size="15" font-weight="700" fill="#FFFDF8" font-family="Arial" text-anchor="middle" transform="rotate(8 24 24)">%</text><path d="M38,30 V44 M33,39 L38,44 L43,39" stroke="#2F7A45" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    sez: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10,44 V8 M10,8 H40 M14,8 L10,14 M32,8 V16" stroke="#14213D" stroke-width="2.6" fill="none" stroke-linecap="round"/><rect x="28" y="16" width="8" height="5" fill="#A13A2C"/><rect x="16" y="34" width="12" height="10" fill="#2B5C8A"/><rect x="28" y="34" width="12" height="10" fill="#A13A2C"/><rect x="22" y="25" width="12" height="9" fill="#C8963E"/><path d="M40,4 l1.6,3.4 3.6,.4 -2.7,2.5 .8,3.6 -3.3,-1.9 -3.3,1.9 .8,-3.6 -2.7,-2.5 3.6,-.4 Z" fill="#A13A2C"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" fill="#8A837A"/><path d="M8,10 V7 a4,4 0 0 1 8,0 V10" fill="none" stroke="#8A837A" stroke-width="2.4"/></svg>`
  };

  // ---------- объекты карты ----------
  const N = '#14213D';
  const f1 = v => v.toFixed(1);

  function tree(x, y, pine) {
    return pine
      ? `<path d="M${f1(x)},${f1(y - 8)} L${f1(x + 5)},${f1(y)} H${f1(x + 1.4)} V${f1(y + 3)} H${f1(x - 1.4)} V${f1(y)} H${f1(x - 5)} Z" fill="#3E6B45"/><path d="M${f1(x)},${f1(y - 11)} L${f1(x + 3.6)},${f1(y - 4)} H${f1(x - 3.6)} Z" fill="#4D7F52"/>`
      : `<rect x="${f1(x - 1)}" y="${f1(y - 1)}" width="2" height="4.5" fill="#6B5844"/><circle cx="${f1(x)}" cy="${f1(y - 4)}" r="4.6" fill="#5E9F4F"/><circle cx="${f1(x - 1.5)}" cy="${f1(y - 5.5)}" r="2" fill="#7DB868" opacity=".8"/>`;
  }
  function grass(x, y) {
    return `<path d="M${f1(x - 4)},${f1(y + 2)} l1,-4 l1,4 M${f1(x - 0.5)},${f1(y + 2)} l1,-5 l1,5 M${f1(x + 3)},${f1(y + 2)} l1,-3.5 l1,3.5" fill="none" stroke="#8DA65A" stroke-width="1.1" stroke-linecap="round"/>`;
  }
  // Ворота в духе Тяньаньмэнь — столица на карте Китая.
  function gate(x, y) {
    return `<g><rect x="${f1(x - 9)}" y="${f1(y - 2)}" width="18" height="7" fill="#A13A2C" stroke="${N}" stroke-width=".7"/><path d="M${f1(x - 1.6)},${f1(y + 5)} V${f1(y + 1)} a1.6,1.6 0 0 1 3.2,0 V${f1(y + 5)} Z" fill="${N}"/>` +
      `<rect x="${f1(x - 7)}" y="${f1(y - 7)}" width="14" height="5" fill="#C9473A" stroke="${N}" stroke-width=".7"/><path d="M${f1(x - 10)},${f1(y - 7)} L${f1(x - 6)},${f1(y - 10)} H${f1(x + 6)} L${f1(x + 10)},${f1(y - 7)} Z" fill="#E2B865" stroke="${N}" stroke-width=".7"/>` +
      `<path d="M${f1(x - 8)},${f1(y - 11.5)} L${f1(x - 5)},${f1(y - 14)} H${f1(x + 5)} L${f1(x + 8)},${f1(y - 11.5)} Z" fill="#E2B865" stroke="${N}" stroke-width=".7"/><rect x="${f1(x - 5)}" y="${f1(y - 11.5)}" width="10" height="1.6" fill="#A13A2C"/></g>`;
  }
  function mountain(x, y) {
    return `<path d="M${f1(x - 9)},${f1(y + 5)} L${f1(x - 2)},${f1(y - 7)} L${f1(x + 2)},${f1(y - 1)} L${f1(x + 4)},${f1(y - 4)} L${f1(x + 10)},${f1(y + 5)} Z" fill="#A79F92"/><path d="M${f1(x - 2)},${f1(y - 7)} L${f1(x - 4.5)},${f1(y - 2.5)} L${f1(x - 2)},${f1(y - 3.5)} L${f1(x)},${f1(y - 3.6)} Z" fill="#F7F5F0"/>`;
  }
  // Здание по уровню региона: хижина → дом → многоэтажка → башня.
  function building(x, y, tier, cls) {
    const c = cls ? ` class="${cls}"` : '';
    if (tier === 0) return `<g${c}><path d="M${f1(x - 4)},${f1(y + 4)} V${f1(y)} L${f1(x)},${f1(y - 3.5)} L${f1(x + 4)},${f1(y)} V${f1(y + 4)} Z" fill="#E9DCC3" stroke="${N}" stroke-width=".7"/><rect x="${f1(x - 1)}" y="${f1(y + 1)}" width="2" height="3" fill="#6B5844"/></g>`;
    if (tier === 1) return `<g${c}><path d="M${f1(x - 5.5)},${f1(y + 5)} V${f1(y - 1)} L${f1(x)},${f1(y - 6)} L${f1(x + 5.5)},${f1(y - 1)} V${f1(y + 5)} Z" fill="#FFFDF8" stroke="${N}" stroke-width=".8"/><path d="M${f1(x - 6.5)},${f1(y - 0.5)} L${f1(x)},${f1(y - 6.5)} L${f1(x + 6.5)},${f1(y - 0.5)}" fill="none" stroke="#A13A2C" stroke-width="1.8" stroke-linejoin="round"/><rect x="${f1(x - 3.5)}" y="${f1(y)}" width="2.6" height="2.4" fill="#9FC3E0"/><rect x="${f1(x + 0.9)}" y="${f1(y)}" width="2.6" height="2.4" fill="#9FC3E0"/></g>`;
    if (tier === 2) return `<g${c}><rect x="${f1(x - 6)}" y="${f1(y - 8)}" width="12" height="13" fill="#E4E0D8" stroke="${N}" stroke-width=".8"/>` +
      [0, 1, 2].map(r => [0, 1, 2].map(q => `<rect x="${f1(x - 4.6 + q * 3.4)}" y="${f1(y - 6.5 + r * 3.6)}" width="2" height="2.2" fill="#6F9CC6"/>`).join('')).join('') + `</g>`;
    return `<g${c}><rect x="${f1(x - 7)}" y="${f1(y - 5)}" width="6" height="10" fill="#C9D3E3" stroke="${N}" stroke-width=".7"/><rect x="${f1(x - 2)}" y="${f1(y - 14)}" width="8" height="19" fill="#9FB0C9" stroke="${N}" stroke-width=".8"/><path d="M${f1(x + 2)},${f1(y - 14)} V${f1(y - 18)}" stroke="${N}" stroke-width=".8"/>` +
      [0, 1, 2, 3].map(r => `<rect x="${f1(x - 0.6)}" y="${f1(y - 12 + r * 4)}" width="5.2" height="1.6" fill="#E8F1F8"/>`).join('') + `</g>`;
  }
  const tierFor = lv => (lv < 5 ? 0 : lv < 10 ? 1 : lv < 15 ? 2 : 3);

  // Достопримечательности регионов (стоят всегда).
  function landmark(k, x, y, state) {
    if (k === 'A') return `<g><rect x="${f1(x - 6)}" y="${f1(y - 4)}" width="12" height="9" fill="#F7F5F0" stroke="${N}" stroke-width=".9"/><rect x="${f1(x - 2.5)}" y="${f1(y - 14)}" width="5" height="10" fill="#F7F5F0" stroke="${N}" stroke-width=".9"/><path d="M${f1(x - 3.5)},${f1(y - 14)} L${f1(x)},${f1(y - 21)} L${f1(x + 3.5)},${f1(y - 14)} Z" fill="#A13A2C"/><circle cx="${f1(x)}" cy="${f1(y - 9)}" r="1.4" fill="${N}"/><path d="M${f1(x)},${f1(y - 21)} V${f1(y - 25)}" stroke="${N}" stroke-width=".8"/><path d="M${f1(x)},${f1(y - 25)} h4 l-1.2,1.2 1.2,1.2 h-4" fill="#A13A2C"/></g>`;
    if (k === 'B') return `<g><path d="M${f1(x - 6)},${f1(y + 5)} V${f1(y - 12)} M${f1(x - 6)},${f1(y - 12)} H${f1(x + 9)} M${f1(x - 6)},${f1(y - 7)} L${f1(x - 1)},${f1(y - 12)}" stroke="#A13A2C" stroke-width="1.8" fill="none"/><path d="M${f1(x + 6)},${f1(y - 12)} V${f1(y - 4)}" stroke="${N}" stroke-width=".8"/><rect x="${f1(x + 3.5)}" y="${f1(y - 4)}" width="5" height="3" fill="#2B5C8A"><animateTransform attributeName="transform" type="translate" values="0,0;0,4;0,0" dur="4s" repeatCount="indefinite"/></rect><rect x="${f1(x - 2)}" y="${f1(y + 1)}" width="5" height="4" fill="#C8963E"/><rect x="${f1(x + 3)}" y="${f1(y + 1)}" width="5" height="4" fill="#2B5C8A"/></g>`;
    if (k === 'C') return `<g><path d="M${f1(x - 7)},${f1(y + 5)} H${f1(x + 7)}" stroke="${N}" stroke-width="1.2"/><path d="M${f1(x - 1)},${f1(y + 5)} L${f1(x)},${f1(y - 4)} L${f1(x + 1)},${f1(y + 5)}" fill="none" stroke="${N}" stroke-width="1.2"/>` +
      `<g><animateTransform attributeName="transform" type="rotate" values="-14 ${f1(x)} ${f1(y - 4)};14 ${f1(x)} ${f1(y - 4)};-14 ${f1(x)} ${f1(y - 4)}" dur="2.4s" repeatCount="indefinite"/><path d="M${f1(x - 8)},${f1(y - 4)} H${f1(x + 7)}" stroke="#14213D" stroke-width="2.2" stroke-linecap="round"/><path d="M${f1(x + 7)},${f1(y - 7)} q3,3 0,6" fill="#14213D"/><path d="M${f1(x - 7)},${f1(y - 4)} V${f1(y + 2)}" stroke="${N}" stroke-width=".9"/></g>` +
      `<path d="M${f1(x + 5)},${f1(y + 5)} q1.4,-3 2.8,0 q0,2 -1.4,2 q-1.4,0 -1.4,-2 Z" fill="#14213D"/></g>`;
    if (k === 'D') {
      const closed = state === 'closed';
      const smoke = closed ? '' : [0, 1].map(i => `<circle cx="${f1(x + 2.5 + i * 4)}" cy="${f1(y - 12)}" r="2.2" fill="#B9B3AA" opacity=".8"><animate attributeName="cy" values="${f1(y - 12)};${f1(y - 22)}" dur="${2.6 + i * 0.7}s" repeatCount="indefinite"/><animate attributeName="r" values="1.8;4.5" dur="${2.6 + i * 0.7}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="${2.6 + i * 0.7}s" repeatCount="indefinite"/></circle>`).join('');
      return `<g>${smoke}<path d="M${f1(x - 8)},${f1(y + 5)} V${f1(y - 2)} L${f1(x - 4)},${f1(y - 5)} V${f1(y - 2)} L${f1(x)},${f1(y - 5)} V${f1(y - 2)} L${f1(x + 1.5)},${f1(y - 2.6)} V${f1(y - 11)} H${f1(x + 4)} V${f1(y - 3)} H${f1(x + 5.5)} V${f1(y - 11)} H${f1(x + 8)} V${f1(y + 5)} Z" fill="${closed ? '#9C968E' : '#8C5A3C'}" stroke="${N}" stroke-width=".8"/>` +
        (closed ? `<rect x="${f1(x - 6)}" y="${f1(y)}" width="12" height="3.6" fill="#A13A2C" transform="rotate(-10 ${f1(x)} ${f1(y + 2)})"/>` : `<rect x="${f1(x - 6)}" y="${f1(y)}" width="2.5" height="2.5" fill="#F2C9B8"/><rect x="${f1(x - 2)}" y="${f1(y)}" width="2.5" height="2.5" fill="#F2C9B8"/>`) + `</g>`;
    }
    if (k === 'E') return `<g><path d="M${f1(x - 7)},${f1(y + 5)} V${f1(y - 13)}" stroke="${N}" stroke-width="1.1"/><path d="M${f1(x - 7)},${f1(y - 13)} q4,-2 8,0 t8,0 v6 q-4,-2 -8,0 t-8,0 Z" fill="#A13A2C"><animate attributeName="d" values="M${f1(x - 7)},${f1(y - 13)} q4,-2 8,0 t8,0 v6 q-4,-2 -8,0 t-8,0 Z;M${f1(x - 7)},${f1(y - 13)} q4,2 8,0 t8,0 v6 q-4,2 -8,0 t-8,0 Z;M${f1(x - 7)},${f1(y - 13)} q4,-2 8,0 t8,0 v6 q-4,-2 -8,0 t-8,0 Z" dur="2s" repeatCount="indefinite"/></path>` +
      `<rect x="${f1(x - 3)}" y="${f1(y - 2)}" width="5" height="7" fill="#F7F5F0" stroke="${N}" stroke-width=".8"/><path d="M${f1(x + 2)},${f1(y + 1)} H${f1(x + 11)}" stroke="#A13A2C" stroke-width="1.8" stroke-dasharray="2 1.6"/></g>`;
    return '';
  }

  function sezZone(x, y, planned) {
    if (planned) return `<g><circle cx="${f1(x)}" cy="${f1(y)}" r="13" fill="#FFFDF8" fill-opacity=".35" stroke="#A13A2C" stroke-width="1.6" stroke-dasharray="3 2.4"><animate attributeName="stroke-dashoffset" values="0;11" dur="1.2s" repeatCount="indefinite"/></circle><text x="${f1(x)}" y="${f1(y + 3.5)}" font-size="9" font-weight="700" fill="#A13A2C" text-anchor="middle" font-family="Arial">?</text></g>`;
    return `<g class="sez"><circle cx="${f1(x)}" cy="${f1(y)}" r="13" fill="#A13A2C" fill-opacity=".12" stroke="#A13A2C" stroke-width="1.4"/>` +
      `<rect x="${f1(x - 8)}" y="${f1(y + 1)}" width="5.5" height="4" fill="#2B5C8A"/><rect x="${f1(x - 2.5)}" y="${f1(y + 1)}" width="5.5" height="4" fill="#A13A2C"/><rect x="${f1(x - 5)}" y="${f1(y - 3)}" width="5.5" height="4" fill="#C8963E"/>` +
      `<path d="M${f1(x + 5)},${f1(y + 5)} V${f1(y - 9)} H${f1(x - 3)} M${f1(x + 5)},${f1(y - 5)} L${f1(x + 1)},${f1(y - 9)}" stroke="${N}" stroke-width="1.3" fill="none"/>` +
      `<path d="M${f1(x - 1)},${f1(y - 9)} V${f1(y - 5)}" stroke="${N}" stroke-width=".7"><animate attributeName="d" values="M${f1(x - 1)},${f1(y - 9)} V${f1(y - 5)};M${f1(x - 1)},${f1(y - 9)} V${f1(y - 2)};M${f1(x - 1)},${f1(y - 9)} V${f1(y - 5)}" dur="3s" repeatCount="indefinite"/></path></g>`;
  }

  function ship(x, y, dur) {
    return `<g><animateTransform attributeName="transform" type="translate" values="0,0;-14,1;0,0" dur="${dur}s" repeatCount="indefinite"/>` +
      `<path d="M${f1(x - 9)},${f1(y)} H${f1(x + 9)} L${f1(x + 6)},${f1(y + 4)} H${f1(x - 7)} Z" fill="#A13A2C"/><rect x="${f1(x - 6)}" y="${f1(y - 4)}" width="4" height="4" fill="#2B5C8A"/><rect x="${f1(x - 2)}" y="${f1(y - 4)}" width="4" height="4" fill="#C8963E"/><rect x="${f1(x + 2)}" y="${f1(y - 7)}" width="4" height="7" fill="#F7F5F0" stroke="${N}" stroke-width=".6"/></g>`;
  }
  function wave(x, y, i) {
    return `<path d="M${f1(x - 6)},${f1(y)} q3,-2.4 6,0 t6,0" fill="none" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="1.2" stroke-linecap="round"><animateTransform attributeName="transform" type="translate" values="0,0;2.5,0;0,0" dur="${3 + (i % 3)}s" repeatCount="indefinite"/></path>`;
  }
  function truck(pathD, dur, delay) {
    return `<g><rect x="-4" y="-2.6" width="5.4" height="4.2" rx=".6" fill="#2B5C8A"/><rect x="1.4" y="-1.8" width="2.8" height="3.4" rx=".6" fill="#A13A2C"/><animateMotion path="${pathD}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="linear"/></g>`;
  }
  function cone(x, y) {
    return `<path d="M${f1(x - 2.6)},${f1(y + 2.5)} L${f1(x)},${f1(y - 4)} L${f1(x + 2.6)},${f1(y + 2.5)} Z" fill="#F2A33A" stroke="#B8701E" stroke-width=".5"/><path d="M${f1(x - 1.4)},${f1(y - 0.6)} H${f1(x + 1.4)}" stroke="#FFFDF8" stroke-width="1"/>`;
  }
  // Человечек, который уезжает из региона без дороги.
  function leaver(x, y, tx, ty, delay) {
    return `<g opacity="0"><circle cx="0" cy="-5" r="1.8" fill="${N}"/><path d="M0,-3 V2 M0,2 l-2,3.4 M0,2 l2,3.4 M-2.4,-1 H2.4" stroke="${N}" stroke-width="1.3" stroke-linecap="round"/><rect x="2" y="-2" width="3" height="3.4" fill="#A13A2C"/>` +
      `<animateMotion path="M${f1(x)},${f1(y)} L${f1(tx)},${f1(ty)}" dur="2.4s" begin="${delay}s" fill="freeze"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.8;1" dur="2.4s" begin="${delay}s" fill="freeze"/></g>`;
  }

  // ---------- сцены событий ----------
  function eventScene(n, applied, label1) {
    const sky = `<rect width="320" height="150" fill="#DCE8F1"/><rect y="112" width="320" height="38" fill="#BFD79B"/>`;
    if (n === 1) return `<svg viewBox="0 0 320 150" class="scene" aria-hidden="true">${sky}` +
      `<g transform="translate(70,104) scale(3)">${landmark('C', 0, 0)}</g>` +
      `<rect x="168" y="22" width="132" height="84" rx="8" fill="#FFFDF8" stroke="#DDD6C8"/><text x="180" y="40" font-size="12" font-family="Arial" fill="#5F5A52">${label1 || '$ / баррель · 油价'}</text>` +
      `<polyline points="180,52 205,58 225,54 248,74 270,86 290,96" fill="none" stroke="#A13A2C" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="200" stroke-dashoffset="200"><animate attributeName="stroke-dashoffset" from="200" to="0" dur="1.4s" fill="freeze"/></polyline>` +
      `<path d="M284,88 l10,10 l-13,1 Z" fill="#A13A2C"/>` +
      `<g transform="translate(130,98)"><ellipse cx="0" cy="12" rx="9" ry="3" fill="#6B5844"/><rect x="-9" y="-8" width="18" height="20" fill="#2B5C8A"/><ellipse cx="0" cy="-8" rx="9" ry="3" fill="#4C7BA6"/><path d="M-9,0 H9" stroke="#14213D" stroke-width="1.2"/></g></svg>`;
    if (n === 2) return `<svg viewBox="0 0 320 150" class="scene" aria-hidden="true">${sky}` +
      `<g transform="translate(150,96) scale(3.4)">${landmark('D', 0, 0, applied ? 'closed' : '')}</g>` +
      (applied ? `<text x="160" y="140" font-size="13" font-weight="700" fill="#A13A2C" font-family="Arial" text-anchor="middle">ЗАКРЫТО · 倒闭</text>`
        : `<path d="M0,128 H320" stroke="#5A5048" stroke-width="10"/><path d="M0,128 H320" stroke="#F7F5F0" stroke-width="1.2" stroke-dasharray="8 8"/>${truck('M20,128 L300,128', 6, 0)}`) + `</svg>`;
    return `<svg viewBox="0 0 320 150" class="scene" aria-hidden="true">${sky}` +
      `<g transform="translate(160,100) scale(3.2)">${landmark('E', 0, 0)}</g>` +
      (applied ? `<path d="M0,128 H320" stroke="#5A5048" stroke-width="10"/><path d="M0,128 H320" stroke="#F7F5F0" stroke-width="1.2" stroke-dasharray="8 8"/>${truck('M10,128 L310,128', 5, 0)}${truck('M10,128 L310,128', 5, 1.6)}` : `<text x="160" y="140" font-size="12" fill="#5F5A52" font-family="Arial" text-anchor="middle">нет дороги · 没有路</text>`) + `</svg>`;
  }

  root.Art = { portrait, TOOL_ICON, tree, grass, gate, mountain, building, tierFor, landmark, sezZone, ship, wave, truck, cone, leaver, eventScene };
})(this);
