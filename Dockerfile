# 베이스 이미지를 선택합니다. Node.js 버전 20을 사용합니다.
FROM node:20

# 앱 디렉토리를 생성하고 작업 디렉토리로 설정합니다.
WORKDIR /app

# package.json과 package-lock.json을 복사하여 종속성 설치를 준비합니다.
COPY package*.json ./

# 종속성을 설치합니다.
RUN npm install --production

# 소스 코드를 작업 디렉토리로 복사합니다.
COPY . .

# 앱을 빌드합니다.
RUN npm run build

# 포트 8080을 EXPOSE하여 Cloud Run이 이 포트를 인식할 수 있게 합니다.
EXPOSE 8080

# 환경 변수를 설정하여 포트를 지정합니다.
ENV PORT 8080

# 앱을 실행합니다.
CMD ["npm", "start"]
