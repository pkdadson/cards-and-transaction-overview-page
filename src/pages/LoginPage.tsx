import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '@/auth/AuthContext';
import { PATHS } from '@/routes/paths';

interface FormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  async function onSubmit({ email, password }: FormValues) {
    await login(email, password);
    navigate(PATHS.home, { replace: true });
  }

  return (
    <Wrapper>
      <Card>
        <Title>Sign in</Title>
        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />
            {errors.email && <ErrorMsg role="alert">{errors.email.message}</ErrorMsg>}
          </Field>

          <Field>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />
            {errors.password && <ErrorMsg role="alert">{errors.password.message}</ErrorMsg>}
          </Field>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </SubmitButton>
        </Form>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f7f7f7;
  font-family: sans-serif;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 28px;
  color: #111;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #444;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: #555;
  }

  &[aria-invalid='true'] {
    border-color: #c0392b;
  }
`;

const ErrorMsg = styled.p`
  font-size: 12px;
  color: #c0392b;
  margin: 0;
`;

const SubmitButton = styled.button`
  padding: 11px;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #333;
  }
`;
