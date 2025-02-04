# Onthewall-Cloud 

## 프레임워크 및 환경
- **프레임워크**: Next.js 14
- **React 버전**: 18 이상 (Next.js 14 이상에서만 호환 가능)
- **언어**: TypeScript

## 상태 관리 라이브러리
- **Fetch**: Tanstack-Query (former : React-Query)
- **Store**: Zustand

## 아이콘
- **아이콘 라이브러리**: Heroicons
- **아이콘 사용 방법**: SVG 컴포넌트로 만들어서 사용
- **파일 이름**: `[이름]`
- **컴포넌트 이름**: `[이름 + Icon]` (추후 같은 이름의 이미지를 사용할 수 있기 때문에 아이콘에는 아이콘을 명시함)

## API
- **API**: Cloud Functions

## Mui 라이브러리
- **Mui 설치**: React 18과 호환되는 `@material-ui/core` 사용할 것.
  ```sh
  npm install @material-ui/core

## 배포 URL
- **Application**: https://onthewall-cloud.web.app/ `[app-routing]`
- **Functions**: https://us-central1-onthewall-cloud.cloudfunctions.net/rest/ `[routing-url]`

## Command
- **Deploy**
```bash
   firebase deploy
```
- **Dev**
```bash
    next dev
```

## Required Conference
- **Next.js** : https://nextjs.org
- **Material-UI** : https://mui.com/core
- **HeroIcons** : https://heroicons.com
- **TansStack-Query** : https://tanstack.com/query/latest
- **Zustand** : https://docs.pmnd.rs/zustand/getting-started