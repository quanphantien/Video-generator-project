import React, { useState } from 'react';
import { useProtectedApi, useGet, usePost } from '../../hooks/useApi';
import api from '../../services/authService';

const ProtectedApiDemo = () => {
    const { loading: apiLoading, error: apiError, callApi } = useProtectedApi();
    const [response, setResponse] = useState(null);
    const [endpoint, setEndpoint] = useState('/auth/me');
    const [method, setMethod] = useState('GET');
    const [requestBody, setRequestBody] = useState('');

    const handleApiCall = async () => {
        try {
            let result;
            const options = {
                method: method,
                url: endpoint
            };

            if (method !== 'GET' && requestBody) {
                try {
                    options.data = JSON.parse(requestBody);
                } catch (e) {
                    alert('Invalid JSON in request body');
                    return;
                }
            }

            result = await callApi(endpoint, options);
            setResponse(result);
        } catch (error) {
            console.error('API call failed:', error);
        }
    };

    const predefinedEndpoints = [
        { label: 'Get Current User (/auth/me)', value: '/auth/me', method: 'GET' },
        { label: 'Get Videos (/videos)', value: '/videos', method: 'GET' },
        { label: 'Get Statistics (/statistics)', value: '/statistics', method: 'GET' },
        { label: 'Get Trends (/trends)', value: '/trends', method: 'GET' },
    ];

    const handlePredefinedEndpoint = (selectedEndpoint) => {
        setEndpoint(selectedEndpoint.value);
        setMethod(selectedEndpoint.method);
        setRequestBody('');
        setResponse(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Demo Protected API Calls</h2>
            
            {/* Predefined endpoints  */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Các endpoint có sẵn:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {predefinedEndpoints.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handlePredefinedEndpoint(item)}
                            className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="font-medium text-purple-600">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.method} {item.value}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom API call form */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Custom API Call:</h3>
                
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                HTTP Method
                            </label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                        </div>
                        <div className="flex-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Endpoint
                            </label>
                            <input
                                type="text"
                                value={endpoint}
                                onChange={(e) => setEndpoint(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                placeholder="/api/endpoint"
                            />
                        </div>
                    </div>

                    {method !== 'GET' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Request Body (JSON)
                            </label>
                            <textarea
                                value={requestBody}
                                onChange={(e) => setRequestBody(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                placeholder='{"key": "value"}'
                            />
                        </div>
                    )}

                    <button
                        onClick={handleApiCall}
                        disabled={apiLoading}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                            apiLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500'
                        }`}
                    >
                        {apiLoading ? 'Calling API...' : 'Call API'}
                    </button>
                </div>
            </div>

            {/* Error display */}
            {apiError && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    <h4 className="font-medium">Error:</h4>
                    <pre className="mt-2 text-sm overflow-auto">
                        {JSON.stringify(apiError, null, 2)}
                    </pre>
                </div>
            )}

            {/* Response display */}
            {response && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Response:</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                        <pre className="text-sm overflow-auto max-h-96">
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {/* Authentication status */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-900">Authentication Status:</h4>
                <div className="mt-2 text-sm text-blue-700">
                    <p>Access Token: {localStorage.getItem('accessToken') ? '✅ Present' : '❌ Missing'}</p>
                    <p>Refresh Token: {localStorage.getItem('refreshToken') ? '✅ Present' : '❌ Missing'}</p>
                    <p>User Data: {localStorage.getItem('user') ? '✅ Present' : '❌ Missing'}</p>
                </div>
            </div>
        </div>
    );
};

export default ProtectedApiDemo;
