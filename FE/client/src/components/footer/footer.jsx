import './footer.css';
import logo from './footer.png';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t, i18n } = useTranslation();
    return (
        <footer className="footer">
            <div className="footer-flex">
                <div className="footer-col footer-logo-col">
                    <img src={logo} alt="Footer Logo" className="footer-logo" />
                </div>
                <div className="footer-col footer-info-col">
                    <h3 className="footer-heading">{t('info')}</h3>
                    <ul className="footer-list">
                        <li>{t('terms')}</li>
                        <li>{t('paymentGuide')}</li>
                        <li>{t('shippingPolicy')}</li>
                        <li>{t('faq')}</li>
                    </ul>
                </div>
                <div className="footer-col footer-social-col">
                    <h3 className="footer-heading">{t('followUs')}</h3>
                    <div className="footer-social-links">
                        <a href="#" className="social-link">Facebook</a>
                        <a href="#" className="social-link">Twitter</a>
                        <a href="#" className="social-link">Instagram</a>
                    </div>
                </div>
            </div>
            {/* <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button onClick={() => i18n.changeLanguage('en')} style={{ marginRight: 8 }}>EN</button>
                <button onClick={() => i18n.changeLanguage('vi')}>VI</button>
            </div> */}
        </footer>
    );
}

export default Footer;
