# Changelog

## 2025-12-09

### Added
- **Patch Note 기능 추가**
  - 패치 노트 관리 페이지 구현 (`/patchnote`)
  - Git 그래프 스타일 타임라인 UI
  - 패치 노트 생성 및 삭제 기능
  - API 클라이언트 (`src/lib/api/patchnoteApi.ts`)
  - 홈 화면에 Patch Note 서비스 카드 추가

### Changed
- 네비게이션에 Patch Note 메뉴 추가 (`src/routes/+layout.ts`)
- 레이아웃 개선 및 사이드바 스타일 조정 (`src/routes/+layout.svelte`)
- 홈 페이지 서비스 카드 레이아웃 개선 (`src/routes/+page.svelte`)

### Technical Details
- Timeline UI with git graph visualization
  - Date labels on left
  - Continuous timeline line connecting dots
  - Card-based content display
  - Visual ㄴ-shape connection from timeline to content
- Notification system integration using `notificationStore`
- Responsive design for mobile devices
