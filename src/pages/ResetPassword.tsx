import React, { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirm) {
      toast({
        title: 'Senhas divergentes',
        description: 'As senhas digitadas não coincidem.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm)
      setSuccess(true)
      toast({
        title: 'Senha redefinida com sucesso!',
        description: 'Você já pode fazer login com a nova senha.',
      })
    } catch {
      toast({
        title: 'Erro ao redefinir',
        description: 'O link pode estar expirado ou ser inválido.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-slate-950 font-serif">Criar Nova Senha</h1>
          <p className="text-xs text-slate-500">Digite sua nova combinação de acesso segura</p>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600">Sua senha foi atualizada com sucesso!</p>
            <Button
              onClick={() => navigate('/login')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs w-full rounded-xl"
            >
              Ir para o Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pass" className="text-xs font-bold text-slate-700">
                Nova Senha
              </Label>
              <Input
                id="pass"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="text-xs bg-slate-50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passConf" className="text-xs font-bold text-slate-700">
                Confirmar Nova Senha
              </Label>
              <Input
                id="passConf"
                type="password"
                required
                minLength={8}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="text-xs bg-slate-50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Alterando...' : 'Salvar Nova Senha'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
