// ============================================
// منطق لوحة التحكم
// ============================================

let currentUser = null;
let editingServiceId = null;
let editingProjectId = null;

// عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", async () => {
  // التأكد من وجود Supabase client
  console.log("Supabase initialized:", supabase ? "✅" : "❌", "URL:", SUPABASE_URL);
  if (!supabase) {
    alert("خطأ في تحميل Supabase. تأكد من اتصال الإنترنت.");
    return;
  }

  // التحقق من وجود جلسة سابقة
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    showAdmin(session.user);
  } else {
    showLogin();
  }

  setupLogin();
  setupLogout();
  setupTabs();
  setupForms();
});

// ========== تسجيل الدخول ==========
function showLogin() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("admin-screen").style.display = "none";
}

function showAdmin(user) {
  currentUser = user;
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("admin-screen").style.display = "block";
  document.getElementById("admin-email").textContent = user.email;
  loadAll();
}

function setupLogin() {
  const form = document.getElementById("login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error");
    errorEl.classList.remove("show");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      errorEl.textContent = "❌ " + error.message + " (Status: " + (error.status || "?") + ") | Code: " + (error.code || "?");
      errorEl.classList.add("show");
      return;
    }
    showAdmin(data.user);
  });
}

function setupLogout() {
  document.getElementById("btn-logout").addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.reload();
  });
}

// ========== التبويبات ==========
function setupTabs() {
  document.querySelectorAll(".admin-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
    });
  });
}

// ========== تحميل كل البيانات ==========
async function loadAll() {
  await Promise.all([
    loadContent(),
    loadServices(),
    loadProjects(),
    loadRequests(),
    loadContact()
  ]);
}

// ========== محتوى الصفحة ==========
async function loadContent() {
  const data = await supabaseClient.select("site_content");
  const content = data[0] || {};
  document.getElementById("hero-title-input").value = content.hero_title || "";
  document.getElementById("hero-subtitle-input").value = content.hero_subtitle || "";
  document.getElementById("hero-description-input").value = content.hero_description || "";
}

document.getElementById("form-content").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = await supabaseClient.select("site_content");
  const id = data[0]?.id;
  const updates = {
    hero_title: document.getElementById("hero-title-input").value,
    hero_subtitle: document.getElementById("hero-subtitle-input").value,
    hero_description: document.getElementById("hero-description-input").value
  };
  try {
    if (id) await supabaseClient.update("site_content", id, updates);
    else await supabaseClient.insert("site_content", updates);
    toast("✅ تم حفظ المحتوى");
  } catch (err) {
    toast("❌ " + err.message, true);
  }
});

// ========== الخدمات ==========
async function loadServices() {
  const services = await supabaseClient.select("services");
  const list = document.getElementById("services-list");
  if (!services || !services.length) {
    list.innerHTML = "<p class='loading'>لا توجد خدمات. أضف خدمتك الأولى.</p>";
    return;
  }
  list.innerHTML = services.map(s => `
    <div class="item-row">
      <div class="info">
        <h4>${s.icon || "⚙️"} ${s.title}</h4>
        <p>${s.description || ""}</p>
      </div>
      <div class="actions">
        <button class="btn-sm btn-edit" onclick="editService(${s.id}, '${escape(s.title)}', '${escape(s.description || "")}', '${s.icon || ""}')">✏️</button>
        <button class="btn-sm btn-del" onclick="deleteService(${s.id})">🗑️</button>
      </div>
    </div>
  `).join("");
}

document.getElementById("form-service").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    title: document.getElementById("service-title").value,
    description: document.getElementById("service-description").value,
    icon: document.getElementById("service-icon").value || "⚙️"
  };
  try {
    if (editingServiceId) {
      await supabaseClient.update("services", editingServiceId, data);
      toast("✅ تم تحديث الخدمة");
    } else {
      await supabaseClient.insert("services", data);
      toast("✅ تمت إضافة الخدمة");
    }
    resetServiceForm();
    loadServices();
  } catch (err) {
    toast("❌ " + err.message, true);
  }
});

function editService(id, title, description, icon) {
  editingServiceId = id;
  document.getElementById("service-title").value = title;
  document.getElementById("service-description").value = description;
  document.getElementById("service-icon").value = icon;
  document.getElementById("btn-service-submit").textContent = "💾 تحديث";
  document.getElementById("btn-service-cancel").style.display = "inline-block";
  document.getElementById("service-title").focus();
}

function resetServiceForm() {
  editingServiceId = null;
  document.getElementById("form-service").reset();
  document.getElementById("btn-service-submit").textContent = "➕ إضافة خدمة";
  document.getElementById("btn-service-cancel").style.display = "none";
}

document.getElementById("btn-service-cancel").addEventListener("click", resetServiceForm);

async function deleteService(id) {
  if (!confirm("هل تريد حذف هذه الخدمة؟")) return;
  try {
    await supabaseClient.delete("services", id);
    toast("🗑️ تم حذف الخدمة");
    loadServices();
  } catch (err) {
    toast("❌ " + err.message, true);
  }
}

// ========== الأعمال ==========
async function loadProjects() {
  const projects = await supabaseClient.select("projects");
  const list = document.getElementById("projects-list");
  if (!projects || !projects.length) {
    list.innerHTML = "<p class='loading'>لا توجد أعمال. أضف مشروعك الأول.</p>";
    return;
  }
  list.innerHTML = projects.map(p => `
    <div class="item-row">
      <div class="info">
        <h4>${p.title}</h4>
        <p>${p.description || ""}</p>
      </div>
      <div class="actions">
        <button class="btn-sm btn-edit" onclick='editProject(${p.id}, ${JSON.stringify(p.title)}, ${JSON.stringify(p.description || "")}, ${JSON.stringify(p.image || "")}, ${JSON.stringify(p.link || "")})'>✏️</button>
        <button class="btn-sm btn-del" onclick="deleteProject(${p.id})">🗑️</button>
      </div>
    </div>
  `).join("");
}

document.getElementById("form-project").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    title: document.getElementById("project-title").value,
    description: document.getElementById("project-description").value,
    image: document.getElementById("project-image").value,
    link: document.getElementById("project-link").value
  };
  try {
    if (editingProjectId) {
      await supabaseClient.update("projects", editingProjectId, data);
      toast("✅ تم تحديث المشروع");
    } else {
      await supabaseClient.insert("projects", data);
      toast("✅ تمت إضافة المشروع");
    }
    resetProjectForm();
    loadProjects();
  } catch (err) {
    toast("❌ " + err.message, true);
  }
});

function editProject(id, title, description, image, link) {
  editingProjectId = id;
  document.getElementById("project-title").value = title;
  document.getElementById("project-description").value = description;
  document.getElementById("project-image").value = image;
  document.getElementById("project-link").value = link;
  document.getElementById("btn-project-submit").textContent = "💾 تحديث";
  document.getElementById("btn-project-cancel").style.display = "inline-block";
  document.getElementById("project-title").focus();
}

function resetProjectForm() {
  editingProjectId = null;
  document.getElementById("form-project").reset();
  document.getElementById("btn-project-submit").textContent = "➕ إضافة مشروع";
  document.getElementById("btn-project-cancel").style.display = "none";
}

document.getElementById("btn-project-cancel").addEventListener("click", resetProjectForm);

async function deleteProject(id) {
  if (!confirm("هل تريد حذف هذا المشروع؟")) return;
  try {
    await supabaseClient.delete("projects", id);
    toast("🗑️ تم حذف المشروع");
    loadProjects();
  } catch (err) {
    toast("❌ " + err.message, true);
  }
}

// ========== الطلبات ==========
async function loadRequests() {
  const container = document.getElementById("requests-container");
  container.innerHTML = "<p class='loading'>جاري التحميل...</p>";
  try {
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!data || !data.length) {
      container.innerHTML = "<p class='loading'>لا توجد طلبات حالياً.</p>";
      return;
    }
    container.innerHTML = `
      <table class="requests-table">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>الاسم</th>
            <th>التواصل</th>
            <th>الخدمة</th>
            <th>التفاصيل</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(r => `
            <tr>
              <td>${new Date(r.created_at).toLocaleDateString("ar-EG")}</td>
              <td>${r.name}</td>
              <td>${r.contact}</td>
              <td>${r.service_type || "-"}</td>
              <td style="max-width:300px; white-space:normal;">${r.details || "-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (err) {
    container.innerHTML = `<p class='loading'>❌ ${err.message}</p>`;
  }
}

document.getElementById("btn-refresh-requests").addEventListener("click", loadRequests);

// ========== التواصل ==========
async function loadContact() {
  const data = await supabaseClient.select("contact_info");
  const info = data[0] || {};
  document.getElementById("contact-whatsapp").value = info.whatsapp || "";
  document.getElementById("contact-mostaql").value = info.mostaql || "";
  document.getElementById("contact-khamsat").value = info.khamsat || "";
  document.getElementById("contact-email").value = info.email || "";
}

document.getElementById("form-contact").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = await supabaseClient.select("contact_info");
  const id = data[0]?.id;
  const updates = {
    whatsapp: document.getElementById("contact-whatsapp").value,
    mostaql: document.getElementById("contact-mostaql").value,
    khamsat: document.getElementById("contact-khamsat").value,
    email: document.getElementById("contact-email").value
  };
  try {
    if (id) await supabaseClient.update("contact_info", id, updates);
    else await supabaseClient.insert("contact_info", updates);
    toast("✅ تم حفظ معلومات التواصل");
  } catch (err) {
    toast("❌ " + err.message, true);
  }
});

// ========== الإشعارات ==========
function toast(message, isError = false) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.toggle("error", isError);
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

// دالة مساعدة
function escape(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, '\\"');
}
