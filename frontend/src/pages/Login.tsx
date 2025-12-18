/**
 * VetCRM Receptionist Module - Login Page
 *
 * @author Bartłomiej Król
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/api';

// Validation Schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email jest wymagany').email('Nieprawidłowy format email'),
  password: z.string().min(1, 'Hasło jest wymagane')
});

type LoginFormInputs = z.infer<typeof loginSchema>;

interface LoginProps {
  onLogin: (token: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError('');
    setIsLoading(true);

    try {
      const response = await authService.login(data.email, data.password);
      onLogin(response.data.token);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setServerError(error.response?.data?.error || 'Błąd logowania');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>VetCRM</h1>
        <p>Moduł Recepcjonisty</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="recepcja@vetcrm.pl"
              {...register('email')}
            />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              type="password"
              id="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '0.85rem', color: '#7f8c8d', textAlign: 'center' }}>
          Testowe dane: recepcja@vetcrm.pl / Recepcja123!
        </p>
      </div>
    </div>
  );
}

export default Login;
