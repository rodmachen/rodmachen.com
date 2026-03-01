import { visit } from 'unist-util-visit';

const SIZE_PRESETS: Record<string, number> = {
  small: 300,
  medium: 600,
  large: 800,
  full: 1100,
};

const CLOUDINARY_PATTERN = /res\.cloudinary\.com/;

function insertTransformations(url: string, width: number): string {
  // Insert w_{width},f_auto,q_auto into the upload path
  // URL format: https://res.cloudinary.com/CLOUD/image/upload/[existing_transforms/]public_id
  return url.replace(
    /\/upload\//,
    `/upload/w_${width},f_auto,q_auto/`,
  );
}

export default function remarkCloudinaryImages() {
  return (tree: any) => {
    visit(tree, 'image', (node: any, index: number | undefined, parent: any) => {
      if (index === undefined || !parent) return;

      const url: string = node.url;
      const title: string = node.title || '';
      const alt: string = node.alt || '';

      const isCloudinary = CLOUDINARY_PATTERN.test(url);

      // Parse size from title field: "size:medium Optional caption text"
      const sizeMatch = title.match(/^size:(small|medium|large|full)(?:\s+(.*))?$/);

      let size: string | null = null;
      let caption: string | undefined;

      if (sizeMatch) {
        size = sizeMatch[1];
        caption = sizeMatch[2]?.trim() || undefined;
      } else if (isCloudinary && !title.startsWith('size:')) {
        // Cloudinary images with no explicit size default to large
        size = 'large';
        // Preserve existing title as caption only if there is one
        caption = title || undefined;
      }

      // Leave non-Cloudinary images without size: directive untouched
      if (!size) return;

      const width = SIZE_PRESETS[size];
      const width2x = width * 2;

      let src: string;
      let srcset: string;

      if (isCloudinary) {
        src = insertTransformations(url, width);
        const src2x = insertTransformations(url, width2x);
        srcset = `${src} 1x, ${src2x} 2x`;
      } else {
        src = url;
        srcset = '';
      }

      // Build the figure HTML
      const imgAttrs = [
        `src="${src}"`,
        `alt="${alt}"`,
        `loading="lazy"`,
        `width="${width}"`,
      ];
      if (srcset) {
        imgAttrs.push(`srcset="${srcset}"`);
      }

      let html = `<figure class="img-${size}">`;
      html += `<img ${imgAttrs.join(' ')} />`;
      if (caption) {
        html += `<figcaption>${caption}</figcaption>`;
      }
      html += `</figure>`;

      // Replace the image node with raw HTML
      parent.children[index] = {
        type: 'html',
        value: html,
      };
    });
  };
}
