import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MemoryFormPage } from '@/pages/MemoryFormPage';
import { getCities, getTopics } from '@/pages/pageShared';

const apiMocks = vi.hoisted(() => ({
  createMemory: vi.fn(),
  updateMemory: vi.fn(),
  getMemory: vi.fn(),
}));

vi.mock('@/api/memories', () => ({
  createMemory: apiMocks.createMemory,
  updateMemory: apiMocks.updateMemory,
  getMemory: apiMocks.getMemory,
}));

describe('MemoryFormPage', () => {
  beforeEach(() => {
    apiMocks.createMemory.mockReset();
    apiMocks.updateMemory.mockReset();
    apiMocks.getMemory.mockReset();
  });

  // @trace FR-MEM-01, FR-MEM-02
  it('renders the core memory fields', () => {
    renderPage();

    expect(screen.getByLabelText(/Формат/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Назва/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Текст/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Фото/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Рік від/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Рік до/)).toBeInTheDocument();
  });

  // @trace FR-TOPIC-01, FR-TOPIC-02
  it('offers exactly the predefined topics in the topic dropdown', () => {
    renderPage();

    const topicSelect = screen.getByLabelText(/Тема/);
    const optionLabels = within(topicSelect)
      .getAllByRole('option')
      .map((option) => option.textContent);

    expect(optionLabels).toEqual(['Оберіть тему', ...getTopics()]);
  });

  // @trace FR-CITY-01
  it('offers the suggested cities with an empty default', () => {
    renderPage();

    const citySelect = screen.getByLabelText(/Місто/);
    const optionLabels = within(citySelect)
      .getAllByRole('option')
      .map((option) => option.textContent);

    expect(optionLabels).toEqual(['Оберіть місто', ...getCities()]);
    expect(citySelect).toHaveValue('');
  });

  // @trace FR-MEM-01
  it('shows recipe fields only when the recipe type is selected', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.queryByLabelText(/Інгредієнти/)).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Формат/), 'recipe');

    expect(screen.getByLabelText(/Інгредієнти/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Кроки приготування/)).toBeInTheDocument();
  });

  // @trace FR-MEM-03
  it('lets the user choose public visibility', () => {
    renderPage();

    expect(screen.getByLabelText(/Показувати спогад у публічній стрічці/)).toBeInTheDocument();
  });

  // @trace FR-MEM-02
  it('shows inline field validation messages on empty submit and does not call the API', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Створити спогад' }));

    expect(screen.getByText('Вкажіть назву спогаду.')).toBeInTheDocument();
    expect(screen.getByText('Додайте текст спогаду.')).toBeInTheDocument();
    expect(apiMocks.createMemory).not.toHaveBeenCalled();
  });

  // @trace FR-MEM-01
  it('blocks submission with an inline message when yearTo is before yearFrom', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/Назва/), 'Спогад');
    await user.type(screen.getByLabelText(/Текст/), 'Текст спогаду');
    await user.type(screen.getByLabelText(/Рік від/), '2020');
    await user.type(screen.getByLabelText(/Рік до/), '1990');
    await user.click(screen.getByRole('button', { name: 'Створити спогад' }));

    expect(screen.getByText('Кінцевий рік не може бути раніше початкового.')).toBeInTheDocument();
    expect(apiMocks.createMemory).not.toHaveBeenCalled();
  });

  // @trace FR-MEM-01
  it('blocks submission with an inline message when a year field is not numeric', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/Назва/), 'Спогад');
    await user.type(screen.getByLabelText(/Текст/), 'Текст спогаду');
    await user.type(screen.getByLabelText(/Рік від/), 'abcd');
    await user.click(screen.getByRole('button', { name: 'Створити спогад' }));

    expect(screen.getByText('Введіть рік цифрами, наприклад 1998.')).toBeInTheDocument();
    expect(apiMocks.createMemory).not.toHaveBeenCalled();
  });
});

function renderPage() {
  return render(
    <MemoryRouter>
      <MemoryFormPage />
    </MemoryRouter>,
  );
}
