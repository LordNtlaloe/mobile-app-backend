import { render } from '@react-email/render';
import React from 'react';

export async function renderEmailComponent(
    component: React.ReactElement
): Promise<string> {
    try {
        const html = await render(component);
        return html;
    } catch (error) {
        console.error('Error rendering email component:', error);
        throw error;
    }
}