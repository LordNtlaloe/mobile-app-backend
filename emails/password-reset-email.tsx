// // emails/PasswordResetEmail.tsx
// import {
//   Body,
//   Container,
//   Head,
//   Heading,
//   Html,
//   Preview,
//   Text,
//   Button,
//   Section,
// } from '@react-email/components';
// import * as React from 'react';

// interface PasswordResetEmailProps {
//   userName: string;
//   resetLink: string;
//   expiryTime: string;
// }

// export const PasswordResetEmail = ({ 
//   userName, 
//   resetLink,
//   expiryTime 
// }: PasswordResetEmailProps) => {
//   return (
//     <Html>
//       <Head />
//       <Preview>Reset your Fitness App password</Preview>
//       <Body style={main}>
//         <Container style={container}>
//           <Heading style={h1}>Password Reset Request</Heading>
          
//           <Section style={section}>
//             <Text style={text}>
//               Hello {userName},
//             </Text>
            
//             <Text style={text}>
//               We received a request to reset your password. Click the button below to create a new password:
//             </Text>
            
//             <Button style={button} href={resetLink}>
//               Reset Password
//             </Button>
            
//             <Text style={text}>
//               This link will expire in {expiryTime}.
//             </Text>
            
//             <Text style={text}>
//               If you didn't request a password reset, please ignore this email or contact support.
//             </Text>
//           </Section>
          
//           <Text style={footer}>
//             © {new Date().getFullYear()} Fitness App. All rights reserved.
//           </Text>
//         </Container>
//       </Body>
//     </Html>
//   );
// };