"""Authenticated Social Studio API routes."""
from __future__ import annotations

from fastapi import APIRouter, File, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse

import social_store


def build_social_router(check_auth) -> APIRouter:
    router = APIRouter(prefix="/api/social", tags=["social-studio"])

    def authorize(authorization: str | None) -> None:
        check_auth((authorization or "").removeprefix("Bearer ").strip() or None)

    def store_call(fn, *args, **kwargs):
        try:
            return fn(*args, **kwargs)
        except social_store.SocialStoreError as exc:
            message = str(exc)
            status = 404 if "not found" in message else 400
            raise HTTPException(status_code=status, detail=message) from exc

    @router.get("/drafts")
    def drafts(authorization: str | None = Header(default=None)):
        authorize(authorization)
        return {"drafts": store_call(social_store.list_drafts)}

    @router.post("/drafts", status_code=201)
    def create(payload: dict, authorization: str | None = Header(default=None)):
        authorize(authorization)
        return store_call(social_store.create_draft, payload or {})

    @router.get("/drafts/{draft_id}")
    def get(draft_id: str, authorization: str | None = Header(default=None)):
        authorize(authorization)
        return store_call(social_store.get_draft, draft_id)

    @router.patch("/drafts/{draft_id}")
    def update(
        draft_id: str,
        payload: dict,
        authorization: str | None = Header(default=None),
    ):
        authorize(authorization)
        return store_call(social_store.update_draft, draft_id, payload or {})

    @router.delete("/drafts/{draft_id}", status_code=204)
    def delete(draft_id: str, authorization: str | None = Header(default=None)):
        authorize(authorization)
        store_call(social_store.delete_draft, draft_id)

    @router.post("/drafts/{draft_id}/media", status_code=201)
    def upload_media(
        draft_id: str,
        media: UploadFile = File(...),
        authorization: str | None = Header(default=None),
    ):
        authorize(authorization)
        try:
            return store_call(
                social_store.add_media,
                draft_id,
                media.file,
                filename=media.filename or "media",
                content_type=media.content_type,
            )
        finally:
            media.file.close()

    @router.get("/drafts/{draft_id}/media/{media_id}")
    def download_media(
        draft_id: str,
        media_id: str,
        download: bool = False,
        authorization: str | None = Header(default=None),
    ):
        authorize(authorization)
        item, target = store_call(social_store.get_media, draft_id, media_id)
        disposition = "attachment" if download else "inline"
        return FileResponse(
            target,
            media_type=item["content_type"],
            filename=item["original_name"] if download else None,
            content_disposition_type=disposition,
        )

    @router.delete("/drafts/{draft_id}/media/{media_id}", status_code=204)
    def remove_media(
        draft_id: str,
        media_id: str,
        authorization: str | None = Header(default=None),
    ):
        authorize(authorization)
        store_call(social_store.delete_media, draft_id, media_id)

    return router
