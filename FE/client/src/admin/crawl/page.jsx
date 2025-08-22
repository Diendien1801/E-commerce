"use client";
import React, { useState, useEffect, useRef } from 'react';
import './crawl.css';

const CrawlPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isCrawling, setIsCrawling] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    newProducts: 0,
    updatedProducts: 0,
    failedProducts: 0,
    processedCategories: 0,
    totalCategories: 0
  });
  const [progress, setProgress] = useState({
    currentCategory: '',
    currentPage: 0,
    currentProduct: '',
    processedProducts: 0
  });
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [testResults, setTestResults] = useState(null);

  const eventSourceRef = useRef(null);
  const logsEndRef = useRef(null);

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Kết nối SSE
  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      eventSourceRef.current = new EventSource(`${API_BASE}/crawl/stream`);
      
      eventSourceRef.current.onopen = () => {
        setConnectionStatus('connected');
        addLog('🌊 Kết nối real-time thành công', 'success');
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleSSEMessage(data);
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSourceRef.current.onerror = () => {
        setConnectionStatus('error');
        addLog('❌ Lỗi kết nối real-time', 'error');
        
        // Thử kết nối lại sau 5 giây
        setTimeout(() => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
          }
          connectSSE();
        }, 5000);
      };
    } catch (error) {
      setConnectionStatus('error');
      addLog(`❌ Lỗi khởi tạo SSE: ${error.message}`, 'error');
    }
  };

  // Xử lý tin nhắn SSE
  const handleSSEMessage = (data) => {
    switch (data.type) {
      case 'connected':
        setConnectionStatus('connected');
        setIsCrawling(data.isCrawling || false);
        break;
      case 'log':
        addLog(data.message, data.logType);
        break;
      case 'progress':
        setProgress(prev => ({ ...prev, ...data }));
        break;
      case 'stats':
        setStats(data.stats);
        break;
      case 'complete':
        setIsCrawling(false);
        addLog('✅ ' + data.result.message, 'success');
        break;
      case 'error':
        setIsCrawling(false);
        addLog(`❌ Lỗi: ${data.message}`, 'error');
        break;
    }
  };

  // Thêm log
  const addLog = (message, type = 'info') => {
    const logEntry = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [...prev.slice(-99), logEntry]); // Giữ tối đa 100 logs
  };

  // Scroll xuống cuối logs
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/crawl/categories`);
      const data = await response.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
        addLog(`✅ Tải thành công ${data.categories.length} categories`, 'success');
      } else {
        addLog('⚠️ Lỗi tải categories từ server', 'warning');
      }
    } catch (error) {
      addLog(`❌ Lỗi tải categories: ${error.message}`, 'error');
    }
  };

  // Test kết nối
  const testConnection = async () => {
    try {
      addLog('🔍 Đang test kết nối...', 'info');
      const response = await fetch(`${API_BASE}/crawl/test`);
      const data = await response.json();
      setTestResults(data.tests);
      
      if (data.success) {
        addLog('✅ Test kết nối hoàn thành', 'success');
      } else {
        addLog(`❌ Test thất bại: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Lỗi test: ${error.message}`, 'error');
    }
  };

  // Bắt đầu crawl
  const startCrawl = async () => {
    try {
      const response = await fetch(`${API_BASE}/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: selectedCategories.length > 0 ? selectedCategories : null
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsCrawling(true);
        addLog('🚀 ' + data.message, 'success');
        // Không xóa logs cũ nữa để người dùng có thể xem lại
      } else {
        addLog(`❌ ${data.message}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Lỗi bắt đầu crawl: ${error.message}`, 'error');
    }
  };

  // Dừng crawl
  const stopCrawl = async () => {
    try {
      const response = await fetch(`${API_BASE}/crawl/stop`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        addLog('🛑 ' + data.message, 'warning');
      } else {
        addLog(`❌ ${data.message}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Lỗi dừng crawl: ${error.message}`, 'error');
    }
  };

  // Chọn/bỏ chọn category
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Chọn/bỏ chọn cả nhóm
  const toggleGroup = (groupCategories) => {
    const groupIds = groupCategories.map(cat => cat.idCategory);
    const allSelected = groupIds.every(id => selectedCategories.includes(id));
    
    if (allSelected) {
      setSelectedCategories(prev => prev.filter(id => !groupIds.includes(id)));
    } else {
      setSelectedCategories(prev => [...new Set([...prev, ...groupIds])]);
    }
  };

  // Chọn tất cả
  const selectAll = () => {
    setSelectedCategories(categories.map(cat => cat.idCategory));
  };

  // Bỏ chọn tất cả
  const clearAll = () => {
    setSelectedCategories([]);
  };

  // Xóa logs
  const clearLogs = () => {
    setLogs([]);
    addLog('🧹 Đã xóa logs', 'info');
  };

  useEffect(() => {
    loadCategories();
    connectSSE();

    // Kiểm tra trạng thái crawl khi component mount
    fetch(`${API_BASE}/crawl/status`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsCrawling(data.isCrawling);
          if (data.stats) {
            setStats(data.stats);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching crawl status:', err);
      });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Nhóm categories theo group
  const groupedCategories = categories.reduce((acc, category) => {
    const group = category.group || 'Khác';
    if (!acc[group]) acc[group] = [];
    acc[group].push(category);
    return acc;
  }, {});

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Crawler</h1>
              <p className="text-gray-600 mt-2">Crawl sản phẩm từ website Hàng Đĩa Thời Đại</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${getConnectionStatusColor()}`}>
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                {connectionStatus === 'connected' ? 'Đã kết nối' : 
                 connectionStatus === 'error' ? 'Lỗi kết nối' : 'Đang kết nối'}
              </div>
              <button
                onClick={testConnection}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Test Kết Nối
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2">Kết quả test:</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className={`${testResults.mongodb ? 'text-green-600' : 'text-red-600'}`}>
                  MongoDB: {testResults.mongodb ? '✅' : '❌'}
                </div>
                <div className={`${testResults.selenium ? 'text-green-600' : 'text-red-600'}`}>
                  Selenium: {testResults.selenium ? '✅' : '❌'}
                </div>
                <div>Categories: {testResults.categoriesCount}</div>
                <div>Crawling: {testResults.isCrawling ? 'Có' : 'Không'}</div>
                <div>Clients: {testResults.connectedClients}</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Chọn Categories</h2>
              <div className="space-x-2">
                <button
                  onClick={selectAll}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Chọn tất cả
                </button>
                <button
                  onClick={clearAll}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(groupedCategories).map(([groupName, groupCategories]) => (
                <div key={groupName} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{groupName}</h3>
                    <button
                      onClick={() => toggleGroup(groupCategories)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {groupCategories.every(cat => selectedCategories.includes(cat.idCategory)) 
                        ? 'Bỏ chọn nhóm' : 'Chọn nhóm'}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {groupCategories.map((category) => (
                      <label key={category.idCategory} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.idCategory)}
                          onChange={() => toggleCategory(category.idCategory)}
                          className="mr-2"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                Đã chọn: {selectedCategories.length}/{categories.length}
              </p>
              <div className="space-y-2">
                <button
                  onClick={startCrawl}
                  disabled={isCrawling}
                  className={`w-full py-2 px-4 rounded-md ${
                    isCrawling
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  {isCrawling ? 'Đang Crawl...' : 'Bắt Đầu Crawl'}
                </button>
                {isCrawling && (
                  <button
                    onClick={stopCrawl}
                    className="w-full py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white"
                  >
                    Dừng Crawl
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progress & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Thống Kê</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-green-50 p-3 rounded-md text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.newProducts}</div>
                  <div className="text-sm text-gray-600">Tạo mới</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-md text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.updatedProducts}</div>
                  <div className="text-sm text-gray-600">Cập nhật</div>
                </div>
                <div className="bg-red-50 p-3 rounded-md text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.failedProducts}</div>
                  <div className="text-sm text-gray-600">Lỗi</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-md text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.processedCategories}/{stats.totalCategories || '?'}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-md text-center">
                  <div className="text-2xl font-bold text-yellow-600">{progress.processedProducts || 0}</div>
                  <div className="text-sm text-gray-600">Sản phẩm</div>
                </div>
              </div>
            </div>

            {/* Current Progress */}
            {isCrawling && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Tiến Trình</h2>
                <div className="space-y-3">
                  {progress.currentCategory && (
                    <div>
                      <span className="font-medium">Category:</span> {progress.currentCategory}
                    </div>
                  )}
                  {progress.currentPage > 0 && (
                    <div>
                      <span className="font-medium">Trang:</span> {progress.currentPage}
                    </div>
                  )}
                  {progress.currentProduct && (
                    <div>
                      <span className="font-medium">Sản phẩm:</span> {progress.currentProduct}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Logs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Logs</h2>
                <button
                  onClick={clearLogs}
                  className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Xóa logs
                </button>
              </div>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 && (
                  <div className="text-gray-500">Chờ logs...</div>
                )}
                {logs.map((log) => (
                  <div key={log.id} className="mb-1">
                    <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                    <span className={getLogColor(log.type)}>{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrawlPage;