import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const success = await login(email, password)
    setLoading(false)
    if (success) {
      navigate(-1)
    }
  }

  // Quick fill admin credentials for evaluation
  const handleQuickAdmin = () => {
    setEmail('comunicacao@expohospitalbrasil.com.br')
    setPassword('Skip@Pass')
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mx-auto shadow-xs">
            F
          </div>
          <h1 className="text-2xl font-black text-slate-950 font-serif">Acesse sua Conta</h1>
          <p className="text-xs text-slate-500">
            Acompanhe seus pedidos de roupas fitness e gerencie seus dados
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-slate-700">
              E-mail cadastrado
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
            <div className="flex items-center justify-between">
              <Label htmlFor="pass" className="text-xs font-bold text-slate-700">
                Sua senha
              </Label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-emerald-600 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <span>{loading ? 'Entrando...' : 'Entrar no FitWear'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Botão de Preenchimento Rápido do Admin para Avaliação */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleQuickAdmin}
            className="w-full text-center text-[11px] text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 transition-colors"
          >
            Preencher credenciais do Administrador (Skip@Pass)
          </button>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Ainda não tem conta? </span>
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Criar conta grátis
          </Link>
        </div>
      </div>
    </div>
  )
}
