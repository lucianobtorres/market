import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IconsRegisterService } from './services/icons-register.service';
import { ROTAS } from './app-routing.module';
import { ThemeService, ThemeTyped } from './services/theme.service';
import { Utils } from './utils/util';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit {
  public iconeLogo = IconsRegisterService.LOGO;
  title = 'Market';

  isMobile: boolean = false;

  deferredPrompt: any;
  public showInstallButton = false;


  constructor(
    private router: Router,
    private themeService: ThemeService,
  ) {
    router.canceledNavigationResolution = 'computed';

    history.pushState(null, '', location.href);
    window.onpopstate = function () {
      history.go(1);
    };
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 840;
  }

  ngOnInit() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();

        const deferredPrompt: any = e;

        const installButton = document.createElement('button');
        installButton.textContent = 'Install App';
        installButton.style.position = 'fixed';
        installButton.style.top = '10px';
        installButton.style.left = '50%';
        installButton.style.transform = 'translateX(-50%)';
        installButton.style.zIndex = '9999';
        installButton.style.padding = '10px 20px';
        installButton.classList.add('btn-grad');
        installButton.style.color = 'white';
        installButton.style.border = 'none';
        installButton.style.borderRadius = '5px';
        installButton.style.cursor = 'pointer';

        installButton.addEventListener('click', () => {

          deferredPrompt.prompt();

          deferredPrompt.userChoice.then((choiceResult: { outcome: string; }) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('App installed');
            } else {
              console.log('App installation declined');
            }

            installButton.style.display = 'none';
          });
        });

        document.body.appendChild(installButton);
      });
    }
    window.addEventListener('appinstalled', () => {
      // Hide the app-provided install promotion
      // hideInstallPromotion();
      // // Clear the deferredPrompt so it can be garbage collected
      // deferredPrompt = null;
      // Optionally, send analytics event to indicate successful install
      alert('PWA was installed');
    });
    const installButton = document.querySelector("#install");

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      installButton?.removeAttribute("hidden");
    });

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log(prefersDark)
    if (prefersDark) {
      this.themeService.theme = 'light-theme';
      this.themeService.toggleTheme();
    }

    // Escute as mudanças no sistema operacional
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      if (event.matches) {
        this.themeService.theme = 'light-theme';
      } else {
        this.themeService.theme = 'dark-theme';
      }
      this.toggleTheme();
    });
  }

  ngAfterViewInit(): void {
    this.checkScreenSize();
    //this.startup();
  }

  goHome() {
    // this.router.navigate(["/home"])
    this.router.navigate([ROTAS.home])
  }

  startup() {
    // screen.orientation.lock("portrait")
    //   .then(() => {
    //     console.log('portrait')
    //   }
    //   )
    //   .catch((error) => {
    //     console.log(error)
    //   });

    // const element = document.querySelector('body');
    // element?.addEventListener('touchstart', (e) => {
    //   console.log(e)
    //   //if (e.view.pageX > 20 && e.pageX < window.innerWidth - 20) return;
    //   e.preventDefault();
    // });
  }

  async installApp() {
    if (this.deferredPrompt) {

      const installButton = document.querySelector("#install");

      const result = await this.deferredPrompt.prompt();
      this.deferredPrompt = null;
      installButton?.setAttribute("hidden", "");

    }
  }

  public get iconTheme(): string {
    return this.themeService.iconTheme;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}

