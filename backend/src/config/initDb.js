/**
 * Database Initialization Script
 *
 * Creates tables and seeds initial data
 *
 * Run: npm run db:init
 *
 * @author Bartłomiej Król
 */

const bcrypt = require('bcrypt');
const { query, initializeSchema, closeDatabase, pool } = require('./database');

async function waitForDatabase() {
  let retries = 10;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connected.');
      return;
    } catch (err) {
      console.log(`Waiting for database... (${retries} retries left)`);
      retries--;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  throw new Error('Could not connect to database');
}

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    await waitForDatabase();

    // Ensure schema exists first
    await initializeSchema();
    console.log('Schema verified.');

    // Clear existing data to prevent duplication
    const connection = await pool.getConnection();
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      const tables = ['vaccinations', 'appointments', 'working_hours', 'pets', 'clients', 'doctors', 'users', 'medications', 'breed_weights'];
      for (const table of tables) {
        // Check if table exists before truncating to avoid errors on fresh init
        const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          await connection.query(`TRUNCATE TABLE ${table}`);
        }
      }
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('Tables truncated for clean seed.');
    } finally {
      connection.release();
    }

    // Seed receptionist user
    const passwordHash = await bcrypt.hash('Recepcja123!', 10);

    await query(`
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES (?, ?, ?, ?)
    `, ['recepcja@vetcrm.pl', passwordHash, 'Anna', 'Kowalska']);
    console.log('Receptionist user created.');

    // Seed doctors
    const doctors = [
      { first_name: 'Jan', last_name: 'Nowak', specialization: 'Chirurgia', email: 'jan.nowak@vetcrm.pl', phone: '601234567' },
      { first_name: 'Maria', last_name: 'Wiśniewska', specialization: 'Dermatologia', email: 'maria.wisniewska@vetcrm.pl', phone: '602345678' },
      { first_name: 'Piotr', last_name: 'Kowalczyk', specialization: 'Kardiologia', email: 'piotr.kowalczyk@vetcrm.pl', phone: '603456789' }
    ];

    for (const doc of doctors) {
      await query(`
            INSERT INTO doctors (first_name, last_name, specialization, email, phone)
            VALUES (?, ?, ?, ?, ?)
        `, [doc.first_name, doc.last_name, doc.specialization, doc.email, doc.phone]);
    }
    console.log('Doctors seeded.');

    // Seed working hours (Mon-Fri 8:00-16:00 for all doctors)
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const doctorRows = await query('SELECT id FROM doctors');

    for (const doc of doctorRows) {
      for (const day of days) {
        await query(`
          INSERT INTO working_hours (doctor_id, day_of_week, start_time, end_time)
          VALUES (?, ?, ?, ?)
          `, [doc.id, day, '08:00:00', '16:00:00']);
      }
    }
    console.log('Working hours seeded.');

    // Seed clients
    const clients = [
      { first_name: 'Adam', last_name: 'Malinowski', email: 'adam.malinowski@email.pl', phone: '501234567', address: 'ul. Kwiatowa 15, Warszawa' },
      { first_name: 'Ewa', last_name: 'Zielińska', email: 'ewa.zielinska@email.pl', phone: '502345678', address: 'ul. Słoneczna 22, Kraków' },
      { first_name: 'Tomasz', last_name: 'Wójcik', email: 'tomasz.wojcik@email.pl', phone: '503456789', address: 'ul. Polna 8, Gdańsk' }
    ];

    for (const client of clients) {
      await query(`
          INSERT INTO clients (first_name, last_name, email, phone, address)
          VALUES (?, ?, ?, ?, ?)
       `, [client.first_name, client.last_name, client.email, client.phone, client.address]);
    }
    console.log('Clients seeded.');

    // Seed pets
    // Get client IDs mapping
    const clientRows = await query('SELECT id, email FROM clients');
    const clientMap = clientRows.reduce((acc, row) => ({ ...acc, [row.email]: row.id }), {});

    const pets = [
      { client_email: 'adam.malinowski@email.pl', name: 'Burek', species: 'dog', breed: 'Labrador', date_of_birth: '2020-03-15', weight: 32.5, sex: 'male', color: 'Złoty', microchip_id: '616093901234567', notes: 'Bardzo energiczny, lubi wodę' },
      { client_email: 'adam.malinowski@email.pl', name: 'Mruczek', species: 'cat', breed: 'Europejski', date_of_birth: '2019-06-20', weight: 4.2, sex: 'male', color: 'Szary w paski', microchip_id: '616093902345678', notes: 'Spokojny, nie lubi psów' },
      { client_email: 'ewa.zielinska@email.pl', name: 'Luna', species: 'dog', breed: 'Golden Retriever', date_of_birth: '2021-01-10', weight: 28.0, sex: 'female', color: 'Złoty jasny', microchip_id: '616093903456789', notes: 'Łagodna, świetna z dziećmi' },
      { client_email: 'ewa.zielinska@email.pl', name: 'Puszek', species: 'cat', breed: 'Perski', date_of_birth: '2018-09-05', weight: 5.8, sex: 'male', color: 'Biały', microchip_id: '616093904567890', notes: 'Wymaga regularnej pielęgnacji sierści' },
      { client_email: 'tomasz.wojcik@email.pl', name: 'Max', species: 'dog', breed: 'Owczarek Niemiecki', date_of_birth: '2019-11-22', weight: 38.0, sex: 'male', color: 'Czarno-brązowy', microchip_id: '616093905678901', notes: 'Doskonale wyszkolony, posłuszny' }
    ];

    for (const pet of pets) {
      const clientId = clientMap[pet.client_email];
      if (clientId) {
        await query(`
          INSERT INTO pets (client_id, name, species, breed, date_of_birth, weight, sex, color, microchip_id, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [clientId, pet.name, pet.species, pet.breed, pet.date_of_birth, pet.weight, pet.sex, pet.color, pet.microchip_id, pet.notes]);
      }
    }
    console.log('Pets seeded.');

    // Seed medications
    const medications = [
      { name: 'Amoksycylina', dose_per_kg: 20, unit: 'mg', max_dose: 500, min_weight: 1, species: 'all', notes: 'Antybiotyk szerokiego spektrum' },
      { name: 'Metacam (Meloksykam)', dose_per_kg: 0.2, unit: 'mg', max_dose: 15, min_weight: 2, species: 'dog', notes: 'Przeciwzapalny, przeciwbólowy' },
      { name: 'Metacam (Meloksykam) - koty', dose_per_kg: 0.1, unit: 'mg', max_dose: 1.5, min_weight: 2, species: 'cat', notes: 'Przeciwzapalny dla kotów' },
      { name: 'Prednizolon', dose_per_kg: 1, unit: 'mg', max_dose: 60, min_weight: 1, species: 'all', notes: 'Kortykosteroid' },
      { name: 'Metronidazol', dose_per_kg: 15, unit: 'mg', max_dose: 750, min_weight: 2, species: 'all', notes: 'Przeciwbakteryjny, przeciwpierwotniakowy' },
      { name: 'Cefaleksyna', dose_per_kg: 25, unit: 'mg', max_dose: 1000, min_weight: 1, species: 'all', notes: 'Antybiotyk cefalosporynowy' },
      { name: 'Gabapentyna', dose_per_kg: 10, unit: 'mg', max_dose: 600, min_weight: 2, species: 'all', notes: 'Przeciwbólowy, przeciwdrgawkowy' },
      { name: 'Tramadol', dose_per_kg: 5, unit: 'mg', max_dose: 200, min_weight: 5, species: 'dog', notes: 'Opioidowy lek przeciwbólowy' }
    ];

    for (const med of medications) {
      await query(`
        INSERT INTO medications (name, dose_per_kg, unit, max_dose, min_weight, species, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [med.name, med.dose_per_kg, med.unit, med.max_dose, med.min_weight, med.species, med.notes]);
    }
    console.log('Medications seeded.');

    // Seed breed weights
    const breedWeights = [
      // Dogs - small
      { species: 'dog', breed: 'Chihuahua', min_weight: 1.5, ideal_weight: 2.5, max_weight: 3.5, size_category: 'small' },
      { species: 'dog', breed: 'Yorkshire Terrier', min_weight: 2, ideal_weight: 3, max_weight: 4, size_category: 'small' },
      { species: 'dog', breed: 'Maltańczyk', min_weight: 2, ideal_weight: 3.5, max_weight: 4.5, size_category: 'small' },
      { species: 'dog', breed: 'Labrador', min_weight: 25, ideal_weight: 32, max_weight: 38, size_category: 'large' },
      { species: 'cat', breed: 'Europejski', min_weight: 3.5, ideal_weight: 4.5, max_weight: 6, size_category: 'medium' }
    ];

    for (const bw of breedWeights) {
      await query(`
        INSERT INTO breed_weights (species, breed, min_weight, ideal_weight, max_weight, size_category)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [bw.species, bw.breed, bw.min_weight, bw.ideal_weight, bw.max_weight, bw.size_category]);
    }
    console.log('Breed weights seeded.');

    console.log('\n✅ Database seeded successfully!');
    console.log('Login credentials: recepcja@vetcrm.pl / Recepcja123!');
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
    process.exit(0);
  }
}

seedDatabase();
