# KhanovMath Academy Mobile

Одно мобильное приложение для учеников и родителей KhanovMath Academy. После входа интерфейс и навигация автоматически выбираются по роли `STUDENT` или `PARENT`.

## Возможности

### Ученик

- главная с прогрессом, уровнем, расписанием, ДЗ и оплатой;
- домашние задания и материалы;
- оценки и рейтинг группы;
- достижения, XP и медали;
- расписание и преподаватель;
- история оплаты;
- объявления, in-app, push и Telegram-уведомления;
- редактирование имени и телефона.

### Родитель

- переключение между несколькими детьми;
- посещаемость и журнал занятий;
- оценки и средний результат;
- домашние задания и достижения;
- баланс, история и загрузка квитанции;
- объявления, in-app, push и Telegram-уведомления.

## Технологии

- Expo SDK 57, React Native, TypeScript;
- Expo Router;
- TanStack Query с 24-часовым offline-кэшем;
- Axios с единой очередью обновления JWT;
- Expo SecureStore для access/refresh token;
- Zustand для выбранного ребёнка;
- Expo Notifications и Expo Push Service;
- React Hook Form + Zod.

## Локальный запуск

```bash
npm install
cp .env.example .env.local
npm run start
```

В `.env.local`:

```env
EXPO_PUBLIC_API_URL=https://api.khanovmathacademy.uz
EXPO_PUBLIC_EAS_PROJECT_ID=<project-id-после-eas-init>
```

Обычные экраны можно проверить через Expo Go. Удалённые push-уведомления проверяются только на реальном устройстве в development build.

## Подключение EAS и push

Выполняется один раз владельцем Expo-аккаунта:

```bash
npx eas-cli login
npx eas-cli init
```

После `eas init` скопируйте созданный `projectId` в `EXPO_PUBLIC_EAS_PROJECT_ID`. Затем создайте development build:

```bash
npx eas-cli build --profile development --platform android
npx eas-cli build --profile development --platform ios
```

EAS предложит настроить FCM/APNs credentials. Эти секреты не хранятся в Git.

## Проверки

```bash
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform ios
npx expo export --platform android
```

## Backend перед запуском push

Миграция `20260812150000_add_mobile_push_devices` добавляет таблицу устройств и `Notification.data` для deep link.

На сервере после обновления кода:

```bash
cd /opt/khanovmath-backend
docker compose -f docker-compose.prod.yml --env-file .env.production build api
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm api npx prisma migrate deploy
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

Проверьте:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100 api
curl -fsS https://api.khanovmathacademy.uz/health
```

Для загрузки квитанций production backend также должен иметь настоящие `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_ENDPOINT` и `S3_REGION`.

## Безопасность

- JWT не сохраняются в AsyncStorage;
- при logout refresh token инвалидируется, push-устройство удаляется, SecureStore и пользовательский query-кэш очищаются;
- кэш не переносится между аккаунтами;
- загрузка квитанции использует авторизованный multipart endpoint;
- неправильные и устаревшие Expo push token автоматически отклоняются или отключаются.
