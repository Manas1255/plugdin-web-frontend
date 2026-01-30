import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profile';
import './ProfileSettingsPage.css';

const PROFILE_PICTURE_MAX_MB = 20;

export const ProfileSettingsPage = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/auth?redirect=/profile/settings');
      return;
    }
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setBio(user.bio ?? '');
    setProfilePicturePreview(user.profilePicture ?? null);
  }, [user, isAuthenticated, navigate]);

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');
    if (!file) {
      setProfilePictureFile(null);
      setProfilePicturePreview(user?.profilePicture ?? null);
      return;
    }
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please choose a JPG, PNG, or WebP image.');
      setProfilePictureFile(null);
      return;
    }
    if (file.size > profileService.profilePictureMaxSizeBytes) {
      setError(`Image must be under ${PROFILE_PICTURE_MAX_MB}MB.`);
      setProfilePictureFile(null);
      return;
    }
    setProfilePictureFile(file);
    setProfilePicturePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const updated = await profileService.updateProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        bio: bio.trim() || undefined,
        profilePicture: profilePictureFile ?? undefined,
      });
      updateUser(updated);
      setSuccess(true);
      setProfilePictureFile(null);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: { message?: string }; message?: string } } }).response?.data?.error?.message ||
            (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="profile-settings-page">
      <Navbar />
      <div className="profile-settings-container">
        <div className="profile-settings-header">
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">
            Update your name, bio, and profile picture. Changes are saved to your account.
          </p>
        </div>

        {error && <div className="form-error-banner">{error}</div>}
        {success && (
          <div className="profile-success-message">Your profile has been updated successfully.</div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-form-section">
            <h2 className="profile-section-title">Profile picture</h2>
            <div className="profile-form-group">
              <div className="profile-picture-area">
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Profile"
                    className="profile-picture-preview"
                  />
                ) : (
                  <div className="profile-picture-placeholder">{initials}</div>
                )}
                <div className="profile-picture-upload">
                  <label className="label">Choose a new photo</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handlePictureChange}
                    className="input"
                  />
                  <p className="profile-picture-hint">JPG, PNG or WebP. Max {PROFILE_PICTURE_MAX_MB}MB.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-form-section">
            <h2 className="profile-section-title">Basic information</h2>
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label className="label">First name</label>
                <input
                  type="text"
                  className="input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="profile-form-group">
                <label className="label">Last name</label>
                <input
                  type="text"
                  className="input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="profile-form-group">
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={user.email}
                disabled
                aria-readonly
                title="Email cannot be changed here"
              />
              <p className="profile-picture-hint">Email cannot be changed in profile settings.</p>
            </div>
            <div className="profile-form-group">
              <label className="label">Bio</label>
              <textarea
                className="input textarea"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Software developer and tech enthusiast"
              />
            </div>
          </div>

          <div className="profile-form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
