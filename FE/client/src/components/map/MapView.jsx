import React, { useEffect, useRef, useState } from 'react';
import './MapView.css';

const MapView = ({ initialAddress = '', onClose, onConfirm }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  const [address, setAddress] = useState(initialAddress);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  // ✅ Cleanup function để destroy map
  const cleanupMap = () => {
    if (mapInstanceRef.current && mapInstanceRef.current.map) {
      try {
        mapInstanceRef.current.map.remove();
      } catch (error) {
        console.warn('Error removing map:', error);
      }
      mapInstanceRef.current = null;
    }
  };

  // ✅ Cleanup khi component unmount
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, []);

  useEffect(() => {
    // Load Leaflet CSS và JS
    const loadLeaflet = async () => {
      try {
        // Load CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Load JS
        if (!window.L) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => {
            setIsMapLoaded(true);
            if (initialAddress) {
              initMapWithAddress(initialAddress);
            } else {
              initDefaultMap();
            }
          };
          script.onerror = () => {
            setError('Không thể tải bản đồ. Vui lòng thử lại.');
          };
          document.head.appendChild(script);
        } else {
          setIsMapLoaded(true);
          // ✅ Delay một chút để đảm bảo DOM ready
          setTimeout(() => {
            if (initialAddress) {
              initMapWithAddress(initialAddress);
            } else {
              initDefaultMap();
            }
          }, 100);
        }
      } catch (error) {
        setError('Không thể tải bản đồ. Vui lòng thử lại.');
      }
    };

    loadLeaflet();
  }, []);

  // Khởi tạo bản đồ mặc định (Việt Nam)
  const initDefaultMap = () => {
    // ✅ Cleanup map cũ trước khi tạo mới
    cleanupMap();
    
    // ✅ Kiểm tra DOM element có sẵn không
    if (!mapRef.current) {
      console.error('Map container not found');
      return;
    }

    // ✅ Clear container content
    mapRef.current.innerHTML = '';

    try {
      const vietnamCenter = [14.0583, 108.2772]; // [lat, lng] cho Leaflet
      
      const map = window.L.map(mapRef.current, {
        center: vietnamCenter,
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true
      });

      // Thêm tile layer từ OpenStreetMap
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = { map, marker: null };
    } catch (error) {
      console.error('Error initializing default map:', error);
      setError('Không thể khởi tạo bản đồ');
    }
  };

  // Khởi tạo bản đồ với địa chỉ
  const initMapWithAddress = async (searchAddress) => {
    setIsSearching(true);
    setError('');
    
    try {
      // Sử dụng Nominatim API (miễn phí) để geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&countrycodes=vn&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ECommerce-App/1.0'
          }
        }
      );
      
      const results = await response.json();
      
      if (results.length > 0) {
        // ✅ Cleanup map cũ trước khi tạo mới
        cleanupMap();
        
        // ✅ Kiểm tra DOM element có sẵn không
        if (!mapRef.current) {
          console.error('Map container not found');
          return;
        }

        // ✅ Clear container content
        mapRef.current.innerHTML = '';

        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const formattedAddress = result.display_name;
        
        // Tạo map
        const map = window.L.map(mapRef.current, {
          center: [lat, lng],
          zoom: 16,
          zoomControl: true
        });

        // Thêm tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        // Tạo custom icon
        const customIcon = window.L.divIcon({
          html: '<div style="background: #e91e63; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        // Thêm marker
        const marker = window.L.marker([lat, lng], {
          icon: customIcon,
          draggable: true
        }).addTo(map);

        // Popup cho marker
        marker.bindPopup(`<div style="padding: 8px; max-width: 200px;"><strong>Địa chỉ:</strong><br/>${formattedAddress}</div>`);

        // Listener khi kéo marker
        marker.on('dragend', async function(e) {
          const newPosition = e.target.getLatLng();
          map.setView(newPosition, map.getZoom());
          
          // Reverse geocoding
          try {
            const reverseResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition.lat}&lon=${newPosition.lng}&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'ECommerce-App/1.0'
                }
              }
            );
            
            const reverseResult = await reverseResponse.json();
            if (reverseResult && reverseResult.display_name) {
              const newAddress = reverseResult.display_name;
              setSelectedLocation({
                address: newAddress,
                lat: newPosition.lat,
                lng: newPosition.lng
              });
              marker.setPopupContent(`<div style="padding: 8px; max-width: 200px;"><strong>Địa chỉ:</strong><br/>${newAddress}</div>`);
            }
          } catch (error) {
            console.error('Error in reverse geocoding:', error);
          }
        });

        // ✅ Add click listener to map
        map.on('click', handleMapClick);

        mapInstanceRef.current = { map, marker };
        setSelectedLocation({
          address: formattedAddress,
          lat: lat,
          lng: lng
        });
        
      } else {
        setError('Không tìm thấy địa chỉ này ở Việt Nam. Vui lòng nhập địa chỉ chi tiết hơn.');
        initDefaultMap();
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setError('Không thể tìm kiếm địa chỉ. Vui lòng thử lại.');
      initDefaultMap();
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (address.trim()) {
      initMapWithAddress(address);
    } else {
      setError('Vui lòng nhập địa chỉ để tìm kiếm');
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onConfirm(selectedLocation);
    } else {
      setError('Vui lòng chọn một vị trí trên bản đồ');
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding để lấy địa chỉ
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'ECommerce-App/1.0'
                }
              }
            );
            
            const result = await response.json();
            if (result && result.display_name) {
              setAddress(result.display_name);
              initMapWithAddress(result.display_name);
            }
          } catch (error) {
            console.error('Error getting current location address:', error);
            setError('Không thể lấy địa chỉ hiện tại');
          } finally {
            setIsSearching(false);
          }
        },
        (error) => {
          setIsSearching(false);
          setError('Không thể lấy vị trí hiện tại');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setError('Trình duyệt không hỗ trợ định vị');
    }
  };

  const handleMapClick = async (e) => {
    if (!mapInstanceRef.current) return;
    
    const { lat, lng } = e.latlng;
    const { map, marker } = mapInstanceRef.current;
    
    try {
      // Reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ECommerce-App/1.0'
          }
        }
      );
      
      const result = await response.json();
      if (result && result.display_name) {
        // Di chuyển marker tới vị trí mới
        if (marker) {
          marker.setLatLng([lat, lng]);
        } else {
          const customIcon = window.L.divIcon({
            html: '<div style="background: #e91e63; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
            className: 'custom-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          const newMarker = window.L.marker([lat, lng], {
            icon: customIcon,
            draggable: true
          }).addTo(map);
          
          mapInstanceRef.current.marker = newMarker;
        }
        
        setSelectedLocation({
          address: result.display_name,
          lat: lat,
          lng: lng
        });
        
        // Update popup
        if (mapInstanceRef.current.marker) {
          mapInstanceRef.current.marker.setPopupContent(
            `<div style="padding: 8px; max-width: 200px;"><strong>Địa chỉ:</strong><br/>${result.display_name}</div>`
          );
        }
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
    }
  };

  // ✅ Cleanup khi close
  const handleClose = () => {
    cleanupMap();
    onClose();
  };

  return (
    <div className="map-overlay">
      <div className="map-container">
        <div className="map-header">
          <h3>Chọn vị trí giao hàng</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="map-content">
          {/* Search Section */}
          <div className="address-search">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ: số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  className="address-input"
                />
                <button 
                  type="button" 
                  className="current-location-btn"
                  onClick={handleCurrentLocation}
                  title="Vị trí hiện tại"
                >
                  📍
                </button>
                <button 
                  type="submit" 
                  className="search-btn"
                  disabled={isSearching}
                >
                  {isSearching ? '⏳' : '🔍'}
                </button>
              </div>
            </form>
            
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
            
            <div className="search-hints">
              <p><strong>Gợi ý:</strong> Nhập địa chỉ đầy đủ để có kết quả chính xác nhất</p>
              <p><em>Ví dụ: 123 Nguyễn Trãi, Hà Nội</em></p>
              <p><em>Click vào bản đồ để chọn vị trí</em></p>
            </div>
          </div>

          {/* Map Section */}
          <div className="map-section">
            {!isMapLoaded ? (
              <div className="map-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải bản đồ...</p>
              </div>
            ) : !selectedLocation && !isSearching ? (
              <div className="map-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">🗺️</div>
                  <h4>Chưa chọn vị trí</h4>
                  <p>Nhập địa chỉ ở trên để xem vị trí trên bản đồ</p>
                  <p className="placeholder-note">
                    Bạn có thể click vào bản đồ hoặc kéo thả marker để điều chỉnh vị trí
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                {isSearching && (
                  <div className="search-overlay">
                    <div className="loading-spinner"></div>
                    <p>Đang tìm kiếm địa chỉ...</p>
                  </div>
                )}
                <div ref={mapRef} className="map-element"></div>
              </div>
            )}
          </div>

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="selected-location">
              <h4>📍 Vị trí đã chọn:</h4>
              <p className="location-address">{selectedLocation.address}</p>
              <p className="location-coords">
                Tọa độ: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="map-actions">
            <button className="cancel-btn" onClick={handleClose}>
              Hủy
            </button>
            <button 
              className="confirm-btn" 
              onClick={handleConfirm}
              disabled={!selectedLocation}
            >
              Xác nhận vị trí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;