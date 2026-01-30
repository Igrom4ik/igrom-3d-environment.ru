import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentService } from '../ContentService';
import fs from 'fs';
import path from 'path';

// Mock dependencies
vi.mock('fs', () => {
  return {
    default: {
      existsSync: vi.fn(),
      statSync: vi.fn(),
      readFileSync: vi.fn(),
      readdirSync: vi.fn(),
      mkdirSync: vi.fn(),
      writeFileSync: vi.fn(),
    },
    // Depending on how it's imported/compiled, named exports might be needed
    existsSync: vi.fn(),
    statSync: vi.fn(),
    readFileSync: vi.fn(),
    readdirSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});

vi.mock('@keystatic/core/reader', () => ({
  createReader: () => ({
    collections: {
      albums: {
        read: vi.fn(),
        all: vi.fn(),
      },
      posts: {
        read: vi.fn(),
        all: vi.fn(),
      },
      projects: {
        read: vi.fn(),
        all: vi.fn(),
      },
      telegramPosts: {
        read: vi.fn(),
        all: vi.fn(),
      }
    }
  })
}));

describe('ContentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Path Traversal Protection', () => {
    it('should return null for paths attempting traversal', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // Use enough ../ to ensure we go outside the project root
      const maliciousSlug = '../../../../../../../../../../../../../../etc/passwd';
      
      // We must mock existsSync to true so it reaches the security check in getCached
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const result = await ContentService.getAlbum(maliciousSlug);
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Blocked path traversal'));
      consoleSpy.mockRestore();
    });
  });

  describe('Albums', () => {
    it('should return null if album does not exist (FS fallback)', async () => {
      // Mock existsSync to return false
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const album = await ContentService.getAlbum('non-existent');
      expect(album).toBeNull();
    });

    it('should return album from FS if Keystatic fails', async () => {
        // Mock Keystatic to fail or return null (already returns undefined by default mock)
        
        // Mock FS existence
        vi.mocked(fs.existsSync).mockReturnValue(true);
        
        // Mock FS stat for mtime
        vi.mocked(fs.statSync).mockReturnValue({
            mtimeMs: 123456789,
            isDirectory: () => false
        } as any);

        // Mock FS read
        const mockContent = `---
title: Test Album
date: 2024-01-01
---
Test content`;
        vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

        const album = await ContentService.getAlbum('test-album');
        
        expect(album).not.toBeNull();
        expect(album?.title).toBe('Test Album');
        expect(fs.readFileSync).toHaveBeenCalled();
    });
  });
});
