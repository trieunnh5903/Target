// Reexport the native module. On web, it will be resolved to ZaloPayModule.web.ts
// and on native platforms to ZaloPayModule.ts
export { default } from './src/ZaloPayModule';
export * from  './src/ZaloPay.types';
