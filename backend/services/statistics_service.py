from datetime import datetime
from googleapiclient.discovery import build
from typing import  Optional
from config.config import settings
from dto.video_dto import SocialStatics, SummaryVideoStatistics, VideoStatistics
from sqlalchemy.orm import Session
from sqlalchemy import select


from models.video import Video

def get_video_statistics(video_youtube_id: str , video_id : str) -> Optional[SocialStatics]:
    youtube = build("youtube", "v3", developerKey=settings.YOUTUBE_DATA_KEY)
    request = youtube.videos().list(
        part="snippet,statistics",
        id=video_youtube_id
    )

    response = request.execute()

    if "items" in response and len(response["items"]) > 0:
        video = response["items"][0]
        snippet = video["snippet"]
        stats = video["statistics"]

        video_data = VideoStatistics(
            video_id=video_id,
            video_youtube_id = video_youtube_id , 
            title=snippet["title"],
            publishedAt=datetime.fromisoformat(snippet["publishedAt"].replace("Z", "+00:00")),
            viewCount=int(stats["viewCount"]),
            likeCount=int(stats["likeCount"]) if "likeCount" in stats else None,
            commentCount=int(stats["commentCount"]) if "commentCount" in stats else None
        )

        return SocialStatics(platform="YouTube", statistics=[video_data], summary=SummaryVideoStatistics(
            total_views=video_data.viewCount,
            total_likes=video_data.likeCount if video_data.likeCount is not None else 0,
            total_count=1
        ))
    return None

def get_all_statistic(db: Session, user_id: str) -> SocialStatics:
    stmt = select(Video).where(Video.user_id == user_id)
    videos = db.execute(stmt).scalars().all()

    if not videos:
        return None

    statistics_list = []
    total_views = 0
    total_likes = 0
    total_count = 0

    for video in videos:
        if video.youtube_id: 
            print(video.youtube_id)
            stat = get_video_statistics(video.youtube_id , str(video.id))
            if stat and stat.statistics:
                video_stat = stat.statistics[0]
                statistics_list.append(video_stat)
                
                total_views += video_stat.viewCount
                if video_stat.likeCount is not None:
                    total_likes += video_stat.likeCount
                total_count += 1

    if not statistics_list:
        return None

    summary = SummaryVideoStatistics(
        total_views=total_views,
        total_likes=total_likes,
        total_count=total_count
    )

    return SocialStatics(platform="YouTube", statistics=statistics_list, summary=summary)