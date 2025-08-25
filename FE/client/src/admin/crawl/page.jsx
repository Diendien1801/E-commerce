import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './crawl.css';

const CrawlerPage = () => {
  const { t } = useTranslation();
  const [crawlerStatus, setCrawlerStatus] = useState({
    isRunning: false,
    startTime: null,
    endTime: null,
    progress: 0,
    currentCategory: '',
    totalProducts: 0,
    processedProducts: 0,
    errors: []
  });
  
  const [categories, setCategories] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    outOfStockProducts: 0,
    avgPrice: 0,
    todayProducts: 0
  });
  const statusInterval = useRef(null);

  // Log filtering states
  const [logFilter, setLogFilter] = useState({
    level: '',
    type: '',
    limit: 100
  });

  // API base URL
  const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api/crawl`;

  // Fetch crawler status
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      const data = await response.json();
      if (data.success) {
        setCrawlerStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };
const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (logFilter.level) params.append('level', logFilter.level);
      if (logFilter.type) params.append('type', logFilter.type);
      if (logFilter.limit) params.append('limit', logFilter.limit);

      const response = await fetch(`${API_BASE}/logs?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setLogs(data.data.logs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, [logFilter]);

  // Stop polling (bọc useCallback)
  const stopStatusPolling = useCallback(() => {
    if (statusInterval.current) {
      clearInterval(statusInterval.current);
      statusInterval.current = null;
    }
  }, []);
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch product statistics
  const fetchProductStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/products/stats`);
      const data = await response.json();
      if (data.success) {
        setProductStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching product stats:', error);
    }
  };

  

  // Start crawler
  const startCrawler = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        startStatusPolling();
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Lỗi kết nối: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Stop crawler
  const stopCrawler = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_BASE}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        stopStatusPolling();
        fetchStatus();
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Lỗi kết nối: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  

  const startStatusPolling = () => {
  if (statusInterval.current) clearInterval(statusInterval.current);
  statusInterval.current = setInterval(() => {
    fetchStatus();
    fetchLogs();
  }, 2000);
};

  

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Format duration
  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end - start;
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return '0₫';
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  // Get status indicator class
  const getStatusClass = () => {
    if (crawlerStatus.isRunning) return 'status-running';
    if (crawlerStatus.startTime && !crawlerStatus.endTime) return 'status-pending';
    return 'status-stopped';
  };

  // Get status text
  const getStatusText = () => {
    if (crawlerStatus.isRunning) return t('crawl.running', 'Running');
    if (crawlerStatus.startTime && !crawlerStatus.endTime) return t('crawl.processing', 'Processing...');
    return t('crawl.stopped', 'Stopped');
  };

  // Get log level class
  const getLogLevelClass = (level) => {
    switch (level) {
      case 'success': return 'log-success';
      case 'error': return 'log-error';
      case 'warning': return 'log-warning';
      case 'info': return 'log-info';
      default: return 'log-info';
    }
  };

  // Get log type icon
  const getLogTypeIcon = (type) => {
    switch (type) {
      case 'product': return '🎵';
      case 'category': return '📁';
      case 'page': return '📄';
      case 'inventory': return '📦';
      case 'system': return '⚙️';
      case 'summary': return '📊';
      default: return 'ℹ️';
    }
  };

  // Handle log filter change
  const handleLogFilterChange = (field, value) => {
    setLogFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };
useEffect(() => {
  const interval = setInterval(() => {
    fetchLogs();
  }, 3000);
  return () => clearInterval(interval);
}, [fetchLogs]);
  // Initialize data
  useEffect(() => {
  fetchStatus();
  fetchCategories();
  fetchProductStats();
  fetchLogs();

  return () => {
    stopStatusPolling();
  };
}, [fetchLogs, stopStatusPolling]);

useEffect(() => {
  fetchLogs();
}, [logFilter, fetchLogs]);

  return (
    <div className="container">
      {/* Product Statistics */}
      <div className="stats-section">
        <h2>{t('crawl.productStats', 'Product Statistics')}</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{productStats.totalProducts.toLocaleString()}</div>
            <div className="stat-label">{t('crawl.totalProducts', 'Total Products')}</div>
          </div>
          
        
          
          <div className="stat-card">
            <div className="stat-value">{formatPrice(productStats.avgPrice)}</div>
            <div className="stat-label">{t('crawl.avgPrice', 'Average Price')}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{productStats.todayProducts.toLocaleString()}</div>
            <div className="stat-label">{t('crawl.todayProducts', 'Added Today')}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{formatDate(productStats.lastUpdated)}</div>
            <div className="stat-label">{t('crawl.lastUpdated', 'Last Updated')}</div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="control-section">
        <h2>{t('crawl.controlPanel', 'Crawler Control')}</h2>
        
        {message && (
          <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="control-buttons">
          <button
            className="btn btn-primary"
            onClick={startCrawler}
            disabled={crawlerStatus.isRunning || loading}
          >
            {loading ? t('crawl.processing', 'Processing...') : t('crawl.start', 'Start Crawl')}
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={stopCrawler}
            disabled={!crawlerStatus.isRunning || loading}
          >
            {loading ? t('crawl.processing', 'Processing...') : t('crawl.stop', 'Stop Crawl')}
          </button>
        </div>

        <div className="status-display">
          <span className={`status-badge ${getStatusClass()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Crawler Status */}
      <div className="status-section">
        <h2>{t('crawl.status', 'Crawler Status')}</h2>
        
        <div className="status-grid">
          <div className="status-item">
            <div className="status-label">{t('crawl.startTime', 'Start Time')}</div>
            <div className="status-value">{formatDate(crawlerStatus.startTime)}</div>
          </div>
          
          <div className="status-item">
            <div className="status-label">{t('crawl.endTime', 'End Time')}</div>
            <div className="status-value">{formatDate(crawlerStatus.endTime)}</div>
          </div>
          
          <div className="status-item">
            <div className="status-label">{t('crawl.duration', 'Duration')}</div>
            <div className="status-value">
              {formatDuration(crawlerStatus.startTime, crawlerStatus.endTime)}
            </div>
          </div>
          
          
          
          
          
          <div className="status-item">
            <div className="status-label">{t('crawl.errors', 'Errors')}</div>
            <div className="status-value">
              {crawlerStatus.errors.length}
            </div>
          </div>
        </div>

        
      </div>

      {/* Categories */}
      <div className="categories-section">
        <h2>{t('crawl.categories', 'Product Categories')}</h2>
        
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <h3>{category.name}</h3>
                <span className="category-count">{category.count.toLocaleString()}</span>
              </div>
              <div className="category-details">
                <span className="category-id">{t('crawl.categoryId', 'ID')}: {category.id}</span>
                {category.parentId && (
                  <span className="category-parent">{t('crawl.parentId', 'Parent')}: {category.parentId}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs Section */}
      <div className="logs-section">
        <h2>{t('crawl.logs', 'Crawler Logs')}</h2>
        
        {/* Log Filters */}
        <div className="log-filters">
          <div className="filter-group">
            <label>{t('crawl.level', 'Level')}:</label>
            <select 
              value={logFilter.level} 
              onChange={(e) => handleLogFilterChange('level', e.target.value)}
            >
              <option value="">{t('crawl.all', 'All')}</option>
              <option value="success">{t('crawl.success', 'Success')}</option>
              <option value="info">{t('crawl.info', 'Info')}</option>
              <option value="warning">{t('crawl.warning', 'Warning')}</option>
              <option value="error">{t('crawl.error', 'Error')}</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>{t('crawl.type', 'Type')}:</label>
            <select 
              value={logFilter.type} 
              onChange={(e) => handleLogFilterChange('type', e.target.value)}
            >
              <option value="">{t('crawl.all', 'All')}</option>
              <option value="product">{t('crawl.product', 'Product')}</option>
              <option value="category">{t('crawl.category', 'Category')}</option>
              <option value="page">{t('crawl.page', 'Page')}</option>
              <option value="inventory">{t('crawl.inventory', 'Inventory')}</option>
              <option value="system">{t('crawl.system', 'System')}</option>
              <option value="summary">{t('crawl.summary', 'Summary')}</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>{t('crawl.limit', 'Limit')}:</label>
            <select 
              value={logFilter.limit} 
              onChange={(e) => handleLogFilterChange('limit', e.target.value)}
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>
          
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setLogFilter({ level: '', type: '', limit: 100 });
            }}
          >
            {t('crawl.reset', 'Reset')}
          </button>
        </div>

        {/* Logs Display */}
        {logs.length === 0 ? (
          <div className="empty-logs">
            {t('crawl.noLogs', 'No logs yet')}
          </div>
        ) : (
          <div className="logs-list">
            {logs.map((log, index) => (
              <div key={index} className={`log-item ${getLogLevelClass(log.level)}`}>
                <div className="log-header">
                  <span className="log-type-icon">{getLogTypeIcon(log.type)}</span>
                  <span className={`log-level ${getLogLevelClass(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="log-timestamp">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
                <div className="log-message">
                  {log.message}
                </div>
                {log.data && (
                  <div className="log-data">
                    <details>
                      <summary>{t('crawl.details', 'Details')}</summary>
                      <pre>{JSON.stringify(log.data, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="logs-footer">
          <span>{t('crawl.showLogs', 'Showing')} {logs.length} {t('crawl.latestLogs', 'latest logs')}</span>
          <button 
            className="btn btn-primary btn-sm"
            onClick={fetchLogs}
          >
            {t('crawl.refresh', 'Refresh')}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default CrawlerPage;
