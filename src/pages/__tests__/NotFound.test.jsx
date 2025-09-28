import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import NotFound from '../NotFound';

describe('NotFound Page', () => {
    it('clicking the link should navigate to /dashboard without a page reload', () => {
        render(
            <MemoryRouter initialEntries={['/some-bad-route']}>
                <Routes>
                    <Route path="/some-bad-route" element={<NotFound />} />
                    <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
                </Routes>
            </MemoryRouter>
        );

        const link = screen.getByText('Return to Dashboard');
        fireEvent.click(link);

        // With the buggy <a> tag, clicking the link does not navigate within MemoryRouter.
        // As a result, getByTestId will throw an error, failing the test.
        // After fixing it to use <Link>, it will navigate, and this test will pass.
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
});