# Практична робота №5 — Архітектура та керування станом клієнтського застосунку

Розширення клієнт-серверного застосунку з практичної роботи №4 (керування записами користувачів) шляхом введення явного рівня керування станом інтерфейсу та даних.

Реалізовано два підходи:
- **Завдання 1** — стандартні інструменти React (Context API + useReducer)
- **Завдання 2** — зовнішня бібліотека Redux Toolkit

---

## Завдання 1 — React Context API + useReducer

### Що реалізовано

Стан організовано у три секції (`src/state/usersReducer.ts`):

```ts
{
  data: {
    users: User[];             // список користувачів з сервера
    selectedUser: User | null; // вибраний для редагування
    pagination: PaginationData | null;
  },
  ui: {
    search: string;        // пошуковий запит
    sortBy: string;        // поле сортування
    order: string;         // напрямок сортування
    page: number;          // поточна сторінка
    isFormOpen: boolean;   // чи відкрита форма
  },
  status: {
    loading: boolean;      // виконується запит
    success: boolean;      // запит успішний
    error: string | null;  // повідомлення про помилку
  }
}
```

#### Редуктор та дії (`src/state/usersReducer.ts`)

Чиста функція без побічних ефектів. Дії:

| Дія | Опис |
|-----|------|
| `FETCH_START` | Починається завантаження |
| `FETCH_SUCCESS` | Список отримано успішно |
| `FETCH_ERROR` | Помилка при завантаженні |
| `SELECT_USER` | Вибір користувача для редагування |
| `SET_SEARCH` | Зміна пошуку (скидає page → 1) |
| `SET_SORT_BY` | Зміна поля сортування |
| `SET_ORDER` | Зміна напрямку сортування |
| `SET_PAGE` | Перехід на іншу сторінку |
| `OPEN_FORM` / `CLOSE_FORM` | Відкриття/закриття форми |
| `OPERATION_ERROR` | Помилка CRUD-операції |

#### Контекст (`src/state/UsersContext.tsx`)

- Провайдер `UsersProvider` ініціалізує `useReducer`
- При старті зчитує `search` і `page` з `localStorage`
- `useEffect` синхронізує ці поля при кожній зміні — стан відновлюється після F5

#### Кастомний хук `useUsers` (`src/hooks/useUsers.ts`)

Єдина точка доступу до стану та API:
- Запускає `fetchUsers` через `useEffect` при зміні фільтрів
- Надає методи: `createUser`, `updateUser`, `deleteUser`, `openEditForm`, `openCreateForm`, `closeForm`
- Після кожної CRUD-операції автоматично повторно завантажує список

#### Компоненти

| Компонент | Роль |
|-----------|------|
| `UsersPage` | Координує сценарії, отримує дані через `useUsers` |
| `FilterPanel` | Пошук і сортування, отримує `dispatch` через props |
| `UserTable` | Чистий компонент відображення списку |
| `UserForm` | Чистий компонент форми створення/редагування |

### Структура файлів

```
task-1/client/src/
├── api/
│   └── userApi.ts
├── types/
│   └── user.ts
├── state/
│   ├── usersReducer.ts     # стан, типи дій, редуктор
│   └── UsersContext.tsx    # контекст + провайдер + localStorage
├── hooks/
│   └── useUsers.ts         # кастомний хук (стан + API)
├── components/
│   ├── FilterPanel.tsx
│   ├── UserTable.tsx
│   └── UserForm.tsx
├── pages/
│   └── UsersPage.tsx
└── App.tsx                 # обгортає <UsersProvider>
```

### Як запустити

```bash
# 1. База даних
cd task-1
docker-compose up -d

# 2. Сервер
cd task-1/server
npm install
npm run migrate
npm run dev         # http://localhost:3000

# 3. Клієнт
cd task-1/client
npm install
npm run dev         # http://localhost:5173
```

---

## Завдання 2 — Redux Toolkit

### Що реалізовано

#### Redux Store (`src/store/index.ts`)

```ts
configureStore({
  reducer: {
    users: usersReducer,  // дані та статуси запитів
    ui: uiReducer,        // параметри інтерфейсу
  }
})
```

#### Slice 1 — `usersSlice` (`src/store/usersSlice.ts`)

Відповідає за дані предметної області:

| Поле | Опис |
|------|------|
| `users` | Список користувачів |
| `selectedUser` | Вибраний для редагування |
| `pagination` | Дані пагінації |
| `loading` | Виконується запит |
| `success` | Запит завершено успішно |
| `error` | Повідомлення про помилку |

Асинхронні дії (`createAsyncThunk`):

| Thunk | Опис |
|-------|------|
| `fetchUsers` | Отримує список з урахуванням параметрів з `uiSlice` |
| `createUser` | Створює → автоматично викликає `fetchUsers` |
| `updateUser` | Оновлює → автоматично викликає `fetchUsers` |
| `deleteUser` | Видаляє → автоматично викликає `fetchUsers` |

Кожен thunk автоматично обробляє стани `pending → fulfilled → rejected`.

#### Slice 2 — `uiSlice` (`src/store/uiSlice.ts`)

Відповідає за параметри інтерфейсу:

| Поле | Зберігається в localStorage |
|------|-----------------------------|
| `search` | Так |
| `page` | Так |
| `sortBy` | Ні |
| `order` | Ні |
| `isFormOpen` | Ні |

При ініціалізації зчитує `search` і `page` з `localStorage`. При зміні — одразу зберігає. Дії `createUser.fulfilled` і `updateUser.fulfilled` автоматично закривають форму через `extraReducers`.

#### Окремий API-модуль

`src/api/userApi.ts` — ізольований від Redux, викликається лише з thunks.

#### Типізовані хуки

| Хук | Призначення |
|-----|-------------|
| `useAppDispatch` | Типізований `useDispatch<AppDispatch>` |
| `useAppSelector` | Типізований `useSelector<RootState>` |

#### Компоненти

| Компонент | Роль |
|-----------|------|
| `UsersPage` | Підключається до store, координує взаємодію |
| `FilterPanel` | Сам читає store і відправляє дії без props |
| `UserTable` | Чистий компонент, отримує дані через props |
| `UserForm` | Чистий компонент форми |

### Структура файлів

```
task-2/client/src/
├── api/
│   └── userApi.ts
├── types/
│   └── user.ts
├── store/
│   ├── index.ts            # configureStore + RootState, AppDispatch
│   ├── usersSlice.ts       # дані + async thunks
│   └── uiSlice.ts          # UI-параметри + localStorage
├── hooks/
│   ├── useAppDispatch.ts
│   └── useAppSelector.ts
├── components/
│   ├── FilterPanel.tsx
│   ├── UserTable.tsx
│   └── UserForm.tsx
├── pages/
│   └── UsersPage.tsx
└── App.tsx                 # обгортає <Provider store={store}>
```

### Як запустити

```bash
# 1. База даних
cd task-2
docker-compose up -d        # якщо вже запущено з task-1 — пропустити

# 2. Сервер
cd task-2/server
npm install
npm run migrate
npm run dev                 # http://localhost:3000

# 3. Клієнт
cd task-2/client
npm install
npm run dev                 # http://localhost:5174
```

---

## Порівняння підходів

| | Завдання 1 | Завдання 2 |
|-|------------|------------|
| Інструмент | React Context + useReducer | Redux Toolkit |
| Де живе стан | Всередині React (Provider) | Поза React (Store) |
| Async логіка | Вручну в `useEffect` | `createAsyncThunk` |
| Генерація дій | Вручну константи | Автоматично через `createSlice` |
| Доступ у компонентах | `useContext` або через props | `useSelector` / `useDispatch` |
| Підходить для | Середніх додатків | Великих додатків |
