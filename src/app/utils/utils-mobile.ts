
export abstract class UtilsMobile {
  static isMobile(): boolean {
    return window.innerWidth < 768;
  }
}
