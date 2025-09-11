import React, { useState } from 'react'
import assets from '../assets/assets'
import {AuthContext} from '../../context/AuthContext'

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [isDataSubmitted, setIsDataSubmitted] = useState(false)

  const {login}=userContext(AuthContext);

  const onSubmitHandler = (e) => {
    e.preventDefault()

    if (currState === "Sign up" && !isDataSubmitted) {
      // First step done → move to bio step
      setIsDataSubmitted(true)
      return
    }

    // Final submit (Login OR Signup with Bio)
    console.log({
      fullName,
      email,
      password,
      bio,
    })
    alert(`${currState} successful! 🚀`)
  }

  return (
    <div className="min-h-screen bg-[#0D1F1B] flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col">
      {/* Left Section */}
      <img src={assets.logo_big} alt="logo" className="w-[min(30vw,250px)]" />

      {/* Right Section */}
      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-[#112821]/80 text-white border-green-700 p-6 flex flex-col gap-6 rounded-lg shadow-xl w-[90%] max-w-md"
      >
        {/* Header */}
        <h2 className="font-semibold text-xl flex justify-between items-center text-green-300">
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="back"
              className="w-5 cursor-pointer"
            />
          )}
        </h2>

        {/* Full Signup Fields */}
        {currState === "Sign up" && !isDataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            className="p-2 border border-green-700 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Full Name"
            required
          />
        )}

        {/* Common Inputs */}
        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              className="p-2 border border-green-700 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Email"
              required
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              className="p-2 border border-green-700 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Password"
              required
            />
          </>
        )}

        {/* Bio Step */}
        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            className="p-2 border border-green-700 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Write your Bio..."
            rows={4}
            required
          ></textarea>
        )}

        {/* Button */}
        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-md shadow-md hover:from-emerald-500 hover:to-green-600 transition"
        >
          {currState === "Sign up"
            ? isDataSubmitted
              ? "Finish Signup"
              : "Create Account"
            : "Login Now"}
        </button>

        {/* Checkbox */}
        {!isDataSubmitted && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" required />
            <p>Agree to the terms of use & privacy policy</p>
          </div>
        )}

        {/* Toggle State */}
        <div className="flex flex-col gap-2">
          {currState === "Sign up" ? (
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login")
                  setIsDataSubmitted(false)
                }}
                className="font-medium text-emerald-400 cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              Create an account{" "}
              <span
                onClick={() => setCurrState("Sign up")}
                className="font-medium text-emerald-400 cursor-pointer"
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default LoginPage
