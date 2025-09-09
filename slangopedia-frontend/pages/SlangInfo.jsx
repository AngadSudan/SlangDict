import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link, useParams } from 'react-router-dom';
import { Heart, Star, Trash2, Search, Plus, User, LogOut } from 'lucide-react';
import Navigation from '../components/Navbar';
import { useAuth } from "../src/context/AuthContext"; 
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

const SlangInfo = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slang, setSlang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const fetchSlang = async () => {
      try {
        const response = await api.get(`/slang/${id}`);
        setSlang(response.data);
        setLikes(response.data.likes || 0);
      } catch (error) {
        console.error('Error fetching slang:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlang();
  }, [id]);

  const handleLike = async () => {
    try {
      await api.post(`/slang/${id}/like`);
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleFavorite = async () => {
    try {
      await api.post(`/slang/${id}/favorite`);
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this slang?')) {
      try {
        await api.delete(`/slang/${id}`);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting slang:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!slang) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Slang not found</h1>
            <Link to="/dashboard" className="text-purple-600 hover:text-purple-500">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard" className="text-purple-600 hover:text-purple-500 mb-6 inline-block">
          ← Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{slang.word}</h1>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                {slang.category}
              </span>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Created by: <span className="font-medium">{slang.createdByUsername}</span></p>
              <p>{new Date(slang.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Meaning</h3>
              <p className="text-gray-700 text-lg">{slang.meaning}</p>
            </div>
            
            {slang.example && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Example</h3>
                <p className="text-gray-700 italic">"{slang.example}"</p>
              </div>
            )}
            
            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                }`}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{likes} Likes</span>
              </button>
              
              <button
                onClick={handleFavorite}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  isFavorited ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'
                }`}
              >
                <Star size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                <span>{isFavorited ? 'Favorited' : 'Add to Favorites'}</span>
              </button>
              
              {user && slang.createdBy === user.id && (
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={20} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SlangInfo;