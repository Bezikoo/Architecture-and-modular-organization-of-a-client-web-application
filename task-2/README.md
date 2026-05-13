# Завдання 2 — Централізоване керування станом через Redux Toolkit

## Опис

Нова версія клієнтської частини застосунку для керування користувачами з використанням **Redux Toolkit** як централізованого засобу керування станом. На відміну від завдання 1 (де стан зберігався всередині React через Context), тут стан зберігається у глобальному Redux store поза деревом компонентів.

---

## Що реалізовано

### Redux Store

Файл `src/store/index.ts` — налаштовує глобальне сховище через `configureStore`:

```ts
store = configureStore({
  reducer: {
    users: usersReducer,  // дані та статуси запитів
    ui: uiReducer,        // параметри інтерфейсу
  }
})
```

### Slice 1 — usersSlice (`src/store/usersSlice.ts`)

Відповідає за **дані предметної області**:

| Поле | Тип | Опис |
|------|-----|------|
| `users` | `User[]` | Список користувачів |
| `selectedUser` | `User \| null` | Вибраний для редагування |
| `pagination` | `PaginationData \| null` | Дані пагінації |
| `loading` | `boolean` | Виконується запит |
| `success` | `boolean` | Запит завершено успішно |
| `error` | `string \| null` | Повідомлення про помилку |

Асинхронні дії (`createAsyncThunk`):

| Thunk | Опис |
|-------|------|
| `fetchUsers` | Отримує список з урахуванням параметрів з `uiSlice` |
| `createUser` | Створює користувача → автоматично викликає `fetchUsers` |
| `updateUser` | Оновлює користувача → автоматично викликає `fetchUsers` |
| `deleteUser` | Видаляє користувача → автоматично викликає `fetchUsers` |

Кожен thunk автоматично генерує три стани: `pending`, `fulfilled`, `rejected` — обробляються через `extraReducers`.

### Slice 2 — uiSlice (`src/store/uiSlice.ts`)

Відповідає за **параметри інтерфейсу**, які впливають на запити:

| Поле | Тип | Опис | Зберігається в localStorage |
|------|-----|------|------------------------------|
| `search` | `string` | Пошуковий запит | Так |
| `sortBy` | `string` | Поле сортування | Ні |
| `order` | `string` | Напрямок сортування | Ні |
| `page` | `number` | Поточна сторінка | Так |
| `isFormOpen` | `boolean` | Стан форми | Ні |

При ініціалізації зчитує `search` і `page` з `localStorage`. При кожній зміні цих полів одразу зберігає нові значення — стан відновлюється після F5.

Дії `createUser.fulfilled` і `updateUser.fulfilled` автоматично закривають форму через `extraReducers`.

### Окремий API-модуль

Файл `src/api/userApi.ts` — ізольований модуль для HTTP-запитів через axios. Не залежить від Redux, викликається лише з thunks.

### Типізовані хуки

| Хук | Файл | Призначення |
|-----|------|-------------|
| `useAppDispatch` | `hooks/useAppDispatch.ts` | Типізований `useDispatch<AppDispatch>` |
| `useAppSelector` | `hooks/useAppSelector.ts` | Типізований `useSelector<RootState>` |

### Компоненти

| Компонент | Роль |
|-----------|------|
| `UsersPage` | Підключається до store, координує взаємодію |
| `FilterPanel` | Сам читає стан зі store (`useAppSelector`) і відправляє дії (`useAppDispatch`) |
| `UserTable` | Чистий компонент, отримує дані через props |
| `UserForm` | Чистий компонент форми, локальний стан полів через `useState` |

### Автоматичне оновлення після CRUD

Кожен thunk (`createUser`, `updateUser`, `deleteUser`) після успішного виконання автоматично диспатчить `fetchUsers()` — список завжди актуальний без ручного перезавантаження.

---

## Структура проекту

```
task-2/
├── client/
│   └── src/
│       ├── api/
│       │   └── userApi.ts              # axios-запити до REST API
│       ├── types/
│       │   └── user.ts                 # TypeScript інтерфейси
│       ├── store/
│       │   ├── index.ts                # configureStore + типи RootState/AppDispatch
│       │   ├── usersSlice.ts           # дані + async thunks
│       │   └── uiSlice.ts              # UI-параметри + localStorage
│       ├── hooks/
│       │   ├── useAppDispatch.ts       # типізований dispatch
│       │   └── useAppSelector.ts      # типізований selector
│       ├── components/
│       │   ├── FilterPanel.tsx         # сам читає store
│       │   ├── UserTable.tsx
│       │   └── UserForm.tsx
│       ├── pages/
│       │   └── UsersPage.tsx
│       └── App.tsx                     # обгортає <Provider store={store}>
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
cd task-2
docker-compose up -d
```

> Якщо Docker вже запущений з task-1 — цей крок можна пропустити, БД спільна.

### 2. Запустити сервер

```bash
cd task-2/server
npm install
npm run migrate     # застосувати міграції Prisma
npm run dev         # сервер запуститься на http://localhost:3000
```

### 3. Запустити клієнт

```bash
cd task-2/client
npm install
npm run dev         # клієнт запуститься на http://localhost:5174
```

### 4. Відкрити в браузері

```
http://localhost:5174
```

---

## Потік даних

```
Redux Store
  ├── usersSlice (users, pagination, loading, error)
  └── uiSlice    (search, page, sortBy, order, isFormOpen)
         ↕ localStorage (search, page відновлюються після F5)

UsersPage
  ├── useEffect([search, page, sortBy, order]) → dispatch(fetchUsers())
  ├── handleEdit   → dispatch(selectUser) + dispatch(openForm)
  ├── handleDelete → dispatch(deleteUser) → автоматично fetchUsers
  └── handleSubmit → dispatch(createUser | updateUser) → автоматично fetchUsers

FilterPanel (читає store самостійно)
  └── onChange → dispatch(setSearch | setSortBy | setOrder)
```

---

## Відмінність від Завдання 1

| | Завдання 1 | Завдання 2 |
|-|------------|------------|
| Інструмент | React Context + useReducer | Redux Toolkit |
| Де живе стан | Всередині React (Provider) | Поза React (Store) |
| Async логіка | Вручну в useEffect | createAsyncThunk |
| Дії | Рядкові константи вручну | Автогенерація через createSlice |
| Компоненти | Отримують dispatch через props | Читають store самостійно |
