# Завдання 1 — Розширення архітектури станом застосунку (React Context + useReducer)

## Опис

На основі клієнт-серверного застосунку з практичної роботи №4 реалізовано явний рівень керування станом інтерфейсу та даних. Стан виступає єдиним джерелом істини (single source of truth) для всіх компонентів, що працюють із користувачами. Використані стандартні інструменти React: `useReducer`, `useContext`, `useEffect`, `useCallback`.

---

## Відповідність діаграмам

### Рисунок 1 — Потік даних

Діаграма описує такий ланцюжок:

```
Користувач → UI-компоненти → (подія/callback) → Контейнер/Сторінка
  → зміна стану / dispatch(action) → Стан (Context/Reducer/Hook)
  → запит до сервера → API-модуль → HTTP-запит → REST API сервер
```

Реалізований потік в коді:

```
Користувач (клік на кнопку)
  → FilterPanel / UserList / UserForm  (UI-компоненти)
  → callback-prop або dispatch          (подія)
  → UsersPage                           (Контейнер/Сторінка)
  → useUsers hook → dispatch(action)    (зміна стану)
  → usersReducer                        (новий стан)
  → UsersContext (useContext)           (поширення стану)
  → userApi (axios)                     (API-модуль)
  → HTTP-запит до REST API сервера      (Express + Prisma + PostgreSQL)
```

Після отримання відповіді дані повертаються назад:
`REST API → userApi → dispatch(FETCH_SUCCESS) → usersReducer → Context → компоненти`

### Рисунок 2 — Діаграма компонентів

UML-діаграма розподіляє код на чотири пакети. Ось точна відповідність:

| Пакет на діаграмі | Компонент/файл у коді |
|-------------------|-----------------------|
| **Подання** → `UsersPage` | `src/pages/UsersPage.tsx` |
| **Подання** → `UserList` | `src/components/UserList.tsx` |
| **Подання** → `UserForm` | `src/components/UserForm.tsx` |
| **Подання** → `FilterPanel` | `src/components/FilterPanel.tsx` |
| **Координація** → `useUsers (дані + статуси + дії)` | `src/hooks/useUsers.ts` |
| **Керування станом** → `UsersContext` | `src/state/UsersContext.tsx` |
| **Керування станом** → `UsersReducer` | `src/state/usersReducer.ts` |
| **Доступ до даних** → `UsersApi` | `src/api/userApi.ts` |
| **REST API сервер** | `server/src/` (Express + Prisma) |

Інтерфейси між пакетами:
- `UsersPage` підключається до `useUsers` через хук (інтерфейс «API hook-а useUsers»)
- `useUsers` читає і змінює стан через `UsersContext` (інтерфейси «Читання стану» / «Зміна стану»)
- `useUsers` викликає `userApi` (інтерфейс «HTTP API»)
- `userApi` звертається до REST API сервера (інтерфейс «REST API»)

### Рисунок 3 — Орієнтовний вигляд UI

| Елемент на скріншоті | Де реалізовано |
|----------------------|----------------|
| Заголовок «User Management» | `UsersPage.tsx` |
| Поле пошуку | `FilterPanel.tsx` — `dispatch({ type: 'SET_SEARCH', ... })` |
| Сортування (поле + напрямок) | `FilterPanel.tsx` — `SET_SORT_BY`, `SET_ORDER` |
| Кнопка «Add User» | `FilterPanel.tsx` → `onAddUser` → `openCreateForm()` |
| Таблиця зі списком користувачів | `UserList.tsx` |
| Кнопки Edit / Delete у рядках | `UserList.tsx` → `onEdit` / `onDelete` |
| Модальна форма створення/редагування | `UserForm.tsx` в `UsersPage.tsx` (рендериться за `ui.isFormOpen`) |
| Пагінація (Previous / Next) | `UsersPage.tsx` — `dispatch({ type: 'SET_PAGE', ... })` |
| Індикатор завантаження | `UsersPage.tsx` — умовний рендер за `status.loading` |
| Повідомлення про помилку | `UsersPage.tsx` — умовний рендер за `status.error` |

---

## Модель стану

Стан організовано у три секції (`src/state/usersReducer.ts`):

```ts
{
  data: {
    users: User[];               // список користувачів з сервера
    selectedUser: User | null;   // вибраний для перегляду або редагування
    pagination: PaginationData | null;
  },
  ui: {
    search: string;              // пошуковий запит
    sortBy: string;              // поле сортування
    order: string;               // напрямок: 'asc' | 'desc'
    page: number;                // поточна сторінка пагінації
    isFormOpen: boolean;         // чи відкрита модальна форма
  },
  status: {
    loading: boolean;            // виконується HTTP-запит
    success: boolean;            // останній запит завершено успішно
    error: string | null;        // текст помилки або null
  }
}
```

---

## Редуктор та дії

Файл `src/state/usersReducer.ts` — чиста функція без побічних ефектів. Перелік дій:

| Дія | Результат |
|-----|-----------|
| `FETCH_START` | `status.loading = true`, очищення помилки |
| `FETCH_SUCCESS` | Оновлення `data.users` і `data.pagination`, `loading = false`, `success = true` |
| `FETCH_ERROR` | `loading = false`, запис помилки в `status.error` |
| `SELECT_USER` | Встановлення `data.selectedUser` |
| `SET_SEARCH` | Оновлення `ui.search`, скидання `ui.page` на 1 |
| `SET_SORT_BY` | Оновлення `ui.sortBy` |
| `SET_ORDER` | Оновлення `ui.order` |
| `SET_PAGE` | Перехід на вказану сторінку |
| `OPEN_FORM` | `ui.isFormOpen = true`, очищення помилки |
| `CLOSE_FORM` | `ui.isFormOpen = false`, скидання `data.selectedUser` |
| `OPERATION_ERROR` | Запис помилки CRUD-операції |

---

## Контекст (UsersContext)

Файл `src/state/UsersContext.tsx`:

- Ініціалізує `useReducer` з читанням стартових значень із `localStorage` (функція `getPersistedState`)
- `useEffect` слідкує за `ui.search` та `ui.page` і синхронізує їх у `localStorage` при кожній зміні
- Після F5 пошуковий запит і номер сторінки відновлюються автоматично
- Надає `{ state, dispatch }` через `useContext` всім дочірнім компонентам без prop drilling

---

## Кастомний хук useUsers

Файл `src/hooks/useUsers.ts` — єдина точка доступу до стану та операцій:

- Читає `ui`-параметри зі стану через `useUsersContext()`
- `useCallback` + `useEffect` → автоматичний `fetchUsers` при зміні `page`, `search`, `sortBy`, `order`
- Надає методи: `createUser`, `updateUser`, `deleteUser`, `openEditForm`, `openCreateForm`, `closeForm`
- Після кожної успішної CRUD-операції повторно викликає `fetchUsers` → список оновлюється без ручного перезавантаження

---

## Компоненти

| Компонент | Шар | Роль |
|-----------|-----|------|
| `UsersPage` | Контейнер (Координація) | Отримує всі дані через `useUsers`, координує сценарії взаємодії, рендерить дочірні компоненти |
| `UserList` | Подання | Чистий компонент: таблиця з рядками користувачів, приймає `users`, `onEdit`, `onDelete` через props |
| `UserForm` | Подання | Чистий компонент форми зі своїм локальним `useState` для полів; передає дані через `onSubmit` |
| `FilterPanel` | Подання | Відображає пошук і сортування, отримує `dispatch` і поточні значення через props від `UsersPage` |

Компоненти подання не містять логіки роботи з API та не підключаються до контексту напряму — це обов'язок `UsersPage` та `useUsers`.

---

## Структура проекту

```
task-1/
├── client/
│   └── src/
│       ├── api/
│       │   └── userApi.ts              # axios-запити до REST API (шар «Доступ до даних»)
│       ├── types/
│       │   └── user.ts                 # TypeScript інтерфейси: User, UserFormData, PaginationData
│       ├── state/
│       │   ├── usersReducer.ts         # UsersState, UsersAction, initialState, usersReducer
│       │   └── UsersContext.tsx        # createContext, UsersProvider, useUsersContext, localStorage
│       ├── hooks/
│       │   └── useUsers.ts             # кастомний хук — координація стану та API (шар «Координація»)
│       ├── components/
│       │   ├── FilterPanel.tsx         # пошук + сортування (шар «Подання»)
│       │   ├── UserList.tsx            # таблиця користувачів (шар «Подання»)
│       │   └── UserForm.tsx            # форма створення/редагування (шар «Подання»)
│       ├── pages/
│       │   └── UsersPage.tsx           # контейнер-сторінка (шар «Координація»)
│       └── App.tsx                     # обгортає <UsersProvider> — підключає контекст
├── server/
│   ├── prisma/
│   │   └── schema.prisma               # модель User
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── controllers/userController.js
│       ├── routes/userRoutes.js
│       └── services/userService.js     # пошук, сортування, пагінація
└── docker-compose.yml
```

---

## REST API

| Метод | Маршрут | Query-параметри |
|-------|---------|-----------------|
| `GET` | `/api/users` | `page`, `limit`, `search`, `sortBy`, `order` |
| `GET` | `/api/users/:id` | — |
| `POST` | `/api/users` | тіло: `firstName`, `lastName`, `email`, `role` |
| `PUT` | `/api/users/:id` | тіло: ті самі поля |
| `DELETE` | `/api/users/:id` | — |

---

## Потік даних (детально)

```
UsersProvider (useReducer + localStorage)
    │
    └── useUsers (кастомний хук)
            │
            ├── useEffect([page, search, sortBy, order])
            │       └── fetchUsers()
            │               ├── dispatch(FETCH_START)   → status.loading = true
            │               ├── userApi.getUsers(params) → HTTP GET /api/users
            │               ├── dispatch(FETCH_SUCCESS) → data.users + pagination
            │               └── dispatch(FETCH_ERROR)   → status.error
            │
            ├── createUser(formData)
            │       ├── userApi.createUser(formData) → HTTP POST /api/users
            │       ├── dispatch(CLOSE_FORM)
            │       └── fetchUsers()                 → автооновлення списку
            │
            ├── updateUser(id, formData)
            │       ├── userApi.updateUser(id, data) → HTTP PUT /api/users/:id
            │       ├── dispatch(CLOSE_FORM)
            │       └── fetchUsers()                 → автооновлення списку
            │
            └── deleteUser(id)
                    ├── userApi.deleteUser(id)       → HTTP DELETE /api/users/:id
                    └── fetchUsers()                 → автооновлення списку

UsersPage (контейнер)
    ├── FilterPanel  ← props: search, sortBy, order, dispatch, onAddUser
    ├── UserList     ← props: users, onEdit, onDelete
    ├── UserForm     ← props: onSubmit, initialData, onCancel  (у модалці)
    └── Pagination   ← dispatch(SET_PAGE, ...)
```

---

## Як запустити

### 1. База даних

```bash
cd task-1
docker-compose up -d
```

### 2. Сервер

```bash
cd task-1/server
npm install
npm run migrate     # застосувати міграції Prisma
npm run dev         # http://localhost:3000
```

### 3. Клієнт

```bash
cd task-1/client
npm install
npm run dev         # http://localhost:5173
```

### 4. У браузері

```
http://localhost:5173
```

---

## Чек-лист вимог практичної

- [x] Явна модель стану з секціями `data`, `ui`, `status`
- [x] `useReducer` для складних структур з формалізованими переходами станів
- [x] `useContext` для поширення стану (без prop drilling у глибину)
- [x] `useEffect` для синхронізації фільтрів зі списком
- [x] `useCallback` для стабілізації функцій між рендерами
- [x] Кастомний хук `useUsers` що інкапсулює стан та виклики API
- [x] Збереження `search` та `page` в `localStorage` з відновленням після F5
- [x] Автоматичне оновлення списку після create / update / delete
- [x] Індикація `loading`, `success`, `error` в інтерфейсі
- [x] Компоненти подання залишаються «чистими» (без логіки API)
- [x] Відповідність Рисунку 1 (потік даних), Рисунку 2 (діаграма компонентів), Рисунку 3 (UI)
