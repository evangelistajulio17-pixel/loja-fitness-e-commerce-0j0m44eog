import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await pb.collection('users').requestPasswordReset(email)
      setSent(true)
      toast({
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada com o link de recuperação.',
      })
    } catch {
      // Show success anyway for security
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-slate-950 font-serif">Recuperar Senha</h1>
          <p className="text-xs text-slate-500">
            Digite seu e-mail para receber as instruções de redefinição
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enviamos um link de redefinição para <strong>{email}</strong>. Verifique também a
              pasta de spam.
            </p>
            <Link to="/login">
              <Button variant="outline" className="text-xs font-bold w-full rounded-xl">
                Voltar para o Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                Seu e-mail cadastrado
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Enviando link...' : 'Enviar Link de Redefinição'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="text-center text-xs text-slate-500 pt-2">
              <Link to="/login" className="font-semibold text-slate-700 hover:underline">
                Lembrou da senha? Voltar ao login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
