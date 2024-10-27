import { Injectable } from '@angular/core';

export type ThemeTyped = 'dark-theme' | 'light-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public theme: ThemeTyped = 'light-theme'; // Tema padrão
  isDarkTheme: boolean = false;

  public get iconTheme(): string {
    return this.theme === 'light-theme' ? 'dark_mode' : 'light_mode';
  }

  constructor() {
    // Tenta carregar o tema salvo no localStorage
    const savedTheme: ThemeTyped = (localStorage.getItem('theme') ?? 'light-theme') as ThemeTyped;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme(this.theme); // Aplica o tema padrão
    }
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light-theme' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  setTheme(theme: ThemeTyped): void {
    this.theme = theme;
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  private applyTheme(): void {
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
    document.body.classList.remove('light-theme', 'dark-theme'); // Remove ambas as classes
    document.body.classList.add(this.theme); // Adiciona a classe do tema atual
  }
}
