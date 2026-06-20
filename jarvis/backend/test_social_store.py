from __future__ import annotations

import io
import tempfile
import unittest
from pathlib import Path

import social_store


class SocialStoreTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        root = Path(self.temp.name)
        social_store.DATA_ROOT = root
        social_store.DRAFTS_FILE = root / "drafts.json"
        social_store.MEDIA_ROOT = root / "media"

    def tearDown(self):
        self.temp.cleanup()

    def test_draft_media_lifecycle(self):
        draft = social_store.create_draft({
            "title": "Reel draft",
            "caption": "A useful IELTS tip",
            "hashtags": "#ielts, #band7",
            "platforms": ["instagram", "tiktok", "invalid"],
        })
        self.assertEqual(draft["platforms"], ["instagram", "tiktok"])
        self.assertEqual(draft["hashtags"], ["ielts", "band7"])

        updated = social_store.update_draft(draft["id"], {"status": "ready"})
        self.assertEqual(updated["status"], "ready")

        media = social_store.add_media(
            draft["id"],
            io.BytesIO(b"\x89PNG\r\n\x1a\nfake"),
            filename="../../unsafe name.png",
            content_type="image/png",
        )
        item, path = social_store.get_media(draft["id"], media["id"])
        self.assertEqual(item["content_type"], "image/png")
        self.assertTrue(path.is_file())
        self.assertEqual(path.parent.resolve(), (social_store.MEDIA_ROOT / draft["id"]).resolve())

        social_store.delete_media(draft["id"], media["id"])
        self.assertFalse(path.exists())
        social_store.delete_draft(draft["id"])
        self.assertEqual(social_store.list_drafts(), [])

    def test_rejects_invalid_inputs(self):
        draft = social_store.create_draft({"title": "Test"})
        with self.assertRaises(social_store.SocialStoreError):
            social_store.update_draft(draft["id"], {"status": "published"})
        with self.assertRaises(social_store.SocialStoreError):
            social_store.add_media(
                draft["id"],
                io.BytesIO(b"payload"),
                filename="payload.exe",
                content_type="application/octet-stream",
            )


if __name__ == "__main__":
    unittest.main()
