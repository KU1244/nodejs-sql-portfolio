// src/utils/security.ts
// Function to sanitize user input and prevent XSS attacks
export const sanitizeInput = (input: string): string => {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");  // Escape < and > to prevent XSS
};
