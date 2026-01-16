"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderEmailComponent = renderEmailComponent;
const render_1 = require("@react-email/render");
async function renderEmailComponent(component) {
    try {
        const html = await (0, render_1.render)(component);
        return html;
    }
    catch (error) {
        console.error('Error rendering email component:', error);
        throw error;
    }
}
//# sourceMappingURL=render-email.js.map