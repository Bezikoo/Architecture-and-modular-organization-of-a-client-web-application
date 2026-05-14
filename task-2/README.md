# Завдання 2 — Централізоване керування станом (Redux Toolkit)

## Варіант 4

> Реалізуйте клієнтський модуль для роботи із заявками користувачів або технічними зверненнями. Кожен запис має містити **тему, категорію, стан розгляду, дату створення та короткий опис**. Система повинна дозволяти отримувати список заявок, відкривати конкретний запис, редагувати стан, фільтрувати за категорією та станом, виконувати пошук і пагінацію. У Redux Toolkit слід організувати централізоване сховище даних і окреме збереження параметрів поточного перегляду.

---

## Як вимоги варіанту 4 відображені в реалізації

| Вимога варіанту 4 | Де реалізовано |
|-------------------|----------------|
| **Тема** заявки | `Ticket.subject` (`schema.prisma`, `types/ticket.ts`) |
| **Категорія** | `Ticket.category` — enum `technical \| billing \| general \| complaint` |
| **Стан розгляду** | `Ticket.status` — enum `new \| in_progress \| resolved \| closed` |
| **Дата створення** | `Ticket.createdAt` (`@default(now())`) |
| **Короткий опис** | `Ticket.description` |
| Отримання списку заявок | `fetchTickets` (async thunk → `GET /api/tickets`) |
| Відкриття конкретного запису | `fetchTicketById` + компонент `TicketDetails` |
| Редагування стану | `updateTicket` + поле `status` у `TicketForm` |
| Фільтрація за категорією | `setCategoryFilter` (uiSlice) + `?category=` у API |
| Фільтрація за станом | `setStatusFilter` (uiSlice) + `?status=` у API |
| Пошук | `setSearch` (uiSlice) + `?search=` у API (по `subject`/`description`) |
| Пагінація | `pagination` у `ticketsSlice` + `setPage` у `uiSlice` |
| Централізоване сховище даних | `ticketsSlice` (Redux store) |
| Окреме збереження параметрів перегляду | `uiSlice` + `localStorage` |

---

## Модель заявки

```prisma
model Ticket {
  id          Int      @id @default(autoincrement())
  subject     String   // тема
  category    String   // категорія: technical | billing | general | complaint
  status      String   // стан розгляду: new | in_progress | resolved | closed
  description String   // короткий опис
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

```ts
// src/types/ticket.ts
export type TicketCategory = 'technical' | 'billing' | 'general' | 'complaint';
export type TicketStatus   = 'new' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
  id: number;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Архітектура стану

### Redux Store (`src/store/index.ts`)

```ts
configureStore({
  reducer: {
    tickets: ticketsReducer,  // дані заявок + статуси запитів
    ui: uiReducer,            // параметри поточного перегляду
  }
})
```

### Slice 1 — `ticketsSlice` (`src/store/ticketsSlice.ts`)

Відповідає за **дані предметної області**:

| Поле | Опис |
|------|------|
| `tickets` | Список заявок |
| `selectedTicket` | Активна заявка (для перегляду або редагування) |
| `pagination` | Метадані сторінкової навігації |
| `loading` | Виконується запит |
| `success` | Запит завершено успішно |
| `error` | Повідомлення про помилку |

**Асинхронні дії (`createAsyncThunk`):**

| Thunk | HTTP-запит | Що робить |
|-------|------------|-----------|
| `fetchTickets` | `GET /api/tickets?...` | Отримує список з урахуванням параметрів з `uiSlice` |
| `fetchTicketById` | `GET /api/tickets/:id` | Відкриває конкретну заявку |
| `createTicket` | `POST /api/tickets` | Створює → автоматично диспатчить `fetchTickets()` |
| `updateTicket` | `PUT /api/tickets/:id` | Оновлює (зокрема стан розгляду) → автоматично `fetchTickets()` |
| `deleteTicket` | `DELETE /api/tickets/:id` | Видаляє → автоматично `fetchTickets()` |

Стани `pending → fulfilled → rejected` обробляються через `extraReducers`. Параметри запиту читаються через `getState()`, що дозволяє вмикати/вимикати фільтри без зміни сигнатури thunk.

### Slice 2 — `uiSlice` (`src/store/uiSlice.ts`)

Відповідає за **параметри поточного перегляду** (окремо від даних):

| Поле | Опис | Зберігається в `localStorage` |
|------|------|-------------------------------|
| `search` | Пошук за темою або описом | ✅ |
| `categoryFilter` | Фільтр за категорією | ✅ |
| `statusFilter` | Фільтр за станом розгляду | ✅ |
| `page` | Поточна сторінка | ✅ |
| `sortBy` | Поле сортування | ❌ |
| `order` | Напрямок сортування | ❌ |
| `isFormOpen` | Чи відкрита модалка | ❌ |
| `viewMode` | `'view'` (детальний перегляд) або `'edit'` (редагування) | ❌ |

**Особливості:**
- Будь-яка зміна `search`, `categoryFilter`, `statusFilter` скидає `page` на 1
- `createTicket.fulfilled` і `updateTicket.fulfilled` автоматично закривають форму через `extraReducers`
- При ініціалізації `localStorage` зчитується — після F5 фільтри та сторінка відновлюються

### Окремий API-модуль (`src/api/ticketApi.ts`)

Ізольований від Redux модуль для HTTP-запитів через `axios`. Не залежить від store, не імпортує жодного типу Redux. Викликається лише з thunks → дотримана послідовність шарів **API → state → UI**.

### Типізовані хуки

| Хук | Файл | Призначення |
|-----|------|-------------|
| `useAppDispatch` | `hooks/useAppDispatch.ts` | Типізований `useDispatch<AppDispatch>` |
| `useAppSelector` | `hooks/useAppSelector.ts` | Типізований `useSelector<RootState>` |

---

## Компоненти

| Компонент | Шар | Роль |
|-----------|-----|------|
| `TicketsPage` | Контейнер | Підключається до store, реагує на зміну фільтрів через `useEffect`, координує дії (перегляд/редагування/видалення) |
| `FilterPanel` | Подання | Сам читає `ui`-стан зі store через `useAppSelector` і відправляє дії через `useAppDispatch` — **без props** |
| `TicketTable` | Подання | Чистий компонент: рядки заявок з кольоровими бейджами категорії та стану, кнопки **Перегляд / Редагувати / Видалити** |
| `TicketForm` | Подання | Чистий компонент форми створення та редагування (включно зі зміною `status`) |
| `TicketDetails` | Подання | Окремий екран детального перегляду конкретної заявки з можливістю переключитися в режим редагування |

---

## Структура проекту

```
task-2/
├── client/
│   └── src/
│       ├── api/
│       │   └── ticketApi.ts              # axios-запити до REST API
│       ├── types/
│       │   └── ticket.ts                 # типи + лейбли категорій/станів українською
│       ├── store/
│       │   ├── index.ts                  # configureStore + RootState, AppDispatch
│       │   ├── ticketsSlice.ts           # дані + async thunks
│       │   └── uiSlice.ts                # UI-параметри + localStorage
│       ├── hooks/
│       │   ├── useAppDispatch.ts
│       │   └── useAppSelector.ts
│       ├── components/
│       │   ├── FilterPanel.tsx           # пошук + категорія + стан + сортування
│       │   ├── TicketTable.tsx
│       │   ├── TicketForm.tsx
│       │   └── TicketDetails.tsx         # детальний перегляд
│       ├── pages/
│       │   └── TicketsPage.tsx
│       └── App.tsx                       # обгортає <Provider store={store}>
├── server/
│   ├── prisma/
│   │   └── schema.prisma                 # модель Ticket
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── controllers/ticketController.js
│       ├── routes/ticketRoutes.js
│       └── services/ticketService.js     # пошук, фільтри category/status, сортування, пагінація
└── docker-compose.yml                    # окрема БД tickets_management на :5433
```

---

## REST API сервера

| Метод | Маршрут | Опис |
|-------|---------|------|
| `GET` | `/api/tickets` | Список з фільтрами: `?page=&limit=&search=&sortBy=&order=&category=&status=` |
| `GET` | `/api/tickets/:id` | Одна заявка |
| `POST` | `/api/tickets` | Створення |
| `PUT` | `/api/tickets/:id` | Оновлення (тема, категорія, стан, опис) |
| `DELETE` | `/api/tickets/:id` | Видалення |

---

## Потік даних

```
              ┌──────────────────────────────────────────────────────┐
              │                  Redux Store                          │
              │                                                       │
              │  ticketsSlice                  uiSlice                │
              │  ┌─────────────────┐           ┌──────────────────┐  │
              │  │ tickets[]       │           │ search           │  │
              │  │ selectedTicket  │           │ categoryFilter ◄─┼──┐
              │  │ pagination      │           │ statusFilter   ◄─┼──┤ localStorage
              │  │ loading         │           │ page           ◄─┼──┘
              │  │ success         │           │ sortBy / order   │
              │  │ error           │           │ isFormOpen       │
              │  └────────┬────────┘           │ viewMode         │
              │           │                    └────────▲─────────┘
              └───────────┼─────────────────────────────┼───────────┘
                          │                             │
                          ▼                             │
         ┌────────────────────────────┐                 │
         │    TicketsPage             │                 │
         │  useEffect([фільтри]) →    │                 │
         │  dispatch(fetchTickets())  │                 │
         └──┬─────────────────────────┘                 │
            │                                           │
            ├── onView   → selectTicket + openForm(view) ───┐
            ├── onEdit   → selectTicket + openForm(edit) ───┤
            ├── onDelete → deleteTicket  → fetchTickets() ──┤
            └── onSubmit → create/update → fetchTickets() ──┤
                                                            │
         ┌─────────────────────────────────────────┐        │
         │    FilterPanel (читає store сам)        │        │
         │  setSearch / setCategoryFilter /        │────────┘
         │  setStatusFilter / setSortBy / setOrder │
         └─────────────────────────────────────────┘
```

---

## Як запустити

### 1. База даних

```bash
cd task-2
docker-compose up -d
```

Запускає контейнер `tickets_management_db` з PostgreSQL на порту **5433** (БД `tickets_management`). Це окрема БД від task-1 — обидва завдання можуть працювати одночасно.

### 2. Сервер

```bash
cd task-2/server
npm install
npm run migrate     # створює таблицю Ticket
npm run dev         # http://localhost:3000
```

### 3. Клієнт

```bash
cd task-2/client
npm install
npm run dev         # http://localhost:5174
```

### 4. У браузері

```
http://localhost:5174
```

---

## Чек-лист вимог практичної

- [x] `configureStore`
- [x] Щонайменше два slice (`ticketsSlice` + `uiSlice`)
- [x] Асинхронні дії для роботи з REST API (`createAsyncThunk`)
- [x] Окремий API-модуль (`src/api/ticketApi.ts`)
- [x] `useSelector` і `useDispatch` (типізовані обгортки)
- [x] Централізоване зберігання параметрів інтерфейсу (`uiSlice`)
- [x] Відновлення стану з `localStorage` (search, page, categoryFilter, statusFilter)
- [x] Автоматичне оновлення/інвалідація даних після CRUD (thunk → `fetchTickets`)
- [x] Індикація `loading`, `success`, `error`

## Чек-лист вимог варіанту 4

- [x] Поля: тема, категорія, стан розгляду, дата створення, короткий опис
- [x] Отримання списку заявок
- [x] Відкриття конкретного запису (`TicketDetails`)
- [x] Редагування стану (поле `status` у `TicketForm`)
- [x] Фільтрація за категорією
- [x] Фільтрація за станом
- [x] Пошук
- [x] Пагінація
- [x] Централізоване сховище даних
- [x] Окреме збереження параметрів поточного перегляду
