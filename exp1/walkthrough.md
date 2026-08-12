# Walkthrough - React Multi-Platform Social Media Post Composer

I have designed and developed a dynamic, high-fidelity **Post Composer Dashboard** in React under the `/Users/tanuj/summer project1/post-composer` workspace folder. The application is compiled, validated, and currently running locally.

## Features Developed

### 1. Dynamic Platform Selector & Validation Constraints
Real-time auditor checks character limits, media attachments, and hashtags according to each platform:
- 🐦 **Twitter/X**: Limit of 280 characters. Enforces URL counting (all links count as 23 characters). Max 4 images or 1 video.
- 📘 **Facebook**: Limit of 63,206 characters. Media optional. Warning triggers for long posts.
- 💼 **LinkedIn**: Limit of 3,000 characters. Media optional.
- 📸 **Instagram**: Limit of 2,200 characters. Media is **mandatory** (at least 1 image or video). Max 30 hashtags.

### 2. Social Media Overrides (Buffer/Hootsuite Style)
- Toggles let users customize the text specifically for X, Facebook, LinkedIn, or Instagram. 
- Allows a unified global post to serve as the default draft, which can then be fine-tuned for individual channels.

### 3. Smart AI Tone Assistant
- Integrated an interactive **AI Tone Adjuster** featuring preset tones: **Professional**, **Hype/Viral**, **Concise**, and **Humor**.
- Clicking a tone starts a scanning animation inside the composer text area, dynamically rewriting the post.

### 4. Media Upload Manager
- A drag-and-drop file upload zone.
- Generates base64/blob visual thumbnails of uploaded images or videos, complete with hover overlay delete buttons.

### 5. Interactive Visual Previews
- Toggles between social media mockup cards for Twitter/X (dark mode), Facebook, LinkedIn, and Instagram.
- Fully formats hashtags (`#tag` in blue) and links (`https://...` in cyan) inside the live visual cards.
- Mock action bars (Like, Repost, Comment, Share) are interactive; clicking the **Like** button updates the mockup's like counter in real-time.

---

## Verification & Build Results
- Production build compiled successfully:
  - JS Bundle: `dist/assets/index-DW9wIo3e.js` (227.79 kB)
  - CSS Bundle: `dist/assets/index-pD44jW7p.css` (3.73 kB)
- React Dev Server is live:
  - **URL**: [http://localhost:5002](http://localhost:5002)
