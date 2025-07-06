
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pizza, User, Phone, Lock, Mail, MapPin, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    name: '', 
    email: '',
    phone: '', 
    password: '',
    address: '',
    number: '',
    cep: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useSupabaseAuth();

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  // Função para formatar CEP
  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{5})(\d{3})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return value;
  };

  // Função para buscar endereço pelo CEP
  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setSignupData(prev => ({
            ...prev,
            address: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
          }));
        } else {
          toast({
            title: "CEP não encontrado",
            description: "Por favor, verifique o CEP informado.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Não foi possível buscar o endereço.",
          variant: "destructive"
        });
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginData.email, loginData.password);
    
    if (error) {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta."
      });
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast({
        title: "Erro no login com Google",
        description: "Não foi possível fazer login com Google.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validações
    if (!signupData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome completo.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (!signupData.cep.trim()) {
      toast({
        title: "CEP obrigatório",
        description: "Por favor, informe o CEP.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (!signupData.number.trim()) {
      toast({
        title: "Número obrigatório",
        description: "Por favor, informe o número da casa.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    const fullAddress = `${signupData.address}, ${signupData.number} - CEP: ${signupData.cep}`;

    const { error } = await signUp(
      signupData.email, 
      signupData.password, 
      signupData.name, 
      signupData.phone,
      fullAddress
    );
    
    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message === 'User already registered' ? 
          'Este email já está cadastrado' : 'Erro ao realizar cadastro. Verifique os dados informados.',
        variant: "destructive"
      });
    } else {
      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta e depois faça login."
      });
      // Limpar formulário
      setSignupData({ name: '', email: '', phone: '', password: '', address: '', number: '', cep: '' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 pizza-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <Pizza className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Brother's Pizzaria</CardTitle>
          <CardDescription className="text-sm">
            Entre na sua conta ou crie uma nova
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="text-sm">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 text-sm"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Sua senha"
                      className="pl-10 text-sm"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full pizza-gradient hover:opacity-90 text-white text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Entrando...' : 'Entrar com Google'}
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      className="pl-10 text-sm"
                      value={signupData.name}
                      onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 text-sm"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone" className="text-sm">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="pl-10 text-sm"
                      value={signupData.phone}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        if (formatted.length <= 15) {
                          setSignupData(prev => ({ ...prev, phone: formatted }));
                        }
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-cep" className="text-sm">CEP</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-cep"
                      type="text"
                      placeholder="00000-000"
                      className="pl-10 text-sm"
                      value={signupData.cep}
                      onChange={(e) => {
                        const formatted = formatCep(e.target.value);
                        if (formatted.length <= 9) {
                          setSignupData(prev => ({ ...prev, cep: formatted }));
                          if (formatted.length === 9) {
                            fetchAddressByCep(formatted);
                          }
                        }
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-address" className="text-sm">Endereço</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-address"
                      type="text"
                      placeholder="Rua, bairro, cidade"
                      className="pl-10 text-sm"
                      value={signupData.address}
                      onChange={(e) => setSignupData(prev => ({ ...prev, address: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-number" className="text-sm">Número da Casa</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-number"
                      type="text"
                      placeholder="123"
                      className="pl-10 text-sm"
                      value={signupData.number}
                      onChange={(e) => setSignupData(prev => ({ ...prev, number: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Digite sua senha"
                      className="pl-10 text-sm"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full pizza-gradient hover:opacity-90 text-white text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
