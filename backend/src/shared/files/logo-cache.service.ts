import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class LogoCacheService {
  private readonly logger = new Logger(LogoCacheService.name);
  private readonly rootDir = path.join(process.cwd(), 'storage', 'logos');
  private readonly publicPrefix = '/static/logos';

  async getOrDownload(
    externalUrl: string | null | undefined,
    fileSlug: string,
    subdir?: string | null,
  ): Promise<string | null> {
    if (!externalUrl) return null;

    const safeSubdir = this.sanitizePath(subdir || '');
    const targetDir = safeSubdir
      ? path.join(this.rootDir, safeSubdir)
      : this.rootDir;

    await fs.mkdir(targetDir, { recursive: true });

    const safeSlug = this.sanitizeKey(fileSlug);

    const existing = await this.findExistingBySlug(targetDir, safeSlug);
    if (existing) {
      this.logger.log(`Logo already exists: ${existing}`);
      return safeSubdir
        ? `${this.publicPrefix}/${safeSubdir}/${existing}`
        : `${this.publicPrefix}/${existing}`;
    }

    try {
      this.logger.log(`Fetching logo from: ${externalUrl}`);
      const res = await fetch(externalUrl, { method: 'GET' });
      if (!res.ok) {
        this.logger.warn(
          `Failed to fetch logo: ${externalUrl} with status: ${res.status}`,
        );
        return externalUrl;
      }

      const contentType = res.headers.get('content-type') ?? '';
      const ext =
        this.extFromContentType(contentType) ??
        this.extFromUrl(externalUrl) ??
        'png';

      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) return externalUrl;

      const fileName = `${safeSlug}.${ext}`;
      const filePath = path.join(targetDir, fileName);

      await fs.writeFile(filePath, buf);

      this.logger.log(`Logo saved to: ${filePath}`);
      return safeSubdir
        ? `${this.publicPrefix}/${safeSubdir}/${fileName}`
        : `${this.publicPrefix}/${fileName}`;
    } catch (e) {
      this.logger.warn(`Error downloading logo: ${e}`);
      return externalUrl;
    }
  }

  private sanitizeKey(input: string): string {
    const s = (input || '')
      .toLowerCase()
      .trim()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');

    return s.length ? s : 'team';
  }

  private sanitizePath(input: string): string {
    const raw = (input || '').toLowerCase().trim();
    if (!raw) return '';

    const parts = raw
      .split(/[\\/]+/g)
      .map((p) =>
        p
          .replace(/[^a-z0-9_-]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, ''),
      )
      .filter(Boolean);

    return parts.join('/');
  }

  private async findExistingBySlug(
    dir: string,
    slug: string,
  ): Promise<string | null> {
    try {
      const files = await fs.readdir(dir);
      const found = files.find((f) => f.startsWith(slug + '.'));
      return found ?? null;
    } catch {
      return null;
    }
  }

  private extFromContentType(contentType: string): string | null {
    const ct = contentType.toLowerCase();
    if (ct.includes('image/png')) return 'png';
    if (ct.includes('image/jpeg')) return 'jpg';
    if (ct.includes('image/webp')) return 'webp';
    if (ct.includes('image/svg+xml')) return 'svg';
    if (ct.includes('image/gif')) return 'gif';
    return null;
  }

  private extFromUrl(url: string): string | null {
    try {
      const u = new URL(url);
      const ext = path
        .extname(u.pathname || '')
        .replace('.', '')
        .toLowerCase();
      if (!ext) return null;
      if (ext === 'jpeg') return 'jpg';
      if (['png', 'jpg', 'webp', 'svg', 'gif'].includes(ext)) return ext;
      return null;
    } catch {
      return null;
    }
  }
}
