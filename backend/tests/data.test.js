const softwareData = require('../data/softwareData');

describe('Software Data', () => {
  it('should export an array of software', () => {
    expect(Array.isArray(softwareData)).toBe(true);
    expect(softwareData.length).toBeGreaterThan(0);
  });

  it('should have software with required properties', () => {
    softwareData.forEach(software => {
      expect(software).toHaveProperty('id');
      expect(software).toHaveProperty('name');
      expect(software).toHaveProperty('description');
      expect(software).toHaveProperty('size');
      expect(software).toHaveProperty('category');
      expect(software).toHaveProperty('link');
      
      expect(typeof software.id).toBe('number');
      expect(typeof software.name).toBe('string');
      expect(typeof software.description).toBe('string');
      expect(typeof software.size).toBe('string');
      expect(typeof software.category).toBe('string');
      expect(typeof software.link).toBe('string');
    });
  });

  it('should have unique IDs', () => {
    const ids = softwareData.map(s => s.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  it('should have valid categories', () => {
    const validCategories = ['Browser', 'Media', 'Utilities'];
    softwareData.forEach(software => {
      expect(validCategories).toContain(software.category);
    });
  });

  it('should have valid URLs', () => {
    softwareData.forEach(software => {
      expect(software.link).toMatch(/^https?:\/\/.+/);
    });
  });

  it('should have specific software items', () => {
    const softwareNames = softwareData.map(s => s.name);
    
    expect(softwareNames).toContain('Google Chrome');
    expect(softwareNames).toContain('Mozilla Firefox');
    expect(softwareNames).toContain('VLC Media Player');
    expect(softwareNames).toContain('Spotify');
    expect(softwareNames).toContain('7-Zip');
    expect(softwareNames).toContain('WinRAR');
    expect(softwareNames).toContain('Microsoft Edge');
    expect(softwareNames).toContain('CCleaner');
  });

  it('should have correct categories for specific software', () => {
    const chrome = softwareData.find(s => s.name === 'Google Chrome');
    const vlc = softwareData.find(s => s.name === 'VLC Media Player');
    const sevenZip = softwareData.find(s => s.name === '7-Zip');

    expect(chrome.category).toBe('Browser');
    expect(vlc.category).toBe('Media');
    expect(sevenZip.category).toBe('Utilities');
  });
});