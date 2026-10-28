// Правила «Пятилетки» — те же, что на бумажном листе и в табло преподавателя.
// Чистые функции без DOM: их проверяет tests/engine.test.js.
(function (root) {
  'use strict';

  const REGIONS = [
    { k: 'A', donor: true, start: 8, sez: false },  // Столица — ядро
    { k: 'B', donor: true, start: 6, sez: true },   // Портовый край — порт
    { k: 'C', donor: true, start: 7, sez: false },  // Нефтяной Север
    { k: 'D', donor: false, start: 4, sez: false }, // Старопромышленный район — депрессивный
    { k: 'E', donor: false, start: 2, sez: true }   // Приграничье — отсталый, граница
  ];
  const KEYS = REGIONS.map(r => r.k);
  const COST = { dot: 1, road: 2, tax: 1, sez: 3 };
  const START_BUDGET = 10;
  const ROUNDS = 2;      // третья пятилетка — по желанию преподавателя
  const MAX_ROUNDS = 3;
  // cond: 'noRoad' — только если в регионе нет дороги, 'road' — только если есть
  const EVENTS = {
    1: [{ k: 'C', d: -3 }],
    2: [{ k: 'D', d: -3, cond: 'noRoad' }],
    3: [{ k: 'E', d: 3, cond: 'road' }, { k: 'B', d: 1 }]
  };

  const region = k => REGIONS.find(r => r.k === k);

  function newGame() {
    const lv = {};
    REGIONS.forEach(r => { lv[r.k] = r.start; });
    return { round: 1, lv, roads: [], sez: [], budget: START_BUDGET, history: [] };
  }

  function blankDecision() {
    const d = {};
    KEYS.forEach(k => { d[k] = { dot: 0, tax: 0, road: false, sez: false }; });
    return d;
  }

  // Льготы — у доноров и там, где дорога построена в прошлой пятилетке.
  const canTax = (st, k) => region(k).donor || st.roads.includes(k);
  const canSez = (st, k) => region(k).sez && !st.sez.includes(k);
  const canRoad = (st, k) => !st.roads.includes(k);

  function spent(st, dec) {
    let s = 0;
    KEYS.forEach(k => {
      const d = dec[k];
      s += d.dot * COST.dot;
      if (canTax(st, k)) s += d.tax * COST.tax;
      if (d.road && canRoad(st, k)) s += COST.road;
      if (d.sez && canSez(st, k)) s += COST.sez;
    });
    return s;
  }

  function score(lv) {
    const v = KEYS.map(k => lv[k]);
    const sum = v.reduce((a, b) => a + b, 0);
    const gap = Math.max(...v) - Math.min(...v);
    return { sum, gap, idx: sum - gap };
  }

  // Одна пятилетка: Было + Покупки + Объекты + Событие + Мюрдаль = Стало (не ниже 0).
  // withEvent = false — прогноз для экрана решений.
  function playRound(st, dec, withEvent) {
    const roads = new Set(st.roads), sez = new Set(st.sez);
    KEYS.forEach(k => {
      if (dec[k].road) roads.add(k);
      if (dec[k].sez && canSez(st, k)) sez.add(k);
    });
    const lv = {}, log = {};
    KEYS.forEach(k => {
      const r = region(k), d = dec[k];
      const buy = d.dot + (canTax(st, k) ? 2 * d.tax : 0);
      let obj = roads.has(k) ? 1 : 0;
      if (sez.has(k)) obj += (k === 'E' && !roads.has('E')) ? 1 : 4;
      const myr = r.donor ? 1 : (roads.has(k) ? 0 : -1);
      log[k] = { start: st.lv[k], buy, obj, ev: 0, myr, end: 0, floored: false };
    });
    const events = [];
    if (withEvent) {
      (EVENTS[st.round] || []).forEach(e => {
        const has = roads.has(e.k);
        const applies = !e.cond || (e.cond === 'noRoad' ? !has : has);
        if (applies) log[e.k].ev += e.d;
        events.push({ k: e.k, d: e.d, cond: e.cond || null, applied: applies });
      });
    }
    KEYS.forEach(k => {
      const L = log[k];
      let v = L.start + L.buy + L.obj + L.ev + L.myr;
      if (v < 0) { v = 0; L.floored = true; }
      L.end = v; lv[k] = v;
    });
    const before = score(st.lv).sum;
    const sc = score(lv);
    const growth = sc.sum - before;
    const bonus = Math.max(0, Math.floor(growth / 5));
    return { lv, log, events, roads: [...roads], sez: [...sez], sc, before, growth, bonus, next: START_BUDGET + bonus };
  }

  // Утвердить план: возвращает новое состояние и итоги пятилетки.
  function commit(st, dec) {
    const res = playRound(st, dec, true);
    const rec = { round: st.round, dec: JSON.parse(JSON.stringify(dec)), spent: spent(st, dec), budget: st.budget, res };
    const next = {
      round: st.round + 1, lv: res.lv, roads: res.roads, sez: res.sez, budget: res.next,
      history: st.history.concat([rec])
    };
    return { state: next, result: res };
  }

  // На чью модель похожа стратегия — подсказка к разбору, не оценка.
  function classify(history) {
    // Монеты по инструментам; «рост» = льготы донорам и ОЭЗ, «периферия» = вложения в реципиентов.
    let dot = 0, road = 0, tax = 0, sez = 0, growth1 = 0, peri = 0;
    history.forEach(h => {
      KEYS.forEach(k => {
        const d = h.dec[k], donor = region(k).donor;
        const built = d.road ? COST.road : 0, opened = d.sez ? COST.sez : 0;
        dot += d.dot; tax += d.tax; road += built; sez += opened;
        if (h.round === 1) growth1 += (donor ? d.tax : 0) + opened;
        if (!donor) peri += built + (h.round >= 2 ? d.tax : 0);
      });
    });
    const total = dot + road + tax + sez;
    let model = 'own';
    if (total > 0 && dot / total >= 0.4 && dot > tax + sez) model = 'russia';
    else if (growth1 >= 3 && peri > 0) model = 'china';
    return { model, dot, road, tax, sez, total };
  }

  const api = { REGIONS, KEYS, COST, START_BUDGET, ROUNDS, MAX_ROUNDS, EVENTS, region, newGame, blankDecision, canTax, canSez, canRoad, spent, score, playRound, commit, classify };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Engine = api;
})(this);
