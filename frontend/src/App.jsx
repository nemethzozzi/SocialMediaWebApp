import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainPage from "./pages/MainPage";
import UserProfilePage from "./pages/UserProfilePage";
import Notifications from "./components/Sidebar/Notifications";
import { ToastContainer } from 'react-toastify';
import ProfilePage from "./pages/ProfilePage";
import UpdateUserPage from "./pages/UpdateUserPage";



function App() {
  return (
    <Router>
    <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/user/:id" element={<UserProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        {/* <Route path="/update-profile/:id" element={<UpdateUserPage />} /> */}
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </Router>
  );
}

export default App;
