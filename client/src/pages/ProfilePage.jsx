import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import InteractiveShowcase from "../components/InteractiveShowcase";

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
      {/* Themed mesh + globe background */}
      <div className="absolute inset-0 home-mesh-bg" />
      <InteractiveShowcase asBackground globeAlign="left" />
      <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: 'blur(10px) saturate(1.1)', WebkitBackdropFilter: 'blur(10px) saturate(1.1)' }}>
        <div className="absolute inset-0 home-noise" />
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
            <div className="flex items-center gap-3 select-none">
              <img src={assets.logo_icon} alt="ConvoFlow" className="w-10 h-10 rounded-xl" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                ConvoFlow
              </h1>
            </div>
          </div>

          {/* Theme toggle (mobile only to avoid desktop duplicate) */}
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 pb-10 relative z-10">
        <div className="w-full max-w-5xl slide-in-up">
          <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(18px)' }}>
            <div className="grid grid-cols-1 md:grid-cols-[320px,1fr]">
              {/* Left Summary Panel */}
              <aside className="relative p-8 md:p-10 border-b md:border-b-0 md:border-r" style={{ borderColor: 'var(--border-subtle)', background: 'linear-gradient(180deg, rgba(var(--accent-primary-rgb),0.10), transparent)' }}>
                <div className="absolute inset-x-0 -top-16 h-40 blur-2xl opacity-40 pointer-events-none" style={{ background: 'radial-gradient(600px 200px at 30% 30%, rgba(var(--accent-primary-rgb),0.35), transparent 70%)' }} />

                <div className="relative flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <img
                      src={imagePreview || assets.avatar_icon}
                      alt="Profile"
                      className="w-28 h-28 rounded-2xl object-cover border-4 shadow-xl"
                      style={{ borderColor: 'rgba(var(--accent-primary-rgb),0.4)' }}
                    />
                    <label className="absolute inset-0 rounded-2xl cursor-pointer grid place-items-center opacity-0 hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-2xl" />
                    </label>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{name || authUser?.fullName}</h2>
                    <p className="text-sm opacity-80" style={{ color: 'var(--text-muted)' }}>{authUser?.email}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 w-full mt-3">
                    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(var(--accent-primary-rgb),0.08)' }}>
                      <p className="text-xs opacity-70" style={{ color: 'var(--text-muted)' }}>Bio</p>
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{(bio || authUser?.bio || '—').toString()}</p>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Right Edit Panel */}
              <section className="p-6 md:p-10">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">Edit Profile</h3>
                  <p className="mt-1 opacity-80" style={{ color: 'var(--text-muted)' }}>Update your profile information</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border-2 input-glow transition-all duration-300 placeholder:text-[var(--text-muted)]"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-4 rounded-xl border-2 input-glow transition-all duration-300 resize-none placeholder:text-[var(--text-muted)]"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="flex-1 py-4 px-6 rounded-xl border-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', background: 'transparent' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-4 px-6 rounded-xl font-semibold text-white relative overflow-hidden btn-hover-effect ripple transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                      style={{ background: `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)` }}
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
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;