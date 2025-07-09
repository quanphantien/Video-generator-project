from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
import httpx
import asyncio
from app_code import appCode
from dependencies.auth_config import get_user_id_from_token
from database.session import SessionLocal
from dependencies.db import get_db
from dto.standard_response import StandardResponse
from dto.video_dto import VideoEditRequest, VideoEditResponse, VideoRequest, VideoResponse
from services.video_service import generate_video, edit_video, get_user_videos , delete_video
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/generate", response_model=StandardResponse[VideoResponse])
async def generate_video_endpoint(request: VideoRequest , user_id: str = Depends(get_user_id_from_token) , db: Session = Depends(get_db)):
    return  StandardResponse(
                code = appCode.SUCCESS , 
                message = "Generate video succesfully  " ,
                data = generate_video(request=request ,  user_id= user_id , db= db))
@router.post("/edit", response_model=StandardResponse[VideoEditResponse])
async def edit_video_endpoint(video_id: str,  request : VideoEditRequest , db: Session = Depends(get_db)):
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Edit video succesfully  " ,
                data = VideoEditResponse(success=True, new_video=edit_video(video_id , request  ,db)))
    
@router.get("", response_model=StandardResponse[list[VideoResponse]])
async def get_videos(db: Session = Depends(get_db)  ,user_id = Depends(get_user_id_from_token)   ):
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Get video succesfully  " ,
                data = get_user_videos(db= db, user_id=user_id))
    
@router.delete("/{video_id}", response_model=StandardResponse[bool])
async def delete_video_endpoint(video_id: str, db: Session = Depends(get_db) , user_id = Depends(get_user_id_from_token)):
    success = delete_video(video_id=video_id,db= db , user_id= user_id)
    return StandardResponse(
                code = appCode.SUCCESS , 
                message = "Delete succesfully  " ,
                data = True)

@router.post("/youtube/upload")
async def upload_to_youtube(
    video_url: str = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    access_token: str = Form(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    """
    Endpoint để upload video lên YouTube thông qua proxy
    """
    try:
        # Validate inputs
        if not access_token:
            raise HTTPException(status_code=400, detail="Access token is required")
        
        if not video_url:
            raise HTTPException(status_code=400, detail="Video URL is required")
        
        if not title or len(title.strip()) == 0:
            title = "Untitled Video"
        
        # Validate video URL format
        if not (video_url.startswith('http://') or video_url.startswith('https://')):
            raise HTTPException(status_code=400, detail="Invalid video URL format")
        
        print(f"🚀 Starting YouTube upload for user {user_id}")
        print(f"📹 Video URL: {video_url}")
        print(f"📝 Title: {title}")
        print(f"📄 Description: {description[:100]}...")
        
        # Validate access token trước khi sử dụng
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                token_info_response = await client.get(
                    f"https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={access_token}"
                )
                
                if token_info_response.status_code != 200:
                    print(f"❌ Invalid access token: {token_info_response.text}")
                    raise HTTPException(
                        status_code=401, 
                        detail="Invalid or expired access token. Please refresh your token."
                    )
                
                token_info = token_info_response.json()
                required_scope = "https://www.googleapis.com/auth/youtube.upload"
                
                if required_scope not in token_info.get("scope", ""):
                    print(f"❌ Missing required scope. Current scopes: {token_info.get('scope', '')}")
                    raise HTTPException(
                        status_code=403,
                        detail="Access token does not have required YouTube upload permissions"
                    )
                
                print(f"✅ Access token validated. Expires in: {token_info.get('expires_in', 'unknown')} seconds")
                
        except httpx.TimeoutException:
            raise HTTPException(status_code=408, detail="Token validation timeout")
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Token validation error: {str(e)}")
        
        # Tải video từ URL với retry mechanism
        max_retries = 3
        video_content = None
        content_type = "video/mp4"
        
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=300.0) as client:
                    print(f"📥 Downloading video from: {video_url} (Attempt {attempt + 1}/{max_retries})")
                    video_response = await client.get(video_url)
                    if video_response.status_code != 200:
                        print(f"❌ Failed to download video: {video_response.status_code}")
                        if attempt == max_retries - 1:
                            raise HTTPException(status_code=400, detail=f"Cannot download video: {video_response.status_code}")
                        continue
                    
                    video_content = video_response.content
                    content_type = video_response.headers.get('content-type', 'video/mp4')
                    print(f"✅ Video downloaded successfully, size: {len(video_content)} bytes, type: {content_type}")
                    break
                    
            except httpx.TimeoutException:
                print(f"⏰ Download timeout on attempt {attempt + 1}")
                if attempt == max_retries - 1:
                    raise HTTPException(status_code=408, detail="Video download timeout")
                await asyncio.sleep(2)  # Wait before retry
            except Exception as e:
                print(f"❌ Download error on attempt {attempt + 1}: {str(e)}")
                if attempt == max_retries - 1:
                    raise HTTPException(status_code=500, detail=f"Download error: {str(e)}")
                await asyncio.sleep(2)
        
        if not video_content:
            raise HTTPException(status_code=500, detail="Failed to download video content")
        
        # Metadata cho YouTube
        metadata = {
            "snippet": {
                "title": title or "Untitled Video",
                "description": description or "Video được tạo bởi AI Video Generator",
                "tags": ["AI Video", "Video Generator", "Automation"],
                "categoryId": "22"
            },
            "status": {
                "privacyStatus": "private",
                "embeddable": True,
                "license": "youtube"
            }
        }
        
        print(f"📤 Initiating YouTube upload...")
        
        # Khởi tạo resumable upload với retry
        upload_url = None
        max_upload_retries = 2
        
        for attempt in range(max_upload_retries):
            try:
                async with httpx.AsyncClient(timeout=300.0) as client:
                    init_response = await client.post(
                        "https://www.googleapis.com/youtube/v3/videos",
                        params={
                            "uploadType": "resumable",
                            "part": "snippet,status"
                        },
                        headers={
                            "Authorization": f"Bearer {access_token}",
                            "Content-Type": "application/json",
                            "X-Upload-Content-Type": content_type,
                            "X-Upload-Content-Length": str(len(video_content))
                        },
                        json=metadata
                    )
                    
                    print(f"📋 Init response status: {init_response.status_code}")
                    print(f"📋 Response headers: {dict(init_response.headers)}")
                    
                    if init_response.status_code == 401:
                        raise HTTPException(
                            status_code=401, 
                            detail="Access token expired or invalid. Please refresh your token and try again."
                        )
                    elif init_response.status_code == 403:
                        error_detail = init_response.text
                        print(f"❌ 403 Error detail: {error_detail}")
                        raise HTTPException(
                            status_code=403,
                            detail="Insufficient permissions. Make sure your token has YouTube upload scope and quota is available."
                        )
                    elif init_response.status_code != 200:
                        error_detail = init_response.text
                        print(f"❌ Init upload failed: {error_detail}")
                        if attempt == max_upload_retries - 1:
                            raise HTTPException(status_code=init_response.status_code, detail=f"Init upload failed: {error_detail}")
                        await asyncio.sleep(3)  # Wait before retry
                        continue
                    
                    # Lấy upload URL từ Location header
                    upload_url = init_response.headers.get("Location")
                    if not upload_url:
                        print(f"❌ No Location header in response")
                        if attempt == max_upload_retries - 1:
                            raise HTTPException(status_code=500, detail="No upload URL received from YouTube")
                        await asyncio.sleep(3)
                        continue
                    
                    print(f"✅ Upload URL received: {upload_url[:50]}...")
                    break
                    
            except HTTPException:
                raise  # Re-raise HTTP exceptions immediately
            except Exception as e:
                print(f"❌ Init upload error on attempt {attempt + 1}: {str(e)}")
                if attempt == max_upload_retries - 1:
                    raise HTTPException(status_code=500, detail=f"Init upload error: {str(e)}")
                await asyncio.sleep(3)
        
        # Upload video content với chunked upload cho file lớn
        print(f"⬆️ Uploading video content...")
        
        try:
            # Nếu file nhỏ hơn 50MB, upload một lần
            if len(video_content) < 50 * 1024 * 1024:
                async with httpx.AsyncClient(timeout=600.0) as client:
                    upload_response = await client.put(
                        upload_url,
                        content=video_content,
                        headers={
                            "Content-Type": content_type,
                            "Content-Length": str(len(video_content))
                        }
                    )
                    
                    print(f"📤 Upload response status: {upload_response.status_code}")
                    
                    if upload_response.status_code not in [200, 201]:
                        error_detail = upload_response.text
                        print(f"❌ Upload failed: {error_detail}")
                        
                        # Thử parse JSON để lấy thông tin lỗi chi tiết
                        try:
                            error_json = upload_response.json()
                            error_message = error_json.get('error', {}).get('message', error_detail)
                            print(f"❌ Detailed error: {error_message}")
                            raise HTTPException(status_code=upload_response.status_code, detail=f"Upload failed: {error_message}")
                        except:
                            raise HTTPException(status_code=upload_response.status_code, detail=f"Upload failed: {error_detail}")
                    
                    result = upload_response.json()
                    
            else:
                # Chunked upload cho file lớn
                print(f"📦 Using chunked upload for large file...")
                chunk_size = 10 * 1024 * 1024  # 10MB chunks
                uploaded = 0
                
                async with httpx.AsyncClient(timeout=900.0) as client:
                    while uploaded < len(video_content):
                        chunk_end = min(uploaded + chunk_size, len(video_content))
                        chunk = video_content[uploaded:chunk_end]
                        
                        headers = {
                            "Content-Type": content_type,
                            "Content-Range": f"bytes {uploaded}-{chunk_end-1}/{len(video_content)}"
                        }
                        
                        print(f"📤 Uploading chunk: {uploaded}-{chunk_end-1}/{len(video_content)}")
                        
                        upload_response = await client.put(
                            upload_url,
                            content=chunk,
                            headers=headers
                        )
                        
                        if upload_response.status_code in [200, 201]:
                            # Upload complete
                            result = upload_response.json()
                            break
                        elif upload_response.status_code == 308:
                            # Continue uploading
                            uploaded = chunk_end
                            continue
                        else:
                            error_detail = upload_response.text
                            print(f"❌ Chunk upload failed: {error_detail}")
                            raise HTTPException(status_code=upload_response.status_code, detail=f"Chunk upload failed: {error_detail}")
            
            video_id = result.get("id")
            if not video_id:
                print(f"❌ No video ID in response: {result}")
                raise HTTPException(status_code=500, detail="No video ID received from YouTube")
            
            print(f"🎉 Upload successful! Video ID: {video_id}")
            
            return StandardResponse(
                code=appCode.SUCCESS,
                message="Video uploaded to YouTube successfully",
                data={
                    "video_id": video_id,
                    "video_url": f"https://www.youtube.com/watch?v={video_id}",
                    "status": "private",
                    "title": title
                }
            )
            
        except httpx.TimeoutException:
            print(f"⏰ Upload content timeout")
            raise HTTPException(status_code=408, detail="Upload timeout - please try again")
        except httpx.RequestError as e:
            print(f"🌐 Network error during upload: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Network error during upload: {str(e)}")
            
    except httpx.TimeoutException:
        print(f"⏰ Upload timeout")
        raise HTTPException(status_code=408, detail="Upload timeout - video file too large or slow connection")
    except httpx.RequestError as e:
        print(f"🌐 Network error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
    except Exception as e:
        print(f"💥 Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")
    



@router.post("/youtube/refresh-token")
async def refresh_youtube_token(
    refresh_token: str = Form(...),
    client_id: str = Form(...),
    client_secret: str = Form(...)
):
    """
    Refresh YouTube access token
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token"
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to refresh token: {response.text}"
                )
            
            token_data = response.json()
            
            return StandardResponse(
                code=appCode.SUCCESS,
                message="Token refreshed successfully",
                data={
                    "access_token": token_data.get("access_token"),
                    "expires_in": token_data.get("expires_in"),
                    "token_type": token_data.get("token_type")
                }
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token refresh error: {str(e)}")


@router.post("/youtube/test-connection")
async def test_youtube_connection(
    access_token: str = Form(...),
    user_id: str = Depends(get_user_id_from_token)
):
    """
    Test YouTube API connection and permissions
    """
    try:
        if not access_token:
            raise HTTPException(status_code=400, detail="Access token is required")
        
        print(f"🧪 Testing YouTube connection for user {user_id}")
        
        # Test token validity
        async with httpx.AsyncClient(timeout=30.0) as client:
            token_info_response = await client.get(
                f"https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={access_token}"
            )
            
            if token_info_response.status_code != 200:
                return StandardResponse(
                    code=401,
                    message="Invalid access token",
                    data={
                        "connected": False,
                        "error": "Token validation failed"
                    }
                )
            
            token_info = token_info_response.json()
            
            # Test YouTube API access
            channel_response = await client.get(
                "https://www.googleapis.com/youtube/v3/channels",
                params={
                    "part": "snippet",
                    "mine": "true"
                },
                headers={
                    "Authorization": f"Bearer {access_token}"
                }
            )
            
            if channel_response.status_code != 200:
                return StandardResponse(
                    code=channel_response.status_code,
                    message="YouTube API access failed",
                    data={
                        "connected": False,
                        "error": f"API call failed: {channel_response.status_code}"
                    }
                )
            
            channel_data = channel_response.json()
            
            return StandardResponse(
                code=appCode.SUCCESS,
                message="YouTube connection successful",
                data={
                    "connected": True,
                    "token_expires_in": token_info.get("expires_in"),
                    "scopes": token_info.get("scope", "").split(),
                    "has_upload_permission": "https://www.googleapis.com/auth/youtube.upload" in token_info.get("scope", ""),
                    "channel_count": len(channel_data.get("items", []))
                }
            )
            
    except Exception as e:
        print(f"❌ Connection test error: {str(e)}")
        return StandardResponse(
            code=500,
            message="Connection test failed",
            data={
                "connected": False,
                "error": str(e)
            }
        )