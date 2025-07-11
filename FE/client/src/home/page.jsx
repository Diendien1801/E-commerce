import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import Banner from '../components/banner/banner';

import ProductCard from '../components/product-card/card';

import './home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5000/api/products') 
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                console.log(data);
            })
            .catch(err => console.error('Failed to fetch products:', err));
    }, []);

    const filterAndSlice = (filterFn) => products.filter(filterFn).slice(0, 5);

    const available = products.slice(0, 10);
    // const trending = filterAndSlice(p => p.category === 'trending');
    // const newArrival = filterAndSlice(p => p.category === 'new');
    // const sale = filterAndSlice(p => p.category === 'sale');

    return (
        <div className='container'>
            <Navbar />
            <div className="home-page">
                <Banner />
                <div className="product-sections">
                    <section className="product-section">
                        <div className="section-header">
                            <h2>Available</h2>
                            <button className="show-all-btn" onClick ={() => navigate('../shop/')}>Show All Products &gt;</button>
                        </div>

                        <div className="product-list">
                            {available.map(p => (
                                <ProductCard product={p} key={p._id} />
                            ))}
                        </div>

                    </section>
                    {/* <section className="product-section">
                        <h2>Trending</h2>
                        <div className="product-list">
                            {trending.map(renderProduct)}
                        </div>
                    </section>
                    <section className="product-section">
                        <h2>New Arrival</h2>
                        <div className="product-list">
                            {newArrival.map(renderProduct)}
                        </div>
                    </section>
                    <section className="product-section">
                        <h2>Sale</h2>
                        <div className="product-list">
                            {sale.map(renderProduct)}
                        </div>
                    </section> */}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Home;