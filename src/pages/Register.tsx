import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutationWithAuth } from "@/hooks/use-mutation-with-auth";
import { authService } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, GraduationCap, UserPlus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { DatePicker } from "@/components/atoms/DatePicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/molecules/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/molecules/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/molecules/card";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { RegisterCredentials } from "@/types/autentication.interface";
import { getRoleId, UserRoles } from "@/config/routePermissions";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/molecules/select';

const registerSchema = z.object({
  firstName: z.string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(50, { message: "El nombre no puede exceder 50 caracteres" }),
  lastName: z.string()
    .min(2, { message: "El apellido debe tener al menos 2 caracteres" })
    .max(50, { message: "El apellido no puede exceder 50 caracteres" }),
  email: z.string()
    .email({ message: "Correo electrónico inválido" })
    .max(255, { message: "El correo no puede exceder 255 caracteres" }),
  identityDocument: z.string()
    .min(8, { message: "El documento debe tener al menos 8 caracteres" })
    .max(20, { message: "El documento no puede exceder 20 caracteres" }),
  birthDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Formato de fecha inválido (YYYY-MM-DD)" }),
  password: z.string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/, {
      message: "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un caracter especial",
    }),
  phone: z.string()
    .regex(/^[0-9]{10}$/, { message: "El celular debe contener 10 dígitos" }),
  roleId: z.number().default(1)
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const roleOptions = [
  { label: 'Estudiante', value: UserRoles.STUDENT },
  { label: 'Instructor', value: UserRoles.INSTRUCTOR },
];

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      identityDocument: "",
      birthDate: "",
      phone: "",
      password: "",
      roleId: getRoleId(UserRoles.STUDENT),
    },
  });

  const registerMutation = useMutationWithAuth({
    mutationFn: (data: RegisterCredentials) => authService.register(data),
    onSuccess: () => {
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente.",
      });
      
      // Redirigir al login después del registro
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al crear tu cuenta. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = async (data: RegisterCredentials) => {
    setIsLoading(true);
    try {
      await registerMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/10 to-background p-4">
      <Card className="w-full max-w-3xl shadow-glow">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Crear Cuenta
          </CardTitle>
          <CardDescription>
            Completa el formulario para unirte a nuestra plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" {...field} />
                      </FormControl>
                      <FormDescription className="h-5"></FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellidos</FormLabel>
                      <FormControl>
                        <Input placeholder="Pérez" {...field} />
                      </FormControl>
                      <FormDescription className="h-5"></FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="juan.perez@ejemplo.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="h-5"></FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="identityDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documento de Identidad</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="1234567890" 
                          maxLength={20}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="h-5">
                        Ingresa tu número de documento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-10",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                field.value
                              ) : (
                                <span>YYYY-MM-DD</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => {
                              if (date) {
                                const formattedDate = format(date, "yyyy-MM-dd");
                                field.onChange(formattedDate);
                              }
                            }}
                            minDate={new Date("1900-01-01")}
                            maxDate={new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="h-5">
                        Formato: YYYY-MM-DD
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="3001234567" 
                          maxLength={10}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="h-5">
                        Ingresa 10 dígitos sin espacios
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="h-5">
                        Mínimo 8 caracteres con mayúscula, minúscula y número
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <FormControl>
                        <Select
                          value={roleOptions.find(opt => getRoleId(opt.value) === field.value)?.value || UserRoles.STUDENT}
                          onValueChange={val => field.onChange(getRoleId(val as typeof UserRoles.STUDENT | typeof UserRoles.INSTRUCTOR))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription className="h-5">Selecciona tu rol en la plataforma</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              <div className="flex flex-col items-center gap-4 pt-2">
                <Button 
                  type="submit" 
                  className="w-full max-w-md" 
                  disabled={isLoading}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Registrando..." : "Registrarse"}
                </Button>

                <div className="relative w-full max-w-md">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">¿Ya tienes cuenta?</span>
                  </div>
                </div>

                <div className="text-center text-sm">
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Inicia sesión aquí
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
