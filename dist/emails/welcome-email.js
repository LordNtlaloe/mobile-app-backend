"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeEmail = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
const WelcomeEmail = ({ userName, verificationLink }) => {
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Preview, { children: "Welcome to Fitness App!" }), (0, jsx_runtime_1.jsx)(components_1.Body, { style: main, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { style: container, children: [(0, jsx_runtime_1.jsxs)(components_1.Heading, { style: h1, children: ["Welcome, ", userName, "! \uD83C\uDF89"] }), (0, jsx_runtime_1.jsxs)(components_1.Section, { style: section, children: [(0, jsx_runtime_1.jsx)(components_1.Text, { style: text, children: "Thank you for joining our fitness community. We're excited to help you achieve your fitness goals!" }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: text, children: "Please verify your email address to get started:" }), (0, jsx_runtime_1.jsx)(components_1.Button, { style: button, href: verificationLink, children: "Verify Email" }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: text, children: "Or copy and paste this link in your browser:" }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: linkText, children: verificationLink })] }), (0, jsx_runtime_1.jsx)(components_1.Text, { style: footer, children: "If you didn't create this account, please ignore this email." })] }) })] }));
};
exports.WelcomeEmail = WelcomeEmail;
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};
const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};
const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '30px 0',
};
const section = {
    padding: '0 48px',
};
const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
};
const button = {
    backgroundColor: '#0070f3',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'block',
    width: '100%',
    padding: '12px',
    margin: '24px 0',
};
const linkText = {
    color: '#0070f3',
    fontSize: '14px',
    wordBreak: 'break-all',
    margin: '16px 0',
};
const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    marginTop: '48px',
    textAlign: 'center',
    padding: '0 48px',
};
exports.default = exports.WelcomeEmail;
//# sourceMappingURL=welcome-email.js.map