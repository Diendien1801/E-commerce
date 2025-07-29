import React, { useEffect, useRef, useState } from 'react';
// import banner1 from'./banner1.png';
// import banner2 from './banner2.png';
// import banner3 from './banner3.png'; 
import './banner.css';

const banner1 = 'https://theme.hstatic.net/1000304920/1001307865/14/slide_logo_3.jpg?v=466';
const banner2 = 'https://theme.hstatic.net/1000304920/1001307865/14/slide_logo_4.jpg?v=466';
const banner3 = 'https://theme.hstatic.net/1000304920/1001307865/14/slide_logo_2.jpg?v=466';

const bannerImages = [
  banner1,
  banner2,
  banner3
];

const Banner = () => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % bannerImages.length);
    }, 3000);
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  const prevBanner = () => {
    setCurrent((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };
  const nextBanner = () => {
    setCurrent((prev) => (prev + 1) % bannerImages.length);
  };

  return (
    <div className="banner-slider">
      <button className="banner-arrow left" onClick={prevBanner} aria-label="Previous banner"><i class="bi bi-arrow-left"></i></button>
      <div
        className="banner-images"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {bannerImages.map((src, idx) => (
          <img src={src} alt={`Banner ${idx + 1}`} className="banner-img" key={src} />
        ))}
      </div>
      <button className="banner-arrow right" onClick={nextBanner} aria-label="Next banner"><i class="bi bi-arrow-right"></i></button>
    </div>
  );
};

export default Banner;
