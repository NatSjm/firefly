import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AboutPage } from '@/pages/AboutPage';

// @trace FR-CONTENT-01

describe('AboutPage', () => {
  function renderAbout() {
    return render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
  }

  it('renders the page title', () => {
    renderAbout();
    expect(screen.getByRole('heading', { level: 1, name: /про проєкт/i })).toBeInTheDocument();
  });

  it('renders project description section', () => {
    renderAbout();
    expect(screen.getByRole('heading', { level: 2, name: /що таке світлячок/i })).toBeInTheDocument();
    expect(
      screen.getByText(/українська спільнота для дорослих.*зберігати теплі спогади/i),
    ).toBeInTheDocument();
  });

  it('renders target audience section', () => {
    renderAbout();
    expect(screen.getByRole('heading', { level: 2, name: /для кого цей простір/i })).toBeInTheDocument();
    expect(screen.getByText(/записати родинні історії.*зібрати улюблені рецепти/i)).toBeInTheDocument();
  });

  it('renders usage section', () => {
    renderAbout();
    expect(screen.getByRole('heading', { level: 2, name: /що тут можна робити/i })).toBeInTheDocument();
    expect(screen.getByText(/створювати приватні.*читати стрічку.*загублених світлячків/i)).toBeInTheDocument();
  });

  it('does not contain exclamation marks (BC-BRAND-01)', () => {
    const { container } = renderAbout();
    const fullText = container.textContent || '';
    expect(fullText).not.toContain('!');
  });

  it('is accessible without authentication', () => {
    // This page does not use ProtectedRoute, so it should always render
    const { container } = renderAbout();
    expect(container.querySelector('h1')).toBeInTheDocument();
  });
});
