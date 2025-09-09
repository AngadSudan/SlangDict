import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link, useParams } from 'react-router-dom';
import { Heart, Star, Trash2, Search, Plus, User, LogOut } from 'lucide-react';
import Navigation from '../components/Navbar';
import { useAuth } from '../src/context/AuthContext';
import CreateSlang from '../components/CreateSlang';
import SlangCard from '../components/SlangCard';
import axios from 'axios';
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
const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('created');
  const [slangs, setSlangs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSlangs = async (type = 'created') => {
    setLoading(true);
    try {
      // For now, we'll fetch all slangs and filter on frontend
      // In a real app, you'd have separate endpoints for user's created/liked/favorited slangs
      const response = await api.get('/slang');
      const allSlangs = response.data.slangs || response.data;
      
      let filteredSlangs = [];
      if (type === 'created') {
        filteredSlangs = allSlangs.filter(slang => slang.createdBy === user.id);
      } else if (type === 'liked') {
        // In a real app, you'd track which slangs the user liked
        // For now, we'll show a subset as an example
        filteredSlangs = allSlangs.slice(0, 3);
      } else if (type === 'favorited') {
        // In a real app, you'd track which slangs the user favorited
        // For now, we'll show a subset as an example
        filteredSlangs = allSlangs.slice(0, 2);
      }
      
      setSlangs(filteredSlangs);
    } catch (error) {
      console.error('Error fetching slangs:', error);
      setSlangs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlangs(activeTab);
  }, [activeTab, user.id]);

  const tabs = [
    { id: 'created', label: 'Created Slangs', icon: Plus },
    { id: 'liked', label: 'Liked Slangs', icon: Heart },
    { id: 'favorited', label: 'Favorite Slangs', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.username}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-1">Member since {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
<div>
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-gray-900">
      {tabs.find(tab => tab.id === activeTab)?.label}
    </h2>
    <p className="text-gray-600">{slangs.length} slangs found</p>
  </div>

  {/* 👇 Show CreateSlang only in "Created" tab */}
  {activeTab === "created" && (
    <div className="mb-8">
      <CreateSlang onCreated={() => fetchSlangs("created")} />
    </div>
  )}

  {loading ? (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading slangs...</p>
    </div>
  ) : slangs.length === 0 ? (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          {activeTab === 'created' && <Plus size={24} className="text-gray-400" />}
          {activeTab === 'liked' && <Heart size={24} className="text-gray-400" />}
          {activeTab === 'favorited' && <Star size={24} className="text-gray-400" />}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No {activeTab} slangs yet
        </h3>
        <p className="text-gray-600">
          {activeTab === 'created' && "You haven't created any slangs yet. Start by adding your first slang!"}
          {activeTab === 'liked' && "You haven't liked any slangs yet. Explore and like some slangs!"}
          {activeTab === 'favorited' && "You haven't favorited any slangs yet. Mark some as favorites!"}
        </p>
      </div>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {slangs.map((slang) => (
        <SlangCard 
          key={slang._id} 
          slang={slang} 
          onUpdate={() => fetchSlangs(activeTab)} 
        />
      ))}
    </div>
  )}
</div>

      </div>
    </div>
  );
};
export default Profile;