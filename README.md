# Attendance API Server

출석 관리 백엔드 API 서버

## 기술 스택

| 영역 | 기술 |
|------|------|
| Runtime | Node.js 22 LTS |
| Language | TypeScript 5.8 |
| Framework | Fastify 5 |
| ORM | Drizzle ORM (MySQL) |
| Validation | Zod |
| API Docs | @fastify/swagger + Scalar |
| Build | tsup |
| Lint / Format | Biome |
| Test | Vitest |
| CI/CD | GitHub Actions → Docker → EC2 |

## 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 파일 (.env) 생성
# LOCAL_DB_HOST, LOCAL_DB_USER, LOCAL_DB_PASSWORD, LOCAL_DB_NAME, PORT 설정 필요

# 개발 서버 (hot-reload)
npm run dev

# 프로덕션 빌드 + 실행
npm run build
npm start
```

서버 시작 후:
- API: `http://localhost:3000`
- API 문서: `http://localhost:3000/api-docs`

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | tsx watch 개발 서버 |
| `npm run build` | tsup 프로덕션 빌드 |
| `npm start` | 빌드된 서버 실행 |
| `npm test` | 테스트 실행 (API 커버리지 포함) |
| `npm run check` | Biome 린트 + 포맷 |
| `npm run db:generate` | Drizzle 마이그레이션 생성 |
| `npm run db:push` | 스키마 DB 반영 |
| `npm run db:studio` | Drizzle Studio 실행 |

## 폴더 구조

```
src/
├── server.ts                  # 엔트리 포인트
├── app.ts                     # Fastify 앱 팩토리
├── config/
│   ├── env.ts                 # 환경변수 로드 및 타입
│   └── swagger.ts             # Swagger/Scalar 설정
├── db/
│   ├── index.ts               # DB 연결 (mysql2 pool + Drizzle)
│   └── schema/                # Drizzle ORM 테이블 스키마
├── modules/                   # 라우트 (도메인별)
│   ├── health/
│   ├── auth/
│   ├── user/
│   ├── activity/
│   ├── organization/
│   ├── attendance/
│   ├── season/
│   └── cron/
├── plugins/
│   ├── auth.ts                # Bearer 토큰 인증
│   ├── error-handler.ts       # 글로벌 에러 핸들러
│   └── request-logger.ts      # 요청 로깅 + 민감 필드 마스킹
├── services/                  # 비즈니스 로직 (도메인별)
│   ├── shared/                # 공통 상수, 유틸
│   ├── auth/
│   ├── user/
│   ├── activity/
│   ├── organization/
│   ├── attendance/
│   ├── permission/
│   └── season/
├── enums/                     # 활동 템플릿 등 열거형
└── utils/                     # 에러 클래스, 암호화, HTTP 요청
tests/
├── setup.ts                   # 테스트 환경 설정
├── api-coverage.test.ts       # API 커버리지 검증
├── helpers/
│   └── build-test-app.ts      # 테스트용 앱 빌더
└── routes/                    # 라우트별 통합 테스트
```
