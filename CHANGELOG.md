# Changelog

All notable changes to Harbor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-18

### Added
- **Dual-Bundle Anchor Modeler Version Support**: Harbor now supports two versions of Anchor Modeler
  - Test Version (v0.100.1): Latest features and monthly updates
  - Production Version (v0.99.16): Stable release with rare updates
- **Version Selection**: Choose Anchor Modeler version when creating new models
- **Persistent Version Tracking**: Models remember their selected version and always open with it
- **Version Badges**: Model cards display version badges (blue for test, green for production)
- **CreateBlankModal**: New modal for creating blank models with a single anchor
- **Dynamic Bundle Loading**: Automatically loads the correct Anchor Modeler bundle based on model version
- **Harbor Integration in Both Versions**: 
  - Save to Harbor functionality
  - File upload support with drag-and-drop
  - Loading overlay UI
  - Automatic model synchronization
- **Comprehensive Documentation**: Updated README with dual-bundle architecture details

### Changed
- Separated "Upload Model" and "Create Model" workflows
  - "Upload Model" (+): Upload existing XML files via CreateModal
  - "Create Model" (✎): Create new blank models via CreateBlankModal
- Updated database schema to include `anchorVersion` field (enum: "v0.100.1" | "v0.99.16")
- Enhanced model creation to include version parameter
- Modified `handleEditModel` to dynamically route to correct bundle

### Fixed
- Backported missing functions to production Anchor version (v0.99.16):
  - `Actions.showLoading()` and `Actions.hideLoading()`
  - `Actions._applyLoadedModel()`
  - `Actions.lastLocalFilename` and `Actions.loading`
- Fixed timing issues with Harbor integration initialization
- Fixed file upload completion handling
- Added missing "Save to Harbor" menu item in production version

### Technical Details
- Both Anchor bundles located in `/client/public/anchor/` and `/client/public/anchor-prod/`
- File difference: 754 lines between versions (7,938 vs 7,184 lines)
- All Harbor integration code identical across both versions
- Bundle selection via URL routing: `/anchor/` or `/anchor-prod/`

## [1.0.0] - 2025-11-18

### Initial Release
- React 18 + Vite frontend application
- Express.js backend with MongoDB Atlas integration
- Anchor Modeler integration (single version)
- Model management: Create, Read, Update, Delete (CRUD)
- File upload and XML content management
- Model renaming functionality
- Version history tracking
- Model export functionality
- Tailwind CSS styling
- Toast notifications for user feedback
- Responsive grid layout for model cards
- Sidebar navigation
- Error handling and validation
- Loading states and skeleton screens

---

## Version Comparison

| Version | Release Date | Key Features |
|---------|--------------|--------------|
| v1.1.0  | 2025-11-18   | Dual Anchor version support, CreateBlankModal |
| v1.0.0  | 2025-11-18   | Initial Harbor release with single Anchor version |
