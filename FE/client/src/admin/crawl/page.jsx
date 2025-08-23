import React, { useState, useEffect, useCallback, useRef } from 'react';
import './crawl.css';

const CrawlerPage = () => {
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
  const API_BASE = 'http://localhost:5000/api/crawl';

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
    if (crawlerStatus.isRunning) return 'Đang chạy';
    if (crawlerStatus.startTime && !crawlerStatus.endTime) return 'Đang xử lý';
    return 'Đã dừng';
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
        <h2>Thống kê Sản phẩm</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{productStats.totalProducts.toLocaleString()}</div>
            <div className="stat-label">Tổng sản phẩm</div>
          </div>
          
        
          
          <div className="stat-card">
            <div className="stat-value">{formatPrice(productStats.avgPrice)}</div>
            <div className="stat-label">Giá trung bình</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{productStats.todayProducts.toLocaleString()}</div>
            <div className="stat-label">Thêm hôm nay</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{formatDate(productStats.lastUpdated)}</div>
            <div className="stat-label">Cập nhật lần cuối</div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="control-section">
        <h2>Điều khiển Crawler</h2>
        
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
            {loading ? 'Đang xử lý...' : 'Bắt đầu Crawl'}
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={stopCrawler}
            disabled={!crawlerStatus.isRunning || loading}
          >
            {loading ? 'Đang xử lý...' : 'Dừng Crawl'}
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
        <h2>Trạng thái Crawler</h2>
        
        <div className="status-grid">
          <div className="status-item">
            <div className="status-label">Thời gian bắt đầu</div>
            <div className="status-value">{formatDate(crawlerStatus.startTime)}</div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Thời gian kết thúc</div>
            <div className="status-value">{formatDate(crawlerStatus.endTime)}</div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Thời gian chạy</div>
            <div className="status-value">
              {formatDuration(crawlerStatus.startTime, crawlerStatus.endTime)}
            </div>
          </div>
          
          
          
          
          
          <div className="status-item">
            <div className="status-label">Lỗi</div>
            <div className="status-value">
              {crawlerStatus.errors.length}
            </div>
          </div>
        </div>

        
      </div>

      {/* Categories */}
      <div className="categories-section">
        <h2>Danh mục sản phẩm</h2>
        
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <h3>{category.name}</h3>
                <span className="category-count">{category.count.toLocaleString()}</span>
              </div>
              <div className="category-details">
                <span className="category-id">ID: {category.id}</span>
                {category.parentId && (
                  <span className="category-parent">Parent: {category.parentId}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs Section */}
      <div className="logs-section">
        <h2>Log hoạt động Crawler</h2>
        
        {/* Log Filters */}
        <div className="log-filters">
          <div className="filter-group">
            <label>Level:</label>
            <select 
              value={logFilter.level} 
              onChange={(e) => handleLogFilterChange('level', e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="success">Success</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Type:</label>
            <select 
              value={logFilter.type} 
              onChange={(e) => handleLogFilterChange('type', e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="product">Product</option>
              <option value="category">Category</option>
              <option value="page">Page</option>
              <option value="inventory">Inventory</option>
              <option value="system">System</option>
              <option value="summary">Summary</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Limit:</label>
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
            Reset
          </button>
        </div>

        {/* Logs Display */}
        {logs.length === 0 ? (
          <div className="empty-logs">
            Chưa có log hoạt động
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
                      <summary>Chi tiết</summary>
                      <pre>{JSON.stringify(log.data, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="logs-footer">
          <span>Hiển thị {logs.length} log gần nhất</span>
          <button 
            className="btn btn-primary btn-sm"
            onClick={fetchLogs}
          >
            Làm mới
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
