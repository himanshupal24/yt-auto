import puppeteer, { Browser, Page } from 'puppeteer';
import { InstagramPost } from '../../models/media';
import fs from 'fs';
import path from 'path';
import https from 'https';

export class InstagramFetcher {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
  }

  async fetchPost(url: string): Promise<InstagramPost | null> {
    if (!this.page) {
      throw new Error('Puppeteer not initialized. Call initialize() first.');
    }

    try {
      // Navigate to the Instagram post
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      
      // Wait for content to load
      await this.page.waitForSelector('img', { timeout: 10000 });

      // Extract post data
      const postData = await this.page.evaluate(() => {
        // Extract media URL from meta tags or img elements
        const metaImage = document.querySelector('meta[property="og:image"]');
        const imgElement = document.querySelector('img[src*="instagram"]');
        
        let mediaUrl = '';
        if (metaImage) {
          mediaUrl = metaImage.getAttribute('content') || '';
        } else if (imgElement) {
          mediaUrl = imgElement.getAttribute('src') || '';
        }

        // Extract caption if available
        const captionElement = document.querySelector('[data-testid="post-content"] span, .C4VMK span');
        const caption = captionElement?.textContent || '';

        // Determine media type
        const videoElement = document.querySelector('video');
        const mediaType = videoElement ? 'VIDEO' : 'IMAGE';

        return {
          mediaUrl,
          caption,
          mediaType,
          permalink: window.location.href
        };
      });

      if (!postData.mediaUrl) {
        return null;
      }

      // Create post object
      const post: InstagramPost = {
        id: this.extractPostId(url),
        url,
        mediaUrl: postData.mediaUrl,
        caption: postData.caption,
        mediaType: postData.mediaType as 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM',
        timestamp: new Date().toISOString(),
        permalink: postData.permalink
      };

      return post;
    } catch (error) {
      console.error('Error fetching Instagram post:', error);
      return null;
    }
  }

  async downloadMedia(mediaUrl: string, fileName: string, downloadDir: string): Promise<string | null> {
    try {
      // Ensure download directory exists
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      const filePath = path.join(downloadDir, fileName);
      const file = fs.createWriteStream(filePath);

      return new Promise((resolve, reject) => {
        https.get(mediaUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download: ${response.statusCode}`));
            return;
          }

          response.pipe(file);

          file.on('finish', () => {
            file.close();
            resolve(filePath);
          });

          file.on('error', (error) => {
            fs.unlink(filePath, () => {}); // Delete partial file
            reject(error);
          });
        }).on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error downloading media:', error);
      return null;
    }
  }

  async fetchMultiplePosts(urls: string[]): Promise<InstagramPost[]> {
    const posts: InstagramPost[] = [];
    
    for (const url of urls) {
      const post = await this.fetchPost(url);
      if (post) {
        posts.push(post);
      }
      
      // Add delay to avoid rate limiting
      await this.delay(2000);
    }

    return posts;
  }

  private extractPostId(url: string): string {
    const match = url.match(/\/p\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : Math.random().toString(36).substr(2, 9);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

// Helper function to validate Instagram URL
export function isValidInstagramUrl(url: string): boolean {
  const instagramRegex = /^https:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+\/?/;
  return instagramRegex.test(url);
}

// Helper function to get file extension from media URL
export function getFileExtension(mediaUrl: string): string {
  const url = new URL(mediaUrl);
  const pathname = url.pathname;
  const extension = path.extname(pathname);
  return extension || '.jpg'; // Default to jpg for images
}