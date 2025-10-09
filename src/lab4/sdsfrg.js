import { formatUsers } from './helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.teacher-list');
  const filterCountry = document.getElementById('filterCountry');
  const filterAge = document.getElementById('filterAge');
  const filterGender = document.getElementById('filterGender');
  const filterFavorite = document.getElementById('filterFavorite');
  const cardSearchInput = document.getElementById('cardSearchInput');
  const cardSearchBtn = document.getElementById('cardSearchBtn');
  const leftBtn = document.querySelector(".left-btn");
  const rightBtn = document.querySelector(".right-btn");
  const favList = document.querySelector(".favorites-list");
  const scrollAmount = 200;

  let teachers = [];
  let fetchPage = 1;
  const pageSize = 10;


  // ---------------- вигрузка карток селектів фаворитів ---------------
  async function loadUsers() {
    try {
      // 1. випадковi
      const res = await fetch("https://randomuser.me/api/?results=50");
      const data = await res.json();
      let randomTeachers = formatUsers(data.results, []);
      randomTeachers.forEach(t => t.favorite = false);

      // 2.  локальнi з json-server
      const resLocal = await fetch("http://localhost:3001/users");
      const dataLocal = await resLocal.json();
      // loadash
      const localTeachers = _.map(dataLocal, t => ({
        ...t,
        favorite: t.favorite ?? false,
        picture_large: t.picture_large || "",
        age: calculateAge(t.age)
      }));


      // 3.  (локальні + випадкові)
      teachers = [...localTeachers, ...randomTeachers];

      // 4. оновлюємо решту
      populateFilters(teachers);
      filteredUsers = [...teachers];
      render(filteredUsers);
      updateFavoritesList();
    } catch (err) {
      console.error("Помилка при завантаженні користувачів:", err);
    }
  }


  loadUsers();

  // +10 плюсдесять
  loadMoreBtn?.addEventListener('click', async () => {
    fetchPage++; // наступна сторінка
    try {
      const res = await fetch(`https://randomuser.me/api/?results=${pageSize}`);
      const data = await res.json();

      const newTeachers = formatUsers(data.results, []);
      newTeachers.forEach(t => t.favorite = false);

      teachers = [...teachers, ...newTeachers];   //  до існуючих
      filteredUsers = [...teachers];              //  для фільтрів

      populateFilters(teachers);                  //  селекти
      applyFiltersAndSearch();                    // рендер карток

      renderTable(filteredUsers);                  // рендер таблиці
      updateFavoritesList();                       //  фаворити
    } catch (err) {
      console.error('Помилка при завантаженні користувачів', err);
    }
  });



  // ---------------- рендер ----------------
  function render(users) {
    container.innerHTML = '';

    users.forEach(u => {
      const div = document.createElement('div');
      div.classList.add('teacher-card', 'openInfo');
      div.dataset.id = u.id;
      div.dataset.name = u.full_name;
      div.dataset.speciality = u.course;
      div.dataset.country = u.country;
      div.dataset.age = u.age;
      div.dataset.gender = u.gender;
      div.dataset.favorite = u.favorite;
      div.dataset.photo = u.picture_large;
      div.dataset.email = u.email;
      div.dataset.phone = u.phone;
      div.dataset.desc = u.note || "No description";
      div.dataset.bgcolor = u.bgcolor || "#000";

      div.innerHTML = `
        <img src="${u.picture_large}" alt="${u.full_name}">
        <p>
          <strong>${u.full_name}</strong>
          <span class="spec">${u.course}</span>
          <span class="country">${u.country}</span>
        </p>
        <span class="star">${u.favorite ? '★' : '☆'}</span>
      `;
      // фотка з ініціалів
      let avatar;
      if (u.picture_large) {
        avatar = `<img src="${u.picture_large}" alt="${u.full_name}">`;
      } else {
        const initials = getInitials(u.full_name);
        const color = u.bgcolor || "#000";

        function darkenColor(hex, percent) {
          const num = parseInt(hex.replace("#", ""), 16);
          let r = (num >> 16) & 0xFF;
          let g = (num >> 8) & 0xFF;
          let b = num & 0xFF;

          r = Math.max(0, Math.min(255, r - r * percent / 100));
          g = Math.max(0, Math.min(255, g - g * percent / 100));
          b = Math.max(0, Math.min(255, b - b * percent / 100));

          return `rgb(${r},${g},${b})`;
        }

        avatar = `<div class="circle" style="color: ${color}; background-color: ${darkenColor(color, 40)};">${initials}</div>`;
      }

      div.innerHTML = `
        ${avatar}
        <p>
          <strong>${u.full_name}</strong>
          <span class="spec">${u.course}</span>
          <span class="country">${u.country}</span>
        </p>
        <span class="star">${u.favorite ? '★' : '☆'}</span>
      `;
      container.appendChild(div);
    });
  }

  // ---------------- любімкі ----------------
  function updateFavoritesList() {
    if (!favList) return;
    favList.innerHTML = '';

    teachers.filter(t => t.favorite).forEach(t => { // для кожного со звіздой робить картку у фейворітс
      const card = document.createElement('div');
      card.classList.add('teacher-card');
      card.dataset.id = t.id;
      card.dataset.name = t.full_name;
      card.dataset.speciality = t.course;
      card.dataset.country = t.country;
      card.dataset.age = t.age;
      card.dataset.gender = t.gender;
      card.dataset.favorite = t.favorite;
      card.dataset.photo = t.picture_large;
      card.dataset.bgcolor = t.bgcolor || "#f0a";
      card.dataset.email = t.email;
      card.dataset.phone = t.phone;
      card.dataset.desc = t.note || "No description";

      card.innerHTML = `
        <p>
          <strong>${t.full_name}</strong>
          <span class="spec">${t.course}</span>
          <span class="country">${t.country}</span>
        </p>
        <span class="star">${t.favorite ? '★' : '☆'}</span>
      `;

      // фотка з ініціалів (fav)
      let avatar;
      if (t.picture_large) {
        avatar = `<img src="${t.picture_large}" alt="${t.full_name}">`;
      } else {
        const initials = getInitials(t.full_name);
        const color = t.bgcolor || "#000";

        function darkenColor(hex, percent) {
          const num = parseInt(hex.replace("#", ""), 16);
          let r = (num >> 16) & 0xFF;
          let g = (num >> 8) & 0xFF;
          let b = num & 0xFF;

          r = Math.max(0, Math.min(255, r - r * percent / 100));
          g = Math.max(0, Math.min(255, g - g * percent / 100));
          b = Math.max(0, Math.min(255, b - b * percent / 100));

          return `rgb(${r},${g},${b})`;
        }

        avatar = `<div class="circle" style="color: ${color}; background-color: ${darkenColor(color, 40)};">${initials}</div>`;
      }

      card.innerHTML = `
  ${avatar}
  <p>
    <strong>${t.full_name}</strong>
    <span class="spec">${t.course}</span>
    <span class="country">${t.country}</span>
  </p>
  <span class="star">${t.favorite ? '★' : '☆'}</span>
`;

      // Клік на картку для відкриття модалки
      card.addEventListener('click', () => openModal(card));
      favList.appendChild(card);

    });
  }
  // ---------------- івент делегейшн ----------------
  //щоб менше було івентлістенерів, вішає на батьківський елемент
  container.addEventListener('click', (e) => { // привязка саме до зірочкапалаю коли клік
    const card = e.target.closest('.teacher-card'); // знаходить найближчкий батьківський тічеркард 
    if (!card) return; // якшо нє то бай

    if (e.target.classList.contains('star')) {  // чек чи точно на зірчк
      e.stopPropagation(); // щоб не відкривалась модалка за умови, коли ми тикаєм по зірчк
      const teacher = teachers.find(t => t.id === card.dataset.id); // знайти в масиві тічерс викладача по якому тикається
      if (teacher) {
        teacher.favorite = !teacher.favorite;
        e.target.textContent = teacher.favorite ? '★' : '☆'; // перемикаєм тру фалс фалс тру
      }
      updateFavoritesList();
      applyFiltersAndSearch();

      // Показати повідомлення
      showToast(teacher.favorite
        ? `${teacher.full_name} додано до улюблених!`
        : `${teacher.full_name} видалено з улюблених!`);

      return;
    }

    // модал
    const modalInfo = document.getElementById('modalInfo');
    modalInfo.querySelector('.modal-body .photo').src = card.dataset.photo;
    modalInfo.querySelector('.modal-body .name').textContent = card.dataset.name;
    modalInfo.querySelector('.modal-body .spec').textContent = card.dataset.speciality;
    modalInfo.querySelector('.modal-body .country').textContent = card.dataset.country;
    if (!modalInfo.querySelector('.modal-body .contacts .email')) return;
    modalInfo.querySelector('.modal-body .contacts .email').innerHTML = card.dataset.email ? `<a href="mailto:${card.dataset.email}">${card.dataset.email}</a>` : '';
    modalInfo.querySelector('.modal-body .contacts .phone').innerHTML = card.dataset.phone ? `<a href="tel:${card.dataset.phone}">${card.dataset.phone}</a>` : '';
    modalInfo.querySelector('.modal-body .desc').textContent = card.dataset.desc;
    modalInfo.classList.add('active');
    document.body.classList.add('modal-open');
  });

  // ---------------- закр модал ----------------
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      document.body.classList.remove('modal-open');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.classList.remove('modal-open');
      }
    });
  });

  // ---------------- фільтри ----------------
  function populateFilters(users) {
    function fillSelect(select, values) {
      values = _.sortBy(_.uniq(values)); // lodash uniq + sort
      select.innerHTML = '';
      select.appendChild(new Option('All', ''));
      values.forEach(v => select.appendChild(new Option(v, v)));
    }

    fillSelect(filterCountry, _.map(users, 'country'));
    fillSelect(filterAge, _.map(users, 'age'));
    fillSelect(filterGender, _.map(users, 'gender'));
  }


  // ---------------- фільтри + пошук----------------
  function applyFiltersAndSearch() {
    let filtered = _.clone(teachers); // lodash clone

    if (filterCountry.value) filtered = _.filter(filtered, { country: filterCountry.value });
    if (filterAge.value) filtered = _.filter(filtered, t => t.age === parseInt(filterAge.value));
    if (filterGender.value) filtered = _.filter(filtered, { gender: filterGender.value });
    if (filterFavorite.checked) filtered = _.filter(filtered, { favorite: true });

    const query = cardSearchInput.value.toLowerCase().trim();
    if (query) {
      filtered = _.filter(filtered, t =>
        _.startsWith(t.full_name.toLowerCase(), query) ||
        _.startsWith(String(t.age), query) ||
        _.startsWith(t.course.toLowerCase(), query) ||
        (t.note && _.startsWith(t.note.toLowerCase(), query))
      );
    }

    filteredUsers = filtered;
    render(filteredUsers);
  }


  [filterCountry, filterAge, filterGender, filterFavorite].forEach(el => el.addEventListener('change', applyFiltersAndSearch));
  cardSearchBtn.addEventListener('click', applyFiltersAndSearch);
  cardSearchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyFiltersAndSearch();
  });

  // ---------------- скрол любімок ----------------
  leftBtn.addEventListener("click", () => {
    favList.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });
  rightBtn.addEventListener("click", () => {
    favList.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });
});

///////


// ---------------- DOM ----------------
const teacherList = document.querySelector(".teacher-list");
const closeButtons = document.querySelectorAll(".close-modal");
const tableBody = document.getElementById("tableBody");
const pageInfo = document.getElementById("pageInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// ---------------- конст ----------------
let allUsers = [];
let filteredUsers = [];
let favorites = [];
let currentPage = 1;
const rowsPerPage = 10;

// ---------------- викачка тіл ----------------
async function loadUsers() {
  const res = await fetch("https://randomuser.me/api/?results=50");
  const data = await res.json();

  allUsers = formatUsers(data.results, []);
  filteredUsers = allUsers;
  render();
}

loadUsers();



// ---------------- Render Table ----------------
function renderTable(users) {
  tableBody.innerHTML = "";
  const totalPages = Math.ceil(users.length / rowsPerPage);
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const slice = users.slice(start, end);

  slice.forEach((u, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${u.full_name}</td>
      <td>${u.age}</td>
      <td>${u.country}</td>
      <td>${u.gender}</td>
      <td>${u.course}</td>
    `;
    tableBody.appendChild(row);
  });



  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}


document.querySelectorAll("th[data-field]").forEach(th => {
  th.addEventListener("click", () => {
    const field = th.dataset.field;

    if (currentSort.field === field) {
      currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
    } else {
      currentSort.field = field;
      currentSort.direction = "asc";
    }
    // -сортет у th
    document.querySelectorAll("th[data-field]").forEach(t => t.classList.remove("sorted"));
    // на обрна
    th.classList.add("sorted");

    filteredUsers = _.orderBy(filteredUsers, [currentSort.field], [currentSort.direction]);
    renderTable(filteredUsers);
  });
});


// ---------------- модал ----------------
async function openModal(card) {
  document.getElementById("infoName").innerText = card.dataset.name;
  document.getElementById("infoSpeciality").innerText = card.dataset.speciality;
  document.getElementById("infoCountry").innerText = card.dataset.country;
  const age = calculateAge(card.dataset.age) || card.dataset.age;
  document.getElementById("infoMeta").innerText = age + " yrs, " + (card.dataset.gender || "—");
  document.getElementById("infoEmail").innerHTML = card.dataset.email ? `<a href="mailto:${card.dataset.email}">${card.dataset.email}</a>` : "";
  document.getElementById("infoPhone").innerHTML = card.dataset.phone ? `<a href="tel:${card.dataset.phone}">${card.dataset.phone}</a>` : "";
  document.getElementById("infoDesc").innerText = card.dataset.desc || 'No description provided.';

  modalInfo.classList.add("active");
  document.body.classList.add("modal-open");

  // ---------------- Фото ----------------
  const photoContainer = modalInfo.querySelector('.modal-body .photo');
  photoContainer.innerHTML = '';
  if (card.dataset.photo) {
    const img = document.createElement('img');
    img.src = card.dataset.photo;
    img.alt = card.dataset.name;
    img.style.width = "240px";
    img.style.height = "240px";
    img.style.border = "3px solid #f5a5a5";
    photoContainer.appendChild(img);
  } else {
    const avatarDiv = createInitialsAvatar(card.dataset.name, card.dataset.bgcolor || "#000");
    avatarDiv.style.width = "240px";
    avatarDiv.style.height = "240px";
    avatarDiv.style.fontSize = "96px";
    avatarDiv.style.borderRadius = "0";
    photoContainer.appendChild(avatarDiv);
  }

  // ---------------- мапа ----------------
  const mapContainer = document.getElementById("teacherMap");

  if (mapContainer._leaflet_id) {
    mapContainer._leaflet_id = null; // багфік
  }

  let lat = card.dataset.lat;
  let lon = card.dataset.lon;

  // якщо координат немає, центр країни через API
  if (!lat || !lon) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(card.dataset.country)}&format=json&limit=1`);
      const data = await res.json();
      if (data && data[0]) {
        lat = parseFloat(data[0].lat);
        lon = parseFloat(data[0].lon);
      } else {
        lat = 0; lon = 0;
      }
    } catch {
      lat = 0; lon = 0;
    }
  }

  lat = parseFloat(lat);
  lon = parseFloat(lon);

  const map = L.map(mapContainer).setView([lat, lon], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(`${card.dataset.name}<br>${card.dataset.country}`)
    .openPopup();
}


teacherList.addEventListener("click", (e) => {
  const card = e.target.closest(".teacher-card");
  if (!card) return;

  if (e.target.classList.contains("star")) {
    e.stopPropagation();
    return;
  }

  openModal(card);
});

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}


// Close modal
closeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
    document.body.classList.remove("modal-open");
  });
});

document.querySelectorAll(".modal-overlay").forEach(overlay => {
  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      document.body.classList.remove("modal-open");
    }
  });
});

// ---------------- пагінация ----------------
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable(filteredUsers);
  }
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable(filteredUsers);
  }
});


let currentSort = { field: null, direction: "asc" };

document.querySelectorAll("th[data-field]").forEach(th => {
  th.addEventListener("click", () => {
    const field = th.dataset.field;

    // міняємо напрямок, якщо клацаємо по тій самій колонці
    if (currentSort.field === field) {
      currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
    } else {
      currentSort.field = field;
      currentSort.direction = "asc";
    }

    filteredUsers = _.orderBy(filteredUsers, [currentSort.field], [currentSort.direction]);
    renderTable(filteredUsers);
  });
});




// ---------------- рендер для фільтров ----------------
function render() {
  renderTable(filteredUsers);
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("addTeacherModal");
  const openBtns = [document.getElementById("openAdd"), document.getElementById("openAddFooter")];
  const closeBtn = document.getElementById("closeAddModal");
  const form = document.getElementById("addTeacherForm");

  // Відкрити модалку
  openBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      modal.classList.add("active");
    });
  });

  // Закрити
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });

  // Сабміт форми
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const teacher = Object.fromEntries(formData.entries());

    // Валіднація (мінімально)
    if (!teacher.full_name.trim() || !teacher.email.trim()) {
      showToast("Please fill in required fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacher)
      });

      if (!res.ok) throw new Error("Server error");

      showToast("Teacher added successfully!");
      form.reset();
      modal.classList.remove("active");
    } catch (err) {
      showToast("Error: " + err.message);
    }
  });

  // Тости (повідомлення)
  function showToast(msg) {
    let toast = document.createElement("div");
    toast.className = "toast show";
    toast.innerText = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});
// ініціал фотка
function getInitials(fullName) {
  const names = fullName.trim().split(" ");
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

function createInitialsAvatar(fullName, color) {
  const initials = getInitials(fullName);

  // Темніший фон на ~30% (можемо робити через HSL)
  function darkenColor(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16);
    let r = (num >> 16) & 0xFF;
    let g = (num >> 8) & 0xFF;
    let b = num & 0xFF;

    r = Math.max(0, Math.min(255, r - r * percent / 100));
    g = Math.max(0, Math.min(255, g - g * percent / 100));
    b = Math.max(0, Math.min(255, b - b * percent / 100));

    return `rgb(${r},${g},${b})`;
  }

  const avatarDiv = document.createElement("div");
  avatarDiv.className = "circle";
  avatarDiv.textContent = initials;
  avatarDiv.style.color = color; // колір літер
  avatarDiv.style.backgroundColor = darkenColor(color, 40); // темніший фон
  avatarDiv.style.fontSize = "48px"; // великий шрифт
  avatarDiv.style.fontWeight = "bold";
  avatarDiv.style.display = "flex";
  avatarDiv.style.alignItems = "center";
  avatarDiv.style.justifyContent = "center";
  avatarDiv.style.width = "120px";   // та сама ширина як img
  avatarDiv.style.height = "120px";  // та сама висота
  avatarDiv.style.borderRadius = "50%";
  avatarDiv.style.border = "3px solid #f5a5a5";

  return avatarDiv;
}

// prorahuvaty vik
function calculateAge(birthdate) {
  if (!birthdate) return '';
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.abs(age);
}

//mobila max
const phoneInput = document.querySelector('input[name="phone"]');
if (phoneInput) {
  phoneInput.addEventListener("input", () => {
    let value = phoneInput.value.replace(/\D/g, ""); // залишаємо тільки цифри
    if (value.length > 10) value = value.slice(0, 10); // максимум 10 цифр

    let formatted = "";
    if (value.length > 0) {
      formatted = "(" + value.substring(0, 3);
    }
    if (value.length >= 4) {
      formatted += ") " + value.substring(3, 6);
    }
    if (value.length >= 7) {
      formatted += " " + value.substring(6, 10);
    }

    phoneInput.value = formatted;
  });


  // ---------------- Chart ----------------
  const tabTable = document.getElementById("tabTable");
  const tabCountry = document.getElementById("tabCountry");
  const tabAge = document.getElementById("tabAge");
  const tabCourse = document.getElementById("tabCourse");
  const tableContainer = document.querySelector(".table-wrapper");
  const chartContainer = document.getElementById("chartContainer");

  const tabs = [tabTable, tabCountry, tabAge, tabCourse];

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (tab === tabTable) {
        tableContainer.style.display = 'block';
        chartContainer.style.display = 'none';
      } else {
        tableContainer.style.display = 'none';
        chartContainer.style.display = 'block';
        if (tab === tabCountry) renderChartByCountry(filteredUsers);
        if (tab === tabAge) renderChartByAge(filteredUsers);
        if (tab === tabCourse) renderChartByCourse(filteredUsers);
      }
    });
  });

  let teachersChart;

  // Стиль 1: Стовпчиковий графік (по країнах)
  function renderChartByCountry(users) {
    const ctx = document.getElementById("teachersChart").getContext("2d");
    const counts = {};
    const canvas = document.getElementById("teachersChart");

    users.forEach(u => counts[u.country] = (counts[u.country] || 0) + 1);

    canvas.classList.remove("small-chart");

    if (teachersChart) teachersChart.destroy();
    teachersChart = new Chart(ctx, {
      type: 'bar',
      data: { labels: Object.keys(counts), datasets: [{ label: 'Teachers', data: Object.values(counts), backgroundColor: 'rgba(75, 192, 192,0.5)' }] },
      options: { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Teachers by Country' } }, scales: { y: { beginAtZero: true } } }
    });
  }

  // Стиль 2: Doughnut графік (по віку)
  function renderChartByAge(users) {
    const ctx = document.getElementById("teachersChart").getContext("2d");
    const canvas = document.getElementById("teachersChart");
    canvas.classList.remove("small-chart");

    const ageGroups = { "20-29": 0, "30-39": 0, "40-49": 0, "50+": 0 };
    users.forEach(u => {
      const age = parseInt(u.age);
      if (age < 30) ageGroups["20-29"]++;
      else if (age < 40) ageGroups["30-39"]++;
      else if (age < 50) ageGroups["40-49"]++;
      else ageGroups["50+"]++;
    });

    if (teachersChart) teachersChart.destroy();

    teachersChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(ageGroups),
        datasets: [{
          label: 'Number of Teachers',
          data: Object.values(ageGroups),
          backgroundColor: ['#d9534f', '#5bc0de', '#f0ad4e', '#5cb85c']
        }]
      },
      options: {
        indexAxis: 'y', // горизонтальні
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Teachers by Age' }
        },
        scales: {
          x: { beginAtZero: true }
        }
      }
    });
  }


  // Стиль 3: Pie графік (по курсам)
  function renderChartByCourse(users) {
    const ctx = document.getElementById("teachersChart").getContext("2d");
    const canvas = document.getElementById("teachersChart");
    const counts = {};
    users.forEach(u => counts[u.course] = (counts[u.course] || 0) + 1);

    canvas.classList.add("small-chart");

    if (teachersChart) teachersChart.destroy();
    teachersChart = new Chart(ctx, {
      type: 'pie',
      data: { labels: Object.keys(counts), datasets: [{ label: 'Teachers', data: Object.values(counts), backgroundColor: ['#d9534f', '#5bc0de', '#f0ad4e', '#5cb85c', '#292b2c'] }] },
      options: { responsive: true, plugins: { legend: { position: 'right' }, title: { display: true, text: 'Teachers by Course' } } }
    });

  }
}

