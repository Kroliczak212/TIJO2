# Temat projektu: VetCRM - Moduł Recepcjonisty

**Nazwa kursu:** Testowanie i Jakość Oprogramowania
**Autor:** Bartłomiej Król
**Wersja:** 1.0.0

## Spis treści

1. [Opis projektu](#opis-projektu)
2. [Technologie](#technologie)
3. [Instalacja](#instalacja)
4. [Uruchomienie](#uruchomienie)
5. [Struktura projektu](#struktura-projektu)
6. [Funkcjonalności](#funkcjonalności)
7. [Testy automatyczne](#testy-automatyczne)
8. [Testy manualne](#testy-manualne)
9. [API Endpoints](#api-endpoints)

---

## Opis projektu

VetCRM - Moduł Recepcjonisty to samodzielna aplikacja webowa do zarządzania przychodnią weterynaryjną. Moduł umożliwia recepcjoniście zarządzanie wizytami, klientami, zwierzętami oraz korzystanie z kalkulatorów weterynaryjnych.

### Kluczowe funkcje:
- **Zarządzanie wizytami** - tworzenie, przeglądanie, anulowanie z regułami czasowymi (72h/48h/24h)
- **Zarządzanie klientami** - CRUD, wyszukiwanie
- **Zarządzanie zwierzętami** - dodawanie, przeglądanie szczepień
- **Grafik lekarzy** - harmonogramy, dostępność slotów
- **Kalkulatory weterynaryjne:**
  - Kalkulator wieku zwierzęcia (przeliczanie na lata ludzkie)
  - Kalkulator dawkowania leków
  - Kalkulator BCS (Body Condition Score)

---

## Technologie użyte w projekcie

### Backend
- Node.js + Express.js
- MySQL (mysql2)
- JWT (jsonwebtoken)
- bcrypt
- Jest + Supertest (testy)

### Frontend
- React 18 + TypeScript
- Vite
- React Router DOM
- Axios
- Lucide React (ikony)

---

## Instalacja

### Wymagania
- Node.js >= 18.x
- npm >= 9.x

### Krok 1: Instalacja zależności backendu
```bash
cd test_rec_module/backend
npm install
```

### Krok 2: Inicjalizacja bazy danych
```bash
npm run db:init
```

### Krok 3: Instalacja zależności frontendu
```bash
cd ../frontend
npm install
```

---

## Uruchomienie

### Opcja 1: Docker (zalecane)

```bash
cd test_rec_module
docker-compose up --build
```

Aplikacja będzie dostępna pod adresem: **http://localhost:8080**

### Opcja 2: Ręczne uruchomienie

#### Backend (port 3001)
```bash
cd test_rec_module/backend
npm start
```

#### Frontend (port 5173)
```bash
cd test_rec_module/frontend
npm run dev
```

### Dane logowania
- **Email:** recepcja@vetcrm.pl
- **Hasło:** Recepcja123!

---

## Struktura projektu

```
test_rec_module/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js         # Konfiguracja MySQL
│   │   │   ├── constants.js        # Stałe (Enums)
│   │   │   ├── index.js            # Konfiguracja aplikacji
│   │   │   ├── appointmentRules.js # Reguły anulowania wizyt
│   │   │   └── initDb.js           # Skrypt inicjalizacji DB
│   │   ├── middleware/
│   │   │   └── auth.js             # Middleware JWT
│   │   ├── controllers/            # Kontrolery
│   │   │   ├── auth.controller.js
│   │   │   ├── clients.controller.js
│   │   │   ├── pets.controller.js
│   │   │   ├── appointments.controller.js
│   │   │   ├── doctors.controller.js
│   │   │   └── calculators.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── clients.routes.js
│   │   │   ├── pets.routes.js
│   │   │   ├── appointments.routes.js
│   │   │   ├── doctors.routes.js
│   │   │   └── calculators.routes.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── clients.service.js
│   │   │   ├── pets.service.js
│   │   │   ├── appointments.service.js
│   │   │   ├── doctors.service.js
│   │   │   └── calculators.service.js
│   │   ├── utils/
│   │   │   ├── petAgeCalculator.js
│   │   │   ├── dosageCalculator.js
│   │   │   └── petBmiCalculator.js
│   │   └── app.js
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── petAgeCalculator.test.js
│   │   │   ├── dosageCalculator.test.js
│   │   │   ├── petBmiCalculator.test.js
│   │   │   └── appointmentRules.test.js
│   │   ├── integration/
│   │   │   ├── auth.integration.test.js
│   │   │   ├── clients.integration.test.js
│   │   │   ├── pets.integration.test.js
│   │   │   ├── appointments.integration.test.js
│   │   │   ├── doctors.integration.test.js
│   │   │   └── calculators.integration.test.js
│   │   └── setup.js
│   ├── package.json
│   └── jest.config.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── .dockerignore
    ├── src/
    │   ├── components/
    │   │   └── Layout.tsx
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Clients.tsx
    │   │   ├── Pets.tsx
    │   │   ├── Appointments.tsx
    │   │   ├── Doctors.tsx
    │   │   └── Calculators.tsx
    │   ├── services/
    │   │   └── api.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

---

## Funkcjonalności

### 1. Logowanie
- Prosty system logowania dla recepcjonisty
- Autoryzacja JWT z 24h ważnością tokena

### 2. Zarządzanie wizytami
- Tworzenie nowych wizyt
- Przeglądanie wizyt na wybrany dzień
- Anulowanie wizyt z regułami czasowymi:
  - **> 72h przed wizytą** - bezpłatne anulowanie
  - **48-72h przed wizytą** - ostrzeżenie
  - **24-48h przed wizytą** - opłata 50 zł
  - **< 24h przed wizytą** - anulowanie zablokowane

### 3. Zarządzanie klientami
- Dodawanie, edycja, usuwanie klientów
- Wyszukiwanie po imieniu/nazwisku/telefonie

### 4. Zarządzanie zwierzętami
- Dodawanie zwierząt do klientów
- Przeglądanie historii szczepień
- Obliczanie wieku w latach ludzkich

### 5. Grafik lekarzy
- Przeglądanie harmonogramów pracy
- Sprawdzanie dostępności na wybrany dzień

### 6. Kalkulatory weterynaryjne
- **Kalkulator wieku** - przeliczanie na lata ludzkie (różne formuły dla psów wg rozmiaru i kotów)
- **Kalkulator dawkowania** - obliczanie dawek leków na podstawie wagi
- **Kalkulator BCS** - ocena kondycji ciała w skali 1-9 z zaleceniami

---

## Testy

Projekt zawiera kompleksowy zestaw testów automatycznych zlokalizowanych w katalogu `backend/src/tests`.

### Uruchomienie testów
```bash
cd backend
npm test
```

**Wyniki:**
- ✅ **33 testy przechodzą** (22 jednostkowe + 11 integracyjne)
- ✅ **5 zestawów testów** (wszystkie przechodzą)

### Testy Jednostkowe (Unit Tests)
Lokalizacja: [`backend/src/tests/unit`](backend/src/tests/unit)

**1. [`appointmentRules.test.js`](backend/src/tests/unit/appointmentRules.test.js)** (12 testów)
Weryfikacja **logiki biznesowej** anulowania i edycji wizyt:
- Sprawdzanie czy termin wizyty jest w przyszłości.
- Obliczanie typu anulowania (**+72h: bezpłatne**, **48-72h: ostrzeżenie**, **24-48h: płatne 50zł**, **<24h: zablokowane**).
- Blokowanie edycji wizyt, które już się odbyły.
- Formatowanie czasu pozostałego do wizyty.

**2. [`schemas.test.js`](backend/src/tests/unit/schemas.test.js)** (10 testów)
Walidacja poprawności danych wejściowych (**Zod Schemas**):
- **Logowanie:** Weryfikacja formatu email i wymagań hasła.
- **Wizyty:** Sprawdzanie poprawności dat (ISO), typów i wymaganych ID.
- **Klienci:** Walidacja długości imienia/nazwiska i formatu numeru telefonu.

### Testy Integracyjne (Integration Tests)
Lokalizacja: [`backend/src/tests/integration`](backend/src/tests/integration)

**1. [`auth.test.js`](backend/src/tests/integration/auth.test.js)**
Testy end-to-end procesu uwierzytelniania:
- Logowanie poprawnymi danymi (zwraca token JWT).
- Obsługa błędów logowania (złe hasło, nieistniejący user).
- Walidacja formatu danych (Błąd 400).

**2. [`appointments.test.js`](backend/src/tests/integration/appointments.test.js)**
Testy zarządzania wizytami:
- Tworzenie nowej wizyty (POST) i weryfikacja zapisu.
- Przesuwanie terminu wizyty (POST /reschedule).
- Blokowanie niepoprawnych dat.

**3. [`clients.test.js`](backend/src/tests/integration/clients.test.js)**
Testy operacji na klientach:
- Pobieranie listy klientów.
- Tworzenie nowego klienta z walidacją.
- Edycja danych istniejącego klienta.

---

## Przypadki testowe dla testera manualnego (TestCase)

### TC-01: Logowanie prawidłowymi danymi
**ID**
TC-01
**Tytuł**
Logowanie prawidłowymi danymi
**Warunki wstępne**
Aplikacja uruchomiona, użytkownik na stronie logowania
**Kroki**
1. Wpisz email: recepcja@vetcrm.pl
2. Wpisz hasło: Recepcja123!
3. Kliknij "Zaloguj się"
**Oczekiwany rezultat**
Użytkownik zostaje przekierowany na Dashboard

### TC-02: Logowanie błędnymi danymi
**ID**
TC-02
**Tytuł**
Logowanie błędnymi danymi
**Warunki wstępne**
Aplikacja uruchomiona, użytkownik na stronie logowania
**Kroki**
1. Wpisz email: test@test.pl
2. Wpisz hasło: wrongpassword
3. Kliknij "Zaloguj się"
**Oczekiwany rezultat**
Wyświetla się komunikat błędu "Nieprawidłowe dane logowania"

### TC-03: Dodawanie nowego klienta
**ID**
TC-03
**Tytuł**
Dodawanie nowego klienta
**Warunki wstępne**
Użytkownik zalogowany, na stronie Klienci
**Kroki**
1. Kliknij "Dodaj klienta"
2. Wypełnij formularz (Imię: Jan, Nazwisko: Testowy, Telefon: 500111222)
3. Kliknij "Dodaj"
**Oczekiwany rezultat**
Klient pojawia się na liście, modal się zamyka

### TC-04: Wyszukiwanie klienta
**ID**
TC-04
**Tytuł**
Wyszukiwanie klienta po nazwisku
**Warunki wstępne**
Użytkownik zalogowany, istnieją klienci w bazie
**Kroki**
1. Przejdź do strony Klienci
2. Wpisz "Malinowski" w pole wyszukiwania
3. Kliknij ikonę lupy
**Oczekiwany rezultat**
Lista filtruje się do klientów zawierających "Malinowski"

### TC-05: Tworzenie nowej wizyty
**ID**
TC-05
**Tytuł**
Tworzenie nowej wizyty
**Warunki wstępne**
Użytkownik zalogowany, istnieją klienci, zwierzęta i lekarze
**Kroki**
1. Przejdź do strony Wizyty
2. Kliknij "Nowa wizyta"
3. Wybierz klienta, zwierzę, lekarza
4. Ustaw datę i godzinę
5. Kliknij "Utwórz wizytę"
**Oczekiwany rezultat**
Wizyta pojawia się na liście z wybraną datą

### TC-06: Anulowanie wizyty (> 72h przed)
**ID**
TC-06
**Tytuł**
Anulowanie wizyty więcej niż 72h przed terminem
**Warunki wstępne**
Istnieje wizyta zaplanowana za więcej niż 72h
**Kroki**
1. Znajdź wizytę na liście
2. Kliknij ikonę kosza
3. Sprawdź informację o anulowaniu
4. Potwierdź anulowanie
**Oczekiwany rezultat**
Wizyta zostaje anulowana bez opłaty, komunikat "Bezpłatne anulowanie"

### TC-07: Przeglądanie szczepień zwierzęcia
**ID**
TC-07
**Tytuł**
Przeglądanie historii szczepień
**Warunki wstępne**
Użytkownik zalogowany, istnieje zwierzę ze szczepieniami
**Kroki**
1. Przejdź do strony Zwierzęta
2. Kliknij ikonę strzykawki przy wybranym zwierzęciu
**Oczekiwany rezultat**
Wyświetla się modal z listą szczepień i ich statusami

### TC-08: Kalkulator wieku psa
**ID**
TC-08
**Tytuł**
Obliczanie wieku psa w latach ludzkich
**Warunki wstępne**
Użytkownik zalogowany, na stronie Kalkulatory
**Kroki**
1. Wybierz zakładkę "Wiek zwierzęcia"
2. Gatunek: Pies
3. Lata: 5, Miesiące: 0
4. Waga: 30 kg
5. Kliknij "Oblicz"
**Oczekiwany rezultat**
Wyświetla się wynik ~36-40 lat ludzkich, etap życia "Dorosły"

### TC-09: Kalkulator dawkowania leków
**ID**
TC-09
**Tytuł**
Obliczanie dawki Amoksycyliny
**Warunki wstępne**
Użytkownik zalogowany, na stronie Kalkulatory
**Kroki**
1. Wybierz zakładkę "Dawkowanie leków"
2. Lek: Amoksycylina (20 mg/kg)
3. Gatunek: Pies
4. Waga: 25 kg
5. Kliknij "Oblicz dawkę"
**Oczekiwany rezultat**
Wyświetla się dawka 500 mg (25 * 20 = 500, max_dose = 500)

### TC-10: Kalkulator BCS dla psa z nadwagą
**ID**
TC-10
**Tytuł**
Ocena BCS dla psa Labrador z nadwagą
**Warunki wstępne**
Użytkownik zalogowany, na stronie Kalkulatory
**Kroki**
1. Wybierz zakładkę "BCS (Kondycja)"
2. Gatunek: Pies
3. Rasa: Labrador
4. Waga: 40 kg
5. Kliknij "Oceń kondycję"
**Oczekiwany rezultat**
BCS 7-8 (Nadwaga/Otyłość), idealna waga ~32 kg, zalecenia dietetyczne

---

## Dokumentacja API (Swagger UI)

**Interaktywna dokumentacja API dostępna pod adresem:**

### 🔗 **http://localhost:3001/api-docs**

Swagger UI pozwala na:
- ✅ Przeglądanie wszystkich endpointów z pełną specyfikacją
- ✅ Testowanie requestów bezpośrednio z przeglądarki
- ✅ Podgląd schematów request/response (JSON)
- ✅ Autoryzację JWT (przycisk "Authorize")
- ✅ Eksport specyfikacji OpenAPI

### 🔐 Jak uzyskać token JWT dla testów w Swagger:

1. Otwórz Swagger UI: http://localhost:3001/api-docs
2. Znajdź endpoint **POST /api/auth/login** (sekcja "Auth")
3. Kliknij "Try it out"
4. Wprowadź dane:
   ```json
   {
     "email": "recepcja@vetcrm.pl",
     "password": "Recepcja123!"
   }
   ```
5. Kliknij "Execute"
6. Skopiuj wartość `token` z Response
7. Kliknij przycisk **"Authorize"** (góra strony, ikona kłódki)
8. W polu wartości wklej: `Bearer <twoj-token>`
9. Kliknij "Authorize" i "Close"
10. Teraz możesz testować wszystkie chronione endpointy! 🎉

---

## Dokumentacja API (tabele)

### Autoryzacja
| Metoda | Endpoint | Opis |
|--------|----------|------|
| POST | /api/auth/login | Logowanie |
| GET | /api/auth/profile | Profil użytkownika |

### Klienci
| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | /api/clients | Lista klientów |
| GET | /api/clients/:id | Szczegóły klienta |
| POST | /api/clients | Dodaj klienta |
| PUT | /api/clients/:id | Edytuj klienta |
| DELETE | /api/clients/:id | Usuń klienta |

### Zwierzęta
| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | /api/pets | Lista zwierząt |
| GET | /api/pets/:id | Szczegóły zwierzęcia |
| GET | /api/pets/:id/vaccinations | Szczepienia zwierzęcia |
| POST | /api/pets | Dodaj zwierzę |
| PUT | /api/pets/:id | Edytuj zwierzę |

### Wizyty
| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | /api/appointments | Lista wizyt |
| GET | /api/appointments/:id | Szczegóły wizyty |
| GET | /api/appointments/slots | Dostępne sloty |
| POST | /api/appointments | Utwórz wizytę |
| PUT | /api/appointments/:id | Edytuj wizytę |
| DELETE | /api/appointments/:id | Anuluj wizytę |

### Lekarze
| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | /api/doctors | Lista lekarzy |
| GET | /api/doctors/:id | Szczegóły lekarza |
| GET | /api/doctors/:id/schedule | Harmonogram lekarza |
| GET | /api/doctors/:id/availability | Dostępność lekarza |

### Kalkulatory
| Metoda | Endpoint | Opis |
|--------|----------|------|
| POST | /api/calculators/pet-age | Oblicz wiek zwierzęcia |
| POST | /api/calculators/dosage | Oblicz dawkowanie |
| POST | /api/calculators/bmi | Oblicz BCS |
| GET | /api/calculators/medications | Lista leków |
| GET | /api/calculators/breeds | Lista ras |

---

## Licencja

Projekt wykonany na potrzeby przedmiotu "Testowanie i jakość oprogramowania 2".

**Autor:** Bartłomiej Król
