// ============================================
// منطق الموقع — يجلب البيانات من Supabase
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  try {
    const data = await loadData();
    if (document.getElementById("hero-title")) renderHero(data.site_content);
    if (document.getElementById("services-grid")) renderServices(data.services);
    if (document.getElementById("projects-grid")) renderProjects(data.projects);
    if (document.getElementById("contact-grid")) renderContact(data.contact_info);
    if (data.contact_info) setupWhatsAppFloat(data.contact_info.whatsapp);
    if (document.getElementById("order-form")) setupOrderForm();
  } catch (error) {
    console.error("خطأ:", error);
    fallbackToMock();
  }
});

async function loadData() {
  const [siteContent, services, projects, contactInfo] = await Promise.all([
    supabaseClient.select("site_content"),
    supabaseClient.select("services"),
    supabaseClient.select("projects"),
    supabaseClient.select("contact_info")
  ]);
  return {
    site_content: siteContent[0] || {},
    services: services.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    projects: projects.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    contact_info: contactInfo[0] || {}
  };
}

function fallbackToMock() {
  console.warn("استخدام بيانات احتياطية");
  if (document.getElementById("hero-title")) renderHero(MOCK_DATA.site_content);
  if (document.getElementById("services-grid")) renderServices(MOCK_DATA.services);
  if (document.getElementById("projects-grid")) renderProjects(MOCK_DATA.projects);
  if (document.getElementById("contact-grid")) renderContact(MOCK_DATA.contact_info);
  setupWhatsAppFloat(MOCK_DATA.contact_info.whatsapp);
  if (document.getElementById("order-form")) setupOrderForm();
}

function renderHero(content) {
  if (!content) return;
  document.getElementById("hero-title").textContent = content.hero_title || "";
  document.getElementById("hero-subtitle").textContent = content.hero_subtitle || "";
  document.getElementById("hero-description").textContent = content.hero_description || "";
}

function renderServices(services) {
  const grid = document.getElementById("services-grid");
  if (!services || !services.length) {
    grid.innerHTML = "<p style='text-align:center;color:#64748b;'>لا توجد خدمات حالياً</p>";
    return;
  }
  grid.innerHTML = services.map((s) => `
    <div class="service-card">
      <div class="service-icon">${s.icon || "⚙️"}</div>
      <h3>${s.title}</h3>
      <p>${s.description || ""}</p>
    </div>
  `).join("");
}

function renderProjects(projects) {
  const grid = document.getElementById("projects-grid");
  if (!projects || !projects.length) {
    grid.innerHTML = "<p style='text-align:center;color:#64748b;'>لا توجد أعمال حالياً</p>";
    return;
  }
  grid.innerHTML = projects.map((p) => `
    <div class="project-card">
      <div class="project-image">
        ${p.image ? `<img src="${p.image}" alt="${p.title}">` : "🖼️"}
      </div>
      <div class="project-body">
        <h3>${p.title}</h3>
        <p>${p.description || ""}</p>
        ${p.link ? `<a href="${p.link}" target="_blank" class="project-link">زيارة المشروع →</a>` : ""}
      </div>
    </div>
  `).join("");
}

function renderContact(info) {
  const grid = document.getElementById("contact-grid");
  if (!info) return;
  const items = [
    { icon: "💬", title: "واتساب", desc: "تواصل مباشر", link: `https://wa.me/${info.whatsapp}` },
    { icon: "🎯", title: "مستقل", desc: "شاهد ملفي", link: info.mostaql },
    { icon: "⭐", title: "خمسات", desc: "خدماتي", link: info.khamsat },
    { icon: "📧", title: "البريد", desc: "راسلني", link: `mailto:${info.email}` }
  ];
  grid.innerHTML = items.map((i) => `
    <a href="${i.link}" target="_blank" class="contact-card">
      <div class="contact-icon">${i.icon}</div>
      <h3>${i.title}</h3>
      <p>${i.desc}</p>
    </a>
  `).join("");
}

function setupWhatsAppFloat(number) {
  const btn = document.getElementById("whatsapp-float");
  if (btn && number) btn.href = `https://wa.me/${number}`;
}

function setupOrderForm() {
  const form = document.getElementById("order-form");
  const msg = document.getElementById("form-message");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.className = "form-message";
    msg.textContent = "جاري الإرسال...";
    const formData = {
      name: form.name.value.trim(),
      contact: form.contact.value.trim(),
      service_type: form.service_type.value,
      details: form.details.value.trim()
    };
    try {
      await supabaseClient.insert("requests", formData);
      msg.className = "form-message success";
      msg.textContent = "✅ تم إرسال طلبك بنجاح! سأرد عليك قريباً.";
      form.reset();
    } catch (err) {
      console.error(err);
      msg.className = "form-message error";
      msg.textContent = "❌ حدث خطأ، حاول مرة أخرى.";
    }
  });
}
