import Navigation from "../components/Navbar";
import SlangCard from "../components/SlangCard";
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Heart, Star, Trash2, Search, Plus, User, LogOut } from 'lucide-react';
import axios from 'axios';

import { useAuth } from "../src/context/AuthContext"; 

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard Page
const Dashboard = () => {
  const { user } = useAuth();
  const [slangs, setSlangs] = useState([]);
  const [slangOfTheDay, setSlangOfTheDay] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchSlangs = async (query = '') => {
    try {
      if (query) setSearchLoading(true);
      const response = await api.get(`/slang?q=${query}&limit=20`);
      setSlangs(response.data.slangs || response.data);
    } catch (error) {
      console.error('Error fetching slangs:', error);
      setSlangs([]);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const fetchSlangOfTheDay = async () => {
    try {
      const response = await api.get('/slang?limit=1');
      const allSlangs = response.data.slangs || response.data;
      if (allSlangs.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(allSlangs.length, 10));
        setSlangOfTheDay(allSlangs[randomIndex]);
      }
    } catch (error) {
      console.error('Error fetching slang of the day:', error);
    }
  };

  useEffect(() => {
    fetchSlangs();
    fetchSlangOfTheDay();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSlangs(searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">Discover and explore the world of slang</p>
        </div>

        {/* Slang of the Day */}
        {slangOfTheDay && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Slang of the Day</h2>
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-xl text-white">
              <h3 className="text-2xl font-bold mb-2">{slangOfTheDay.word}</h3>
              <p className="text-lg mb-2">{slangOfTheDay.meaning}</p>
              {slangOfTheDay.example && (
                <p className="text-sm italic opacity-90">Example: "{slangOfTheDay.example}"</p>
              )}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Search for slangs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Slangs Grid */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Slangs'}
          </h2>
          <span className="text-gray-500">{slangs.length} slangs found</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading slangs...</p>
          </div>
        ) : slangs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No slangs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slangs.map((slang) => (
              <SlangCard key={slang._id} slang={slang} onUpdate={() => fetchSlangs(searchQuery)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;