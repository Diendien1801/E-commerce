import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/context/authcontext';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import './profile.css';
import defaultAvatar from './avatar-default.svg';

const Profile = () => {
    const { t, i18n } = useTranslation();
    const fileInputRef = useRef(null);
    const { id } = useParams();
    const { user: loggedInUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedPhoneNumber, setEditedPhoneNumber] = useState('');
    const [editedCountry, setEditedCountry] = useState('');

    
    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:5000/api/users/${id}`);
                const data = await res.json();
                if (res.ok && data.success && data.data) {
                    setUser(data.data);
                    console.log('address', data.data)
                    console.log(user)
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [id]);

    const handlePicClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async e => {
        const file = e.target.files[0];
        if (!file) return;

        const userId = loggedInUser?._id || loggedInUser?.userId || loggedInUser?.id;
        const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dumv5xryl/image/upload';
        const UPLOAD_PRESET = 'RungRing';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const cloudRes = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData
            });
            const cloudData = await cloudRes.json();

            if (!cloudData.secure_url) {
                throw new Error(t('uploadCloudinaryFailed', 'Upload to Cloudinary failed'));
            }

            const avatarUrl = cloudData.secure_url;
            console.log('Cloudinary avatar URL:', avatarUrl);

            const uploadRes = await fetch('http://localhost:5000/api/users/uploadAvatar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, avatarUrl })
            });
            const uploadData = await uploadRes.json();
            if (!uploadData.success) throw new Error(uploadData.message);

            const changeRes = await fetch('http://localhost:5000/api/users/changeavt', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: userId, avatar: avatarUrl })
            });
            const changeData = await changeRes.json();
            if (!changeData.success) throw new Error(changeData.message);
            setUser(prev => ({ ...prev, avatar: avatarUrl }));
            // alert(t('profilePicUpdated', 'Profile picture successfully updated!'));
        } catch (err) {
            alert(t('error', 'Error') + ': ' + err.message);
        }
        
    };

    const handleUpdateProfile = async () => {
        const userId = loggedInUser?._id || loggedInUser?.userId || loggedInUser?.id;
        try {
            const res = await fetch(`http://localhost:5000/api/users/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    name: editedName,
                    email: editedEmail
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            setUser(prev => ({ ...prev, name: editedName, email: editedEmail }));
            setIsEditing(false);
            // alert(t('profileUpdated', 'Profile updated successfully!'));
        } catch (err) {
            alert(t('error', 'Error') + ': ' + err.message);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="profile-main">
                <div className="profile-title-row">
                    <h2 className="profile-title">{t('profile', 'Profile')}</h2>
                </div>
                <hr className="profile-divider" />
                <div className="profile-row">
                    <div className="profile-pic-col">
                        <div className="profile-pic-wrapper"
                             onClick={handlePicClick}
                             onMouseEnter={e => e.currentTarget.querySelector('.change-pic-overlay').style.opacity = 1}
                             onMouseLeave={e => e.currentTarget.querySelector('.change-pic-overlay').style.opacity = 0}>
                            <img src={user && user.avatar ? user.avatar : defaultAvatar} alt="Profile" className="profile-pic" />
                            <div className="change-pic-overlay">
                                {t('changeProfilePic', 'Change profile picture')}
                            </div>
                            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                        </div>
                    </div>
                    <div className="profile-info-col">
                        {isEditing ? (
                            <>
                            <div className="profile-info">
                                <strong>{t('name', 'Name')}:</strong>
                                <input 
                                    type="text" 
                                    value={editedName} 
                                    onChange={e => setEditedName(e.target.value)} 
                                    className="profile-input"
                                />
                            </div>
                            <div className="profile-info">
                                <strong>{t('email', 'Email')}:</strong>
                                <input 
                                    type="email" 
                                    value={editedEmail} 
                                    onChange={e => setEditedEmail(e.target.value)} 
                                    className="profile-input"
                                />
                            </div>
                            <div className="profile-info">
                            <strong>{t('phoneNumber', 'Phone Number')}:</strong>
                                <input
                                    type="text"
                                    value={editedPhoneNumber}
                                    onChange={e => setEditedPhoneNumber(e.target.value)}
                                    className="profile-input"
                                />
                            </div>
                            <div className="profile-info">
                                <strong>{t('address', 'Address')}:</strong>
                                <input
                                    type="text"
                                    value={editedCountry}
                                    onChange={e => setEditedCountry(e.target.value)}
                                    className="profile-input"
                                />
                            </div>
                            <div style={{ marginTop: '0.7rem' }}>
                                <button onClick={handleUpdateProfile} className="profile-edit-btn" style={{ marginRight: '0.5rem' }}>
                                    {t('save', 'Save')}
                                </button>
                                <button onClick={() => setIsEditing(false)} className="profile-edit-btn" style={{ backgroundColor: '#aaa' }}>
                                    {t('cancel', 'Cancel')}
                                </button>
                            </div>
                            </>
                        ) : (
                                <>
        <div className="profile-info"> 
            <strong>{t('name', 'Name')}:</strong> {user?.name}
        </div>
        {user?.email && (
            <div className="profile-info">
                <strong>{t('email', 'Email')}:</strong> {user.email}
            </div>
        )}
        {user?.phoneNumber && (
            <div className="profile-info">
                <strong>{t('phoneNumber', 'Phone Number')}:</strong> {user.phoneNumber}
            </div>
        )}

        {user?.address?.country && (
            <div className="profile-info">
                <strong>{t('address', 'Address')}:</strong> {user.address.country}
            </div>
        )}

        <div>
            <button 
                onClick={() => {
                    setEditedName(user?.name || '');
                    setEditedEmail(user?.email || '');
                    setEditedPhoneNumber(user?.phoneNumber || '');
                    setEditedCountry(user?.address?.country || '');
                    setIsEditing(true);
                }}
                className="profile-edit-btn"
                style={{ padding: '0.32rem 0.8rem', fontSize: '0.92rem', background: '#2a6b8f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
            >
                {t('editProfile', 'Edit Profile')}
            </button>
        </div>
    </>
)}

                        <div style={{textAlign: 'left' }}>
                            <a href="/change-password" className="profile-edit-btn" style={{ padding: '0.32rem 0.8rem', fontSize: '0.92rem', background: '#9E3736', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, textDecoration: 'none', display: 'inline-block' }}>
                                {t('changePassword', 'Change Password')}
                            </a>
                        </div>
                    </div>
                </div>
                {loading && <div style={{ textAlign: 'center', marginTop: '2rem', color: '#888' }}>{t('loading', 'Loading...')}</div>}
            </div>
            <Footer />
        </div>
    );
}

export default Profile;
