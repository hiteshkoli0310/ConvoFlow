import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null)
  const navigate = useNavigate()
  const [name, setName] = useState("Martin Johnson")
  const [bio, setBio] = useState(
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod."
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0D1F1B] flex items-center justify-center px-6 py-10">
      <div className="flex flex-col md:flex-row items-center gap-10 bg-[#112821]/90 p-10 rounded-2xl shadow-lg w-full max-w-3xl">
        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 flex-1 text-white w-full"
        >
          <h3 className="text-2xl font-semibold text-emerald-400">
            Profile Details
          </h3>

          {/* Avatar Upload */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-4 cursor-pointer text-gray-300 hover:text-emerald-400"
          >
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : assets.avatar_icon
              }
              alt="avatar"
              className={`w-14 h-14 object-cover ${
                selectedImg ? 'rounded-full' : ''
              }`}
            />
            <span className="text-sm">Upload Profile Picture</span>
          </label>

          {/* Name */}
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="p-3 border border-green-700 rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Your name"
            required
          />

          {/* Bio */}
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            className="p-3 border border-green-700 rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={4}
          ></textarea>

          {/* Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white py-3 rounded-full text-lg font-medium transition"
          >
            Save
          </button>
        </form>

        {/* Logo Section */}
        <div className="flex justify-center md:justify-end w-full md:w-auto">
          <img
            className="w-36 h-36 rounded-full object-contain"
            src={assets.logo_icon}
            alt="logo"
          />
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
