const fs = require('fs');
const path = require('path');

describe('File System Tests', () => {
  const downloadsPath = path.join(__dirname, '../downloads');
  
  describe('Downloads Directory Structure', () => {
    it('should have downloads directory', () => {
      expect(fs.existsSync(downloadsPath)).toBe(true);
      expect(fs.statSync(downloadsPath).isDirectory()).toBe(true);
    });

    it('should have category subdirectories', () => {
      const categories = ['browser', 'media', 'utilities'];
      
      categories.forEach(category => {
        const categoryPath = path.join(downloadsPath, category);
        expect(fs.existsSync(categoryPath)).toBe(true);
        expect(fs.statSync(categoryPath).isDirectory()).toBe(true);
      });
    });
  });

  describe('Mock Installer Files', () => {
    const expectedFiles = [
      'browser/chrome-installer.exe',
      'browser/firefox-installer.exe',
      'browser/edge-installer.exe',
      'media/vlc-installer.exe',
      'media/spotify-installer.exe',
      'utilities/7zip-installer.exe',
      'utilities/winrar-installer.exe',
      'utilities/ccleaner-installer.exe'
    ];

    it('should have all required mock installer files', () => {
      expectedFiles.forEach(filePath => {
        const fullPath = path.join(downloadsPath, filePath);
        expect(fs.existsSync(fullPath)).toBe(true);
        expect(fs.statSync(fullPath).isFile()).toBe(true);
      });
    });

    it('should have non-empty mock files', () => {
      expectedFiles.forEach(filePath => {
        const fullPath = path.join(downloadsPath, filePath);
        const stats = fs.statSync(fullPath);
        expect(stats.size).toBeGreaterThan(0);
      });
    });

    it('should have mock files with descriptive content', () => {
      expectedFiles.forEach(filePath => {
        const fullPath = path.join(downloadsPath, filePath);
        const content = fs.readFileSync(fullPath, 'utf8');
        
        expect(content).toContain('Mock');
        expect(content).toContain('Installer');
        expect(content).toContain('Installation Instructions');
        expect(content).toContain('demonstration purposes only');
      });
    });
  });

  describe('File Mapping', () => {
    it('should have correct file mapping for software IDs', () => {
      const fileMap = {
        1: 'browser/chrome-installer.exe',
        2: 'browser/firefox-installer.exe',
        3: 'media/vlc-installer.exe',
        4: 'media/spotify-installer.exe',
        5: 'utilities/7zip-installer.exe',
        6: 'utilities/winrar-installer.exe',
        7: 'browser/edge-installer.exe',
        8: 'utilities/ccleaner-installer.exe',
      };

      Object.values(fileMap).forEach(filePath => {
        const fullPath = path.join(downloadsPath, filePath);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });
  });
});