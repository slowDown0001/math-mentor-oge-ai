
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const signInSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const SignInForm = ({ onToggleForm }: { onToggleForm: () => void }) => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    try {
      setIsLoading(true);
      await signIn(values.email, values.password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Вход в аккаунт</h2>
        <p className="text-gray-600 mt-2">Введите свои данные для входа</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="example@mail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
            {isLoading ? 'Загрузка...' : 'Войти'}
          </Button>
        </form>
      </Form>
      
      <div className="text-center">
        <p className="text-sm">
          Еще нет аккаунта?{' '}
          <button
            onClick={onToggleForm}
            className="text-primary font-medium hover:underline"
            type="button"
          >
            Зарегистрируйтесь
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
