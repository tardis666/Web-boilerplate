// курси
const COURSES = [
  "Mathematics", "Physics", "English", "Computer Science",
  "Dancing", "Chess", "Biology", "Chemistry",
  "Law", "Art", "Medicine", "Statistics"
];

// Функція для вибору випадкового курсу
function getRandomCourse() {
  // Math.random() -> випадкове число від 0 до 1
  // множимо на COURSES.length, щоб отримати діапазон від 0 до кількості курсів
  // Math.floor округлює вниз, щоб вийшов індекс
  const index = Math.floor(Math.random() * COURSES.length);
  // дропається випадковий курс за цим індексом
  return COURSES[index];
}

//перша літера великоаdf
function capitalize(str) {
  // чек шо аргумент — рядок
  if (typeof str !== "string") return str;
  // першу букву (charAt(0)), і роблю її великою (toUpperCase),
  // плюс до цього дод решту рядка (slice(1))
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// zad 1 
// format+zlittia masyviv
export function formatUsers(randomUsers, additionalUsers) {
  //concat не змінює ориг прст повертає новий масив
  const allUsers = randomUsers.concat(additionalUsers);
  // це порожній масив в який будуть вливатися відформ обєкти
  const result = [];

  //пройтись по кожноу користовачу у масиві
  for (let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];


    //зробити обєкт у вигляді як у завданні
    //optional chaining ?. якшо немає - нічого страшного, але якшо є то кул
    //якшо немає - пверне знавчення після || 
    const formatted = {
      gender: user.gender || "Unknown",
      title: user.name?.title || "Unknown",
      full_name: (user.name?.first || "") + " " + (user.name?.last || ""),
      // фулнейм імя+прізвище, якшо нема підставляється пстий рядок 
      city: user.location?.city || "Unknown",
      state: user.location?.state || "Unknown",
      country: user.location?.country || "Unknown",
      postcode: user.location?.postcode || 0,
      coordinates: {
        latitude: user.location?.coordinates?.latitude || "0",
        longitude: user.location?.coordinates?.longitude || "0"
      },
      timezone: {
        offset: user.location?.timezone?.offset || "+0:00",
        description: user.location?.timezone?.description || "Unknown"
      },
      email: user.email || "unknown@example.com",
      b_date: user.dob?.date || "",
      age: Number(user.dob?.age) || 0,
      phone: user.phone || "000-000-0000",
      picture_large: user.picture?.large || "",
      picture_thumbnail: user.picture?.thumbnail || "",

      // нові поля
      // id: login.uuid якщо є, інакше генер "user-i"
      id: user.login?.uuid || "user-" + i,
      favorite: false,
      course: getRandomCourse(),
      bg_color: "#ffffff",
      note: ""
    };

    // перевірка на дублікати (по id + full_name)
    //якшо є таке саме айді і таке саме фулнейм просто не додається
    let exists = false;
    for (let j = 0; j < result.length; j++) {
      if (result[j].id === formatted.id && result[j].full_name === formatted.full_name) {
        exists = true;
        break;
      }
    }

    // функція: true  всіх ноунеймів прибрати
    function isUnknown(u) {
      const keys = ["gender", "title", "city", "state", "country"];
      let unknownCount = 0;
      for (const k of keys) {
        if (!u[k] || u[k] === "Unknown") unknownCount++;
      }
      if (u.full_name === "Unknown") return true;
      return unknownCount >= 3;
    }

    if (!exists && !isUnknown(formatted)) {
      result.push(formatted);
    }
  }

  return result;
}

// zad2
// Перевірка об'єкта (валідація)
export function validateUser(user) {
  // чек аби фулнейм був рядком і почиався з великої літери
  if (typeof user.full_name !== "string" || user.full_name[0] !== user.full_name[0].toUpperCase()) {
    return false;
  }
  if (typeof user.gender !== "string") return false;
  if (typeof user.city !== "string" || user.city[0] !== user.city[0].toUpperCase()) return false;
  if (typeof user.state !== "string" || user.state[0] !== user.state[0].toUpperCase()) return false;
  if (typeof user.country !== "string" || user.country[0] !== user.country[0].toUpperCase()) return false;
  if (typeof user.age !== "number") return false;
  if (typeof user.note !== "string") return false;

  if (user.email.indexOf("@") === -1) return false;
  if (!/^[0-9()+\-\s]+$/.test(user.phone)) return false;
  //все інше чекається: вік-число, ноте-рядок, емаіл-равлик, мобіла простий вираз
  return true;
}

// zad3
// Фільтрація, перебираємо юзерів за умовами країна вік сать феворіт, якшо підходе по всім - додаєм в рези
export function filterUsers(users, filters) {
  const result = [];

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    let ok = true;

    if (filters.country && u.country !== filters.country) ok = false;
    if (filters.age && u.age !== filters.age) ok = false;
    if (filters.gender && u.gender !== filters.gender) ok = false;
    if (filters.favorite !== undefined && u.favorite !== filters.favorite) ok = false;

    if (ok) {
      result.push(u);
    }
  }

  return result;
}

// zad4
// Сортування
export function sortUsers(users, key, direction) {
  const copy = users.slice(); // робимо копію

  //comparator
  copy.sort(function (a, b) {
    let va = a[key];
    let vb = b[key];
    //якшо рядки - порівнювати в нижньом регістрі шоб не залежало від літер
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    //якшо 1 = а стає б б стає а
    if (va > vb) return 1;
    //якшо -1 лишити а перед б
    if (va < vb) return -1;
    //якшо вернути 0 нічо не міняється
    return 0;
  });

  if (direction === "desc") {
    copy.reverse();
  }

  return copy;
}

// zad5
// Пошук
export function searchUsers(users, query) {
  const result = [];
  const q = String(query).toLowerCase().trim();

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    if (String(u.full_name).toLowerCase().startsWith(q) ||
      String(u.note).toLowerCase().startsWith(q) ||
      String(u.age).startsWith(q)) {
      result.push(u);
    }
  }

  return result;
}

// zad6
// відсоток відповідності
export function percentMatch(users, checkFn) {
  let count = 0;

  //checkfn - для кожного юзера дає тру або фолз
  for (let i = 0; i < users.length; i++) {
    if (checkFn(users[i])) {
      count++;
    }
  }

  if (users.length === 0) return 0;

  return Math.round((count / users.length) * 100);
}