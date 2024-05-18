import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainPage from "./pages/MainPage";
import UserProfilePage from "./pages/UserProfilePage";
import { ToastContainer } from 'react-toastify';
import ProfilePage from "./pages/ProfilePage";
import UpdateUserPage from "./pages/UpdateUserPage";
import PrivateRoute from "./components/PrivateRoute";
import { FollowProvider } from "./components/FollowContext";

function App() {
  return (
    <FollowProvider>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <MainPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/user/:id" 
            element={
              <PrivateRoute>
                <UserProfilePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile/:id" 
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/update-profile/:userId" 
            element={
              <PrivateRoute>
                <UpdateUserPage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </FollowProvider>
  );
}

export default App;
