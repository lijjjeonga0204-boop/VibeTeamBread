# CHLOCAL

> 공공데이터를 활용한 대전·충청 지역 정보 공유 커뮤니티

![CHLOCAL 대표 이미지](./public/cursors/bread-cursor.png)

<br>

## 🔗 서비스 링크

| 구분 | 주소 |
|---|---|
| 🌐 Netlify 배포 사이트 | [성심당특별시 바로가기](https://vibeteambread.netlify.app) |
| 📦 GitLab Repository | [프로젝트 저장소 바로가기](https://lab.ssafy.com/csyeon1213/chlocal.git) |

<br>

## 📌 프로젝트 소개

**CHLOCAL**은 대전·충청 지역의 공공데이터를 활용하여 관광지, 문화시설, 축제 등의 지역 정보를 제공하는 웹 서비스입니다.

사용자는 지도와 캘린더를 통해 지역 정보를 탐색할 수 있으며, 별도의 회원가입 없이 익명 게시판을 이용할 수 있습니다.

또한 챗봇을 통해 자연어로 대전·충청 지역의 장소와 축제 정보를 질문하고 안내받을 수 있습니다.

<br>

## 🗓️ 개발 기간

- 2026.07.14 ~ 2026.07.16

<br>

## 🚧 개발 상태

- 주요 기능 구현 완료
- UI 및 디자인 보완 진행 중
- Netlify 배포 완료 후 최종 URL 반영 예정

<br>

## ✨ 주요 기능

### 1. 홈 화면

- CHLOCAL 서비스 소개
- 대전·충청 지역 콘텐츠 안내
- 주요 지역정보 페이지 이동
- 지도, 캘린더, 게시판 접근
- 챗봇 위젯 실행

### 2. 지역정보 조회

- 대전·충청 지역의 관광지 및 문화시설 정보 제공
- 제공된 공공데이터 JSON 파일 기반 정보 조회
- 카테고리별 지역정보 분류
- 장소별 상세정보 확인
- 장소 이미지 및 기본정보 제공

### 3. 지도 기반 장소 탐색

- 지역정보를 지도 위에 마커로 표시
- 카테고리별 장소 확인
- 지도와 장소 목록 연동
- 선택한 장소의 위치로 지도 이동
- 장소 상세 화면에서 지도 화면으로 연결

### 4. 장소 상세정보

- 장소명 및 이미지 표시
- 주소 등 기본 지역정보 제공
- 장소에 대한 상세 설명 확인
- 지도에서 해당 장소 위치 확인

### 5. 축제 캘린더

- 대전·충청 지역의 축제 일정 제공
- 월별 캘린더 형태로 축제 일정 표시
- 날짜 선택 시 해당 날짜의 축제 목록 확인
- 축제 기본정보 및 상세정보 제공

### 6. 익명 커뮤니티

- 게시글 목록 조회
- 게시글 작성
- 게시글 수정
- 게시글 삭제
- 수정용 비밀번호 확인
- 게시글 데이터를 브라우저 `localStorage`에 저장

### 7. 지역정보 챗봇

- 대전·충청 지역정보 자연어 질의응답
- 제공된 공공데이터 기반 장소 및 축제 안내
- 챗봇 대화 내역 표시
- 플로팅 형태의 챗봇 위젯 제공
- Netlify Functions를 통한 챗봇 API 요청 처리

<br>

## 🛠️ 기술 스택

### Frontend

- Vue.js 3
- Vite
- Vue Router
- JavaScript
- HTML5
- CSS3

### Data

- JSON
- Browser LocalStorage

### API 및 서버리스

- OpenAI API
- Netlify Functions

### Deployment

- Netlify

### Collaboration

- Git
- GitLab
- Visual Studio Code
- GitHub Copilot

<br>

## 📂 프로젝트 구조

```text
CHLOCAL/
├── .netlify/
│   └── Netlify 로컬 실행 및 배포 관련 파일
│
├── .vscode/
│   └── extensions.json
│
├── netlify/
│   └── functions/
│       └── chat.mjs
│           └── 챗봇 요청을 처리하는 Netlify 서버리스 함수
│
├── public/
│   ├── cursors/
│   │   ├── bread-cursor.png
│   │   └── bread-pointer.png
│   │       └── 서비스 커스텀 커서 이미지
│   │
│   ├── data/
│   │   └── 대전·충청 지역 공공데이터 JSON 파일
│   │
│   ├── _redirects
│   │   └── Netlify SPA 라우팅 설정
│   │
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   └── vite.svg
│   │       └── 서비스에서 사용하는 정적 이미지
│   │
│   ├── components/
│   │   └── chatbot/
│   │       └── ChatWidget.vue
│   │           └── 플로팅 챗봇 UI 컴포넌트
│   │
│   ├── router/
│   │   └── index.js
│   │       └── Vue Router 경로 설정
│   │
│   ├── services/
│   │   ├── boardService.js
│   │   │   └── 익명 게시글 CRUD 및 localStorage 처리
│   │   │
│   │   ├── chatService.js
│   │   │   └── 챗봇 API 요청 처리
│   │   │
│   │   └── localDataService.js
│   │       └── 공공데이터 JSON 로딩 및 가공
│   │
│   ├── views/
│   │   ├── BoardListView.vue
│   │   │   └── 익명 커뮤니티 게시판 화면
│   │   │
│   │   ├── CalendarView.vue
│   │   │   └── 축제 캘린더 화면
│   │   │
│   │   ├── HomeView.vue
│   │   │   └── 서비스 메인 화면
│   │   │
│   │   ├── MapView.vue
│   │   │   └── 지역정보 지도 화면
│   │   │
│   │   ├── PlaceDetailView.vue
│   │   │   └── 장소 상세정보 화면
│   │   │
│   │   └── RegionInfoView.vue
│   │       └── 대전·충청 지역정보 화면
│   │
│   ├── App.vue
│   │   └── 애플리케이션 최상위 컴포넌트
│   │
│   ├── main.js
│   │   └── Vue 애플리케이션 진입점
│   │
│   └── style.css
│       └── 전역 스타일
│
├── .env.example
│   └── 환경변수 작성 예시
│
├── .gitignore
├── deno.lock
├── index.html
├── netlify.toml
│   └── Netlify 빌드 및 Functions 설정
│
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

<br>

## 🚀 로컬 실행 방법

### 1. 저장소 복제

```bash
git clone https://lab.ssafy.com/YOUR-REPOSITORY.git
```

### 2. 프로젝트 폴더로 이동

```bash
cd CHLOCAL
```

### 3. 패키지 설치

```bash
npm install
```

### 4. 환경변수 파일 생성

프로젝트 루트의 `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다.

#### Windows

```bash
copy .env.example .env
```

#### macOS / Linux

```bash
cp .env.example .env
```

생성한 `.env` 파일에 필요한 API 키를 입력합니다.

```env
# .env.example에 작성된 환경변수명을 그대로 사용합니다.
# 실제 API 키는 .env 파일에만 입력합니다.
```

### 5. 프론트엔드 개발 서버 실행

```bash
npm run dev
```

실행 후 터미널에 표시되는 로컬 주소로 접속합니다.

```text
http://localhost:5173
```

### 6. Netlify Functions를 포함한 로컬 실행

챗봇 서버리스 함수까지 함께 테스트하려면 다음 명령어를 사용합니다.

```bash
npx netlify dev
```

실행 후 Netlify CLI가 안내하는 로컬 주소로 접속합니다.

<br>

## 📦 빌드 방법

### 배포용 빌드

```bash
npm run build
```

빌드 결과물은 다음 폴더에 생성됩니다.

```text
dist/
```

### 빌드 결과 미리보기

```bash
npm run preview
```

<br>

## 🌐 Netlify 배포

본 프로젝트는 Git Repository와 Netlify를 연동하여 배포합니다.

### 기본 배포 설정

| 항목 | 설정값 |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` |

세부 설정은 프로젝트 루트의 `netlify.toml`에서 관리합니다.

### SPA 라우팅

Vue Router를 사용하는 SPA 프로젝트이므로 새로고침 시 발생할 수 있는 `404` 오류를 방지하기 위해 다음 파일을 사용합니다.

```text
public/_redirects
```

일반적인 설정은 다음과 같습니다.

```text
/* /index.html 200
```

<br>

## 🔐 환경변수 및 보안

환경변수가 포함된 `.env` 파일은 Git 저장소에 업로드하지 않습니다.

```gitignore
.env
.env.*
!.env.example
```

저장소에는 실제 키가 없는 `.env.example` 파일만 포함합니다.

챗봇 API 키는 브라우저에서 직접 사용하는 대신 `netlify/functions/chat.mjs`에서 관리합니다.

Netlify 배포 환경에서는 다음 위치에 환경변수를 등록합니다.

```text
Netlify
→ Site configuration
→ Environment variables
```

API 키가 이미 Git 커밋 기록에 포함된 경우에는 해당 키를 즉시 폐기하고 새로 발급받아야 합니다.

<br>

## 💾 게시글 저장 방식

익명 커뮤니티 게시글은 별도 데이터베이스가 아닌 브라우저의 `localStorage`에 저장됩니다.

따라서 다음과 같은 특성이 있습니다.

- 게시글은 작성한 브라우저에만 저장됩니다.
- 다른 사용자나 다른 기기에는 게시글이 공유되지 않습니다.
- 브라우저 저장 데이터를 삭제하면 게시글도 삭제될 수 있습니다.
- 시크릿 모드에서는 게시글이 정상적으로 유지되지 않을 수 있습니다.
- 수정 및 삭제 시 작성할 때 등록한 비밀번호를 확인합니다.
- 교육용 프로젝트이므로 실제 서비스 수준의 사용자 인증은 적용하지 않았습니다.

<br>

## 🤖 챗봇 동작 구조

```text
사용자 질문
    ↓
ChatWidget.vue
    ↓
chatService.js
    ↓
Netlify Function: netlify/functions/chat.mjs
    ↓
OpenAI API
    ↓
챗봇 응답 반환
```

챗봇은 프로젝트에서 제공하는 대전·충청 지역 공공데이터를 바탕으로 지역정보 질문에 응답합니다.

API 사용량 제한이나 환경변수 설정 상태에 따라 챗봇 응답이 제한될 수 있습니다.

<br>

## 📊 활용 데이터

본 프로젝트는 `public/data`에 저장된 대전·충청 지역 공공데이터 JSON 파일을 프론트엔드에서 불러와 사용합니다.

| 데이터 구분 | 활용 기능 | 데이터 출처 |
|---|---|---|
| 관광지 정보 | 지역정보 목록, 지도, 상세정보, 챗봇 | 프로젝트 제공 데이터 |
| 문화시설 정보 | 지역정보 목록, 지도, 상세정보 | 프로젝트 제공 데이터 |
| 축제공연행사 정보 | 축제 캘린더, 상세정보, 챗봇 | 프로젝트 제공 데이터 |
| 여행 관련 정보 | 지역정보 조회 및 추천 | 프로젝트 제공 데이터 |


<br>

## ⚠️ 서비스 이용 시 참고사항

- 본 서비스는 SSAFY 교육 과정에서 제작한 프로젝트입니다.
- 지역정보는 제공된 공공데이터의 수집 시점을 기준으로 합니다.
- 실제 운영 정보와 일부 차이가 있을 수 있습니다.
- 게시글은 서버가 아닌 사용자의 브라우저에 저장됩니다.
- 챗봇은 제공된 정보를 바탕으로 답변하지만 일부 응답이 부정확할 수 있습니다.
- 챗봇 API 사용량이 초과되면 응답이 제한될 수 있습니다.
- 현재 주요 기능 구현은 완료되었으며 UI와 디자인을 보완하고 있습니다.

<br>

## 👥 팀원 및 역할

| 이름 | 역할 | 담당 업무 |
|---|---|---|
| 이정아 | PM / Frontend | 기능 추가 및 수정 |
| 조상연 | Frontend | 일정 관리, 디자인 수정 |
| 황보현 | Frontend | 화면 및 기능 구현, 디자인 수정 |

<br>

## 📄 제출 산출물

- GitLab Repository
- Netlify 배포 URL
- 기능 명세서
- WBS
- 발표 자료
- README.md

<br>

## 📎 프로젝트 요약

```text
서비스명: CHLOCAL
선정 권역: 대전·충청
개발 형태: Vue.js 기반 SPA
데이터 처리: 정적 JSON 데이터
게시판 저장: Browser LocalStorage
챗봇 처리: Netlify Functions + OpenAI API
배포 환경: Netlify
개발 기간: 2026.07.14 ~ 2026.07.16
```
