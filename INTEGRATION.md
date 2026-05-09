# SWGOH.AI - Руководство по интеграции и использованию

## ✅ Что было обновлено

### Новые файлы
1. **`src/lib/dataLoader.ts`** - Полная система загрузки и кэширования игровых данных
2. **`src/lib/swgohService.ts`** - Сервис для парсинга и форматирования данных
3. **`src/lib/contextBuilder.ts`** - Построение контекста для LLM
4. **`src/app/api/search/route.ts`** - API для быстрого поиска персонажей
5. **`README.md`** - Полная документация проекта
6. **`INTEGRATION.md`** - Этот файл

### Обновлённые файлы
- **`src/app/api/chat/route.ts`** - Интегрирована система контекста
- **`tsconfig.json`** - Добавлены path aliases

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Переменные окружения
Создайте файл `.env.local`:
```bash
GROQ_API=sk_your_groq_api_key_here
```

### 3. Запуск в разработке
```bash
npm run dev
```

### 4. Тестирование
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Расскажи про Янго Фетта"}
    ]
  }'
```

## 📊 Структура данных

### Characters.json
```json
{
  "name": "Jango Fett",
  "base_id": "JANGOFETT",
  "power": 41178,
  "description": "Notorious Bounty Hunter...",
  "image": "https://game-assets.swgoh.gg/...",
  "gear_levels": [...]
}
```

### Abilities.json
```json
{
  "base_id": "basicskill_JANGOFETT01",
  "name": "Blaster Barrage",
  "character_base_id": "JANGOFETT",
  "is_zeta": true,
  "is_omicron": false,
  "description": "...",
  "image": "https://game-assets.swgoh.gg/..."
}
```

## 🎯 Примеры использования

### В коде (Node.js)

```typescript
import { 
  findCharacterByName, 
  getCharacterZetas,
  getCharacterAbilities 
} from "@/lib/dataLoader";
import { buildContextForQuery } from "@/lib/contextBuilder";

// Поиск персонажа
const jango = findCharacterByName("Jango Fett");
console.log(jango?.power); // 41178

// Получение дзет
const zetas = getCharacterZetas("JANGOFETT");
console.log(zetas.length); // количество дзет

// Построение контекста для LLM
const context = buildContextForQuery("Как использовать Янго?");
console.log(context); // полная информация о персонаже
```

### Через API

**POST /api/chat**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Какие дзеты у Янго Фетта?"}
    ]
  }'
```

**GET /api/search**
```bash
curl "http://localhost:3000/api/search?q=jango&type=search"
```

## 🔧 Архитектура системы

```
┌─────────────────┐
│  Пользователь  │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTP Request
         ▼
┌──────────────────────┐
│   /api/chat Route    │
│  (route.ts)          │
└─────────┬────────────┘
          │
          │ analyzeQuery()
          ▼
┌──────────────────────┐
│   swgohService.ts    │ ◄─────────────┐
│  - analyzeQuery()    │              │
│  - formatData()      │              │
│  - translateTerms()  │              │
└─────────┬────────────┘              │
          │                           │
          │ buildContext...()         │ Данные
          ▼                           │
┌──────────────────────────────┐      │
│   contextBuilder.ts          │      │
│  - buildContextForQuery()    │      │
│  - buildAnalyticsContext()   │      │
└──────────┬───────────────────┘      │
           │                          │
           │ getCharacters()          │
           │ getAbilities()           │
           ▼                          │
┌──────────────────────────────┐      │
│   dataLoader.ts              │──────┘
│  - loadCharacters()          │
│  - loadAbilities()           │
│  - searchCharacters()        │
│  - getCharacterAbilities()   │
└──────────┬───────────────────┘
           │
           │ Кэш
           ▼
┌──────────────────────────────┐
│   public/data/*.json         │
│  - characters.json           │
│  - abilities.json            │
│  - gear.json                 │
│  - units.json                │
└──────────────────────────────┘
          │
          │ Контекст + Промпт
          ▼
┌──────────────────────────────┐
│   Groq API                   │
│  (LLM Model)                 │
│  llama-3.3-70b               │
└────────┬─────────────────────┘
         │
         │ Response
         ▼
┌──────────────────────────────┐
│   Пользователь              │
│   (Ответ)                   │
└──────────────────────────────┘
```

## 🔍 Поток обработки запроса

### 1️⃣ Пример: "Какие дзеты у Янго Фетта?"

```
INPUT: "Какие дзеты у Янго Фетта?"
  │
  ├─ analyzeQuery() 
  │  └─ type: "character"
  │     filters: { onlyZetas: true }
  │     searchTerm: "Янго Фетта"
  │
  ├─ buildContextForQuery("Какие дзеты...")
  │  └─ searchCharacters("Янго")
  │     └─ findCharacterByName("Янго") = JANGOFETT
  │
  ├─ getCharacterZetas("JANGOFETT")
  │  └─ [
  │       { name: "Daring Evasion", is_zeta: true, ... },
  │       { name: "Notorious Reputation", is_zeta: true, ... }
  │     ]
  │
  ├─ formatCharacterDescription(character, abilities)
  │  └─ **Янго Фетт**
  │     ID: `JANGOFETT`
  │     Мощь: 41178
  │     ...
  │     **Дзеты (2):**
  │     - Daring Evasion: ...
  │     - Notorious Reputation: ...
  │
  ├─ context = "=== КОНТЕКСТ ИГРЫ SWGOH ===\n\n[полный контекст]"
  │
  ├─ messages = [
  │    { role: "system", content: systemPrompt },
  │    { role: "user", content: context + query }
  │  ]
  │
  ├─ Groq API запрос
  │  └─ llama-3.3-70b обрабатывает с контекстом
  │
  └─ OUTPUT: "У Янго Фетта две дзеты: Daring Evasion и Notorious Reputation..."
```

## 💾 Кэширование

Все JSON данные загружаются один раз при первом обращении:

```typescript
// Первый вызов: читает с диска
const characters1 = loadCharacters(); // 50ms

// Второй вызов: из кэша в памяти
const characters2 = loadCharacters(); // 0ms
```

## 🛡️ Обработка ошибок

### Если JSON файл не найден:
```typescript
try {
  const data = loadJSON<Character[]>("characters.json");
  // data = null если файл не существует
  charactersCache = data || [];
} catch (error) {
  console.error(`Error loading characters.json:`, error);
  return [];
}
```

### Если GROQ API недоступен:
```typescript
if (!response.ok) {
  console.error("GROQ API ERROR:", response.status, data);
  return NextResponse.json({ 
    error: "Прости, но сервер загружен. Приходи позже!" 
  }, { status: response.status });
}
```

## 📈 Оптимизация производительности

### 1. Ограничение контекста
```typescript
// Берём только первые 3 персонажа из результатов поиска
characters.slice(0, 3).forEach(...)
```

### 2. Кэширование на стороне клиента
Добавьте в компоненты:
```typescript
const [cached, setCached] = useState({});

if (cached[query]) {
  return cached[query]; // Быстро из памяти браузера
}
```

### 3. Пакетная обработка
```typescript
// Вместо 100 дополнительных запросов
abilities.filter(...).slice(0, 10)
```

## 🔐 Безопасность

### API ключ не попадает на клиент:
```typescript
// ✅ ПРАВИЛЬНО: только на сервере
const apiKey = process.env.GROQ_API; // в /api/chat/route.ts

// ❌ НЕПРАВИЛЬНО: не делайте так
window.location = `https://api.groq.com?key=${process.env.GROQ_API}`
```

### Санитизация входа:
```typescript
const cleanKey = apiKey.replace(/['"]+/g, '').trim();
```

## 📝 Логирование

Вся система логирует в консоль:

```bash
# Development
npm run dev

# Вы увидите в консоли:
# Context Data Generated: === КОНТЕКСТ ИГРЫ SWGOH ===...
# GROQ API response: { choices: [...] }
```

## 🚀 Развёртывание на Vercel

### 1. Подготовка
```bash
git add .
git commit -m "Production ready SWGOH.AI"
git push origin main
```

### 2. В панели Vercel
- Импортируйте репозиторий
- Добавьте переменную: `GROQ_API=sk_...`
- Нажмите Deploy

### 3. Тестирование
```bash
curl https://your-domain.vercel.app/api/chat -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Тест"}]}'
```

## 🐛 Решение проблем

### Проблема: "Cannot find module '@/lib/dataLoader'"
**Решение:** Проверьте `tsconfig.json` — должны быть правильные paths:
```json
"paths": {
  "@/*": ["./src/*"],
  "@/lib/*": ["./src/lib/*"]
}
```

### Проблема: "Characters.json not found"
**Решение:** Убедитесь, что файлы находятся в:
```
public/data/characters.json
public/data/abilities.json
public/data/gear.json
public/data/units.json
```

### Проблема: "GROQ_API is EMPTY"
**Решение:** 
1. Создайте `.env.local` в корне проекта
2. Добавьте: `GROQ_API=sk_your_key_here`
3. Перезагрузите dev сервер

### Проблема: Контекст не применяется
**Решение:** Проверьте логи:
```javascript
// В route.ts добавлено логирование:
console.log("Context Data Generated:", contextData.substring(0, 100));
```

## 🔄 Обновления в будущем

### Планируется добавить:
- [ ] Web scraping swgoh.gg для актуальных данных
- [ ] Рекомендации по модам на основе статистики
- [ ] Сравнение персонажей
- [ ] История обновлений игры
- [ ] Рейтинг персонажей по ролям
- [ ] Интеграция с Discord ботом

## 📞 Поддержка

Если что-то не работает:
1. Проверьте консоль браузера (F12)
2. Посмотрите логи терминала (npm run dev)
3. Убедитесь, что GROQ_API установлен
4. Проверьте, что JSON файлы распакованы в public/data

## 📄 Файловая структура после обновления

```
swgoh-ai/
├── src/
│   ├── lib/
│   │   ├── dataLoader.ts      # ✨ НОВЫЙ
│   │   ├── swgohService.ts    # ✨ НОВЫЙ
│   │   └── contextBuilder.ts  # ✨ НОВЫЙ
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts   # 🔄 ОБНОВЛЁН
│   │   │   └── search/
│   │   │       └── route.ts   # ✨ НОВЫЙ
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   └── workers/
├── public/
│   └── data/
│       ├── characters.json
│       ├── abilities.json
│       ├── gear.json
│       └── units.json
├── tsconfig.json              # 🔄 ОБНОВЛЁН
├── system-prompt.txt
├── package.json
├── README.md                  # ✨ ОБНОВЛЁН
├── INTEGRATION.md             # ✨ НОВЫЙ
└── .env.local                 # ⚙️ ТРЕБУЕТСЯ СОЗДАТЬ
```

---

**Вторая версия:** 2.0.0 - Архитектура готова к production 🚀
**Дата:** 2026-05-09
**Статус:** ✅ Готово к использованию
