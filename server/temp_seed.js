import { products } from '../src/data/products.js';
import axios from 'axios';

const seed = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/seed', { products });
        console.log(res.data.message);
    } catch (error) {
        console.error('Seed failed:', error.response?.data || error.message);
    }
};

seed();
