# @flow/database

A progressive database architecture for Flow music player, designed to evolve from local-only to full cloud sync capabilities.

## 🎯 Architecture Overview

### Phase 1: Local-Only (Current)
- **Storage**: MMKV for simple, fast local storage
- **Scope**: Playlists, settings, playback history
- **Data**: Local music files only
- **Complexity**: Minimal, fast development

### Phase 2: Local Database (Future)
- **Storage**: SQLite with Drizzle ORM
- **Scope**: Full local music library management
- **Data**: Artists, albums, tracks with relationships
- **Complexity**: Medium, structured data

### Phase 3: Cloud Sync (Future)
- **Storage**: SQLite + Cloud APIs
- **Scope**: Cross-device sync, remote music
- **Data**: Local + remote music, user preferences
- **Complexity**: High, distributed system

## 📝 TODO List

### Phase 1 (Current) - MMKV Implementation
- [ ] **Core Storage Setup**
  - [x] Install and configure MMKV
  - [ ] Create storage utility functions
  - [ ] Add TypeScript types for data models

- [ ] **Playlist Management**
  - [ ] Create playlist CRUD operations
  - [ ] Add track to playlist functionality
  - [ ] Implement playlist reordering
  - [ ] Add playlist validation

- [ ] **History & Favorites**
  - [ ] Implement playback history
  - [ ] Add favorites management
  - [ ] Create history cleanup
  - [ ] Add favorites sync

- [ ] **Data Migration**
  - [ ] Create MMKV to SQLite migration utility
  - [ ] Add data validation
  - [ ] Implement rollback mechanism

### Phase 2 (Future) - SQLite Migration
- [ ] **Database Setup**
  - [ ] Configure Drizzle ORM
  - [ ] Create migration scripts
  - [ ] Set up database connection management
  - [ ] Add error handling

- [ ] **Schema Implementation**
  - [ ] Create artists table and relations
  - [ ] Create albums table and relations
  - [ ] Create tracks table and relations
  - [ ] Create playlists and junction tables
  - [ ] Add indexes for performance

- [ ] **Query Functions**
  - [ ] Implement track queries
  - [ ] Add artist queries
  - [ ] Create album queries
  - [ ] Build playlist queries
  - [ ] Add search functionality

- [ ] **Data Migration**
  - [ ] Migrate MMKV data to SQLite
  - [ ] Validate migrated data
  - [ ] Update application to use SQLite
  - [ ] Remove MMKV dependencies

### Phase 3 (Future) - Cloud Integration
- [ ] **Authentication**
  - [ ] Implement user authentication
  - [ ] Add session management
  - [ ] Create user profile system

- [ ] **Cloud Services**
  - [ ] Integrate music streaming APIs
  - [ ] Implement search functionality
  - [ ] Add offline caching
  - [ ] Create sync mechanisms

- [ ] **Advanced Features**
  - [ ] Cross-device sync
  - [ ] Collaborative playlists
  - [ ] Music recommendations
  - [ ] Social features
