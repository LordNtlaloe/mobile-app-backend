import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
    Button,
    Section,
    Link,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
    userName: string;
    verificationLink: string;
}

export const WelcomeEmail = ({ userName, verificationLink }: WelcomeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Welcome to Fitness App!</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Welcome, {userName}! 🎉</Heading>

                    <Section style={section}>
                        <Text style={text}>
                            Thank you for joining our fitness community. We're excited to help you achieve your fitness goals!
                        </Text>

                        <Text style={text}>
                            Please verify your email address to get started:
                        </Text>

                        <Button style={button} href={verificationLink}>
                            Verify Email
                        </Button>

                        <Text style={text}>
                            Or copy and paste this link in your browser:
                        </Text>
                        <Text style={linkText}>
                            {verificationLink}
                        </Text>
                    </Section>

                    <Text style={footer}>
                        If you didn't create this account, please ignore this email.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
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
    textAlign: 'center' as const,
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
    textAlign: 'center' as const,
    display: 'block',
    width: '100%',
    padding: '12px',
    margin: '24px 0',
};

const linkText = {
    color: '#0070f3',
    fontSize: '14px',
    wordBreak: 'break-all' as const,
    margin: '16px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    marginTop: '48px',
    textAlign: 'center' as const,
    padding: '0 48px',
};

export default WelcomeEmail;