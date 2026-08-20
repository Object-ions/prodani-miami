# Optimised hero video

`hero-video-optimised.mp4` is the storefront's existing hero video, re-encoded for web.

|  | Original (live now) | Optimised |
|---|---|---|
| Size | **5,638 KB** | **374 KB** |
| Video | 1280×720, 3.1 Mbps, 30fps | 1280×720, CRF 27, 24fps |
| Audio | AAC 253 kbps | **none** |

**93% smaller, no visible difference.** The audio track was the easiest win — it can
never be heard, because a background hero video has to be muted to autoplay at all.

Upload this in place of the current file. It is the single highest-impact fix in
`audit/AUDIT.md`: the original is 73% of the homepage payload and the direct cause of
the 7.8s LCP.

`hero-poster.jpg` is a first-frame poster so something is on screen before the video
decodes.

Regenerate with:

```bash
ffmpeg -i original.mp4 -an -r 24 -vf scale=1280:-2 \
  -c:v libx264 -crf 27 -preset slow -profile:v main -pix_fmt yuv420p \
  -movflags +faststart hero-video-optimised.mp4
```
