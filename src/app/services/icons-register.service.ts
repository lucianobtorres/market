import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconsRegisterService {
  public static readonly LOGO = "logo";

  private readonly ICONS: string[] = [
    IconsRegisterService.LOGO,
  ];

  init(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer): void {
    for (const icone of this.ICONS) {
      iconRegistry.addSvgIcon(
        icone,
        sanitizer.bypassSecurityTrustResourceUrl(`assets/img/${icone}.svg`));
    }
  }
}
