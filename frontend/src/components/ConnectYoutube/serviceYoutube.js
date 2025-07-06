import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase-config";

class YouTubeService {
    constructor() {
        this.baseURL = 'https://www.googleapis.com/youtube/v3';
        this.channelId = null;
    }

    // Kết nối YouTube thông qua Firebase Google Auth
    async connectYouTube() {
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
            provider.addScope('https://www.googleapis.com/auth/youtube.upload');

            const result = await signInWithPopup(auth, provider);

            // Lấy access token từ Firebase
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const accessToken = credential.accessToken;

            // Lưu access token và thông tin user vào localStorage
            localStorage.setItem('youtube_access_token', accessToken);
            localStorage.setItem('youtube_user', JSON.stringify({
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL
            }));

            return {
                success: true,
                accessToken: accessToken,
                user: result.user
            };
        } catch (error) {
            console.error('YouTube connection error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Lấy access token đã lưu
    getAccessToken() {
        return localStorage.getItem('youtube_access_token');
    }

    // Lấy thông tin user đã lưu
    getUserInfo() {
        const userStr = localStorage.getItem('youtube_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Kiểm tra xem đã kết nối YouTube chưa
    isConnected() {
        return !!this.getAccessToken();
    }

    // Lấy thông tin kênh
    async getChannelInfo() {
        const accessToken = this.getAccessToken();
        if (!accessToken) {
            throw new Error('YouTube chưa được kết nối');
        }

        try {
            const response = await fetch(`${this.baseURL}/channels?part=snippet,statistics&mine=true`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token hết hạn, xóa token và yêu cầu đăng nhập lại
                    this.disconnect();
                    throw new Error('Token đã hết hạn. Vui lòng kết nối lại YouTube.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const channel = data.items[0];
                this.channelId = channel.id; // Cache channel ID

                return {
                    id: channel.id,
                    title: channel.snippet.title,
                    description: channel.snippet.description,
                    thumbnail: channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
                    subscriberCount: this.formatSubscriberCount(channel.statistics.subscriberCount),
                    videoCount: channel.statistics.videoCount,
                    viewCount: channel.statistics.viewCount
                };
            }
            throw new Error('Không tìm thấy thông tin kênh');
        } catch (error) {
            console.error('Error fetching channel info:', error);
            throw error;
        }
    }

    // Lấy danh sách video từ kênh
    async getChannelVideos(maxResults = 20) {
        const accessToken = this.getAccessToken();
        if (!accessToken) {
            throw new Error('YouTube chưa được kết nối');
        }

        try {
            // Lấy channel ID nếu chưa có
            if (!this.channelId) {
                const channelInfo = await this.getChannelInfo();
                this.channelId = channelInfo.id;
            }

            // Lấy danh sách video từ kênh
            const searchResponse = await fetch(
                `${this.baseURL}/search?part=snippet&channelId=${this.channelId}&maxResults=${maxResults}&order=date&type=video`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!searchResponse.ok) {
                if (searchResponse.status === 401) {
                    this.disconnect();
                    throw new Error('Token đã hết hạn. Vui lòng kết nối lại YouTube.');
                }
                throw new Error(`HTTP error! status: ${searchResponse.status}`);
            }

            const searchData = await searchResponse.json();

            if (searchData.items && searchData.items.length > 0) {
                // Lấy thêm thông tin chi tiết cho từng video
                const videoIds = searchData.items.map(item => item.id.videoId);

                const videosResponse = await fetch(
                    `${this.baseURL}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!videosResponse.ok) {
                    throw new Error(`HTTP error! status: ${videosResponse.status}`);
                }

                const videosData = await videosResponse.json();

                return videosData.items.map(video => ({
                    id: video.id,
                    title: video.snippet.title,
                    description: video.snippet.description,
                    thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
                    publishedAt: video.snippet.publishedAt,
                    viewCount: parseInt(video.statistics.viewCount) || 0,
                    likeCount: parseInt(video.statistics.likeCount) || 0,
                    duration: this.formatDuration(video.contentDetails.duration),
                    channelTitle: video.snippet.channelTitle
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching channel videos:', error);
            throw error;
        }
    }

    // Lấy channel ID
    async getChannelId() {
        if (!this.channelId) {
            const channelInfo = await this.getChannelInfo();
            this.channelId = channelInfo.id;
        }
        return this.channelId;
    }

    // Format số subscriber
    formatSubscriberCount(count) {
        const num = parseInt(count);
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Format thời lượng video
    formatDuration(duration) {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return '0:00';

        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Ngắt kết nối YouTube
    disconnect() {
        localStorage.removeItem('youtube_access_token');
        localStorage.removeItem('youtube_user');
        this.channelId = null;
        return { success: true };
    }

    // Upload video (cần implement backend để handle file upload)
    async uploadVideo(videoFile, title, description, tags = []) {
        const accessToken = this.getAccessToken();
        if (!accessToken) throw new Error('YouTube chưa được kết nối');

        // Sử dụng API base URL từ environment
        const apiBaseUrl = process.env.REACT_APP_CONVEASE_API_BASE_URL || 'http://localhost:8000/';

        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('tags', JSON.stringify(tags));
        formData.append('access_token', accessToken);

        try {
            const response = await fetch(`${apiBaseUrl}api/youtube/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    // Kiểm tra trạng thái kết nối và thông tin cơ bản
    async getConnectionStatus() {
        if (!this.isConnected()) {
            return {
                connected: false,
                user: null,
                channel: null
            };
        }

        try {
            const userInfo = this.getUserInfo();
            const channelInfo = await this.getChannelInfo();

            return {
                connected: true,
                user: userInfo,
                channel: channelInfo
            };
        } catch (error) {
            // Nếu có lỗi (token hết hạn), trả về trạng thái không kết nối
            return {
                connected: false,
                user: null,
                channel: null,
                error: error.message
            };
        }
    }
}

export const youtubeService = new YouTubeService();