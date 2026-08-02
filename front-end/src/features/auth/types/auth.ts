export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

//dipisah ini untuk mempermudah, karena di register form ada confirm password, sedangkan di backend tidak ada
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}