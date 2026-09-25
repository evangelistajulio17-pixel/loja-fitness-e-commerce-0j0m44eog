import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirm) {
      toast({
        title: 'Senhas divergentes',
        description: 'A confirmação de senha deve ser igual à senha digitada.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const success = await register(email, password, name)
    setLoading(false)
    if (success) {
      navigate('/')
    }
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mx-auto shadow-xs">
            F
          </div>
          <h1 className="text-2xl font-black text-slate-950 font-serif">Crie sua Conta Oficial</h1>
          <p className="text-xs text-slate-500">
            Junte-se à comunidade FitWear e ganhe benefícios exclusivos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-bold text-slate-700">
              Nome Completo
            </Label>
            <div className="relative">
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="pl-10 text-xs bg-slate-50"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-slate-700">
              Seu melhor e-mail
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="pl-10 text-xs bg-slate-50"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pass" className="text-xs font-bold text-slate-700">
              Crie uma senha (mínimo 8 caracteres)
            </Label>
            <div className="relative">
              <Input
                id="pass"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 text-xs bg-slate-50"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="passConfirm" className="text-xs font-bold text-slate-700">
              Confirme a senha
            </Label>
            <div className="relative">
              <Input
                id="passConfirm"
                type="password"
                required
                minLength={8}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="pl-10 text-xs bg-slate-50"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <span>{loading ? 'Cadastrando...' : 'Finalizar Cadastro'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Já possui cadastro? </span>
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Entrar agora
          </Link>
        </div>
      </div>
    </div>
  )
}
