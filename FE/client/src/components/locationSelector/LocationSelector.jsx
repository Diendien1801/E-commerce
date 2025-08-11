import React, { useState, useEffect, useRef } from 'react';
import './LocationSelector.css';

const LocationSelector = ({ onLocationSelect, onClose, inputRect }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [activeTab, setActiveTab] = useState('province');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  // Sử dụng VAPI v2
  const API_BASE = 'https://vapi.vnappmob.com/api/v2';

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/province/`);
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        const transformedProvinces = data.results.map(province => ({
          code: province.province_id,
          name: province.province_name,
          type: province.province_type
        }));
        
        setProvinces(transformedProvinces);
        console.log('✅ Provinces loaded:', transformedProvinces.length);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setError('Không thể tải danh sách tỉnh thành. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async (provinceId) => {
    try {
      const response = await fetch(`${API_BASE}/province/district/${provinceId}`);
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        const transformedDistricts = data.results.map(district => ({
          code: district.district_id,
          name: district.district_name,
          type: district.district_type
        }));
        
        console.log('✅ Districts loaded:', transformedDistricts.length);
        return transformedDistricts;
      }
      return [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  };

  const fetchWards = async (districtId) => {
    try {
      const response = await fetch(`${API_BASE}/province/ward/${districtId}`);
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        const transformedWards = data.results.map(ward => ({
          code: ward.ward_id,
          name: ward.ward_name,
          type: ward.ward_type
        }));
        
        console.log('✅ Wards loaded:', transformedWards.length);
        return transformedWards;
      }
      return [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      return [];
    }
  };

  const smoothTransition = (callback) => {
    setIsTransitioning(true);
    
    if (contentRef.current) {
      contentRef.current.style.opacity = '0.5';
    }
    
    setTimeout(() => {
      callback();
      
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.opacity = '1';
        }
        setIsTransitioning(false);
      }, 100);
    }, 200);
  };

  const handleProvinceSelect = async (province) => {
    console.log('Province selected:', province.name);
    setSelectedProvince(province);
    setSearchTerm('');
    
    // Cập nhật input ngay lập tức
    onLocationSelect({
      province: province,
      district: null,
      ward: null,
      fullAddress: province.name,
      isComplete: false
    });

    // Smooth transition và fetch districts
    smoothTransition(async () => {
      setLoading(true);
      
      const districtData = await fetchDistricts(province.code);
      
      setSelectedDistrict(null);
      setSelectedWard(null);
      setDistricts(districtData);
      setWards([]);
      setActiveTab('district');
      setLoading(false);
    });
  };

  const handleDistrictSelect = async (district) => {
    console.log('District selected:', district.name);
    setSelectedDistrict(district);
    setSearchTerm('');
    
    // Cập nhật input
    const address = `${selectedProvince.name}, ${district.name}`;
    onLocationSelect({
      province: selectedProvince,
      district: district,
      ward: null,
      fullAddress: address,
      isComplete: false
    });

    // Smooth transition và fetch wards
    smoothTransition(async () => {
      setLoading(true);
      
      const wardData = await fetchWards(district.code);
      
      setSelectedWard(null);
      setWards(wardData);
      setActiveTab('ward');
      setLoading(false);
    });
  };

  const handleWardSelect = (ward) => {
    console.log('Ward selected:', ward.name);
    setSelectedWard(ward);
    setSearchTerm('');
    
    // Hoàn thành địa chỉ và đóng dropdown (không hiển thị map)
    const fullAddress = `${ward.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;
    onLocationSelect({
      province: selectedProvince,
      district: selectedDistrict,
      ward: ward,
      fullAddress: fullAddress,
      isComplete: true
    });
    
    // Đóng dropdown sau khi chọn xong
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const goBack = () => {
    smoothTransition(() => {
      if (activeTab === 'ward') {
        setActiveTab('district');
        setWards([]);
        setSelectedWard(null);
        setSearchTerm('');
        
        // Cập nhật lại input với tỉnh + quận
        const address = `${selectedProvince.name}, ${selectedDistrict.name}`;
        onLocationSelect({
          province: selectedProvince,
          district: selectedDistrict,
          ward: null,
          fullAddress: address,
          isComplete: false
        });
      } else if (activeTab === 'district') {
        setActiveTab('province');
        setDistricts([]);
        setSelectedDistrict(null);
        setSearchTerm('');
        
        // Cập nhật lại input với chỉ tỉnh
        onLocationSelect({
          province: selectedProvince,
          district: null,
          ward: null,
          fullAddress: selectedProvince.name,
          isComplete: false
        });
      }
    });
  };

  // Filter items based on search
  const getFilteredItems = () => {
    let items = [];
    if (activeTab === 'province') items = provinces;
    else if (activeTab === 'district') items = districts;
    else if (activeTab === 'ward') items = wards;

    if (!searchTerm) return items;
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const dropdownStyle = {
    position: 'absolute',
    top: inputRect.bottom + window.scrollY + 5,
    left: inputRect.left + window.scrollX,
    width: inputRect.width,
    zIndex: 1000
  };

  return (
    <>
      {/* Overlay để click outside */}
      <div className="location-overlay" onClick={onClose}></div>
      
      {/* Dropdown */}
      <div className="location-dropdown" style={dropdownStyle}>
        <div className="location-header">
          <div className="location-tabs">
            <div className={`location-tab ${activeTab === 'province' ? 'active' : ''}`}>
              {selectedProvince ? selectedProvince.name : 'Tỉnh / TP'}
            </div>
            <div className={`location-tab ${activeTab === 'district' ? 'active' : ''} ${!selectedProvince ? 'disabled' : ''}`}>
              {selectedDistrict ? selectedDistrict.name : 'Quận / Huyện'}
            </div>
            <div className={`location-tab ${activeTab === 'ward' ? 'active' : ''} ${!selectedDistrict ? 'disabled' : ''}`}>
              {selectedWard ? selectedWard.name : 'Phường / Xã'}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="location-content" ref={contentRef} style={{ 
          transition: 'opacity 0.2s ease',
          opacity: isTransitioning ? 0.5 : 1 
        }}>
          {error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchProvinces} className="retry-btn">
                Thử lại
              </button>
            </div>
          ) : (
            <>
              {/* Search input */}
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder={`Tìm ${activeTab === 'province' ? 'tỉnh/thành phố' : activeTab === 'district' ? 'quận/huyện' : 'phường/xã'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isTransitioning || loading}
                />
              </div>

              {activeTab !== 'province' && (
                <button className="back-btn" onClick={goBack} disabled={isTransitioning}>
                  ← Quay lại
                </button>
              )}

              {loading ? (
                <div className="loading">
                  <div className="loading-spinner"></div>
                  Đang tải...
                </div>
              ) : (
                <div className="location-list">
                  {getFilteredItems().map(item => (
                    <div 
                      key={item.code}
                      className={`location-item ${
                        (activeTab === 'province' && selectedProvince?.code === item.code) ||
                        (activeTab === 'district' && selectedDistrict?.code === item.code) ||
                        (activeTab === 'ward' && selectedWard?.code === item.code) ? 'selected' : ''
                      } ${isTransitioning ? 'disabled' : ''}`}
                      onClick={() => {
                        if (isTransitioning) return;
                        
                        if (activeTab === 'province') handleProvinceSelect(item);
                        else if (activeTab === 'district') handleDistrictSelect(item);
                        else if (activeTab === 'ward') handleWardSelect(item);
                      }}
                    >
                      {item.name}
                    </div>
                  ))}
                  
                  {getFilteredItems().length === 0 && !loading && (
                    <div className="no-results">
                      Không tìm thấy kết quả nào
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LocationSelector;