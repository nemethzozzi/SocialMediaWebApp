import React from "react";
import Sidebar from "./Sidebar";
import CreatePost from "./CreatePost";
import Searchbar from "./SearchBar";
import Posts from "./Posts";
import Recommendation from "./Recommendation";

function MainPage() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="md:w-1/4 xl:w-1/6 bg-gray-800 text-white">
        <Sidebar />
      </div>
      {/* Main content */}
      <div className="md:w-1/2 xl:w-4/6 flex flex-col items-center p-4">
        <Searchbar />
        <h1 className="mt-6 text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Welcome {user?.username}</h1>
        <div className="w-full max-w-3xl mt-4">
          <Posts />
        </div>
      </div>
      {/* Recommendations */}
      {/* <div className="md:w-1/4 xl:w-1/6 bg-white p-4 border-l">
        <Recommendation />
      </div> */}
    </div>
  );
}

export default MainPage;
