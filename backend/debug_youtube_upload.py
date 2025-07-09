#!/usr/bin/env python3
"""
Script để debug và test YouTube upload functionality
"""

import asyncio
import httpx
import json
from datetime import datetime

class YouTubeUploadTester:
    def __init__(self, base_url="http://127.0.0.1:8000"):
        self.base_url = base_url
        
    async def test_connection(self, access_token):
        """Test YouTube connection"""
        print("🧪 Testing YouTube connection...")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/video/youtube/test-connection",
                    data={"access_token": access_token},
                    headers={"Authorization": "Bearer YOUR_AUTH_TOKEN_HERE"}  # Replace with actual auth token
                )
                
                print(f"Response status: {response.status_code}")
                result = response.json()
                print(f"Response: {json.dumps(result, indent=2)}")
                
                return response.status_code == 200
                
            except Exception as e:
                print(f"❌ Connection test failed: {str(e)}")
                return False
    
    async def test_upload(self, access_token, video_url, title="Test Video", description="Test upload"):
        """Test video upload"""
        print("📤 Testing video upload...")
        
        async with httpx.AsyncClient(timeout=600.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/video/youtube/upload",
                    data={
                        "access_token": access_token,
                        "video_url": video_url,
                        "title": title,
                        "description": description
                    },
                    headers={"Authorization": "Bearer YOUR_AUTH_TOKEN_HERE"}  # Replace with actual auth token
                )
                
                print(f"Response status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Upload successful!")
                    print(f"Video ID: {result.get('data', {}).get('video_id')}")
                    print(f"Video URL: {result.get('data', {}).get('video_url')}")
                else:
                    error = response.json()
                    print(f"❌ Upload failed: {error}")
                
                return response.status_code == 200
                
            except Exception as e:
                print(f"❌ Upload test failed: {str(e)}")
                return False
    
    async def validate_video_url(self, video_url):
        """Validate if video URL is accessible"""
        print(f"🔍 Validating video URL: {video_url}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.head(video_url)
                print(f"URL status: {response.status_code}")
                print(f"Content-Type: {response.headers.get('content-type', 'unknown')}")
                print(f"Content-Length: {response.headers.get('content-length', 'unknown')}")
                
                return response.status_code == 200
                
            except Exception as e:
                print(f"❌ URL validation failed: {str(e)}")
                return False

async def main():
    """Main test function"""
    tester = YouTubeUploadTester()
    
    # Example usage - replace with your actual values
    access_token = "YOUR_YOUTUBE_ACCESS_TOKEN"
    video_url = "https://example.com/your-video.mp4"  # Replace with actual video URL
    
    print("=" * 50)
    print("YouTube Upload Debug Tool")
    print("=" * 50)
    
    # Test 1: Validate video URL
    print("\n1. Validating video URL...")
    url_valid = await tester.validate_video_url(video_url)
    
    # Test 2: Test YouTube connection
    print("\n2. Testing YouTube connection...")
    connection_ok = await tester.test_connection(access_token)
    
    # Test 3: Test upload (only if previous tests pass)
    if url_valid and connection_ok:
        print("\n3. Testing video upload...")
        upload_ok = await tester.test_upload(
            access_token, 
            video_url,
            f"Test Video {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "Test video uploaded by debug script"
        )
    else:
        print("\n3. Skipping upload test due to previous failures")
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    asyncio.run(main())
