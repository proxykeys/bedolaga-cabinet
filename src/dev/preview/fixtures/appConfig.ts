import type { AppConfig } from '@/types';

/* ─── SVG icon library ──────────────────────────────────────────────
 * These are inline SVG strings used by InstallationGuide's getSvgHtml().
 * In production they come from the Remnawave panel config (admin-defined).
 * Here we provide simple stroke-based icons that render through
 * dangerouslySetInnerHTML after DOMPurify sanitization.
 * ─────────────────────────────────────────────────────────────────── */

const svgIcons = {
  // Block icons (left side of cards/timeline/accordion)
  download:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  rocket:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',

  // Button icons
  'app-store':
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>',
  'google-play':
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.391 12l2.307-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/></svg>',
  github:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.424 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',

  // Platform icons
  ios: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>',
  android:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4483.9993.9994 0 .551-.4482.9996-.9993.9996m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4483.9993.9994 0 .551-.4482.9996-.9993.9996m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/></svg>',
  windows:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>',
  macos:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"/></svg>',
  linux:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.093.2.145.339.402.891 1.084 1.45 1.854 1.434.703-.024 1.449-.473 2.054-1.444.563-.93 1.043-1.561 1.436-2.053.383-.494.703-.898.795-1.521.04-.292.013-.602-.079-.912-.066-.292-.183-.534-.341-.784-.043-.072-.093-.141-.143-.209-.043-.066-.093-.141-.143-.209v-.003c-.043-.066-.093-.141-.143-.209-.043-.066-.093-.141-.143-.209-.05-.072-.1-.141-.15-.209-.043-.066-.093-.141-.143-.209-.05-.072-.1-.141-.15-.209-.043-.066-.093-.141-.143-.209-.066-.087-.143-.175-.209-.262-.262-.349-.566-.697-.566-1.144 0-.264.079-.528.143-.784.063-.262.143-.528.183-.784.024-.262.04-.528.04-.784 0-.349-.013-.698-.04-1.047-.024-.335-.063-.67-.116-1.005-.04-.335-.093-.67-.143-1.005-.05-.349-.116-.698-.183-1.047-.063-.349-.143-.698-.209-1.047-.063-.349-.143-.698-.209-1.047-.063-.349-.143-.698-.209-1.047-.063-.349-.143-.698-.209-1.047-.063-.349-.143-.698-.209-1.047-.063-.349-.143-.698-.209-1.047-.063-.349-.143-.698-.209-1.047-.063-.349-.143-.698-.209-1.047-.063-.349-.143-.698-.209-1.047-.063-.349-.143-.698-.209-1.047-.063-.349-.143-.698-.209-1.047-.063-.349-.143-.698-.209-1.047"/></svg>',

  // App icons
  hiddify:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>',
  v2ray:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 12h18M12 3a14.85 14.85 0 014 9 14.85 14.85 0 01-4 9 14.85 14.85 0 01-4-9 14.85 14.85 0 014-9z"/></svg>',
};

/**
 * Mock AppConfig for the Connection page preview.
 *
 * Mirrors the Remnawave-style structure: platforms → apps → blocks.
 * Includes a full svgLibrary so getSvgHtml() returns icons for blocks,
 * apps, buttons and platforms — matching the production appearance.
 */
export const mockAppConfig: AppConfig = {
  platformNames: {
    ios: { ru: 'iOS', en: 'iOS' },
    android: { ru: 'Android', en: 'Android' },
    windows: { ru: 'Windows', en: 'Windows' },
    macos: { ru: 'macOS', en: 'macOS' },
    linux: { ru: 'Linux', en: 'Linux' },
  },
  hasSubscription: true,
  subscriptionUrl: 'https://sub.proxykeys.net/v2ray-key-abc12345',
  hideLink: false,
  branding: {
    name: 'ProxyKeys',
    supportUrl: 'https://t.me/proxykeys_support',
  },
  isRemnawave: true,
  // SVG icon library — referenced by svgIconKey on blocks, apps, buttons, platforms
  svgLibrary: svgIcons,
  uiConfig: {
    installationGuidesBlockType: 'cards',
  },
  baseSettings: {
    isShowTutorialButton: true,
    tutorialUrl: 'https://docs.proxykeys.net/tutorial',
  },
  platforms: {
    ios: {
      svgIconKey: 'ios',
      displayName: { ru: 'iOS', en: 'iOS' },
      apps: [
        {
          name: 'Hiddify',
          featured: true,
          deepLink: 'hiddify://',
          svgIconKey: 'hiddify',
          blocks: [
            {
              title: { ru: 'Установка', en: 'Installation' },
              description: {
                ru: 'Скачайте Hiddify из App Store — это бесплатный VPN-клиент с поддержкой всех современных протоколов.',
                en: 'Download Hiddify from the App Store — a free VPN client supporting all modern protocols.',
              },
              svgIconKey: 'download',
              svgIconColor: 'cyan',
              buttons: [
                {
                  text: { ru: 'Скачать из App Store', en: 'Download from App Store' },
                  link: 'https://apps.apple.com/app/hiddify',
                  type: 'external',
                  svgIconKey: 'app-store',
                },
              ],
            },
            {
              title: { ru: 'Добавление подписки', en: 'Add subscription' },
              description: {
                ru: 'Откройте Hiddify, нажмите «Добавить подписку» и вставьте вашу ссылку подключения или отсканируйте QR-код.',
                en: 'Open Hiddify, tap "Add subscription" and paste your connection link or scan the QR code.',
              },
              svgIconKey: 'link',
              svgIconColor: 'blue',
              buttons: [
                {
                  text: { ru: 'Открыть в Hiddify', en: 'Open in Hiddify' },
                  type: 'subscriptionLink',
                  svgIconKey: 'hiddify',
                },
                {
                  text: { ru: 'Копировать ссылку', en: 'Copy link' },
                  type: 'copyButton',
                  svgIconKey: 'copy',
                },
              ],
            },
            {
              title: { ru: 'Подключение', en: 'Connect' },
              description: {
                ru: 'Выберите сервер из списка и нажмите кнопку подключения. Готово — VPN активен!',
                en: 'Select a server from the list and tap connect. Done — VPN is active!',
              },
              svgIconKey: 'rocket',
              svgIconColor: 'green',
              buttons: [
                {
                  text: { ru: 'Открыть Hiddify', en: 'Open Hiddify' },
                  type: 'subscriptionLink',
                  svgIconKey: 'hiddify',
                },
              ],
            },
          ],
        },
        {
          name: 'V2Ray Tun',
          deepLink: 'v2raytun://',
          svgIconKey: 'v2ray',
          blocks: [
            {
              title: { ru: 'Установка', en: 'Installation' },
              description: {
                ru: 'V2Ray Tun — лёгкий клиент для iOS. Скачайте из App Store.',
                en: 'V2Ray Tun — a lightweight iOS client. Download from the App Store.',
              },
              svgIconKey: 'download',
              svgIconColor: 'blue',
              buttons: [
                {
                  text: { ru: 'App Store', en: 'App Store' },
                  link: 'https://apps.apple.com/app/v2ray-tun',
                  type: 'external',
                  svgIconKey: 'app-store',
                },
              ],
            },
            {
              title: { ru: 'Настройка', en: 'Setup' },
              description: {
                ru: 'Добавьте подключение по ссылке или QR-коду.',
                en: 'Add a connection via link or QR code.',
              },
              svgIconKey: 'link',
              svgIconColor: 'green',
              buttons: [
                {
                  text: { ru: 'Открыть в V2Ray Tun', en: 'Open in V2Ray Tun' },
                  type: 'subscriptionLink',
                  svgIconKey: 'v2ray',
                },
              ],
            },
          ],
        },
        {
          name: 'Streisand',
          deepLink: 'streisand://',
          svgIconKey: 'settings',
          blocks: [
            {
              title: { ru: 'Установка', en: 'Installation' },
              description: {
                ru: 'Streisand — open-source клиент с расширенными настройками для опытных пользователей.',
                en: 'Streisand — an open-source client with advanced settings for power users.',
              },
              svgIconKey: 'download',
              svgIconColor: 'purple',
              buttons: [
                {
                  text: { ru: 'App Store', en: 'App Store' },
                  link: 'https://apps.apple.com/app/streisand',
                  type: 'external',
                  svgIconKey: 'app-store',
                },
              ],
            },
          ],
        },
        {
          name: 'Shadowrocket',
          deepLink: 'shadowrocket://',
          svgIconKey: 'rocket',
          blocks: [
            {
              title: { ru: 'Установка', en: 'Installation' },
              description: {
                ru: 'Shadowrocket — мощный клиент для iOS с поддержкой множества протоколов. Платный.',
                en: 'Shadowrocket — a powerful iOS client supporting many protocols. Paid.',
              },
              svgIconKey: 'download',
              svgIconColor: 'orange',
              buttons: [
                {
                  text: { ru: 'App Store ($2.99)', en: 'App Store ($2.99)' },
                  link: 'https://apps.apple.com/app/shadowrocket',
                  type: 'external',
                  svgIconKey: 'app-store',
                },
              ],
            },
            {
              title: { ru: 'Добавление узла', en: 'Add node' },
              description: {
                ru: 'Добавьте узел по ссылке подключения или импортируйте из буфера обмена.',
                en: 'Add a node via the connection link or import from clipboard.',
              },
              svgIconKey: 'link',
              svgIconColor: 'green',
              buttons: [
                {
                  text: { ru: 'Открыть Shadowrocket', en: 'Open Shadowrocket' },
                  type: 'subscriptionLink',
                  svgIconKey: 'rocket',
                },
              ],
            },
          ],
        },
        {
          name: 'FoXray',
          deepLink: 'foxray://',
          svgIconKey: 'v2ray',
          blocks: [
            {
              title: { ru: 'Установка', en: 'Installation' },
              description: {
                ru: 'FoXray — современный клиент для iOS с удобным интерфейсом.',
                en: 'FoXray — a modern iOS client with a user-friendly interface.',
              },
              svgIconKey: 'download',
              svgIconColor: 'blue',
              buttons: [
                {
                  text: { ru: 'App Store', en: 'App Store' },
                  link: 'https://apps.apple.com/app/foxray',
                  type: 'external',
                  svgIconKey: 'app-store',
                },
              ],
            },
          ],
        },
      ],
    },
    android: {
      svgIconKey: 'android',
      displayName: { ru: 'Android', en: 'Android' },
      apps: [
        {
          name: 'Happ',
          featured: true,
          deepLink: 'happ://',
          svgIconKey: 'hiddify',
          blocks: [
            {
              title: { ru: 'Установка', en: 'Installation' },
              description: {
                ru: 'Happ (Hiddify) — рекомендуемый клиент для Android. Скачайте из Google Play или APK-файлом.',
                en: 'Happ (Hiddify) — the recommended client for Android. Download from Google Play or as an APK.',
              },
              svgIconKey: 'download',
              svgIconColor: 'cyan',
              buttons: [
                {
                  text: { ru: 'Google Play', en: 'Google Play' },
                  link: 'https://play.google.com/store/apps/details?id=app.hiddify',
                  type: 'external',
                  svgIconKey: 'google-play',
                },
                {
                  text: { ru: 'Скачать APK', en: 'Download APK' },
                  link: 'https://github.com/hiddify/hiddify/releases',
                  type: 'external',
                  svgIconKey: 'github',
                },
              ],
            },
            {
              title: { ru: 'Импорт подписки', en: 'Import subscription' },
              description: {
                ru: 'Откройте Happ, нажмите «+» и вставьте ссылку или отсканируйте QR-код.',
                en: 'Open Happ, tap "+" and paste the link or scan the QR code.',
              },
              svgIconKey: 'link',
              svgIconColor: 'green',
              buttons: [
                {
                  text: { ru: 'Открыть Happ', en: 'Open Happ' },
                  type: 'subscriptionLink',
                  svgIconKey: 'hiddify',
                },
                {
                  text: { ru: 'Копировать ссылку', en: 'Copy link' },
                  type: 'copyButton',
                  svgIconKey: 'copy',
                },
              ],
            },
            {
              title: { ru: 'Запуск', en: 'Launch' },
              description: {
                ru: 'Выберите сервер и нажмите кнопку подключения.',
                en: 'Select a server and tap the connect button.',
              },
              svgIconKey: 'rocket',
              svgIconColor: 'blue',
              buttons: [
                {
                  text: { ru: 'Открыть Happ', en: 'Open Happ' },
                  type: 'subscriptionLink',
                  svgIconKey: 'hiddify',
                },
              ],
            },
          ],
        },
        {
          name: 'v2rayNG',
          deepLink: 'v2rayng://',
          svgIconKey: 'v2ray',
          blocks: [
            {
              title: { ru: 'Установка', en: 'Installation' },
              description: {
                ru: 'v2rayNG — популярный open-source клиент для Android.',
                en: 'v2rayNG — a popular open-source client for Android.',
              },
              svgIconKey: 'download',
              svgIconColor: 'green',
              buttons: [
                {
                  text: { ru: 'Google Play', en: 'Google Play' },
                  link: 'https://play.google.com/store/apps/details?id=com.v2ray.ang',
                  type: 'external',
                  svgIconKey: 'google-play',
                },
              ],
            },
            {
              title: { ru: 'Добавление профиля', en: 'Add profile' },
              description: {
                ru: 'Импортируйте конфигурацию по ссылке подключения.',
                en: 'Import the configuration via the connection link.',
              },
              svgIconKey: 'link',
              svgIconColor: 'blue',
              buttons: [
                {
                  text: { ru: 'Открыть v2rayNG', en: 'Open v2rayNG' },
                  type: 'subscriptionLink',
                  svgIconKey: 'v2ray',
                },
              ],
            },
          ],
        },
        {
          name: 'NekoBox',
          deepLink: 'nekobox://',
          svgIconKey: 'settings',
          blocks: [
            {
              title: { ru: 'Установка', en: 'Installation' },
              description: {
                ru: 'NekoBox — современный клиент на базе sing-box с поддержкой всех актуальных протоколов.',
                en: 'NekoBox — a modern client based on sing-box supporting all current protocols.',
              },
              svgIconKey: 'download',
              svgIconColor: 'orange',
              buttons: [
                {
                  text: { ru: 'Google Play', en: 'Google Play' },
                  link: 'https://play.google.com/store/apps/details?id=moe.nb4a',
                  type: 'external',
                  svgIconKey: 'google-play',
                },
                {
                  text: { ru: 'Скачать APK', en: 'Download APK' },
                  link: 'https://github.com/MatsuriDayo/NekoBoxForAndroid/releases',
                  type: 'external',
                  svgIconKey: 'github',
                },
              ],
            },
            {
              title: { ru: 'Импорт профиля', en: 'Import profile' },
              description: {
                ru: 'Добавьте профиль по ссылке подключения, затем выберите сервер.',
                en: 'Add a profile via the connection link, then select a server.',
              },
              svgIconKey: 'link',
              svgIconColor: 'green',
              buttons: [
                {
                  text: { ru: 'Открыть NekoBox', en: 'Open NekoBox' },
                  type: 'subscriptionLink',
                  svgIconKey: 'settings',
                },
                {
                  text: { ru: 'Копировать ссылку', en: 'Copy link' },
                  type: 'copyButton',
                  svgIconKey: 'copy',
                },
              ],
            },
          ],
        },
        {
          name: 'Musique',
          deepLink: 'musique://',
          svgIconKey: 'rocket',
          blocks: [
            {
              title: { ru: 'Установка', en: 'Installation' },
              description: {
                ru: 'Musique — минималистичный VPN-клиент для Android с фокусом на простоту.',
                en: 'Musique — a minimalist VPN client for Android focused on simplicity.',
              },
              svgIconKey: 'download',
              svgIconColor: 'cyan',
              buttons: [
                {
                  text: { ru: 'Google Play', en: 'Google Play' },
                  link: 'https://play.google.com/store/apps/details?id=com.musique.vpn',
                  type: 'external',
                  svgIconKey: 'google-play',
                },
              ],
            },
          ],
        },
      ],
    },
    windows: {
      svgIconKey: 'windows',
      displayName: { ru: 'Windows', en: 'Windows' },
      apps: [
        {
          name: 'HiddifyNext',
          featured: true,
          deepLink: 'hiddify://',
          svgIconKey: 'hiddify',
          blocks: [
            {
              title: { ru: 'Установка', en: 'Installation' },
              description: {
                ru: 'Скачайте HiddifyNext для Windows с официального GitHub-репозитория.',
                en: 'Download HiddifyNext for Windows from the official GitHub repository.',
              },
              svgIconKey: 'download',
              svgIconColor: 'cyan',
              buttons: [
                {
                  text: { ru: 'GitHub Releases', en: 'GitHub Releases' },
                  link: 'https://github.com/hiddify/hiddify-desktop/releases',
                  type: 'external',
                  svgIconKey: 'github',
                },
              ],
            },
            {
              title: { ru: 'Настройка и запуск', en: 'Setup and launch' },
              description: {
                ru: 'Запустите HiddifyNext, добавьте подписку по ссылке, выберите сервер и нажмите «Подключить».',
                en: 'Launch HiddifyNext, add the subscription via link, select a server and click "Connect".',
              },
              svgIconKey: 'rocket',
              svgIconColor: 'blue',
              buttons: [
                {
                  text: { ru: 'Открыть HiddifyNext', en: 'Open HiddifyNext' },
                  type: 'subscriptionLink',
                  svgIconKey: 'hiddify',
                },
                {
                  text: { ru: 'Копировать ссылку', en: 'Copy link' },
                  type: 'copyButton',
                  svgIconKey: 'copy',
                },
              ],
            },
          ],
        },
        {
          name: 'v2rayN',
          deepLink: 'v2rayn://',
          svgIconKey: 'v2ray',
          blocks: [
            {
              title: { ru: 'Установка', en: 'Installation' },
              description: {
                ru: 'v2rayN — классический графический клиент для Windows.',
                en: 'v2rayN — a classic GUI client for Windows.',
              },
              svgIconKey: 'download',
              svgIconColor: 'blue',
              buttons: [
                {
                  text: { ru: 'GitHub', en: 'GitHub' },
                  link: 'https://github.com/2dust/v2rayN/releases',
                  type: 'external',
                  svgIconKey: 'github',
                },
              ],
            },
          ],
        },
      ],
    },
    macos: {
      svgIconKey: 'macos',
      displayName: { ru: 'macOS', en: 'macOS' },
      apps: [
        {
          name: 'HiddifyNext',
          featured: true,
          deepLink: 'hiddify://',
          svgIconKey: 'hiddify',
          blocks: [
            {
              title: { ru: 'Установка', en: 'Installation' },
              description: {
                ru: 'Скачайте HiddifyNext для macOS (.dmg) с GitHub.',
                en: 'Download HiddifyNext for macOS (.dmg) from GitHub.',
              },
              svgIconKey: 'download',
              svgIconColor: 'cyan',
              buttons: [
                {
                  text: { ru: 'Скачать .dmg', en: 'Download .dmg' },
                  link: 'https://github.com/hiddify/hiddify-desktop/releases',
                  type: 'external',
                  svgIconKey: 'github',
                },
              ],
            },
            {
              title: { ru: 'Подключение', en: 'Connection' },
              description: {
                ru: 'Добавьте подписку, выберите сервер и подключитесь.',
                en: 'Add the subscription, select a server and connect.',
              },
              svgIconKey: 'rocket',
              svgIconColor: 'blue',
              buttons: [
                {
                  text: { ru: 'Открыть HiddifyNext', en: 'Open HiddifyNext' },
                  type: 'subscriptionLink',
                  svgIconKey: 'hiddify',
                },
              ],
            },
          ],
        },
      ],
    },
    linux: {
      svgIconKey: 'linux',
      displayName: { ru: 'Linux', en: 'Linux' },
      apps: [
        {
          name: 'Nekoray',
          featured: true,
          deepLink: 'nekoray://',
          svgIconKey: 'settings',
          blocks: [
            {
              title: { ru: 'Установка', en: 'Installation' },
              description: {
                ru: 'Nekoray — кроссплатформенный клиент. Доступен в виде AppImage и пакетов.',
                en: 'Nekoray — a cross-platform client. Available as AppImage and packages.',
              },
              svgIconKey: 'download',
              svgIconColor: 'orange',
              buttons: [
                {
                  text: { ru: 'GitHub Releases', en: 'GitHub Releases' },
                  link: 'https://github.com/SagerNet/sing-box/releases',
                  type: 'external',
                  svgIconKey: 'github',
                },
              ],
            },
            {
              title: { ru: 'Импорт конфигурации', en: 'Import config' },
              description: {
                ru: 'Импортируйте конфигурацию из ссылки подключения или буфера обмена.',
                en: 'Import the configuration from the connection link or clipboard.',
              },
              svgIconKey: 'link',
              svgIconColor: 'green',
              buttons: [
                {
                  text: { ru: 'Открыть Nekoray', en: 'Open Nekoray' },
                  type: 'subscriptionLink',
                  svgIconKey: 'settings',
                },
                {
                  text: { ru: 'Копировать ссылку', en: 'Copy link' },
                  type: 'copyButton',
                  svgIconKey: 'copy',
                },
              ],
            },
          ],
        },
      ],
    },
  },
};
