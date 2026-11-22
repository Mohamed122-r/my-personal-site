// ============================================
// إعدادات Supabase
// ============================================

const SUPABASE_URL = "https://xqqhhguzcxhphjiwnuqc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DXxs_x_h-81QoKVKG8VYgw_Hg2MwkQb";

// كائن Supabase الرسمي (للمصادقة والعمليات المتقدمة)
// (يُستخدم في admin.js)
let supabase = null;
if (typeof window !== "undefined" && window.supabase && window.supabase.createClient) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// كائن مبسط للاستخدام في الصفحات العادية (index, services, ...)
const supabaseClient = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,

  async request(path, options = {}) {
    const res = await fetch(`${this.url}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: this.key,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`فشل الطلب (${res.status}): ${err}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  },

  select(table) {
    return this.request(`${table}?select=*`);
  },

  insert(table, data) {
    return this.request(table, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(data)
    });
  },

  update(table, id, data) {
    return this.request(`${table}?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  },

  delete(table, id) {
    return this.request(`${table}?id=eq.${id}`, { method: "DELETE" });
  }
};

// بيانات احتياطية
const MOCK_DATA = {
  site_content: {
    hero_title: "محمد عبد الوهاب",
    hero_subtitle: "مطور مواقع وتطبيقات | أنظمة ERP | حلول رقمية متكاملة",
    hero_description: "أساعد الأفراد والشركات على بناء حلول رقمية احترافية."
  },
  services: [
    { id: 1, title: "تطوير المواقع", description: "مواقع سريعة ومتجاوبة", icon: "🌐" },
    { id: 2, title: "أنظمة ERP", description: "أنظمة إدارة موارد", icon: "📊" },
    { id: 3, title: "تطوير التطبيقات", description: "تطبيقات ويب وموبايل", icon: "📱" },
    { id: 4, title: "الاستشارات التقنية", description: "استشارات تقنية", icon: "💡" }
  ],
  projects: [
    { id: 1, title: "موقع شجرة النسب", description: "منصة شجرة العائلة", image: "", link: "https://genealogygenealogy.netlify.app/" }
  ],
  contact_info: {
    whatsapp: "249960491276",
    mostaql: "https://mostaql.com/u/Askana",
    khamsat: "https://khamsat.com/user/mohamedalaminandalwh",
    email: "your-email@example.com"
  }
};
