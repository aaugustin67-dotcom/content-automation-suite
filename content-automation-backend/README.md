# Content Automation Backend

This project contains the backend services for content automation, including blog post generation and video creation.

## Video Generation Workflow

This section outlines the automated video generation workflow, which converts blog posts into video content.

### Goals

Pull latest posts from my Blogger site, convert to 8–12-scene scripts, fetch stock b-roll, synthesize voiceover, assemble a Shotstack timeline, render MP4(s), and publish artifacts — fully automated, idempotent, CI-ready.

### Secrets / Inputs

The following environment variables are required for the video generation workflow:

- `PEXELS_API_KEY`: API key for Pexels video search.
- `PIXABAY_API_KEY`: API key for Pixabay video search.
- `ELEVEN_API_KEY`: API key for ElevenLabs text-to-speech.
- `SHOTSTACK_API_KEY`: API key for Shotstack video editing API.
- `BLOGGER_FEED_URL`: URL of the Blogger JSON feed.
- `BLOGGER_BLOG_ID`: ID of the Blogger blog.
- `GOOGLE_API_KEY`: API key for Google Blogger API (fallback).
- `OPENAI_API_KEY`: API key for OpenAI for content segmentation.

### Deliverables

- Working CLI: `ingest`, `build`, `render`, `all` (latest N posts → MP4 + metadata).
- `.github/workflows/blog-to-video.yml` (scheduled + manual + repository_dispatch) and `quick-one.yml`.
- `/dist/<postId>/<aspect>/{video.mp4, metadata.json, captions.srt}` per render.
- Idempotency via `/cache/seen.json` committed back on manual runs.
- Clear README “Automation” and “API keys” sections.
- Minimal unit tests for segmentation, SRT timing, and timeline schema.

### Project Structure

```
/src
  /ingest/blogger.ts
  /nlp/segmenter.ts
  /media/pexels.ts
  /media/pixabay.ts
  /tts/eleven.ts
  /assemble/shotstack.ts
  /subtitles/srt.ts
  /pipeline.ts
  /types.ts
/config
  video.json
  providers.json
/cache
/dist
/scripts
  download.ts
README.md
```

### Workflow Steps

1. **Ingest (Blogger)**
   - Primary (no API): fetch JSON feed from `BLOGGER_FEED_URL`, parse entries `{id, url, title, html, publishedAt}`.
   - Fallback (API): `GET https://www.googleapis.com/blogger/v3/blogs/${BLOGGER_BLOG_ID}/posts?maxResults=10&key=${GOOGLE_API_KEY}` when feed fails.
   - Normalize HTML → plain text; keep H1–H3 markers.
   - Skip posts < 300 words. Cache posts in `/cache/posts.json`.

2. **Segment to scenes**
   - Default: OpenAI (`OPENAI_API_KEY`) to summarize into 8–12 single-sentence lines (≤180 chars), each with 3–6 keywords.
   - Fallback heuristic: split by headings/paragraphs; compress; keyword extraction via tf-idf.
   - Output: `Scene[] = { index, text, keywords[] }`.

3. **Media search**
   - Pexels video search first: `GET https://api.pexels.com/videos/search?query=<kw>&per_page=10` with `Authorization: PEXELS_API_KEY`. Choose clips ≥6s, match orientation to aspect (16:9 default).
   - Pixabay fallback: `GET https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=<kw>&video_type=film`.
   - Cache results in `/cache/media.json`. If none found, create a placeholder “title card” instruction for the timeline.

4. **Voiceover (ElevenLabs)**
   - For each scene, call `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` with `ELEVEN_API_KEY`, get MP3/WAV; save to `/dist/audio/<postId>/scene-XX.mp3`.
   - Store durations, build provisional SRT timings at 160 wpm (adjust later if API returns duration).

5. **Assemble Shotstack timeline**
   - Use Edit API: `POST https://api.shotstack.io/edit/v1/render` with `x-api-key: SHOTSTACK_API_KEY`.
   - Build timeline:
     - Track 1: background (brand color/gradient from `/config/video.json`).
     - Track 2: scene b-roll, trimmed/padded to VO length + 0.3s crossfade.
     - Track 3: captions (toggle burnSubtitles), safe margins, font from config.
     - Track 4: logo overlay (top-right, 60% opacity).
     - Audio: concatenated VO.
   - `output: {"format":"mp4","resolution":"hd","fps":30}` (configurable).
   - Poll render status; on success, download MP4 to `/dist/<postId>/<aspect>/video.mp4`.
   - Write `/dist/<postId>/<aspect>/metadata.json` (post URL, scenes, assets, durations, render job id, output URL).
   - Emit `.srt` via `/subtitles/srt.ts`.

6. **Idempotency**
   - Maintain `/cache/seen.json`. Before build/render, if `{postId, aspect}` already present → skip.
   - On manual runs, commit updates to `seen.json` with `[skip ci]`.

7. **CLI**
   - `ingest --limit 5`
   - `build --post <id|latest> --aspects 16:9,9:16 --dry-run`
   - `render --post <id|latest> --aspects 16:9,9:16`
   - `all --latest 1 --aspects 16:9`

8. **GitHub Actions**
   - Create `.github/workflows/blog-to-video.yml`:
     - `on: workflow_dispatch` with inputs: `latestCount`, `aspects`, `dryRun`
     - `schedule: 0 13 * * 1,4`
     - `repository_dispatch: { types: [blog_post_published] }`
     - `permissions: { contents: write }`
     - `concurrency: blog-to-video`
     - `env: map all secrets` (BLOGGER_FEED_URL, BLOGGER_BLOG_ID, GOOGLE_API_KEY, PEXELS_API_KEY, PIXABAY_API_KEY, ELEVEN_API_KEY, SHOTSTACK_API_KEY, OPENAI_API_KEY)
     - Steps: `checkout` → `setup-node@v4 (20)` → `npm ci` → `build` → `run node ./dist/pipeline.js all --latest ${{ inputs.latestCount || 1 }} --aspects "${{ inputs.aspects || '16:9' }}" ${{ inputs.dryRun == 'true' && '--dry-run' || '' }}` → `upload artifacts` (dist/**/*.mp4, dist/**/metadata.json, dist/**/*.srt) → `commit /cache/seen.json` on manual runs with `[skip ci]`.
   - Add `quick-one.yml` that runs `all --latest 1 --aspects 16:9`.

9. **Security & DX**
   - Never log secrets. Fail fast with a clear message if a required key is missing.
   - Rate-limit Pexels/Pixabay; exponential backoff.
   - Windows-friendly: add `npm run build` and `npm run all` scripts; avoid bash-only syntax in docs.

### Acceptance criteria

- `npm run all` (with secrets set) produces at least one MP4 + SRT + metadata from the latest Blogger post.
- Timeline durations match VO within ±300ms per scene.
- If no stock found, placeholder title cards are used, not failures.
- CI artifacts upload successfully; idempotency prevents duplicate renders.

### API Keys

To obtain the necessary API keys, please refer to the documentation for each service:

- **Pexels:** [https://www.pexels.com/api/](https://www.pexels.com/api/)
- **Pixabay:** [https://pixabay.com/api/docs/](https://pixabay.com/api/docs/)
- **ElevenLabs:** [https://elevenlabs.io/](https://elevenlabs.io/)
- **Shotstack:** [https://shotstack.io/](https://shotstack.io/)
- **Blogger/Google API:** [https://developers.google.com/blogger/docs/3.0/getting_started](https://developers.google.com/blogger/docs/3.0/getting_started)
- **OpenAI:** [https://openai.com/docs/api-reference/](https://openai.com/docs/api-reference/)



