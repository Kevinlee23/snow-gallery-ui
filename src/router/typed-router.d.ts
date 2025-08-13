import "vue-router";

declare module "vue-router" {
  // 扩展 RouteMeta 接口
  interface RouteMeta {
    title: string; // 页面标题
    description: string; // 页面描述
  }
}
