export namespace ExpoRouter {
  export interface __routes<T extends string = string> extends Record<string, unknown> {
    StaticRoutes: `/` | `/(app)` | `/(app)/` | `/(app)/calendar` | `/(app)/explore` | `/(app)/library` | `/(app)/my-page` | `/(app)/workout/plan` | `/_sitemap`;
  }
} 