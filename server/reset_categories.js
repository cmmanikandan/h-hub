import { Category, sequelize } from './db.js';

async function resetCategories() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database');

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

        await Category.destroy({ where: {} });
        console.log('✅ Deleted all existing categories');

        await Category.bulkCreate(newCategories);
        newCategories.forEach((cat) => console.log(`✅ Added category: ${cat.name}`));

        console.log('\n🎉 All categories updated successfully!');
    } finally {
        await sequelize.close();
    }
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
