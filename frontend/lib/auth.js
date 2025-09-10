export function saveAuth(token, user){
  if(typeof window !== 'undefined'){
    localStorage.setItem('wl_token', token);
    localStorage.setItem('wl_user', JSON.stringify(user));
  }
}
export function clearAuth(){
  if(typeof window !== 'undefined'){
    localStorage.removeItem('wl_token');
    localStorage.removeItem('wl_user');
  }
}
export function getAuth(){
  if(typeof window === 'undefined') return null;
  const token = localStorage.getItem('wl_token');
  const userStr = localStorage.getItem('wl_user');
  return token ? { token, user: JSON.parse(userStr) } : null;
}
