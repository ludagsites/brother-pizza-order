
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pizza, User, Phone, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ phone: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    name: '', 
    phone: '', 
    password: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signUp } = useSupabaseAuth();

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Usar telefone como email (formato telefone@temp.com)
    const email = `${loginData.phone.replace(/\D/g, '')}@temp.com`;
    
    const { error } = await signIn(email, loginData.password);
    
    if (error) {
      toast({
        title: "Erro no login",
        description: "Telefone ou senha incorretos",
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password.length !== 4 || !/^\d{4}$/.test(signupData.password)) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter exatamente 4 dígitos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Usar telefone como email (formato telefone@temp.com)
    const email = `${signupData.phone.replace(/\D/g, '')}@temp.com`;
    
    const { error } = await signUp(email, signupData.password, signupData.name, signupData.phone);
    
    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message === 'User already registered' ? 
          'Este telefone já está cadastrado' : 'Erro ao realizar cadastro',
        variant: "destructive"
      });
    } else {
      toast({
        title: "Cadastro realizado!",
        description: "Agora você pode fazer login com suas credenciais."
      });
      // Limpar formulário e ir para tab de login
      setSignupData({ name: '', phone: '', password: '' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 pizza-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <Pizza className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Brother's Pizzaria</CardTitle>
          <CardDescription>
            Entre na sua conta ou crie uma nova
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="pl-10"
                      value={loginData.phone}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        if (formatted.length <= 15) {
                          setLoginData(prev => ({ ...prev, phone: formatted }));
                        }
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha (4 dígitos)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="1234"
                      className="pl-10"
                      maxLength={4}
                      value={loginData.password}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setLoginData(prev => ({ ...prev, password: value }));
                      }}
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full pizza-gradient hover:opacity-90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      className="pl-10"
                      value={signupData.name}
                      onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="pl-10"
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
                  <Label htmlFor="signup-password">Senha (4 dígitos)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="1234"
                      className="pl-10"
                      maxLength={4}
                      value={signupData.password}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setSignupData(prev => ({ ...prev, password: value }));
                      }}
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full pizza-gradient hover:opacity-90 text-white"
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
