# Завдання 2 — Централізоване керування станом (Redux Toolkit)

## Варіант 4

> Реалізуйте клієнтський модуль для роботи із заявками користувачів або технічними зверненнями. Кожен запис має містити **тему, категорію, стан розгляду, дату створення та короткий опис**. Система повинна дозволяти отримувати список заявок, відкривати конкретний запис, редагувати стан, фільтрувати за категорією та станом, виконувати пошук і пагінацію. У Redux Toolkit слід організувати централізоване сховище даних і окреме збереження параметрів поточного перегляду.

---

## Відповідність діаграмам

### Рисунок 1 — Потік даних

Діаграма описує такий ланцюжок:

```
Користувач → UI-компоненти → (подія/callback) → Контейнер/Сторінка
  → зміна стану / dispatch(action) → Стан застосунку (Context/Reducer/Hook)
  → запит до сервера → API-модуль → HTTP-запит → REST API сервер
```

Реалізований потік у коді (Redux Toolkit):

```
Користувач (клік / введення тексту)
  → FilterPanel / TicketTable / TicketForm     (UI-компоненти)
  → dispatch(setSearch(...)) або onClick prop  (подія)
  → TicketsPage                                (Контейнер/Сторінка)
  → dispatch(fetchTickets()) — async thunk     (зміна стану)
  → ticketsSlice / uiSlice (Redux store)       (Стан застосунку)
  → ticketApi (axios)                          (API-модуль)
  → HTTP-запит до REST API сервера             (Express + Prisma + PostgreSQL)
```

Зворотний потік:
`REST API → ticketApi → thunk.fulfilled → ticketsSlice → useAppSelector → компоненти`

### Рисунок 2 — Діаграма компонентів

Хоча Рисунок 2 описує архітектуру завдання 1 (з UseUsers hook і Context), ті самі шари присутні і в цьому завданні, але реалізовані через Redux:

| Пакет на діаграмі (Рис.2) | Відповідник у завданні 2 |
|---------------------------|--------------------------|
| **Подання** → `UsersPage` | `src/pages/TicketsPage.tsx` |
| **Подання** → `UserList` | `src/components/TicketTable.tsx` |
| **Подання** → `UserForm` | `src/components/TicketForm.tsx` |
| **Подання** → `FilterPanel` | `src/components/FilterPanel.tsx` |
| **Координація** → `useUsers` | `TicketsPage` + `useAppDispatch` / `useAppSelector` |
| **Керування станом** → `UsersContext` | Redux store (`src/store/index.ts`) |
| **Керування станом** → `UsersReducer` | `ticketsSlice` + `uiSlice` |
| **Доступ до даних** → `UsersApi` | `src/api/ticketApi.ts` |
| **REST API сервер** | `server/src/` (Express + Prisma) |

Додатково в цьому завданні реалізовано `TicketDetails` — окремий компонент детального перегляду заявки, що відповідає вимозі «відкриття конкретного запису».

### Рисунок 3 — Орієнтовний вигляд UI

| Елемент на скріншоті | Де реалізовано |
|----------------------|----------------|
| Заголовок сторінки | `TicketsPage.tsx` |
| Поле пошуку | `FilterPanel.tsx` → `dispatch(setSearch(...))` |
| Фільтр за категорією | `FilterPanel.tsx` → `dispatch(setCategoryFilter(...))` |
| Фільтр за станом | `FilterPanel.tsx` → `dispatch(setStatusFilter(...))` |
| Сортування | `FilterPanel.tsx` → `dispatch(setSortBy / setOrder)` |
| Таблиця зі списком заявок | `TicketTable.tsx` — кольорові бейджі категорії та стану |
| Кнопки Перегляд / Редагувати / Видалити | `TicketTable.tsx` → `onView` / `onEdit` / `onDelete` |
| Детальний перегляд заявки | `TicketDetails.tsx` (режим `viewMode === 'view'`) |
| Модальна форма редагування | `TicketForm.tsx` (режим `viewMode === 'edit'`) |
| Пагінація | `TicketsPage.tsx` → `dispatch(setPage(...))` |
| Індикатор завантаження | `TicketsPage.tsx` — умовний рендер за `tickets.loading` |
| Повідомлення про помилку | `TicketsPage.tsx` — умовний рендер за `tickets.error`, клік очищає |

---

## Як вимоги варіанту 4 відображені в реалізації

| Вимога варіанту 4 | Де реалізовано |
|-------------------|----------------|
| **Тема** заявки | `Ticket.subject` (`schema.prisma`, `types/ticket.ts`) |
| **Категорія** | `Ticket.category` — `technical \| billing \| general \| complaint` |
| **Стан розгляду** | `Ticket.status` — `new \| in_progress \| resolved \| closed` |
| **Дата створення** | `Ticket.createdAt` (`@default(now())`) |
| **Короткий опис** | `Ticket.description` |
| Отримання списку заявок | `fetchTickets` async thunk → `GET /api/tickets` |
| Відкриття конкретного запису | `fetchTicketById` + компонент `TicketDetails` |
| Редагування стану | `updateTicket` + поле `status` у `TicketForm` |
| Фільтрація за категорією | `setCategoryFilter` (uiSlice) + `?category=` у API |
| Фільтрація за станом | `setStatusFilter` (uiSlice) + `?status=` у API |
| Пошук | `setSearch` (uiSlice) + `?search=` у API (по `subject` та `description`) |
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
| `loading` | Виконується HTTP-запит |
| `success` | Запит завершено успішно |
| `error` | Повідомлення про помилку |

**Асинхронні дії (`createAsyncThunk`):**

| Thunk | HTTP-запит | Що робить |
|-------|------------|-----------|
| `fetchTickets` | `GET /api/tickets?...` | Отримує список з параметрами з `uiSlice` через `getState()` |
| `fetchTicketById` | `GET /api/tickets/:id` | Відкриває конкретну заявку |
| `createTicket` | `POST /api/tickets` | Створює → автоматично `dispatch(fetchTickets())` |
| `updateTicket` | `PUT /api/tickets/:id` | Оновлює → автоматично `dispatch(fetchTickets())` |
| `deleteTicket` | `DELETE /api/tickets/:id` | Видаляє → автоматично `dispatch(fetchTickets())` |

Стани `pending → fulfilled → rejected` обробляються через `extraReducers`. Параметри запиту читаються через `getState()` — thunk не потребує аргументів для фільтрів.

### Slice 2 — `uiSlice` (`src/store/uiSlice.ts`)

Відповідає за **параметри поточного перегляду** — зберігається окремо від даних:

| Поле | Опис | `localStorage` |
|------|------|---------------|
| `search` | Пошук за темою або описом | ✅ |
| `categoryFilter` | Фільтр за категорією | ✅ |
| `statusFilter` | Фільтр за станом розгляду | ✅ |
| `page` | Поточна сторінка | ✅ |
| `sortBy` | Поле сортування | — |
| `order` | Напрямок сортування | — |
| `isFormOpen` | Чи відкрита модалка | — |
| `viewMode` | `'view'` або `'edit'` | — |

**Особливості:**
- Зміна `search`, `categoryFilter`, `statusFilter` автоматично скидає `page` на 1
- `createTicket.fulfilled` і `updateTicket.fulfilled` автоматично закривають форму через `extraReducers`
- При ініціалізації стану `localStorage` читається — після F5 фільтри та сторінка відновлюються

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
| `TicketsPage` | Контейнер | Підключається до store, `useEffect` реагує на зміну фільтрів → `dispatch(fetchTickets())`, координує дії |
| `FilterPanel` | Подання | Сам читає `ui`-стан зі store через `useAppSelector` і відправляє дії через `useAppDispatch` — без зовнішніх props |
| `TicketTable` | Подання | Чистий компонент: рядки заявок з кольоровими бейджами категорії та стану, кнопки Перегляд / Редагувати / Видалити |
| `TicketForm` | Подання | Чистий компонент форми створення та редагування (включно зі зміною `status`) |
| `TicketDetails` | Подання | Детальний перегляд конкретної заявки з можливістю переключитися в режим редагування |

---

## Структура проекту

```
task-2/
├── client/
│   └── src/
│       ├── api/
│       │   └── ticketApi.ts              # axios-запити до REST API (шар «Доступ до даних»)
│       ├── types/
│       │   └── ticket.ts                 # типи + лейбли категорій/станів українською
│       ├── store/
│       │   ├── index.ts                  # configureStore + RootState, AppDispatch
│       │   ├── ticketsSlice.ts           # дані + async thunks (CRUD + fetch)
│       │   └── uiSlice.ts                # UI-параметри + localStorage persistence
│       ├── hooks/
│       │   ├── useAppDispatch.ts         # типізований useDispatch
│       │   └── useAppSelector.ts         # типізований useSelector
│       ├── components/
│       │   ├── FilterPanel.tsx           # пошук + категорія + стан + сортування
│       │   ├── TicketTable.tsx           # список заявок з бейджами
│       │   ├── TicketForm.tsx            # форма створення/редагування
│       │   └── TicketDetails.tsx         # детальний перегляд заявки
│       ├── pages/
│       │   └── TicketsPage.tsx           # контейнер-сторінка
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
└── docker-compose.yml                    # БД tickets_management на порту 5433
```

---

## REST API сервера

| Метод | Маршрут | Параметри |
|-------|---------|-----------|
| `GET` | `/api/tickets` | `?page=&limit=&search=&sortBy=&order=&category=&status=` |
| `GET` | `/api/tickets/:id` | — |
| `POST` | `/api/tickets` | тіло: `subject`, `category`, `status`, `description` |
| `PUT` | `/api/tickets/:id` | тіло: ті самі поля |
| `DELETE` | `/api/tickets/:id` | — |

---

## Потік даних

```
              ┌──────────────────────────────────────────────────────┐
              │                  Redux Store                          │
              │                                                       │
              │  ticketsSlice                  uiSlice                │
              │  ┌─────────────────┐           ┌──────────────────┐  │
              │  │ tickets[]       │           │ search         ◄─┼──┐
              │  │ selectedTicket  │           │ categoryFilter ◄─┼──┤ localStorage
              │  │ pagination      │           │ statusFilter   ◄─┼──┤ (відновлення
              │  │ loading         │           │ page           ◄─┼──┘  після F5)
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
            ├── onView   → selectTicket + openForm('view')  ─┐
            ├── onEdit   → selectTicket + openForm('edit')  ─┤
            ├── onDelete → dispatch(deleteTicket(id))       ─┤→ авто fetchTickets
            └── onSubmit → dispatch(create/updateTicket())  ─┘→ авто fetchTickets
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
- [x] Асинхронні дії для роботи з REST API (`createAsyncThunk`: fetchTickets, createTicket, updateTicket, deleteTicket, fetchTicketById)
- [x] Окремий API-модуль (`src/api/ticketApi.ts`) — ізольований від Redux
- [x] `useSelector` і `useDispatch` (типізовані обгортки `useAppSelector` / `useAppDispatch`)
- [x] Централізоване зберігання параметрів інтерфейсу (`uiSlice`)
- [x] Відновлення стану з `localStorage` (search, page, categoryFilter, statusFilter)
- [x] Автоматичне оновлення / інвалідація даних після CRUD (`dispatch(fetchTickets())` у thunk)
- [x] Індикація `loading`, `success`, `error`
- [x] Відповідність Рисунку 1 (потік даних), Рисунку 2 (компонентна архітектура), Рисунку 3 (UI)

## Чек-лист вимог варіанту 4

- [x] Поля: тема, категорія, стан розгляду, дата створення, короткий опис
- [x] Отримання списку заявок
- [x] Відкриття конкретного запису (`TicketDetails` у режимі `viewMode === 'view'`)
- [x] Редагування стану (поле `status` у `TicketForm`)
- [x] Фільтрація за категорією
- [x] Фільтрація за станом
- [x] Пошук
- [x] Пагінація
- [x] Централізоване сховище даних (`ticketsSlice`)
- [x] Окреме збереження параметрів поточного перегляду (`uiSlice` + `localStorage`)
