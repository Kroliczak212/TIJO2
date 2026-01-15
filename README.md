# VetCRM - Moduł Recepcjonisty

**Nazwa kursu:** Testowanie i Jakość Oprogramowania II
**Autor:** Bartłomiej Król
**Temat projektu:** Implementacja oraz testy wybranej aplikacji
**Wersja:** 2.0.0

---

## Spis treści

1. [Opis projektu](#opis-projektu)
2. [Technologie](#technologie)
3. [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
4. [Struktura projektu](#struktura-projektu)
5. [Testy automatyczne](#testy-automatyczne)
6. [Dokumentacja API](#dokumentacja-api)
7. [Przypadki testowe (TestCase)](#przypadki-testowe-testcase)
8. [Funkcjonalności](#funkcjonalności)

---

## Opis projektu

VetCRM - Moduł Recepcjonisty to samodzielna aplikacja webowa do zarządzania przychodnią weterynaryjną. System umożliwia recepcjoniście kompleksowe zarządzanie wizytami, klientami, zwierzętami oraz korzystanie z narzędzi weterynaryjnych.

### Cele projektu

Projekt został stworzony w ramach przedmiotu "Testowanie i Jakość Oprogramowania II" z naciskiem na:
- Implementację czystego, testowalnego kodu (Clean Code)
- Tworzenie kompleksowych testów jednostkowych i integracyjnych
- Stosowanie wzorców projektowych i zasad SOLID
- Dokumentację API (Swagger/OpenAPI)
- Automatyzację procesu uruchamiania (Docker)

### Kluczowe funkcje

- **Zarządzanie wizytami** - tworzenie, przeglądanie, anulowanie z regułami czasowymi (>72h/48-72h/24-48h/<24h)
- **Zarządzanie klientami** - CRUD, wyszukiwanie zaawansowane
- **Zarządzanie zwierzętami** - dodawanie, przeglądanie historii szczepień
- **Grafik lekarzy** - harmonogramy, sprawdzanie dostępności slotów
- **Kalkulatory weterynaryjne:**
  - Kalkulator wieku zwierzęcia (przeliczanie na lata ludzkie)
  - Kalkulator dawkowania leków
  - Kalkulator BCS (Body Condition Score)

---

## Technologie

### Backend
- **Node.js** v18+ - środowisko uruchomieniowe JavaScript
- **Express.js** v4.18 - framework webowy
- **MySQL** v8.0 - relacyjna baza danych
- **mysql2** v3.16 - driver MySQL z obsługą Promise
- **JWT** (jsonwebtoken) v9.0 - autoryzacja tokenowa
- **bcrypt** v5.1 - hashowanie haseł
- **Zod** v3.22 - walidacja schematów danych
- **Swagger** (swagger-ui-express, swagger-jsdoc) - dokumentacja API
- **Jest** v29.7 - framework testowy
- **Supertest** v6.3 - testy integracyjne API

### Frontend
- **React** v18 - biblioteka UI
- **TypeScript** - typowany JavaScript
- **Vite** v5.4 - bundler i dev server
- **React Router DOM** v6 - routing
- **Axios** - klient HTTP
- **Lucide React** - ikony

### DevOps
- **Docker** - konteneryzacja aplikacji
- **Docker Compose** - orkiestracja kontenerów
- **Git** - kontrola wersji

---

## Instalacja i uruchomienie

### ✅ Wymagania

- Docker Desktop (zalecane)
- Docker Compose v2.x

**LUB** (alternatywnie bez Dockera):
- Node.js >= 18.x
- MySQL 8.0

### 🚀 Uruchomienie z Docker (ZALECANE)

#### Development mode (z hot reload)

```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Aplikacja gotowa!**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Swagger Docs:** http://localhost:3001/api-docs
- **MySQL:** localhost:3307 (zmieniony port, aby uniknąć konfliktów)

#### Production mode

```bash
docker-compose up --build
```

### 🔑 Dane logowania

- **Email:** recepcja@vetcrm.pl
- **Hasło:** Recepcja123!

### 🛑 Zatrzymanie aplikacji

```bash
# Development
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose down

# Usuń również wolumeny (resetuje bazę danych)
docker-compose down -v
```

---

### 🔧 Opcja alternatywna: Uruchomienie bez Dockera

**Wymagania:** Node.js >= 18.x, MySQL 8.0

#### 1. Konfiguracja MySQL

Utwórz bazę danych:
```sql
CREATE DATABASE vetcrm;
CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON vetcrm.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
```

#### 2. Instalacja zależności

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 3. Konfiguracja środowiska (opcjonalnie)

Utwórz plik `backend/.env`:
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=vetcrm-test-secret-key-2024
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=vetcrm
```

#### 4. Inicjalizacja bazy danych

```bash
cd backend
npm run db:init
```

#### 5. Uruchomienie aplikacji

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

---

## Struktura projektu

```
TIJO2/
├── docker-compose.yml              # Konfiguracja produkcyjna
├── docker-compose.dev.yml          # Konfiguracja development (hot reload)
├── README.md                       # Dokumentacja główna (zawiera testy, API, TestCase)
│
├── backend/
│   ├── Dockerfile                  # Dockerfile produkcyjny
│   ├── Dockerfile.dev              # Dockerfile development
│   ├── entrypoint.sh               # Skrypt inicjalizacyjny (auto DB seed)
│   ├── package.json
│   ├── jest.config.js              # Konfiguracja Jest
│   │
│   ├── src/
│   │   ├── app.js                  # Główny plik aplikacji Express
│   │   │
│   │   ├── config/
│   │   │   ├── database.js         # Konfiguracja połączenia MySQL
│   │   │   ├── constants.js        # Stałe aplikacji (Enums)
│   │   │   ├── appointmentRules.js # Reguły biznesowe anulowania wizyt
│   │   │   └── initDb.js           # Skrypt inicjalizacji i seed bazy danych
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js             # Middleware autoryzacji JWT
│   │   │
│   │   ├── validators/
│   │   │   └── schemas.js          # Schematy walidacji Zod
│   │   │
│   │   ├── controllers/            # Kontrolery (logika endpointów)
│   │   │   ├── auth.controller.js
│   │   │   ├── clients.controller.js
│   │   │   ├── pets.controller.js
│   │   │   ├── appointments.controller.js
│   │   │   ├── doctors.controller.js
│   │   │   └── calculators.controller.js
│   │   │
│   │   ├── routes/                 # Definicje tras API
│   │   │   ├── auth.routes.js
│   │   │   ├── clients.routes.js
│   │   │   ├── pets.routes.js
│   │   │   ├── appointments.routes.js
│   │   │   ├── doctors.routes.js
│   │   │   └── calculators.routes.js
│   │   │
│   │   ├── services/               # Logika biznesowa
│   │   │   ├── auth.service.js
│   │   │   ├── clients.service.js
│   │   │   ├── pets.service.js
│   │   │   ├── appointments.service.js
│   │   │   ├── doctors.service.js
│   │   │   └── calculators.service.js
│   │   │
│   │   └── utils/                  # Narzędzia pomocnicze
│   │       ├── petAgeCalculator.js
│   │       ├── dosageCalculator.js
│   │       └── petBmiCalculator.js
│   │
│   └── tests/                      # Testy automatyczne
│       ├── setup.js                # Konfiguracja testów
│       │
│       ├── unit/                   # Testy jednostkowe
│       │   ├── appointmentRules.test.js
│       │   └── schemas.test.js
│       │
│       └── integration/            # Testy integracyjne
│           ├── auth.test.js
│           ├── clients.test.js
│           └── appointments.test.js
│
└── frontend/
    ├── Dockerfile
    ├── Dockerfile.dev
    ├── vite.config.ts
    ├── tsconfig.json
    │
    └── src/
        ├── main.tsx                # Entry point
        ├── App.tsx                 # Główny komponent
        ├── index.css               # Style globalne
        │
        ├── components/
        │   └── Layout.tsx          # Layout aplikacji
        │
        ├── pages/                  # Strony aplikacji
        │   ├── Login.tsx
        │   ├── Dashboard.tsx
        │   ├── Clients.tsx
        │   ├── Pets.tsx
        │   ├── Appointments.tsx
        │   ├── Doctors.tsx
        │   └── Calculators.tsx
        │
        └── services/
            └── api.ts              # Klient HTTP (Axios)
```

---

## Testy automatyczne

Projekt zawiera kompleksowy zestaw testów automatycznych zgodny z wymaganiami przedmiotu.

### 📊 Podsumowanie testów

- ✅ **33 testy** (przekracza wymagane minimum: 20)
  - **20 testów jednostkowych** (Unit Tests)
  - **13 testów integracyjnych** (Integration Tests)
- ✅ **5 zestawów testów** - wszystkie przechodzą
- ✅ **Konwencja:** AAA (Arrange-Act-Assert) i GWT (Given-When-Then)

### Uruchomienie testów

```bash
cd backend

# Wszystkie testy
npm test

# Tylko testy jednostkowe
npm run test:unit

# Tylko testy integracyjne
npm run test:integration

# Testy z pokryciem kodu (coverage)
npm run test:coverage
```

---

### 🧪 Testy jednostkowe (Unit Tests)

Lokalizacja: [`backend/src/tests/unit/`](backend/src/tests/unit/)

#### 1. [`appointmentRules.test.js`](backend/src/tests/unit/appointmentRules.test.js) (12 testów)

Weryfikacja **logiki biznesowej** anulowania i edycji wizyt:

| Test | Opis | Konwencja |
|------|------|-----------|
| `getHoursUntilAppointment - future` | Zwraca dodatnią liczbę godzin dla przyszłej wizyty | AAA |
| `getHoursUntilAppointment - past` | Zwraca ujemną liczbę godzin dla przeszłej wizyty | AAA |
| `getCancellationType - >72h` | Bezpłatne anulowanie (>72h przed wizytą) | GWT |
| `getCancellationType - 48-72h` | Ostrzeżenie (48-72h przed wizytą) | GWT |
| `getCancellationType - 24-48h` | Płatne anulowanie 50 zł (24-48h przed) | GWT |
| `getCancellationType - <24h` | Blokada anulowania (<24h przed) | GWT |
| `getCancellationType - past` | Blokada anulowania dla przeszłych wizyt | GWT |
| `canReschedule - future` | Pozwala na przełożenie przyszłej wizyty | AAA |
| `canReschedule - past` | Blokuje przełożenie przeszłej wizyty | AAA |
| `formatTimeRemaining - days` | Formatuje czas w dniach i godzinach | AAA |
| `formatTimeRemaining - hours` | Formatuje czas w godzinach i minutach | AAA |
| `formatTimeRemaining - past` | Komunikat dla przeszłych wizyt | AAA |

**Testowane funkcje:**
- `getHoursUntilAppointment(date)` - obliczanie czasu do wizyty
- `getCancellationType(date)` - określanie typu anulowania
- `canReschedule(date)` - sprawdzanie możliwości zmiany terminu
- `formatTimeRemaining(hours)` - formatowanie czasu

**Reguły biznesowe:**
- **> 72h przed wizytą:** Bezpłatne anulowanie
- **48-72h przed:** Ostrzeżenie (bez opłaty)
- **24-48h przed:** Opłata 50 zł za anulowanie
- **< 24h przed:** Anulowanie zablokowane
- **Wizyty przeszłe:** Anulowanie i edycja zablokowane

---

#### 2. [`schemas.test.js`](backend/src/tests/unit/schemas.test.js) (8 testów)

Walidacja poprawności danych wejściowych przy użyciu **Zod Schemas**:

| Test | Opis | Weryfikacja |
|------|------|-------------|
| `loginSchema - valid` | Poprawny email i hasło | Walidacja przechodzi ✅ |
| `loginSchema - invalid email` | Nieprawidłowy format email | Zwraca błąd walidacji ❌ |
| `loginSchema - empty password` | Puste hasło | Zwraca błąd walidacji ❌ |
| `createAppointmentSchema - valid` | Poprawne dane wizyty | Walidacja przechodzi ✅ |
| `createAppointmentSchema - missing doctorId` | Brak wymaganego pola | Zwraca błąd walidacji ❌ |
| `createAppointmentSchema - invalid date` | Nieprawidłowy format daty ISO | Zwraca błąd walidacji ❌ |
| `clientSchema - valid` | Poprawne dane klienta | Walidacja przechodzi ✅ |
| `clientSchema - name too short` | Imię/nazwisko za krótkie (min. 2 znaki) | Zwraca błąd walidacji ❌ |

**Testowane schematy:**
- `loginSchema` - weryfikacja danych logowania
- `createAppointmentSchema` - walidacja tworzenia wizyty
- `clientSchema` - walidacja danych klienta

**Zasady walidacji:**
- Email musi być w poprawnym formacie
- Hasło nie może być puste
- Daty w formacie ISO 8601
- Imię/nazwisko min. 2 znaki
- Numer telefonu min. 9 cyfr

---

### 🔗 Testy integracyjne (Integration Tests)

Lokalizacja: [`backend/src/tests/integration/`](backend/src/tests/integration/)

Testy end-to-end przepływu HTTP Request → Controller → Service → Response z wykorzystaniem **Supertest**.

#### 1. [`auth.test.js`](backend/src/tests/integration/auth.test.js) (4 testy)

Testy procesu uwierzytelniania:

| Endpoint | Test | Kod HTTP | Opis |
|----------|------|----------|------|
| `POST /api/auth/login` | Valid credentials | 200 | Zwraca JWT token dla poprawnych danych |
| `POST /api/auth/login` | Invalid credentials | 401 | Błąd dla złego hasła/użytkownika |
| `POST /api/auth/login` | Invalid email format | 400 | Błąd walidacji Zod dla złego formatu email |
| `POST /api/auth/login` | Missing password | 400 | Błąd walidacji dla brakujących pól |

**Scenariusze:**
```javascript
// Przykład testu
it('should return token for valid credentials', async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'valid@test.com', password: 'password' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
});
```

---

#### 2. [`clients.test.js`](backend/src/tests/integration/clients.test.js) (4 testy)

Testy zarządzania klientami:

| Endpoint | Test | Kod HTTP | Opis |
|----------|------|----------|------|
| `GET /api/clients` | Get all clients | 200 | Zwraca listę klientów (array) |
| `POST /api/clients` | Create with valid data | 201 | Tworzy nowego klienta |
| `POST /api/clients` | Create with invalid data | 400 | Błąd walidacji Zod (imię za krótkie) |
| `PUT /api/clients/:id` | Update client | 200 | Aktualizuje dane klienta |

**Mockowanie:**
- Middleware `authenticate` - omija proces logowania
- Service `clients.service` - zwraca testowe dane bez dostępu do DB

---

#### 3. [`appointments.test.js`](backend/src/tests/integration/appointments.test.js) (5 testów)

Testy zarządzania wizytami:

| Endpoint | Test | Kod HTTP | Opis |
|----------|------|----------|------|
| `GET /api/appointments` | Get all | 200 | Zwraca listę wizyt |
| `POST /api/appointments` | Create valid | 201 | Tworzy wizytę z poprawnymi danymi |
| `POST /api/appointments` | Invalid date format | 400 | Błąd walidacji Zod dla złego formatu daty |
| `POST /api/appointments/:id/reschedule` | Valid reschedule | 200 | Przesuwa termin wizyty |
| `POST /api/appointments/:id/reschedule` | Invalid date | 400 | Błąd dla niepoprawnej daty ("jutro") |

**Walidowane pola:**
- `doctorId`, `clientId`, `petId` (wymagane, integer)
- `scheduledAt` (wymagane, ISO 8601 datetime)
- `type` (opcjonalne, string)

---

### 📈 Pokrycie kodu (Code Coverage)

Uruchom testy z pokryciem:
```bash
npm run test:coverage
```

Pokrycie kodu obejmuje:
- **Reguły biznesowe** (appointmentRules)
- **Walidatory** (schemas)
- **Kontrolery** (auth, clients, appointments)
- **Routing** (integracja HTTP)

---

## Dokumentacja API

Pełna **interaktywna dokumentacja API** dostępna poprzez **Swagger UI**.

### 🔗 **http://localhost:3001/api-docs**

Swagger UI pozwala na:
- ✅ Przeglądanie wszystkich endpointów z pełną specyfikacją
- ✅ Testowanie requestów bezpośrednio z przeglądarki
- ✅ Podgląd schematów request/response (JSON)
- ✅ Autoryzację JWT (przycisk "Authorize")
- ✅ Eksport specyfikacji OpenAPI 3.0

### 🔐 Jak przetestować API w Swagger

1. Otwórz: http://localhost:3001/api-docs
2. Znajdź endpoint **POST /api/auth/login** (sekcja "Auth")
3. Kliknij **"Try it out"**
4. Wprowadź dane logowania:
   ```json
   {
     "email": "recepcja@vetcrm.pl",
     "password": "Recepcja123!"
   }
   ```
5. Kliknij **"Execute"**
6. Skopiuj wartość `token` z Response Body
7. Kliknij przycisk **"Authorize"** (góra strony, ikona kłódki 🔒)
8. W polu wartości wklej: `Bearer <twój-token>`
9. Kliknij **"Authorize"** i **"Close"**
10. Możesz teraz testować wszystkie chronione endpointy! 🎉

---

### API Endpoints (tabela)

#### Autoryzacja
| Metoda | Endpoint | Opis | Autoryzacja |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Logowanie użytkownika | Nie |
| POST | `/api/auth/register` | Rejestracja nowego użytkownika | Nie |
| GET | `/api/auth/me` | Profil zalogowanego użytkownika | Tak (JWT) |

#### Klienci
| Metoda | Endpoint | Opis | Autoryzacja |
|--------|----------|------|-------------|
| GET | `/api/clients` | Lista wszystkich klientów | Tak (JWT) |
| GET | `/api/clients/:id` | Szczegóły klienta | Tak (JWT) |
| POST | `/api/clients` | Dodaj nowego klienta | Tak (JWT) |
| PUT | `/api/clients/:id` | Edytuj klienta | Tak (JWT) |

#### Zwierzęta
| Metoda | Endpoint | Opis | Autoryzacja |
|--------|----------|------|-------------|
| GET | `/api/pets` | Lista zwierząt | Tak (JWT) |
| GET | `/api/pets/:id` | Szczegóły zwierzęcia | Tak (JWT) |
| GET | `/api/pets/:id/vaccinations` | Historia szczepień zwierzęcia | Tak (JWT) |
| GET | `/api/pets/:id/history` | Historia wizyt zwierzęcia | Tak (JWT) |
| POST | `/api/pets` | Dodaj zwierzę | Tak (JWT) |
| PUT | `/api/pets/:id` | Edytuj zwierzę | Tak (JWT) |

#### Wizyty
| Metoda | Endpoint | Opis | Autoryzacja |
|--------|----------|------|-------------|
| GET | `/api/appointments` | Lista wizyt (z filtrowaniem) | Tak (JWT) |
| GET | `/api/appointments/:id` | Szczegóły wizyty | Tak (JWT) |
| GET | `/api/appointments/slots` | Dostępne sloty czasowe | Tak (JWT) |
| GET | `/api/appointments/calendar` | Widok kalendarzowy wizyt | Tak (JWT) |
| POST | `/api/appointments` | Utwórz nową wizytę | Tak (JWT) |
| POST | `/api/appointments/:id/reschedule` | Przesuń termin wizyty | Tak (JWT) |
| POST | `/api/appointments/:id/cancel` | Anuluj wizytę (alternatywnie) | Tak (JWT) |
| POST | `/api/appointments/:id/complete` | Oznacz wizytę jako zakończoną | Tak (JWT) |
| DELETE | `/api/appointments/:id` | Anuluj wizytę | Tak (JWT) |

#### Lekarze
| Metoda | Endpoint | Opis | Autoryzacja |
|--------|----------|------|-------------|
| GET | `/api/doctors` | Lista lekarzy | Tak (JWT) |
| GET | `/api/doctors/:id` | Szczegóły lekarza | Tak (JWT) |
| GET | `/api/doctors/:id/schedule` | Harmonogram lekarza (tydzień) | Tak (JWT) |
| GET | `/api/doctors/:id/availability` | Dostępność lekarza na dzień | Tak (JWT) |
| GET | `/api/doctors/:id/appointments` | Wizyty przypisane do lekarza | Tak (JWT) |
| GET | `/api/doctors/:id/weekly` | Tygodniowy harmonogram lekarza | Tak (JWT) |

#### Kalkulatory
| Metoda | Endpoint | Opis | Autoryzacja |
|--------|----------|------|-------------|
| POST | `/api/calculators/pet-age` | Oblicz wiek zwierzęcia (lata ludzkie) | Tak (JWT) |
| POST | `/api/calculators/dosage` | Oblicz dawkowanie leku | Tak (JWT) |
| POST | `/api/calculators/bmi` | Oblicz BCS (Body Condition Score) | Tak (JWT) |
| GET | `/api/calculators/medications` | Lista dostępnych leków | Tak (JWT) |
| GET | `/api/calculators/breeds` | Lista ras z wagami idealnymi | Tak (JWT) |

---

## Przypadki testowe (TestCase)

Pełna dokumentacja przypadków testowych dla **testera manualnego**.

**Podsumowanie:** 24 szczegółowe przypadki testowe w formacie: ID | Tytuł | Priorytet | Warunki wstępne | Kroki testowe | Oczekiwany rezultat

### Spis treści

1. [Logowanie](#logowanie)
2. [Zarządzanie klientami](#zarządzanie-klientami)
3. [Zarządzanie wizytami](#zarządzanie-wizytami)
4. [Zarządzanie zwierzętami](#zarządzanie-zwierzętami)
5. [Kalkulatory](#kalkulatory)

---

### Logowanie

#### TC-01: Logowanie prawidłowymi danymi

| Pole | Wartość |
|------|---------|
| **ID** | TC-01 |
| **Tytuł** | Logowanie prawidłowymi danymi |
| **Priorytet** | Wysoki |
| **Warunki wstępne** | Aplikacja uruchomiona na http://localhost:5173, użytkownik na stronie logowania |
| **Kroki testowe** | 1. Otwórz aplikację w przeglądarce<br>2. Wpisz email: `recepcja@vetcrm.pl`<br>3. Wpisz hasło: `Recepcja123!`<br>4. Kliknij przycisk "Zaloguj się" |
| **Oczekiwany rezultat** | Użytkownik zostaje zalogowany i przekierowany na Dashboard. Wyświetla się komunikat powitalny z imieniem użytkownika. |
| **Status** | ✅ Pass |

---

#### TC-02: Logowanie błędnymi danymi

| Pole | Wartość |
|------|---------|
| **ID** | TC-02 |
| **Tytuł** | Logowanie błędnymi danymi - nieprawidłowe hasło |
| **Priorytet** | Wysoki |
| **Warunki wstępne** | Aplikacja uruchomiona, użytkownik na stronie logowania |
| **Kroki testowe** | 1. Wpisz email: `recepcja@vetcrm.pl`<br>2. Wpisz hasło: `WrongPassword123`<br>3. Kliknij "Zaloguj się" |
| **Oczekiwany rezultat** | Wyświetla się komunikat błędu: "Nieprawidłowy email lub hasło". Użytkownik pozostaje na stronie logowania. |
| **Status** | ✅ Pass |

---

#### TC-03: Logowanie z pustymi polami

| Pole | Wartość |
|------|---------|
| **ID** | TC-03 |
| **Tytuł** | Próba logowania z pustymi polami |
| **Priorytet** | Średni |
| **Warunki wstępne** | Aplikacja uruchomiona, użytkownik na stronie logowania |
| **Kroki testowe** | 1. Pozostaw pole email puste<br>2. Pozostaw pole hasło puste<br>3. Kliknij "Zaloguj się" |
| **Oczekiwany rezultat** | Wyświetlają się komunikaty walidacji: "Email jest wymagany", "Hasło jest wymagane". Przycisk logowania jest nieaktywny lub blokuje submit. |
| **Status** | ✅ Pass |

---

#### TC-04: Logowanie z nieprawidłowym formatem email

| Pole | Wartość |
|------|---------|
| **ID** | TC-04 |
| **Tytuł** | Logowanie z nieprawidłowym formatem email |
| **Priorytet** | Średni |
| **Warunki wstępne** | Aplikacja uruchomiona, użytkownik na stronie logowania |
| **Kroki testowe** | 1. Wpisz email: `nieprawidlowy-email`<br>2. Wpisz hasło: `Recepcja123!`<br>3. Kliknij "Zaloguj się" |
| **Oczekiwany rezultat** | Wyświetla się komunikat walidacji: "Nieprawidłowy format email" lub podobny. Request nie jest wysyłany do API. |
| **Status** | ✅ Pass |

---

### Zarządzanie klientami

#### TC-05: Dodawanie nowego klienta z poprawnymi danymi

| Pole | Wartość |
|------|---------|
| **ID** | TC-05 |
| **Tytuł** | Dodawanie nowego klienta z poprawnymi danymi |
| **Priorytet** | Wysoki |
| **Warunki wstępne** | Użytkownik zalogowany, na stronie "Klienci" |
| **Kroki testowe** | 1. Kliknij przycisk "Dodaj klienta"<br>2. Wypełnij formularz:<br>   - Imię: `Jan`<br>   - Nazwisko: `Testowy`<br>   - Telefon: `500111222`<br>   - Email: `jan.testowy@example.com`<br>   - Adres: `ul. Testowa 1, Kraków`<br>3. Kliknij "Dodaj" |
| **Oczekiwany rezultat** | Klient pojawia się na liście. Modal się zamyka. Wyświetla się komunikat sukcesu: "Klient dodany pomyślnie". |
| **Status** | ✅ Pass |

---

#### TC-06: Dodawanie klienta z niepełnymi danymi

| Pole | Wartość |
|------|---------|
| **ID** | TC-06 |
| **Tytuł** | Próba dodania klienta bez wymaganych pól |
| **Priorytet** | Wysoki |
| **Warunki wstępne** | Użytkownik zalogowany, na stronie "Klienci", otwarty modal dodawania |
| **Kroki testowe** | 1. Kliknij "Dodaj klienta"<br>2. Wypełnij tylko pole Imię: `Jan`<br>3. Pozostaw puste: Nazwisko, Telefon<br>4. Spróbuj kliknąć "Dodaj" |
| **Oczekiwany rezultat** | Wyświetlają się komunikaty walidacji dla brakujących pól. Klient nie zostaje dodany. Przycisk "Dodaj" jest nieaktywny lub blokuje submit. |
| **Status** | ✅ Pass |

---

#### TC-07: Wyszukiwanie klienta po nazwisku

| Pole | Wartość |
|------|---------|
| **ID** | TC-07 |
| **Tytuł** | Wyszukiwanie klienta po nazwisku |
| **Priorytet** | Średni |
| **Warunki wstępne** | Użytkownik zalogowany, na stronie "Klienci", w bazie istnieją klienci (np. Adam Malinowski, Ewa Zielińska) |
| **Kroki testowe** | 1. W polu wyszukiwania wpisz: `Malinowski`<br>2. Kliknij ikonę lupy lub naciśnij Enter |
| **Oczekiwany rezultat** | Lista filtruje się do klientów, których imię lub nazwisko zawiera "Malinowski". Wyświetla się tylko Adam Malinowski. |
| **Status** | ✅ Pass |

---

#### TC-08: Edycja danych istniejącego klienta

| Pole | Wartość |
|------|---------|
| **ID** | TC-08 |
| **Tytuł** | Edycja numeru telefonu klienta |
| **Priorytet** | Średni |
| **Warunki wstępne** | Użytkownik zalogowany, na stronie "Klienci", istnieje klient (np. Adam Malinowski) |
| **Kroki testowe** | 1. Znajdź klienta Adam Malinowski na liście<br>2. Kliknij ikonę edycji (ołówek)<br>3. Zmień numer telefonu na: `999888777`<br>4. Kliknij "Zapisz" |
| **Oczekiwany rezultat** | Modal się zamyka. Numer telefonu na liście zostaje zaktualizowany do `999888777`. Wyświetla się komunikat sukcesu. |
| **Status** | ✅ Pass |

---

### Zarządzanie wizytami

#### TC-09: Tworzenie nowej wizyty z poprawnymi danymi

| Pole | Wartość |
|------|---------|
| **ID** | TC-09 |
| **Tytuł** | Tworzenie nowej wizyty |
| **Priorytet** | Wysoki |
| **Warunki wstępne** | Użytkownik zalogowany, na stronie "Wizyty", istnieją klienci, zwierzęta i lekarze w bazie |
| **Kroki testowe** | 1. Kliknij "Nowa wizyta"<br>2. Wybierz klienta: `Adam Malinowski`<br>3. Wybierz zwierzę: `Burek`<br>4. Wybierz lekarza: `Dr Jan Nowak`<br>5. Ustaw datę: jutro, godzina: `10:00`<br>6. Typ: `Wizyta kontrolna`<br>7. Kliknij "Utwórz wizytę" |
| **Oczekiwany rezultat** | Wizyta pojawia się na liście z wybraną datą i godziną. Modal się zamyka. Wyświetla się komunikat sukcesu. |
| **Status** | ✅ Pass |

---

#### TC-10: Anulowanie wizyty (> 72h przed terminem)

| Pole | Wartość |
|------|---------|
| **ID** | TC-10 |
| **Tytuł** | Anulowanie wizyty więcej niż 72h przed terminem (bezpłatne) |
| **Priorytet** | Wysoki |
| **Warunki wstępne** | Istnieje wizyta zaplanowana za więcej niż 72 godziny (np. za 5 dni) |
| **Kroki testowe** | 1. Przejdź do strony "Wizyty"<br>2. Znajdź wizytę zaplanowaną za 5 dni<br>3. Kliknij ikonę kosza (anuluj)<br>4. Sprawdź informację o typie anulowania<br>5. Potwierdź anulowanie |
| **Oczekiwany rezultat** | Wyświetla się komunikat: "Bezpłatne anulowanie" (opłata: 0 zł). Wizyta zostaje anulowana i znika z listy lub zmienia status na "Anulowana". |
| **Status** | ✅ Pass |

---

#### TC-11: Anulowanie wizyty (48-72h przed terminem)

| Pole | Wartość |
|------|---------|
| **ID** | TC-11 |
| **Tytuł** | Anulowanie wizyty 48-72h przed terminem (ostrzeżenie) |
| **Priorytet** | Średni |
| **Warunki wstępne** | Istnieje wizyta zaplanowana za 50 godzin |
| **Kroki testowe** | 1. Znajdź wizytę za ~50h<br>2. Kliknij anuluj<br>3. Sprawdź komunikat ostrzegawczy |
| **Oczekiwany rezultat** | Wyświetla się ostrzeżenie: "Anulowanie w tym terminie jest dopuszczalne, ale zbliża się granica" lub podobne. Opłata: 0 zł. Anulowanie możliwe po potwierdzeniu. |
| **Status** | ✅ Pass |

---

#### TC-12: Anulowanie wizyty (24-48h przed terminem)

| Pole | Wartość |
|------|---------|
| **ID** | TC-12 |
| **Tytuł** | Anulowanie wizyty 24-48h przed terminem (płatne 50 zł) |
| **Priorytet** | Wysoki |
| **Warunki wstępne** | Istnieje wizyta zaplanowana za 30 godzin |
| **Kroki testowe** | 1. Znajdź wizytę za ~30h<br>2. Kliknij anuluj<br>3. Sprawdź informację o opłacie<br>4. Potwierdź anulowanie |
| **Oczekiwany rezultat** | Wyświetla się komunikat: "Anulowanie płatne 50 zł (mniej niż 48h)". Wizyta zostaje anulowana po potwierdzeniu. System zapisuje informację o opłacie. |
| **Status** | ✅ Pass |

---

#### TC-13: Próba anulowania wizyty (< 24h przed terminem)

| Pole | Wartość |
|------|---------|
| **ID** | TC-13 |
| **Tytuł** | Próba anulowania wizyty mniej niż 24h przed terminem (zablokowane) |
| **Priorytet** | Wysoki |
| **Warunki wstępne** | Istnieje wizyta zaplanowana za 20 godzin |
| **Kroki testowe** | 1. Znajdź wizytę za ~20h<br>2. Spróbuj kliknąć przycisk anuluj |
| **Oczekiwany rezultat** | Przycisk "Anuluj" jest nieaktywny (disabled) lub wyświetla się komunikat: "Anulowanie zablokowane - mniej niż 24h do wizyty". Anulowanie niemożliwe. |
| **Status** | ✅ Pass |

---

#### TC-14: Przesuwanie terminu wizyty

| Pole | Wartość |
|------|---------|
| **ID** | TC-14 |
| **Tytuł** | Przesuwanie terminu wizyty na inny dzień |
| **Priorytet** | Średni |
| **Warunki wstępne** | Istnieje wizyta w przyszłości (np. za 5 dni) |
| **Kroki testowe** | 1. Znajdź wizytę na liście<br>2. Kliknij ikonę edycji lub "Przesuń termin"<br>3. Wybierz nową datę: za tydzień, godzina `14:00`<br>4. Kliknij "Zapisz" |
| **Oczekiwany rezultat** | Wizyta zostaje przeniesiona na nowy termin. Wyświetla się komunikat sukcesu. Stara data zostaje zastąpiona nową. |
| **Status** | ✅ Pass |

---

#### TC-15: Próba edycji wizyty przeszłej

| Pole | Wartość |
|------|---------|
| **ID** | TC-15 |
| **Tytuł** | Próba edycji wizyty, która już się odbyła |
| **Priorytet** | Średni |
| **Warunki wstępne** | Istnieje wizyta z przeszłości (data < dzisiaj) |
| **Kroki testowe** | 1. Przejdź do historii wizyt<br>2. Znajdź wizytę z przeszłości<br>3. Spróbuj kliknąć przycisk edycji/przesunięcia |
| **Oczekiwany rezultat** | Przycisk edycji jest nieaktywny lub wyświetla się komunikat: "Nie można edytować wizyt, które już się odbyły". |
| **Status** | ✅ Pass |

---

### Zarządzanie zwierzętami

#### TC-16: Dodawanie nowego zwierzęcia do klienta

| Pole | Wartość |
|------|---------|
| **ID** | TC-16 |
| **Tytuł** | Dodawanie nowego zwierzęcia |
| **Priorytet** | Wysoki |
| **Warunki wstępne** | Użytkownik zalogowany, na stronie "Zwierzęta" lub profilu klienta |
| **Kroki testowe** | 1. Kliknij "Dodaj zwierzę"<br>2. Wybierz klienta: `Adam Malinowski`<br>3. Wypełnij dane:<br>   - Imię: `Rex`<br>   - Gatunek: `Pies`<br>   - Rasa: `Labrador`<br>   - Data urodzenia: `2020-05-10`<br>   - Waga: `30 kg`<br>   - Płeć: `Samiec`<br>4. Kliknij "Dodaj" |
| **Oczekiwany rezultat** | Zwierzę pojawia się na liście przypisane do wybranego klienta. Modal się zamyka. Komunikat sukcesu. |
| **Status** | ✅ Pass |

---

#### TC-17: Przeglądanie historii szczepień zwierzęcia

| Pole | Wartość |
|------|---------|
| **ID** | TC-17 |
| **Tytuł** | Przeglądanie historii szczepień |
| **Priorytet** | Średni |
| **Warunki wstępne** | Użytkownik zalogowany, istnieje zwierzę ze szczepieniami (np. Burek) |
| **Kroki testowe** | 1. Przejdź do strony "Zwierzęta"<br>2. Znajdź zwierzę "Burek"<br>3. Kliknij ikonę strzykawki lub "Szczepienia" |
| **Oczekiwany rezultat** | Wyświetla się modal/strona z listą szczepień: nazwa szczepionki, data podania, data ważności, status (aktualne/wygasłe). |
| **Status** | ✅ Pass |

---

#### TC-18: Obliczanie wieku zwierzęcia w latach ludzkich

| Pole | Wartość |
|------|---------|
| **ID** | TC-18 |
| **Tytuł** | Wyświetlanie wieku psa w latach ludzkich |
| **Priorytet** | Niski |
| **Warunki wstępne** | Użytkownik zalogowany, istnieje pies o znanej dacie urodzenia (np. Burek, ur. 2020-03-15) |
| **Kroki testowe** | 1. Przejdź do szczegółów zwierzęcia "Burek"<br>2. Sprawdź pole "Wiek w latach ludzkich" |
| **Oczekiwany rezultat** | Wyświetla się obliczony wiek w latach ludzkich (np. "~36 lat ludzkich") zgodnie z formułą dla psów dużej rasy. |
| **Status** | ✅ Pass |

---

### Kalkulatory

#### TC-19: Kalkulator wieku psa (duża rasa)

| Pole | Wartość |
|------|---------|
| **ID** | TC-19 |
| **Tytuł** | Obliczanie wieku psa dużej rasy w latach ludzkich |
| **Priorytet** | Średni |
| **Warunki wstępne** | Użytkownik zalogowany, na stronie "Kalkulatory" |
| **Kroki testowe** | 1. Wybierz zakładkę "Wiek zwierzęcia"<br>2. Wybierz gatunek: `Pies`<br>3. Wpisz wiek: Lata: `5`, Miesiące: `0`<br>4. Wpisz wagę: `30 kg` (duża rasa)<br>5. Kliknij "Oblicz" |
| **Oczekiwany rezultat** | Wyświetla się wynik: ~36-40 lat ludzkich. Etap życia: "Dorosły". Formuła uwzględnia większy współczynnik dla dużych ras. |
| **Status** | ✅ Pass |

---

#### TC-20: Kalkulator wieku kota

| Pole | Wartość |
|------|---------|
| **ID** | TC-20 |
| **Tytuł** | Obliczanie wieku kota w latach ludzkich |
| **Priorytet** | Średni |
| **Warunki wstępne** | Użytkownik zalogowany, na stronie "Kalkulatory" |
| **Kroki testowe** | 1. Wybierz zakładkę "Wiek zwierzęcia"<br>2. Wybierz gatunek: `Kot`<br>3. Wpisz wiek: Lata: `3`, Miesiące: `6`<br>4. Kliknij "Oblicz" |
| **Oczekiwany rezultat** | Wyświetla się wynik: ~30 lat ludzkich (formuła dla kotów: rok 1 = 15, rok 2 = +9, kolejne +4/rok). Etap życia: "Młody dorosły". |
| **Status** | ✅ Pass |

---

#### TC-21: Kalkulator dawkowania leków - Amoksycylina

| Pole | Wartość |
|------|---------|
| **ID** | TC-21 |
| **Tytuł** | Obliczanie dawki Amoksycyliny dla psa |
| **Priorytet** | Wysoki |
| **Warunki wstępne** | Użytkownik zalogowany, na stronie "Kalkulatory" |
| **Kroki testowe** | 1. Wybierz zakładkę "Dawkowanie leków"<br>2. Wybierz lek: `Amoksycylina` (20 mg/kg, max 500 mg)<br>3. Wybierz gatunek: `Pies`<br>4. Wpisz wagę: `25 kg`<br>5. Kliknij "Oblicz dawkę" |
| **Oczekiwany rezultat** | Wyświetla się dawka: 500 mg (25 kg × 20 mg/kg = 500 mg, limit max 500 mg). Informacja o częstotliwości podawania. |
| **Status** | ✅ Pass |

---

#### TC-22: Kalkulator dawkowania - Metacam dla kota

| Pole | Wartość |
|------|---------|
| **ID** | TC-22 |
| **Tytuł** | Obliczanie dawki Metacam dla kota (inna dawka niż dla psa) |
| **Priorytet** | Wysoki |
| **Warunki wstępne** | Użytkownik zalogowany, na stronie "Kalkulatory" |
| **Kroki testowe** | 1. Wybierz zakładkę "Dawkowanie leków"<br>2. Wybierz lek: `Metacam (kot)` (0.1 mg/kg)<br>3. Wybierz gatunek: `Kot`<br>4. Wpisz wagę: `5 kg`<br>5. Kliknij "Oblicz dawkę" |
| **Oczekiwany rezultat** | Wyświetla się dawka: 0.5 mg (5 kg × 0.1 mg/kg). Ostrzeżenie: "Dla kotów - jednorazowa dawka". |
| **Status** | ✅ Pass |

---

#### TC-23: Kalkulator BCS - Pies z idealną wagą

| Pole | Wartość |
|------|---------|
| **ID** | TC-23 |
| **Tytuł** | Ocena kondycji ciała psa z idealną wagą |
| **Priorytet** | Średni |
| **Warunki wstępne** | Użytkownik zalogowany, na stronie "Kalkulatory" |
| **Kroki testowe** | 1. Wybierz zakładkę "BCS (Kondycja)"<br>2. Wybierz gatunek: `Pies`<br>3. Wybierz rasę: `Labrador` (idealna waga ~32 kg)<br>4. Wpisz wagę: `32 kg`<br>5. Kliknij "Oceń kondycję" |
| **Oczekiwany rezultat** | Wyświetla się BCS: 4-5 (Idealna waga). Komunikat: "Kondycja prawidłowa, utrzymaj obecną dietę i aktywność". |
| **Status** | ✅ Pass |

---

#### TC-24: Kalkulator BCS - Pies z nadwagą

| Pole | Wartość |
|------|---------|
| **ID** | TC-24 |
| **Tytuł** | Ocena kondycji ciała psa z nadwagą |
| **Priorytet** | Średni |
| **Warunki wstępne** | Użytkownik zalogowany, na stronie "Kalkulatory" |
| **Kroki testowe** | 1. Wybierz zakładkę "BCS (Kondycja)"<br>2. Wybierz gatunek: `Pies`<br>3. Wybierz rasę: `Labrador` (idealna waga ~32 kg)<br>4. Wpisz wagę: `40 kg`<br>5. Kliknij "Oceń kondycję" |
| **Oczekiwany rezultat** | Wyświetla się BCS: 7-8 (Nadwaga/Otyłość). Idealna waga: ~32 kg. Zalecenia: "Redukcja kalorii o 10-15%, zwiększenie aktywności fizycznej, konsultacja z weterynarzem". |
| **Status** | ✅ Pass |

---

### Podsumowanie przypadków testowych

**Łączna liczba przypadków testowych:** 24

**Podział według priorytetów:**
- **Wysoki:** 12 przypadków
- **Średni:** 11 przypadków
- **Niski:** 1 przypadek

**Podział według modułów:**
- **Logowanie:** 4 przypadki (TC-01 do TC-04)
- **Zarządzanie klientami:** 4 przypadki (TC-05 do TC-08)
- **Zarządzanie wizytami:** 7 przypadków (TC-09 do TC-15)
- **Zarządzanie zwierzętami:** 3 przypadki (TC-16 do TC-18)
- **Kalkulatory:** 6 przypadków (TC-19 do TC-24)

**Status wykonania:**
- ✅ **Pass:** 24/24 (100%)

### Uwagi do testowania

1. **Środowisko testowe:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Swagger Docs: http://localhost:3001/api-docs

2. **Dane testowe:**
   - Użytkownik: `recepcja@vetcrm.pl` / `Recepcja123!`
   - Klienci: Adam Malinowski, Ewa Zielińska, Tomasz Wójcik
   - Zwierzęta: Burek, Luna, Max, Mruczek, Puszek
   - Lekarze: Dr Jan Nowak, Dr Maria Wiśniewska, Dr Piotr Kowalczyk

3. **Resetowanie danych testowych:**
   ```bash
   docker exec vetcrm-backend-dev npm run db:init
   ```

4. **Testowanie reguł czasowych wizyt:**
   - Do testowania TC-09 do TC-13 należy utworzyć wizyty w różnych przedziałach czasowych
   - Można użyć narzędzi deweloperskich do zmiany daty systemowej lub czekać na naturalne przesunięcie czasu

5. **Testowanie negatywne:**
   - Przypadki TC-02, TC-03, TC-04, TC-06, TC-13, TC-15 testują scenariusze błędów
   - Należy upewnić się, że aplikacja wyświetla odpowiednie komunikaty błędów

---

## Funkcjonalności

### 1. System uwierzytelniania

- Logowanie przy użyciu JWT (JSON Web Token)
- Token ważny przez 24 godziny
- Middleware `authenticate` chronący endpointy API
- Hashowanie haseł z bcrypt (salt rounds: 10)

### 2. Zarządzanie wizytami

#### Tworzenie wizyt
- Wybór lekarza, klienta, zwierzęcia
- Wybór daty i godziny z dostępnych slotów
- Typ wizyty (wizyta, zabieg, szczepienie)
- Dodatkowe notatki

#### Anulowanie wizyt (reguły czasowe)

Reguły biznesowe zgodne z [`appointmentRules.js`](backend/src/config/appointmentRules.js):

| Czas do wizyty | Typ anulowania | Opłata | Status |
|----------------|----------------|--------|--------|
| **> 72h** | `free` | 0 zł | ✅ Bezpłatne anulowanie |
| **48-72h** | `warning` | 0 zł | ⚠️ Ostrzeżenie (brak opłaty) |
| **24-48h** | `paid` | 50 zł | 💰 Anulowanie płatne |
| **< 24h** | `blocked` | - | ❌ Anulowanie zablokowane |
| **Przeszłe** | `blocked` | - | ❌ Anulowanie niemożliwe |

#### Przesuwanie wizyt
- Zmiana terminu dla przyszłych wizyt
- Sprawdzanie dostępności nowego slotu
- Blokada edycji wizyt przeszłych

### 3. Zarządzanie klientami

- Dodawanie nowych klientów
- Przeglądanie listy klientów
- Wyszukiwanie po imieniu/nazwisku/telefonie
- Edycja danych kontaktowych
- Walidacja danych wejściowych (Zod schema)

### 4. Zarządzanie zwierzętami

- Dodawanie zwierząt przypisanych do klientów
- Dane: gatunek, rasa, data urodzenia, waga, płeć, kolor
- Historia szczepień (nazwa, data, data ważności)
- Obliczanie wieku w latach ludzkich
- Microchip ID i notatki

### 5. Grafik lekarzy

- Przeglądanie harmonogramów pracy (pon-pt 8:00-16:00)
- Sprawdzanie dostępności na wybrany dzień
- Integracja z systemem wizyt (zajęte sloty)
- Specjalizacje lekarzy

### 6. Kalkulatory weterynaryjne

#### Kalkulator wieku zwierzęcia
- **Psy:** Różne formuły w zależności od rozmiaru (mały/średni/duży)
  - Rok 1: 15 lat ludzkich
  - Rok 2: +9 lat
  - Kolejne lata: +4-6 lat (zależnie od rozmiaru)
- **Koty:** Formuła liniowa
  - Rok 1: 15 lat
  - Rok 2: +9 lat
  - Kolejne lata: +4 lata
- **Etapy życia:** Szczenię/Kocię → Młody → Dorosły → Senior → Geriatryczny

#### Kalkulator dawkowania leków
- Baza leków z dawkami mg/kg
- Obliczanie dawki na podstawie wagi zwierzęcia
- Maksymalne dawki bezpieczeństwa
- Uwzględnienie gatunku (pies/kot/wszystkie)
- Notatki dotyczące zastosowania

**Przykładowe leki:**
- Amoksycylina: 20 mg/kg (max 500 mg)
- Metacam: 0.2 mg/kg dla psów, 0.1 mg/kg dla kotów
- Prednizolon: 1 mg/kg (max 60 mg)

#### Kalkulator BCS (Body Condition Score)
- Ocena kondycji ciała w skali 1-9
- Porównanie z idealnymi wagami dla ras
- Zalecenia dietetyczne:
  - BCS 1-3: Niedowaga (zwiększyć kalorie)
  - BCS 4-5: Idealna waga
  - BCS 6-7: Nadwaga (redukcja kalorii o 10-15%)
  - BCS 8-9: Otyłość (wizyta u weterynarza, dieta)

---

## Zasady jakości kodu

Projekt został zaimplementowany zgodnie z najlepszymi praktykami:

### ✅ Clean Code
- Nazwy zmiennych, funkcji, klas w języku **angielskim**
- Nazwy **opisowe** i jednoznaczne (`getHoursUntilAppointment` zamiast `calc`)
- Unikanie **magic numbers** (stałe zdefiniowane w `constants.js`)
- Krótkie funkcje z pojedynczą odpowiedzialnością

### ✅ Zasady SOLID

#### Single Responsibility Principle
- Każdy moduł ma jedną odpowiedzialność:
  - `controllers/` - obsługa HTTP
  - `services/` - logika biznesowa
  - `routes/` - definicje endpointów
  - `validators/` - walidacja danych

#### Open/Closed Principle
- Rozszerzanie funkcjonalności bez modyfikacji kodu (np. dodawanie nowych leków do bazy)

#### Dependency Inversion
- Kontrolery zależą od abstrakcji (serwisy), nie od konkretnych implementacji

### ✅ Wzorce projektowe

#### Service Layer Pattern
Separacja logiki biznesowej od kontrolerów HTTP:
```
Controller → Service → Database
```

#### Repository Pattern
Warstwa abstrakcji dostępu do danych (services jako repositories)

#### Middleware Pattern
Express middleware do autoryzacji i obsługi błędów

### ✅ Konwencje nazewnicze

| Element | Konwencja | Przykład |
|---------|-----------|----------|
| Pliki | kebab-case | `appointment-rules.js` |
| Zmienne | camelCase | `hoursUntilAppointment` |
| Funkcje | camelCase | `getCancellationType()` |
| Klasy | PascalCase | `AppointmentService` |
| Stałe | UPPER_CASE | `MAX_APPOINTMENTS_PER_DAY` |
| Komponenty React | PascalCase | `Dashboard.tsx` |

### ✅ Bezpieczeństwo

- **Hashowanie haseł** z bcrypt (salt rounds: 10)
- **JWT tokens** z expirationem (24h)
- **Walidacja input** z Zod (zapobiega SQL injection, XSS)
- **CORS** skonfigurowany dla origin: `http://localhost:5173`
- **Prepared statements** w MySQL2 (zapobiega SQL injection)

---

## Autor i kontakt

**Bartłomiej Król**
- Kurs: Testowanie i Jakość Oprogramowania II
- Wydział Politechniczny, Katedra Informatyki
- Akademia Tarnowska

---

## Licencja

Projekt wykonany na potrzeby przedmiotu "Testowanie i Jakość Oprogramowania II".

**© 2025 Bartłomiej Król | Akademia Tarnowska**
