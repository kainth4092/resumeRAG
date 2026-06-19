export const getToken = () =>
    localStorage.getItem("access_token");

export const logout = () => {
    localStorage.removeItem("access_token");
};