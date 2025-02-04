export const isValidEmail = (email: string) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
};

export const isValidPassword = (password: string) => {
    const pwdPattern = /^(?=.*\d)(?=.*[\W_]).{8,}$/;
    return pwdPattern.test(password)
}