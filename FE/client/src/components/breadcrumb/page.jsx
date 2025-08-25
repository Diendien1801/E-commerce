import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './breadcrumb.css';

const Breadcrumb = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const pathnames = location.pathname.split('/').filter(x => x);
    const [productName, setProductName] = useState('');
    const [categoryName, setCategoryName] = useState('');

    // Không hiển thị breadcrumb ở trang home
    if (location.pathname === '/') {
        return null;
    }

    // Fetch product name nếu đang ở trang view-product
    useEffect(() => {
        const fetchData = async () => {
            // Fetch product name cho trang view-product
            if (pathnames.length === 2 && pathnames[0] === 'view-product') {
                const productId = pathnames[1];
                try {
                    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products/${productId}`);
                    const data = await response.json();
                    if (data.success !== false && data.data) {
                        setProductName(data.data.title || data.data.name || 'Product');
                    }
                } catch (error) {
                    console.error('Error fetching product:', error);
                    setProductName('Product Details');
                }
            }

            // Fetch category name cho trang category
            if (pathnames.length >= 2 && pathnames[0] === 'category') {
                const categoryId = pathnames[1];
                try {
                    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories/${categoryId}`);
                    const data = await response.json();
                    if (data.success !== false && data.data) {
                        setCategoryName(data.data.name || 'Category');
                    }
                } catch (error) {
                    console.error('Error fetching category:', error);
                    setCategoryName('Category');
                }
            }
        };

        fetchData();
    }, [pathnames]);

    // Function để tạo breadcrumb path dựa trên referrer hoặc logic routing
const getBreadcrumbPath = () => {
    // Nếu là trang view-product, cần xử lý đặc biệt
    if (pathnames[0] === 'view-product' && pathnames.length === 2) {
        const previousPage = sessionStorage.getItem('previousPage') || document.referrer;
        
        if (previousPage && previousPage.includes('/products')) {
            return [
                { name: 'products', displayName: t('breadcrumb.products', 'Sản phẩm'), route: '/products' },
                { name: pathnames[1], displayName: productName, route: null, isProduct: true }
            ];
        } else {
            return [
                { name: pathnames[1], displayName: productName, route: null, isProduct: true }
            ];
        }
    }

    // Nếu là trang profile với ID, chỉ hiển thị "Tài khoản"
    if (pathnames[0] === 'profile' && pathnames.length === 2) {
        return [
            { name: 'profile', displayName: t('breadcrumb.profile', 'Tài khoản'), route: null }
        ];
    }

    // Xử lý các trang khác bình thường
    return pathnames.map((name, index) => {
        const route = `/${pathnames.slice(0, index + 1).join('/')}`;
        let displayName = name;

        // Xử lý display name
        if (pathnames[0] === 'category' && index === 1 && categoryName) {
            displayName = categoryName;
        } else if (pathnames[0] === 'profile' && index === 1) {
            // Bỏ qua ID trong profile, không hiển thị
            return null;
        } else {
            const translationMap = {
                'products': 'breadcrumb.products',
                'cart': 'breadcrumb.cart',
                'checkout': 'breadcrumb.checkout',
                'profile': 'breadcrumb.profile',
                'order': 'breadcrumb.orders',
                'favourite': 'breadcrumb.favorites',
                'search': 'breadcrumb.search',
                'category': 'breadcrumb.category',
                'about': 'breadcrumb.about',
                'contact': 'breadcrumb.contact'
            };
            displayName = t(translationMap[name] || `breadcrumb.${name}`, name);
        }

        return {
            name,
            displayName,
            route: index === pathnames.length - 1 ? null : route
        };
    }).filter(Boolean); // Lọc bỏ null items
};

    const breadcrumbItems = getBreadcrumbPath();

    return (
        <nav className="breadcrumb-container">
            <div className="breadcrumb-wrapper">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/" className="breadcrumb-link">
                            {t('breadcrumb.home', 'Trang chủ')}
                        </Link>
                    </li>
                    {breadcrumbItems.map((item, index) => {
                        const isLast = index === breadcrumbItems.length - 1;

                        return (
                            <li key={`${item.name}-${index}`} className="breadcrumb-item">
                                <span className="breadcrumb-separator">/</span>
                                {!isLast && item.route ? (
                                    <Link to={item.route} className="breadcrumb-link">
                                        {item.displayName}
                                    </Link>
                                ) : (
                                    <span className="breadcrumb-current">
                                        {item.displayName}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </div>
        </nav>
    );
};

export default Breadcrumb;