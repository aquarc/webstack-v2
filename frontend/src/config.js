// src/config/index.js

// Default to localhost if environment variable is not set
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// API endpoints
export const endpoints = {
    findQuestionsV2: `${API_URL}/find-questions-v2`,
    register: `${API_URL}/sat/register`,
    findQuestions: `${API_URL}/sat/find-questions`,
    test: `${API_URL}/sat/test`
};

// Config object for other settings if needed
const config = {
    API_URL,
    endpoints,
    // Add other configuration settings here
};

export default config;