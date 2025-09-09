import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from "../src/context/AuthContext"; // 👈 import here
import { useState } from 'react';
import { Heart, Star, Trash2, Search, Plus, User, LogOut } from 'lucide-react';
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

const SlangCard = ({ slang, onUpdate }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likes, setLikes] = useState(slang.likes || 0);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      await api.post(`/slang/${slang._id}/like`);
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    try {
      await api.post(`/slang/${slang._id}/favorite`);
      setIsFavorited(!isFavorited);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this slang?')) {
      try {
        await api.delete(`/slang/${slang._id}`);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error deleting slang:', error);
      }
    }
  };

  const handleClick = () => {
    navigate(`/slang/${slang._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 cursor-pointer border border-gray-100 hover:border-purple-200"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-900">{slang.word}</h3>
        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
          {slang.category}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{slang.meaning}</p>
      
      {slang.example && (
        <p className="text-sm text-gray-500 italic mb-4">"{slang.example}"</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
              isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
            }`}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likes}</span>
          </button>
          
          <button
            onClick={handleFavorite}
            className={`p-1 rounded-full transition-colors ${
              isFavorited ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <Star size={16} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
          
          {user && slang.createdBy === user.id && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-full text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        
        <span className="text-xs text-gray-400">
          by {slang.createdByUsername}
        </span>
      </div>
    </div>
  );
};
export default SlangCard;