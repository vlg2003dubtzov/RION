// РИОН: связь с сервером платформы (PocketBase, папка server/) — вход, регистрация,
// кабинет, заказы и прогресс в играх. Адрес сервера и ссылки — в #rion-config,
// пустой адрес — тот же сайт. Подключается на всех страницах, когда кабинеты включены.
//
// Для игр, открытых с того же адреса:
//   RION.user()                                  — вошёл ли ученик (null, если нет)
//   RION.saveProgress("missione-italia", 87, {}) — лучший результат и любые данные игры
//   RION.getProgress("missione-italia")          — прочитать сохранённое
(() => {
  "use strict";

  const el = document.getElementById("rion-config");
  if (!el) return;
  const cfg = JSON.parse(el.textContent);
  const base = String(cfg.api || "").replace(/\/$/, "");
  const KEY = "rion_auth";

  // Вход храним в браузере, чтобы не вводить пароль на каждой странице.
  // В приватном окне хранилище может быть недоступно — тогда вход живёт до закрытия страницы.
  const store = {
    get() {
      try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
    },
    set(v) {
      try {
        if (v) localStorage.setItem(KEY, JSON.stringify(v));
        else localStorage.removeItem(KEY);
      } catch {}
    },
  };

  let auth = store.get();
  const listeners = [];

  function setAuth(v) {
    auth = v && v.token ? { token: v.token, record: v.record } : null;
    store.set(auth);
    for (const fn of listeners) {
      try { fn(auth ? auth.record : null); } catch {}
    }
  }

  // Ответы сервера с ошибками — по-русски. Поля формы PocketBase присылает в data.
  const FIELD_CODES = {
    validation_invalid_email: "Проверьте адрес почты.",
    validation_not_unique: "Кабинет с этой почтой уже есть — войдите или восстановите пароль.",
    validation_length_out_of_range: "Пароль — не короче 8 знаков.",
    validation_min_text_constraint: "Пароль — не короче 8 знаков.",
    validation_required: "Заполните обязательные поля.",
    validation_values_mismatch: "Пароли не совпадают.",
  };

  class ApiError extends Error {
    constructor(status, message, data) {
      super(message);
      this.status = status;
      this.data = data;
    }
  }

  function messageOf(status, data) {
    const fields = data && data.data && typeof data.data === "object" ? Object.values(data.data) : [];
    for (const f of fields) {
      if (f && FIELD_CODES[f.code]) return FIELD_CODES[f.code];
    }
    if (data && typeof data.message === "string" && /[а-яё]/i.test(data.message)) return data.message;
    if (status === 400 && /authenticate/i.test((data && data.message) || "")) return "Неверная почта или пароль.";
    if (status === 400 && fields.length) return "Проверьте, правильно ли заполнены поля.";
    if (status === 401 || status === 403) return "Войдите в кабинет ещё раз.";
    if (status === 404) return "Не нашли то, что вы искали.";
    if (status === 429) return "Слишком много попыток. Подождите минуту.";
    return "Сервер не смог выполнить запрос. Попробуйте ещё раз чуть позже.";
  }

  async function request(method, path, body) {
    const headers = {};
    if (auth && auth.token) headers.Authorization = auth.token;
    let payload;
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
    let res;
    try {
      res = await fetch(base + path, { method, headers, body: payload });
    } catch {
      throw new ApiError(0, "Сервер недоступен. Проверьте интернет и попробуйте ещё раз.");
    }
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      if (res.status === 401 && auth) setAuth(null);
      throw new ApiError(res.status, messageOf(res.status, data), data);
    }
    return data;
  }

  const q = (params) =>
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

  // Строка для фильтра PocketBase: кавычки и обратную косую черту экранируем.
  const lit = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

  let configPromise = null;

  const RION = {
    config: cfg,
    ApiError,

    user: () => (auth ? auth.record : null),
    onChange(fn) { listeners.push(fn); },

    async login(email, password) {
      const res = await request("POST", "/api/collections/users/auth-with-password", { identity: email, password });
      setAuth(res);
      return res.record;
    },

    async register({ name, email, password, consent }) {
      await request("POST", "/api/collections/users/records", {
        name, email, password, passwordConfirm: password, consent: !!consent,
      });
      return RION.login(email, password);
    },

    // Проверяем, что вход ещё действует, и получаем свежий токен.
    async refresh() {
      if (!auth) return null;
      try {
        setAuth(await request("POST", "/api/collections/users/auth-refresh"));
      } catch (e) {
        if (e.status === 401 || e.status === 403 || e.status === 404) setAuth(null);
        else throw e;
      }
      return RION.user();
    },

    logout() { setAuth(null); },

    requestReset: (email) => request("POST", "/api/collections/users/request-password-reset", { email }),

    async updateProfile(data) {
      const u = RION.user();
      const rec = await request("PATCH", `/api/collections/users/records/${u.id}`, data);
      setAuth({ token: auth.token, record: rec });
      return rec;
    },

    async list(collection, params = {}) {
      const res = await request("GET", `/api/collections/${collection}/records?${q({ perPage: 200, ...params })}`);
      return res.items || [];
    },

    create: (collection, data) => request("POST", `/api/collections/${collection}/records`, data),
    update: (collection, id, data) => request("PATCH", `/api/collections/${collection}/records/${id}`, data),

    // Какие способы оплаты включены на сервере: {robokassa: bool, sbp: true}.
    serverConfig() {
      if (!configPromise) {
        configPromise = request("GET", "/api/rion/config").catch((e) => {
          configPromise = null;
          throw e;
        });
      }
      return configPromise;
    },

    // Заказ: {id, code, amount, method, payUrl?}. 409 — игра уже куплена.
    order: (product, method) => request("POST", "/api/rion/orders", { product, method }),

    // Ссылка на защищённый файл покупки — с коротким токеном доступа.
    async fileUrl(record, field = "file") {
      const { token } = await request("POST", "/api/files/token");
      const name = record[field];
      return `${base}/api/files/${record.collectionId}/${record.id}/${encodeURIComponent(name)}?token=${encodeURIComponent(token)}&download=1`;
    },

    async getProgress(game) {
      const u = RION.user();
      if (!u) return null;
      const items = await RION.list("progress", { filter: `game = ${lit(game)}` });
      return items[0] || null;
    },

    // Сохраняет лучший результат (больший из старого и нового) и данные игры.
    async saveProgress(game, best, data) {
      const u = RION.user();
      if (!u) return null;
      const old = await RION.getProgress(game);
      const body = { data: data === undefined ? (old && old.data) || {} : data };
      if (typeof best === "number") body.best = old && typeof old.best === "number" ? Math.max(old.best, best) : best;
      if (old) return RION.update("progress", old.id, body);
      return RION.create("progress", { user: u.id, game, ...body });
    },
  };

  window.RION = RION;

  // Ссылка «Кабинет» в шапке показывает, что вход выполнен.
  function markHeader(user) {
    document.querySelectorAll("[data-account-link]").forEach((a) => {
      a.classList.toggle("is-in", !!user);
      a.title = user ? `Вы вошли: ${user.email}` : "Войти или зарегистрироваться";
    });
  }
  RION.onChange(markHeader);
  markHeader(RION.user());
})();
