from googleapiclient.discovery import build
from fastapi import APIRouter

router = APIRouter()
def get_youtube_trending():
    youtube = build('youtube', 'v3', developerKey='AIzaSyAK-AZ-hih2RURn4YD4solwj0A-MEgvRAA')
    request = youtube.videos().list(
        part="snippet,statistics",
        chart="mostPopular",
        regionCode="VN",
        maxResults=20
    )
    response = request.execute()
    return [video['snippet']['title'] for video in response['items']]

@router.get("/youtube-trending", response_model=list[str])
async def youtube_trending_endpoint():
    """
    Endpoint to get YouTube trending videos.
    
    Returns:
        list[str]: A list of trending video titles.
    """
    trending_videos = get_youtube_trending()
    return trending_videos