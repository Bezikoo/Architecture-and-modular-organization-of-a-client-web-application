# Завдання 1 — Керування станом через React Context API + useReducer

## Опис

Розширення клієнт-серверного застосунку з практичної роботи №4 шляхом введення явного рівня керування станом на основі стандартних інструментів React: `useReducer`, `useContext`, `useEffect`, `useCallback`.

Стан виступає єдиним джерелом істини для всіх компонентів, що працюють із користувачами.

---

## Що реалізовано

### Модель стану

Стан організовано у три секції (`src/state/usersReducer.ts`):

```ts
{
  data: {
    users: User[];          // список користувачів з сервера
    selectedUser: User | null; // вибраний для редагування
    pagination: PaginationData | null;
  },
  ui: {
    search: string;         // пошуковий запит
    sortBy: string;         // поле сортування
    order: string;          // напрямок сортування
    page: number;           // поточна сторінка
    isFormOpen: boolean;    // чи відкрита форма
  },
  status: {
    loading: boolean;       // виконується запит
    success: boolean;       // запит успішний
    error: string | null;   // повідомлення про помилку
  }
}
```

### Редуктор та дії

Файл `src/state/usersReducer.ts` містить чисту функцію-редуктор без побічних ефектів. Визначені дії:

| Дія | Опис |
|-----|------|
| `FETCH_START` | Починається завантаження списку |
| `FETCH_SUCCESS` | Список отримано успішно |
| `FETCH_ERROR` | Помилка при завантаженні |
| `SELECT_USER` | Вибір користувача для редагування |
| `SET_SEARCH` | Зміна пошукового запиту (скидає page → 1) |
| `SET_SORT_BY` | Зміна поля сортування |
| `SET_ORDER` | Зміна напрямку сортування |
| `SET_PAGE` | Перехід на іншу сторінку |
| `OPEN_FORM` | Відкриття форми |
| `CLOSE_FORM` | Закриття форми та скидання selectedUser |
| `OPERATION_ERROR` | Помилка CRUD-операції |

### Контекст (UsersContext)

Файл `src/state/UsersContext.tsx`:
- Створює контекст через `createContext`
- Провайдер `UsersProvider` ініціалізує `useReducer` зі збереженими значеннями з `localStorage`
- `useEffect` синхронізує `search` і `page` з `localStorage` при кожній зміні — стан відновлюється після оновлення сторінки (F5)

### Кастомний хук useUsers

Файл `src/hooks/useUsers.ts` — єдина точка доступу до стану та API:
- Зчитує `ui`-параметри зі стану
- Запускає `fetchUsers` через `useEffect` при зміні фільтрів
- Надає методи: `createUser`, `updateUser`, `deleteUser`, `openEditForm`, `openCreateForm`, `closeForm`
- Після кожної CRUD-операції автоматично повторно завантажує список

### Компоненти

| Компонент | Роль |
|-----------|------|
| `UsersPage` | Координує сценарії взаємодії, отримує дані через `useUsers` |
| `FilterPanel` | Відображає пошук і сортування, отримує `dispatch` через props |
| `UserTable` | Чистий компонент, відображає список, не містить логіки |
| `UserForm` | Чистий компонент форми створення/редагування |

### Збереження стану між оновленнями

`search` і `page` автоматично зберігаються в `localStorage` і відновлюються при перезавантаженні сторінки.

---

## Структура проекту

```
task-1/
├── client/
│   └── src/
│       ├── api/
│       │   └── userApi.ts          # axios-запити до REST API
│       ├── types/
│       │   └── user.ts             # TypeScript інтерфейси
│       ├── state/
│       │   ├── usersReducer.ts     # стан, типи дій, редуктор
│       │   └── UsersContext.tsx    # контекст + провайдер + localStorage
│       ├── hooks/
│       │   └── useUsers.ts         # кастомний хук (стан + API)
│       ├── components/
│       │   ├── FilterPanel.tsx
│       │   ├── UserTable.tsx
│       │   └── UserForm.tsx
│       ├── pages/
│       │   └── UsersPage.tsx
│       └── App.tsx                 # обгортає <UsersProvider>
├── server/
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── controllers/userController.js
│       ├── routes/userRoutes.js
│       └── services/userService.js
└── docker-compose.yml
```

---

## Як запустити

### 1. Запустити базу даних (PostgreSQL через Docker)

```bash
cd task-1
docker-compose up -d
```

### 2. Запустити сервер

```bash
cd task-1/server
npm install
npm run migrate     # застосувати міграції Prisma
npm run dev         # сервер запуститься на http://localhost:3000
```

### 3. Запустити клієнт

```bash
cd task-1/client
npm install
npm run dev         # клієнт запуститься на http://localhost:5173
```

### 4. Відкрити в браузері

```
http://localhost:5173
```

---

## Потік даних

```
UsersProvider (useReducer + useContext)
    └── useUsers (хук)
            ├── useEffect → fetchUsers → API → dispatch(FETCH_SUCCESS)
            ├── createUser / updateUser / deleteUser → API → fetchUsers
            └── dispatch(SET_SEARCH | SET_PAGE | ...)
                    └── usersReducer → новий стан
                            └── UsersPage → FilterPanel / UserTable / UserForm
```
