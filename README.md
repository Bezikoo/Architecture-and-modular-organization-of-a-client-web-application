# Практична робота №5 — Архітектура та керування станом клієнтського застосунку

Розширення архітектури клієнт-серверного застосунку шляхом введення явного рівня керування станом інтерфейсу та даних.

Реалізовано два підходи:
- **Завдання 1** — стандартні інструменти React (Context API + `useReducer`). Модуль керування записами користувачів (на основі практичної роботи №4).
- **Завдання 2** — централізоване сховище через Redux Toolkit. **Варіант 4** — клієнтський модуль для роботи із заявками користувачів / технічними зверненнями.

---

## Завдання 1 — React Context API + `useReducer`

### Що реалізовано

Модель стану організовано у три секції (`src/state/usersReducer.ts`):

```ts
{
  data: {
    users: User[];              // список користувачів з сервера
    selectedUser: User | null;  // вибраний для редагування
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

#### Редуктор та дії

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

#### Контекст і кастомний хук

- `UsersProvider` ініціалізує `useReducer` зі значеннями з `localStorage`
- `useEffect` синхронізує `search` і `page` з `localStorage` при кожній зміні — стан відновлюється після F5
- Кастомний хук `useUsers` — єдина точка доступу до стану та API: автоматично запускає `fetchUsers` через `useEffect` при зміні фільтрів; після CRUD автоматично оновлює список

#### Компоненти

| Компонент | Роль |
|-----------|------|
| `UsersPage` | Координує сценарії, отримує дані через `useUsers` |
| `FilterPanel` | Пошук і сортування, отримує `dispatch` через props |
| `UserTable` | Чистий компонент відображення списку |
| `UserForm` | Чистий компонент форми створення/редагування |

### Структура

```
task-1/client/src/
├── api/userApi.ts
├── types/user.ts
├── state/
│   ├── usersReducer.ts     # стан, типи дій, редуктор
│   └── UsersContext.tsx    # контекст + провайдер + localStorage
├── hooks/useUsers.ts       # кастомний хук (стан + API)
├── components/{FilterPanel,UserTable,UserForm}.tsx
├── pages/UsersPage.tsx
└── App.tsx
```

### Запуск

```bash
cd task-1 && docker-compose up -d
cd task-1/server && npm install && npm run migrate && npm run dev   # :3000
cd task-1/client && npm install && npm run dev                      # :5173
```

---

## Завдання 2 — Redux Toolkit (Варіант 4: заявки користувачів)

### Модель заявки

| Поле | Тип | Опис |
|------|-----|------|
| `id` | `number` | Унікальний ідентифікатор |
| `subject` | `string` | Тема заявки |
| `category` | `'technical' \| 'billing' \| 'general' \| 'complaint'` | Категорія |
| `status` | `'new' \| 'in_progress' \| 'resolved' \| 'closed'` | Стан розгляду |
| `description` | `string` | Короткий опис |
| `createdAt` | `DateTime` | Дата створення |
| `updatedAt` | `DateTime` | Дата оновлення |

### Redux Store (`src/store/index.ts`)

```ts
configureStore({
  reducer: {
    tickets: ticketsReducer,  // дані заявок + статуси запитів
    ui: uiReducer,            // параметри інтерфейсу
  }
})
```

#### Slice 1 — `ticketsSlice`

Дані предметної області + статуси запитів (`loading`, `success`, `error`).

Асинхронні дії через `createAsyncThunk`:

| Thunk | Опис |
|-------|------|
| `fetchTickets` | Список з урахуванням параметрів з `uiSlice` |
| `fetchTicketById` | Відкриття конкретного запису |
| `createTicket` | Створення → автоматично `fetchTickets` |
| `updateTicket` | Оновлення (зокрема стану) → автоматично `fetchTickets` |
| `deleteTicket` | Видалення → автоматично `fetchTickets` |

Стани `pending → fulfilled → rejected` обробляються в `extraReducers`.

#### Slice 2 — `uiSlice`

Параметри інтерфейсу та поточного перегляду:

| Поле | Зберігається в localStorage |
|------|-----------------------------|
| `search` | Так |
| `categoryFilter` | Так |
| `statusFilter` | Так |
| `page` | Так |
| `sortBy` | Ні |
| `order` | Ні |
| `isFormOpen`, `viewMode` | Ні |

Дії `createTicket.fulfilled` та `updateTicket.fulfilled` автоматично закривають форму через `extraReducers`.

#### Окремий API-модуль

`src/api/ticketApi.ts` — ізольований від Redux, викликається лише з thunks.

#### Типізовані хуки

| Хук | Призначення |
|-----|-------------|
| `useAppDispatch` | `useDispatch<AppDispatch>` |
| `useAppSelector` | `useSelector<RootState>` |

#### Компоненти

| Компонент | Роль |
|-----------|------|
| `TicketsPage` | Підключається до store, координує сценарії |
| `FilterPanel` | Сам читає store і відправляє дії (без props) |
| `TicketTable` | Чистий компонент: бейджі категорії та стану |
| `TicketForm` | Чистий компонент форми |
| `TicketDetails` | Перегляд конкретної заявки |

### Структура

```
task-2/client/src/
├── api/ticketApi.ts
├── types/ticket.ts
├── store/
│   ├── index.ts            # configureStore + RootState, AppDispatch
│   ├── ticketsSlice.ts     # дані + async thunks
│   └── uiSlice.ts          # UI-параметри + localStorage
├── hooks/{useAppDispatch,useAppSelector}.ts
├── components/{FilterPanel,TicketTable,TicketForm,TicketDetails}.tsx
├── pages/TicketsPage.tsx
└── App.tsx
```

### Запуск

```bash
cd task-2 && docker-compose up -d               # окрема БД tickets_management на :5433
cd task-2/server && npm install && npm run migrate && npm run dev   # :3000
cd task-2/client && npm install && npm run dev                      # :5174
```

> Task-1 і task-2 використовують різні бази на різних портах (5432 / 5433), тому можуть працювати одночасно.

---

## Порівняння підходів

| | Завдання 1 | Завдання 2 |
|-|------------|------------|
| Інструмент | React Context + `useReducer` | Redux Toolkit |
| Де живе стан | Всередині React (Provider) | Поза React (Store) |
| Предметна область | Користувачі | Заявки користувачів (варіант 4) |
| Async-логіка | Вручну в `useEffect` | `createAsyncThunk` |
| Генерація дій | Вручну константи | Автоматично через `createSlice` |
| Доступ у компонентах | `useContext` або через props | `useSelector` / `useDispatch` |
| Підходить для | Середніх додатків | Великих додатків |
