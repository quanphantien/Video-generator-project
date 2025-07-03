import { useState, useEffect } from 'react';
import api from '../services/authService';

// Custom hook để gọi API
export const useApi = (endpoint, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (customOptions = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api({
                url: endpoint,
                ...options,
                ...customOptions
            });
            
            setData(response.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        fetchData,
        refetch: () => fetchData()
    };
};

// Custom hook để gọi API được bảo vệ
export const useProtectedApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const callApi = async (endpoint, options = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api({
                url: endpoint,
                ...options
            });
            
            return response.data;
        } catch (err) {
            setError(err.response?.data || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        callApi
    };
};

// Hook để gọi API GET
export const useGet = (endpoint, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!endpoint) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await api.get(endpoint);
                setData(response.data);
            } catch (err) {
                setError(err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, dependencies);

    return { data, loading, error };
};

// Hook để gọi API POST
export const usePost = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const post = async (endpoint, data = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.post(endpoint, data);
            return response.data;
        } catch (err) {
            setError(err.response?.data || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { post, loading, error };
};

// Hook để gọi API PUT
export const usePut = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const put = async (endpoint, data = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.put(endpoint, data);
            return response.data;
        } catch (err) {
            setError(err.response?.data || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { put, loading, error };
};

// Hook để gọi API DELETE
export const useDelete = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteData = async (endpoint) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.delete(endpoint);
            return response.data;
        } catch (err) {
            setError(err.response?.data || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { deleteData, loading, error };
};
