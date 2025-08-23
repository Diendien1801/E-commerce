import './footer.css';
import footerLogo from './footerLogo.png';
import facebookIcon from './FB.png';
import instagramIcon from './IG.png';
import youtubeIcon from './YT.png';
import twitterIcon from './X.png';
import tiktokIcon from './Tiktok.png';
import footerBank from './footerBank.png';
import boCongThuong from './boCongThuong.png';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="footer">
            {/* Main Footer Content */}
            <div className="footer-flex">
                {/* Cột 0: LOGO */}
                <div className="footer-col footer-logo-col">
                    <img src={footerLogo} alt="Footer Logo" className="footer-logo" />
                   
                </div>

                {/* Cột 1: THÔNG TIN */}
                <div className="footer-col footer-info-col">
                    <h3 className="footer-heading">{t('info')}</h3>
                    <ul className="footer-list">
                        <li><a href="/payment-guide">{t('paymentGuide')}</a></li>
                        <li><a href="/payment-policy">{t('paymentPolicy')}</a></li>
                        <li><a href="/shipping-policy">{t('shippingPolicy')}</a></li>
                        <li><a href="/privacy-policy">{t('privacyPolicy')}</a></li>
                        <li><a href="/faq">{t('faq')}</a></li>
                        <li><a href="/contact">{t('contact')}</a></li>
                    </ul>
                </div>

                {/* Cột 2: SẢN PHẨM */}
                <div className="footer-col footer-product-col">
                    <h3 className="footer-heading">{t('products')}</h3>
                    <ul className="footer-list">
                        <li><a href="/shop?category=1">{t('footerTimesExclusives')}</a></li>
                        <li><a href="/shop?category=1">{t('footerNewArrivals')}</a></li>
                        <li><a href="/shop?category=102">{t('footerCdDvd')}</a></li>
                        <li><a href="/shop?category=104">{t('footerVinyl')}</a></li>
                        <li><a href="/shop?category=103">{t('footerCassette')}</a></li>
                        <li><a href="/shop?category=1">{t('footerIndieCity')}</a></li>
                    </ul>
                </div>

                {/* Cột 3: FOLLOW US */}
                <div className="footer-col footer-social-col">
                    <h3 className="footer-heading">FOLLOW US</h3>
                    
                    {/* Social Icons Row */}
                    <div className="social-icons-row">
                        <a href="#" className="social-icon facebook-icon" aria-label="Facebook">
                            <img src={facebookIcon} alt="Facebook" />
                        </a>
                        <a href="#" className="social-icon instagram-icon" aria-label="Instagram">
                            <img src={instagramIcon} alt="Instagram" />
                        </a>
                        <a href="#" className="social-icon youtube-icon" aria-label="YouTube">
                            <img src={youtubeIcon} alt="YouTube" />
                        </a>
                        <a href="#" className="social-icon twitter-icon" aria-label="Twitter">
                            <img src={twitterIcon} alt="Twitter" />
                        </a>
                        <a href="#" className="social-icon tiktok-icon" aria-label="TikTok">
                            <img src={tiktokIcon} alt="TikTok" />
                        </a>
                    </div>

                   
                </div>
            </div>

            {/* Footer Bottom - Red Section */}
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <div className="company-info">
                        <p className="company-name">
                            <strong>© TIMES RECORDS LABEL CO., LTD</strong> | Của hàng chính hãng do <strong>HKD Thời Đại</strong> vận hành
                        </p>
                        <p className="company-address">
                            <strong>Địa chỉ:</strong> Số 6 Nguyễn Văn Nguyễn, Phường Tân Định, TP. Hồ Chí Minh
                        </p>
                        <p className="company-contact">
                            <strong>Số điện thoại:</strong> 0903088038 
                            <strong> Email:</strong> sales@hangdiathoidal.com
                        </p>
                        <p className="company-license">
                            <strong>Số ĐKKD:</strong> 8214597395-001, cấp ngày 14/12/2024 tại Phòng TC-KH, UBND Phường Sài Gòn
                        </p>
                    </div>

                    <div className="footer-certifications">
                        {/* Certification Badge */}
                        <div className="certification-badge">
                            <img src={boCongThuong} alt="Bộ Công Thương" className="certification-logo" />
                        </div>

                        {/* Payment Methods */}
                        <div className="payment-methods">
                            <img src={footerBank} alt="Payment Methods" className="payment-banks" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;