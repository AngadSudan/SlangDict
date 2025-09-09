import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen, Type, FileText, Tag, Send, CheckCircle, AlertCircle } from 'lucide-react';

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

const CreateSlang = () => {
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    example: '',
    category: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // Common slang categories for dropdown
  const categories = [
    'Internet Slang',
    'Youth Slang',
    'Gaming',
    'Music',
    'Sports',
    'Fashion',
    'Technology',
    'Social Media',
    'Pop Culture',
    'Street Slang',
    'Business',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.word.trim()) {
      newErrors.word = 'Word is required';
    } else if (formData.word.trim().length < 2) {
      newErrors.word = 'Word must be at least 2 characters long';
    }
    
    if (!formData.meaning.trim()) {
      newErrors.meaning = 'Meaning is required';
    } else if (formData.meaning.trim().length < 10) {
      newErrors.meaning = 'Meaning must be at least 10 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage({
          type: 'error',
          text: 'Authentication token not found. Please login again.'
        });
        return;
      }

      // Prepare data - only include non-empty fields
      const slangData = {
        word: formData.word.trim(),
        meaning: formData.meaning.trim(),
        ...(formData.example.trim() && { example: formData.example.trim() }),
        ...(formData.category && { category: formData.category })
      };

      const response = await api.post(
        '/slang',
        slangData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Success - clear form and show success message
      setFormData({
        word: '',
        meaning: '',
        example: '',
        category: ''
      });
      
      setMessage({
        type: 'success',
        text: `Great! "${slangData.word}" has been added to Slangopedia! 🎉`
      });

    } catch (error) {
      console.error('Error creating slang:', error);
      
      let errorMessage = 'Failed to create slang. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid data provided.';
      } else if (error.response?.status === 409) {
        errorMessage = 'This slang word already exists in the dictionary.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <BookOpen className="text-white" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-white">Add New Slang</h2>
              <p className="text-purple-100">Contribute to Slangopedia</p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mx-6 mt-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Word Field */}
          <div>
            <label htmlFor="word" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Type size={16} className="text-purple-600" />
              <span>Slang Word *</span>
            </label>
            <input
              type="text"
              id="word"
              name="word"
              value={formData.word}
              onChange={handleInputChange}
              placeholder="e.g., lit, salty, ghosting"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                errors.word 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 focus:border-purple-500'
              }`}
            />
            {errors.word && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>{errors.word}</span>
              </p>
            )}
          </div>

          {/* Meaning Field */}
          <div>
            <label htmlFor="meaning" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="text-purple-600" />
              <span>Meaning *</span>
            </label>
            <textarea
              id="meaning"
              name="meaning"
              value={formData.meaning}
              onChange={handleInputChange}
              rows={3}
              placeholder="Explain what this slang means..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-vertical ${
                errors.meaning 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 focus:border-purple-500'
              }`}
            />
            {errors.meaning && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>{errors.meaning}</span>
              </p>
            )}
          </div>

          {/* Example Field */}
          <div>
            <label htmlFor="example" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="text-gray-400" />
              <span>Example Usage</span>
              <span className="text-xs text-gray-500">(optional)</span>
            </label>
            <textarea
              id="example"
              name="example"
              value={formData.example}
              onChange={handleInputChange}
              rows={2}
              placeholder="Show how this slang is used in a sentence..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-vertical"
            />
          </div>

          {/* Category Field */}
          <div>
            <label htmlFor="category" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Tag size={16} className="text-gray-400" />
              <span>Category</span>
              <span className="text-xs text-gray-500">(optional)</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Add to Slangopedia</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
          <p className="text-xs text-gray-600 text-center">
            Fields marked with * are required. Help grow our slang dictionary! 📚
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateSlang;