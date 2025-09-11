import { BlogPost } from "../types";
import axios from "axios";

export async function fetchBlogPosts(feedUrl: string, blogId: string, googleApiKey: string): Promise<BlogPost[]> {
  try {
    // Primary: fetch JSON feed from BLOGGER_FEED_URL
    const response = await axios.get(feedUrl);
    const posts: BlogPost[] = response.data.items.map((item: any) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      html: item.content,
      publishedAt: item.published,
    }));
    return posts.filter(post => post.html.split(" ").length >= 300);
  } catch (error) {
    console.warn("Failed to fetch from primary feed URL, falling back to Google API:", error);
    // Fallback (API): GET https://www.googleapis.com/blogger/v3/blogs/${BLOGGER_BLOG_ID}/posts
    const fallbackUrl = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?maxResults=10&key=${googleApiKey}`;
    const response = await axios.get(fallbackUrl);
    const posts: BlogPost[] = response.data.items.map((item: any) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      html: item.content,
      publishedAt: item.published,
    }));
    return posts.filter(post => post.html.split(" ").length >= 300);
  }
}

export function normalizeHtmlToPlainText(html: string): string {
  // Basic HTML to plain text conversion, keeping H1-H3 markers
  let text = html.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n");
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n");
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n");
  text = text.replace(/<[^>]*>/g, ""); // Remove all other HTML tags
  return text;
}


