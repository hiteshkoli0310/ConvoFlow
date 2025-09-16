import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(authUser?.profilePic || null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedImage) {
        await updateProfile({ fullName: name, bio });
        navigate("/");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onload = async () => {
        const base64Image = reader.result;
        await updateProfile({ profilePic: base64Image, fullName: name, bio });
        navigate("/");
      };
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-5 float-animation"
             style={{ background: 'var(--accent-primary)' }}></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full opacity-5 float-animation"
             style={{ background: 'var(--accent-secondary)', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full opacity-3 float-animation"
             style={{ background: 'var(--accent-primary)', animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 py-6 fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all duration-200 ripple"
              style={{ color: 'var(--accent-primary)' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            {/* ConvoFlow Logo */}
            <div className="flex items-center gap-3">
              <img 
                src={assets.logo_icon} 
                alt="ConvoFlow" 
                className="w-10 h-10 rounded-xl" 
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                ConvoFlow
              </h1>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 relative z-10">
        <div className="w-full max-w-2xl slide-in-up">
          <div className="glass-morphism-strong rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent mb-2"
                  style={{ 
                    lineHeight: '1.2',
                    paddingBottom: '0.2em'
                  }}>
                Edit Profile
              </h2>
              <p className="opacity-80" style={{ color: 'var(--text-muted)' }}>
                Update your profile information
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Left Side - Profile Picture */}
                <div className="flex flex-col items-center space-y-4 lg:w-1/3">
                  <div className="relative">
                    {/* Profile Image */}
                    <div className="relative">
                      <img
                        src={imagePreview || assets.avatar_icon}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover shadow-lg border-4"
                        style={{ borderColor: 'var(--accent-primary)' }}
                      />
                      {/* Upload Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                      />
                    </div>
                    
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse -z-10"
                         style={{ background: 'var(--accent-primary)' }}></div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                      Upload Profile Picture
                    </p>
                    <p className="text-xs opacity-70 mt-1" style={{ color: 'var(--text-muted)' }}>
                      Click on the image to change
                    </p>
                  </div>
                </div>

                {/* Right Side - Form Fields */}
                <div className="flex-1 space-y-6 lg:w-2/3">
                  {/* Full Name Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border-2 input-glow transition-all duration-300 placeholder:text-[var(--text-muted)]"
                      style={{
                        background: 'var(--bg-secondary)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Bio Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-4 rounded-xl border-2 input-glow transition-all duration-300 resize-none placeholder:text-[var(--text-muted)]"
                      style={{
                        background: 'var(--bg-secondary)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex-1 py-4 px-6 rounded-xl border-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                    background: 'transparent'
                  }}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-4 px-6 rounded-xl font-semibold text-white relative overflow-hidden btn-hover-effect ripple transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)`
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
