// ============================================
// إعدادات Supabase
// ============================================

const SUPABASE_URL = "https://xqqhhguzcxhphjiwnuqc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DXxs_x_h-81QoKVKG8VYgw_Hg2MwkQb";

const supabaseClient = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,

  // دالة موحدة لعمل الطلبات
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

// بيانات احتياطية (تظهر فقط لو فشل الاتصال)
const MOCK_DATA = {
  site_content: {
    hero_title: "محمد عبد الوهاب",
    hero_subtitle: "مطور مواقع وتطبيقات | أنظمة ERP | حلول رقمية متكاملة",
    hero_description: "أساعد الأفراد والشركات على بناء حلول رقمية احترافية تلبي احتياجاتهم وتنمو مع أعمالهم."
  },
  services: [
    { id: 1, title: "تطوير المواقع", description: "مواقع سريعة ومتجاوبة", icon: "🌐" },
    { id: 2, title: "أنظمة ERP", description: "أنظمة إدارة موارد المؤسسات", icon: "📊" },
    { id: 3, title: "تطوير التطبيقات", description: "تطبيقات ويب وموبايل", icon: "📱" },
    { id: 4, title: "الاستشارات التقنية", description: "استشارات تقنية", icon: "💡" }
  ],
  projects: [
    { id: 1, title: "موقع شجرة النسب", description: "منصة شجرة العائلة", image: "", link: "https://genealogygenealogy.netlify.app/" },
    { id: 2, title: "نظام ERP", description: "نظام ERP متكامل", image: "", link: "https://mohamed-abdalwhab-erp-bay.vercel.app" }
  ],
  contact_info: {
    whatsapp: "249960491276",
    mostaql: "https://mostaql.com/u/Askana",
    khamsat: "https://khamsat.com/user/mohamedalaminandalwh",
    email: "your-email@example.com"
  }
};
