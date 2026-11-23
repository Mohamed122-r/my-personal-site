const SUPABASE_URL = "https://xqqhhguzcxhphjiwnuqc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DXxs_x_h-81QoKVKG8VYgw_Hg2MwkQb";

let supabase = null;
if (typeof window.supabase !== "undefined" && window.supabase.createClient) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("✅ Supabase client initialized");
}

const supabaseClient = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
  async request(path, options = {}) {
    const res = await fetch(`${this.url}/rest/v1/${path}`, {
      ...options,
      headers: { apikey: this.key, "Content-Type": "application/json", ...(options.headers || {}) }
    });
    if (!res.ok) throw new Error(`فشل (${res.status}): ${await res.text()}`);
    const t = await res.text();
    return t ? JSON.parse(t) : null;
  },
  select(table) { return this.request(`${table}?select=*`); },
  insert(table, data) { return this.request(table, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(data) }); },
  update(table, id, data) { return this.request(`${table}?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(data) }); },
  delete(table, id) { return this.request(`${table}?id=eq.${id}`, { method: "DELETE" }); }
};

const MOCK_DATA = {
  site_content: { hero_title: "محمد عبد الوهاب", hero_subtitle: "", hero_description: "" },
  services: [], projects: [],
  contact_info: { whatsapp: "249960491276", mostaql: "", khamsat: "", email: "" }
};
