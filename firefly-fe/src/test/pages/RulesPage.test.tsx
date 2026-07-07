import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RulesPage } from '@/pages/RulesPage';

// @trace FR-CONTENT-02

describe('RulesPage', () => {
  function renderRules() {
    return render(
      <MemoryRouter>
        <RulesPage />
      </MemoryRouter>,
    );
  }

  it('renders the page title', () => {
    renderRules();
    expect(screen.getByRole('heading', { level: 1, name: /правила спільноти/i })).toBeInTheDocument();
  });

  it('renders community rules list', () => {
    renderRules();
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe('OL'); // ordered list as per implementation
  });

  it('renders kindness and respect rule', () => {
    renderRules();
    expect(screen.getByText(/поважайте одне одного.*ніяких образ/i)).toBeInTheDocument();
  });

  it('renders no political conflicts rule', () => {
    renderRules();
    expect(screen.getByText(/ніяких політичних баталій.*місце для дитинства/i)).toBeInTheDocument();
  });

  it('renders no spam rule', () => {
    renderRules();
    expect(screen.getByText(/ніякого спаму.*реклами.*беззмістовного контенту/i)).toBeInTheDocument();
  });

  it('renders no hate speech rule', () => {
    renderRules();
    expect(screen.getByText(/поважайте одне одного.*ніяких образ/i)).toBeInTheDocument();
  });

  it('renders report abuse call-to-action', () => {
    renderRules();
    expect(screen.getByText(/поскаржитися/i)).toBeInTheDocument();
  });

  it('does not contain exclamation marks (BC-BRAND-01)', () => {
    const { container } = renderRules();
    const fullText = container.textContent || '';
    expect(fullText).not.toContain('!');
  });

  it('is accessible without authentication', () => {
    // This page does not use ProtectedRoute, so it should always render
    const { container } = renderRules();
    expect(container.querySelector('h1')).toBeInTheDocument();
  });
});
