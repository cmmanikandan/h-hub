import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetCategories() {
    return new Promise((resolve, reject) => {
        const dbPath = path.join(__dirname, 'hub_db.sqlite');
        const database = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error connecting to database:', err);
                reject(err);
                return;
            }

            console.log('Connected to database');

            // Delete all existing categories
            database.run('DELETE FROM Categories', (err) => {
                if (err) {
                    console.error('Error deleting categories:', err);
                    reject(err);
                    return;
                }

                console.log('✅ Deleted all existing categories');

                // Insert new categories
                const newCategories = [
                    { name: 'Mobiles', description: 'Smartphones and mobile devices' },
                    { name: 'Laptop', description: 'Laptops and portable computers' },
                    { name: 'Speaker', description: 'Audio speakers and sound systems' },
                    { name: 'Fashion', description: 'Clothing and apparel' },
                    { name: 'Accessories', description: 'Tech and fashion accessories' },
                    { name: 'Lighting', description: 'Lights and lighting solutions' },
                    { name: 'Watches', description: 'Smartwatches and timepieces' },
                    { name: 'Headphones', description: 'Earphones and headsets' },
                    { name: 'Tablets', description: 'Tablets and iPad devices' },
                    { name: 'Cameras', description: 'Digital cameras and photography' },
                    { name: 'Gaming', description: 'Gaming consoles and accessories' },
                    { name: 'Home', description: 'Home decor and furniture' }
                ];

                let insertedCount = 0;

                newCategories.forEach((cat) => {
                    database.run(
                        'INSERT INTO Categories (name, description, createdAt, updatedAt) VALUES (?, ?, datetime("now"), datetime("now"))',
                        [cat.name, cat.description],
                        (err) => {
                            if (err) {
                                console.error('Error inserting category:', err);
                                reject(err);
                                return;
                            }
                            insertedCount++;
                            console.log(`✅ Added category: ${cat.name}`);

                            if (insertedCount === newCategories.length) {
                                console.log('\n🎉 All categories updated successfully!');
                                database.close();
                                resolve();
                            }
                        }
                    );
                });
            });
        });
    });
}

resetCategories()
    .then(() => {
        console.log('Done!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });
