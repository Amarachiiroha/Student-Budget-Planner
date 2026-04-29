import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Trash2, ChevronRight, Camera } from 'lucide-react';
import './Profile.css';

// Available stickers/avatars to choose from
const STICKERS = [
  '😊','😎','🤩','🥳','😇','🤓','👩‍💻','👨‍💻',
  '🦁','🐯','🐼','🦊','🐨','🐸','🐙','🦋',
  '🌟','⭐','🔥','💎','🌈','🎯','🚀','💜',
  '🍕','🧋','🍩','🎮','🎵','📚','💡','🏆',
];

const AVATAR_KEY = 'sbp_avatar';

function ProfilePage({ userName, onLogout }) {
  const fileInputRef = useRef(null);

  // Load saved avatar (could be a sticker emoji or a base64 image)
  const savedAvatar = localStorage.getItem(AVATAR_KEY);
  const [avatar, setAvatar]                   = useState(savedAvatar || null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm]   = useState(false);
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [message, setMessage]       = useState(null);
  const [isError, setIsError]       = useState(false);

  const accounts = JSON.parse(localStorage.getItem('sbp_accounts') || '[]');
  const account  = accounts.find(a => a.name === userName);
  const initials = userName
    ? userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const showMsg = (text, error = false) => {
    setMessage(text);
    setIsError(error);
    setTimeout(() => setMessage(null), 3000);
  };

  // Save sticker choice
  const handleStickerSelect = (sticker) => {
    localStorage.setItem(AVATAR_KEY, sticker);
    setAvatar(sticker);
    setShowAvatarPicker(false);
  };

  // Save uploaded photo as base64
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMsg('Please select an image file.', true);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showMsg('Image must be under 2MB.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      localStorage.setItem(AVATAR_KEY, base64);
      setAvatar(base64);
      setShowAvatarPicker(false);
    };
    reader.readAsDataURL(file);
  };

  // Remove avatar — go back to initials
  const handleRemoveAvatar = () => {
    localStorage.removeItem(AVATAR_KEY);
    setAvatar(null);
    setShowAvatarPicker(false);
  };

  // Determine how to render the avatar
  const isPhoto   = avatar && avatar.startsWith('data:');
  const isSticker = avatar && !avatar.startsWith('data:');

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) { showMsg('Please fill in all fields.', true); return; }
    if (!account || account.password !== currentPw) { showMsg('Current password is incorrect.', true); return; }
    if (newPw.length < 6) { showMsg('New password must be at least 6 characters.', true); return; }
    if (newPw !== confirmPw) { showMsg('New passwords do not match.', true); return; }

    const updated = accounts.map(a => a.name === userName ? { ...a, password: newPw } : a);
    localStorage.setItem('sbp_accounts', JSON.stringify(updated));
    showMsg('Password changed successfully! ✅');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setShowChangePassword(false);
  };

  const handleDeleteAccount = () => {
    const updated = accounts.filter(a => a.name !== userName);
    localStorage.setItem('sbp_accounts', JSON.stringify(updated));
    localStorage.removeItem('sbp_logged_in_user');
    localStorage.removeItem(AVATAR_KEY);
    onLogout();
  };

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >

      {/* ── AVATAR SECTION ── */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrapper">
          {/* Avatar display */}
          <div className="profile-avatar">
            {isPhoto   && <img src={avatar} alt="Profile" className="profile-avatar-img" />}
            {isSticker && <span className="profile-avatar-sticker">{avatar}</span>}
            {!avatar   && <span className="profile-avatar-initials">{initials}</span>}
          </div>

          {/* Camera button */}
          <button
            className="profile-avatar-edit-btn"
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            aria-label="Change profile picture"
          >
            <Camera size={14} />
          </button>
        </div>

        <h2 className="profile-name">{userName}</h2>
        <p className="profile-email">{account?.email || 'No email on file'}</p>
        <p className="profile-joined">
          Member since {account?.createdAt
            ? new Date(account.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
            : 'Unknown'}
        </p>
      </div>

      {/* ── AVATAR PICKER PANEL ── */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            className="avatar-picker glass"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="avatar-picker-header">
              <span className="avatar-picker-title">Choose your avatar</span>
              <button className="avatar-picker-close" onClick={() => setShowAvatarPicker(false)}>✕</button>
            </div>

            {/* Upload photo option */}
            <div className="avatar-picker-section-label">📷 Upload a photo</div>
            <button
              className="avatar-upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Click to upload image (max 2MB)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />

            {/* Sticker grid */}
            <div className="avatar-picker-section-label">🎭 Or pick a sticker</div>
            <div className="sticker-grid">
              {STICKERS.map((s, i) => (
                <button
                  key={i}
                  className={`sticker-btn${avatar === s ? ' selected' : ''}`}
                  onClick={() => handleStickerSelect(s)}
                  aria-label={`Select ${s}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Remove option */}
            {avatar && (
              <button className="avatar-remove-btn" onClick={handleRemoveAvatar}>
                Remove avatar — use initials instead
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NOTIFICATION ── */}
      {message && (
        <motion.div
          className={`profile-message ${isError ? 'error' : 'success'}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {message}
        </motion.div>
      )}

      {/* ── ACCOUNT INFO ── */}
      <div className="profile-section glass">
        <h3 className="profile-section-title">
          <User size={16} /> Account Information
        </h3>
        <div className="profile-info-row">
          <span className="profile-info-label">Full Name</span>
          <span className="profile-info-value">{userName}</span>
        </div>
        <div className="profile-info-row">
          <span className="profile-info-label">Email</span>
          <span className="profile-info-value">{account?.email || '—'}</span>
        </div>
      </div>

      {/* ── CHANGE PASSWORD ── */}
      <div className="profile-section glass">
        <button
          className="profile-section-toggle"
          onClick={() => setShowChangePassword(!showChangePassword)}
        >
          <span className="profile-section-title" style={{ margin: 0 }}>
            <Lock size={16} /> Change Password
          </span>
          <ChevronRight
            size={18}
            style={{
              transform: showChangePassword ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: '0.2s',
              color: 'var(--color-text-secondary)'
            }}
          />
        </button>

        <AnimatePresence>
          {showChangePassword && (
            <motion.form
              onSubmit={handleChangePassword}
              className="profile-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="profile-field">
                <label>Current Password</label>
                <input type="password" value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="Enter current password" />
              </div>
              <div className="profile-field">
                <label>New Password</label>
                <input type="password" value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="At least 6 characters" />
              </div>
              <div className="profile-field">
                <label>Confirm New Password</label>
                <input type="password" value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password" />
              </div>
              <div className="profile-form-actions">
                <button type="button" className="btn btn-secondary btn-sm"
                  onClick={() => setShowChangePassword(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Password</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* ── DANGER ZONE ── */}
      <div className="profile-section glass danger-zone">
        <h3 className="profile-section-title danger">
          <Trash2 size={16} /> Danger Zone
        </h3>
        {!showDeleteConfirm ? (
          <button className="btn-delete-account" onClick={() => setShowDeleteConfirm(true)}>
            Delete My Account
          </button>
        ) : (
          <motion.div className="delete-confirm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p>Are you sure? This will delete your account and all your data permanently.</p>
            <div className="profile-form-actions">
              <button className="btn btn-secondary btn-sm"
                onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-delete-confirm" onClick={handleDeleteAccount}>
                Yes, Delete Everything
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default ProfilePage;