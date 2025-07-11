import './footer.css';
import logo from './footer.png';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-flex">
                <div className="footer-col footer-logo-col">
                    <img src={logo} alt="Footer Logo" className="footer-logo" />
                </div>
                <div className="footer-col footer-info-col">
                    <h3 className="footer-heading">Thông tin</h3>
                    <ul className="footer-list">
                        <li>Điều Khoản Giao Dịch</li>
                        <li>Hướng Dẫn Thanh Toán</li>
                        <li>Chính Sách Giao Hàng</li>
                        <li>Câu Hỏi Thường Gặp</li>
                    </ul>
                </div>
                <div className="footer-col footer-social-col">
                    <h3 className="footer-heading">Follow us</h3>
                    <div className="footer-social-links">
                        <a href="#" className="social-link">Facebook</a>
                        <a href="#" className="social-link">Twitter</a>
                        <a href="#" className="social-link">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
