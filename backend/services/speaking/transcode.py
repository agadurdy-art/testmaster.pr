"""
Audio transcoding for the speaking evaluator.

Converts arbitrary browser audio (webm/ogg/mp4) to 16kHz mono WAV via
ffmpeg (system PATH or the imageio-ffmpeg bundled binary), falling back to
pydub. Split out of services/speaking_evaluator.py (2026-07-02 refactor);
behavior unchanged.
"""
from __future__ import annotations

import asyncio
import logging
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


# ─── Audio transcoding ───────────────────────────────────────────────────────


# Memoize the ffmpeg lookup; logged once at first transcode so deploy logs
# show clearly whether the binary is on PATH (and therefore whether we'll
# fall through to the pydub path on every request).
_ffmpeg_path_logged = False


def _resolve_ffmpeg_once() -> Optional[str]:
    """Locate an ffmpeg binary, preferring system PATH then the bundled
    static binary shipped by imageio-ffmpeg. The latter is included in
    requirements.txt as a deploy-image-independent fallback so transcode
    works even when the pod base image lacks ffmpeg.
    """
    global _ffmpeg_path_logged
    path = shutil.which("ffmpeg")
    source = "system PATH"
    if not path:
        try:
            import imageio_ffmpeg  # type: ignore

            path = imageio_ffmpeg.get_ffmpeg_exe()
            source = "imageio-ffmpeg bundled binary"
        except Exception as exc:  # pragma: no cover — package optional
            if not _ffmpeg_path_logged:
                logger.warning(
                    "Speaking transcode: ffmpeg unavailable on PATH and "
                    "imageio-ffmpeg fallback failed (%s). Pydub will also "
                    "fail because it shells out to the same binary.",
                    exc,
                )
                _ffmpeg_path_logged = True
            return None
    if not _ffmpeg_path_logged:
        logger.info("Speaking transcode: ffmpeg resolved via %s → %s", source, path)
        _ffmpeg_path_logged = True
    return path


async def transcode_to_wav(audio_bytes: bytes) -> bytes:
    """Convert arbitrary browser audio (webm/ogg/mp4) to 16kHz mono WAV.

    Tries ffmpeg first, falls back to pydub. Raises a clear RuntimeError on
    total failure so the caller can surface a useful message instead of
    bubbling a generic FileNotFoundError back to the user.
    """
    if not audio_bytes:
        raise RuntimeError("audio payload is empty")

    ffmpeg_bin = _resolve_ffmpeg_once()

    def _run_sync() -> bytes:
        tmp_in = Path(tempfile.mkstemp(suffix=".webm")[1])
        tmp_out = Path(tempfile.mkstemp(suffix=".wav")[1])
        try:
            tmp_in.write_bytes(audio_bytes)
            ffmpeg_err: Optional[str] = None
            if ffmpeg_bin:
                try:
                    subprocess.run(
                        [
                            ffmpeg_bin, "-y", "-i", str(tmp_in),
                            "-acodec", "pcm_s16le", "-ac", "1", "-ar", "16000",
                            str(tmp_out),
                        ],
                        capture_output=True,
                        check=True,
                    )
                except subprocess.CalledProcessError as exc:
                    ffmpeg_err = (
                        (exc.stderr or b"").decode("utf-8", errors="replace")[-400:]
                        or str(exc)
                    )
            if not ffmpeg_bin or ffmpeg_err is not None:
                try:
                    from pydub import AudioSegment  # type: ignore

                    # Point pydub at whichever ffmpeg we found (system or
                    # imageio-bundled) so it doesn't blow up looking for one
                    # on PATH.
                    if ffmpeg_bin:
                        AudioSegment.converter = ffmpeg_bin
                    audio = AudioSegment.from_file(str(tmp_in))
                    audio = audio.set_channels(1).set_frame_rate(16000)
                    audio.export(str(tmp_out), format="wav")
                except Exception as exc:  # pydub raises CouldntDecodeError etc.
                    raise RuntimeError(
                        "could not decode audio "
                        f"(ffmpeg: {'unavailable' if not ffmpeg_bin else ffmpeg_err}; "
                        f"pydub: {exc!r})"
                    ) from exc
            return tmp_out.read_bytes()
        finally:
            tmp_in.unlink(missing_ok=True)
            tmp_out.unlink(missing_ok=True)

    return await asyncio.to_thread(_run_sync)
