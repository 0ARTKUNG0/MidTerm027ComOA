import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api";
const APP_NAME = process.env.REACT_APP_NAME || "Software Download Manager";

const Dashboard = () => {
  const [software, setSoftware] = useState([]);
  const [filteredSoftware, setFilteredSoftware] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const categories = ["All", "Browser", "Media", "Utilities"];

  // Fetch software data from backend
  useEffect(() => {
    fetchSoftware();
  }, []);

  // Filter software when search term or category changes
  useEffect(() => {
    filterSoftware();
  }, [software, searchTerm, activeCategory]);

  const fetchSoftware = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/software`);
      const data = await response.json();
      setSoftware(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching software:", error);
      setLoading(false);
    }
  };

  const filterSoftware = () => {
    let filtered = software;

    // Filter by category
    if (activeCategory !== "All") {
      filtered = filtered.filter((item) => item.category === activeCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSoftware(filtered);
  };

  const handleDownload = async (softwareId, softwareName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ softwareIds: [softwareId] }),
      });

      // Check if response is a file (binary) or JSON
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/octet-stream")) {
        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${softwareName
          .replace(/\s+/g, "-")
          .toLowerCase()}-installer.exe`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert(`Download started for ${softwareName}!`);
      } else {
        // Handle JSON response (for multiple downloads)
        const data = await response.json();
        if (data.success) {
          alert(`Download links generated for ${softwareName}!`);
          console.log("Download links:", data.downloadLinks);
        } else {
          alert(data.message || "Error starting download");
        }
      }
    } catch (error) {
      console.error("Error downloading software:", error);
      alert("Error starting download");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading software...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with User Info */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{APP_NAME}</h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Find and download your favorite software
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search software..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Software Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSoftware.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              {/* Software Icon/Avatar */}
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  {item.name.charAt(0)}
                </span>
              </div>

              {/* Software Info */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {item.description}
              </p>

              {/* Size and Category */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">{item.size}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {item.category}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm font-medium text-center transition-colors"
                >
                  Visit Site
                </a>
                <button
                  onClick={() => handleDownload(item.id, item.name)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredSoftware.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No software found</div>
            <p className="text-gray-400 mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-8 text-center text-gray-500">
          Showing {filteredSoftware.length} of {software.length} software items
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
