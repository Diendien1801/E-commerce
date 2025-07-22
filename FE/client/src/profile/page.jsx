import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/context/authcontext';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import './profile.css';

const Profile = () => {
    const fileInputRef = useRef(null);
    const { id } = useParams();
    const { user: loggedInUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:5000/api/users/${id}`);
                const data = await res.json();
                if (res.ok && data.success && data.data) {
                    setUser(data.data);
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
                throw new Error('Upload to Cloudinary failed');
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
            alert('Profile picture successfully updated!');
        } catch (err) {
            alert('Error: ' + err.message);
        }
        
    };


    return (
        <div>
            <Navbar />
            <div className="profile-main">
                <div className="profile-title-row">
                    <h2 className="profile-title">Profile</h2>
                </div>
                <hr className="profile-divider" />
                <div className="profile-row">
                    <div className="profile-pic-col">
                        <div className="profile-pic-wrapper"
                             onClick={handlePicClick}
                             onMouseEnter={e => e.currentTarget.querySelector('.change-pic-overlay').style.opacity = 1}
                             onMouseLeave={e => e.currentTarget.querySelector('.change-pic-overlay').style.opacity = 0}>
                            <img src={user && user.avatar ? user.avatar : "/profile-placeholder.png"} alt="Profile" className="profile-pic" />
                            <div className="change-pic-overlay">
                                Change profile picture
                            </div>
                            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                        </div>
                    </div>
                    <div className="profile-info-col">
                        <div className="profile-info"> 
                            <strong>Name:</strong> {user ? user.name : 'Name'}
                        </div>
                        {user && user.email && (
                            <div className="profile-info"><strong>Email:</strong> {user.email}</div>
                        )}
                        <div style={{ marginTop: '0.7rem', textAlign: 'left' }}>
                            <a href="/change-password" className="profile-edit-btn" style={{ padding: '0.32rem 0.8rem', fontSize: '0.92rem', background: '#9E3736', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, textDecoration: 'none', display: 'inline-block' }}>
                                Change Password
                            </a>
                        </div>
                    </div>
                </div>
                {loading && <div style={{ textAlign: 'center', marginTop: '2rem', color: '#888' }}>Loading profile...</div>}
            </div>
            <Footer />
        </div>
    );
}

export default Profile;
