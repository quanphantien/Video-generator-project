
import json
from models.project import Project
from sqlalchemy.orm import Session
from dto.project_dto import ProjectDTO

def create_project(video_url: str, image_urls: list, audio_urls: list, user_id: str, thumbnail: str = None, db: Session = None):
    if isinstance(audio_urls, str):
        audio_urls = json.loads(audio_urls)
    if isinstance(image_urls, str):
        image_urls = json.loads(image_urls)
    project = Project(
        video_url=video_url,
        image_urls=image_urls,
        audio_urls=audio_urls,
        thumbnail_url=thumbnail,
        user_id=user_id
    )
    db.add(project)
    db.commit()
    db.refresh(project)


def getAllProjects(user_id: str, db: Session):
    projects = db.query(Project).filter(Project.user_id == user_id).all()
    return [
        ProjectDTO(
            id=str(p.id),
            video_url=p.video_url,
            image_urls=p.image_urls,
            audio_urls=p.audio_urls,
            thumbnail=p.thumbnail_url,
            user_id=str(p.user_id)
        )
        for p in projects
    ]

