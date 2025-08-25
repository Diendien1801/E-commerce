import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import './text-pages.css';

const ContactText = () => {
	const { i18n } = useTranslation();
	const isVI = i18n.language === 'vi';
	return (
			<>
				<Navbar />
				<div className="text-page-center">
					{isVI ? (
						<>
							<h2><strong>Liên hệ &amp; Hỗ trợ</strong></h2>
							<p>Nếu bạn có bất kỳ câu hỏi nào về sản phẩm, đơn hàng, hoặc cần hỗ trợ đổi trả, huỷ đơn, vui lòng liên hệ với chúng tôi qua các kênh sau:</p>
							<ul>
								<li>Email: <a href="mailto:support@ecommerce.com">support@ecommerce.com</a></li>
								<li>Hotline: <a href="tel:0123456789">0123 456 789</a></li>
								<li>Fanpage: <a href="https://facebook.com/ecommerce">facebook.com/ecommerce</a></li>
							</ul>
							<p>Chúng tôi sẽ phản hồi trong vòng 24h làm việc. Xin cảm ơn!</p>
						</>
					) : (
						<>
							<h2><strong>Contact &amp; Support</strong></h2>
							<p>If you have any questions about products, orders, or need help with returns or cancellations, please contact us via:</p>
							<ul>
								<li>Email: <a href="mailto:support@ecommerce.com">support@ecommerce.com</a></li>
								<li>Hotline: <a href="tel:0123456789">0123 456 789</a></li>
								<li>Fanpage: <a href="https://facebook.com/ecommerce">facebook.com/ecommerce</a></li>
							</ul>
							<p>We will respond within 24 business hours. Thank you!</p>
						</>
					)}
				</div>
				<Footer />
				</>
	);
};

export default ContactText;
