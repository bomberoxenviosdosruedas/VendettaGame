'use client';

import { useActionState } from 'react';
import { login } from '@/lib/actions/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="w-full">
      <form action={formAction} className="flex flex-col md:flex-row items-center gap-2">
        <Select defaultValue="server1" name="server">
          <SelectTrigger className="w-full md:w-[150px] bg-input text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="server1">Server 1</SelectItem>
          </SelectContent>
        </Select>

        <Input
          name="email"
          placeholder="Email"
          className="bg-input text-foreground"
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          className="bg-input text-foreground"
          required
        />

        <Button
          type="submit"
          variant="destructive"
          className="w-full md:w-auto bg-accent hover:bg-accent/90"
          disabled={isPending}
        >
          {isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      {state?.message && (
        <p className="text-red-500 text-xs mt-2 text-center md:text-left">{state.message}</p>
      )}

      <Link href="/forgot-password" passHref>
          <p className="text-xs text-right mt-2 hover:underline cursor-pointer text-gray-400">¿Olvidaste tu password?</p>
      </Link>
    </div>
  );
}
