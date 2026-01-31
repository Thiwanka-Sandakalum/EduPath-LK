import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Title, Text, TextInput, PasswordInput, Button, Group, Checkbox, Anchor, Center, Box, Stack, ThemeIcon, BackgroundImage, Overlay, useMantineColorScheme } from '@mantine/core';
import { GraduationCap, ArrowRight, Lock } from 'lucide-react';

const Login: React.FC = () => {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const { colorScheme } = useMantineColorScheme();
   const isDark = colorScheme === 'dark';

   const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
         setLoading(false);
         navigate('/admin/dashboard');
      }, 1200);
   };

   return (
      <Box style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
         {/* Left Side - Form */}
         <Box 
            w={{ base: '100%', md: 480 }}
            style={{ 
               flexShrink: 0,
               display: 'flex', 
               flexDirection: 'column', 
               justifyContent: 'center', 
               padding: '40px', 
               backgroundColor: 'var(--mantine-color-body)',
               zIndex: 10,
               borderRight: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-2)'}`
            }}
         >
             <Box w="100%">
               <Group mb="xl">
                  <ThemeIcon size="xl" radius="md" variant="filled" color="blue" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>
                     <GraduationCap size={24} />
                  </ThemeIcon>
                  <Box>
                    <Text size="xl" fw={800} lh={1}>EduPath</Text>
                    <Text size="sm" fw={600} c="blue" lh={1}>Admin Portal</Text>
                  </Box>
               </Group>
               
               <Stack gap="xs" mb={30}>
                 <Title order={2}>Welcome back</Title>
                 <Text c="dimmed" size="sm">Please enter your details to sign in.</Text>
               </Stack>

               <form onSubmit={handleLogin}>
                  <Stack>
                     <TextInput 
                        label="Email Address" 
                        placeholder="admin@edupath.lk" 
                        required 
                        size="md"
                     />
                     <PasswordInput 
                        label="Password" 
                        placeholder="••••••••" 
                        required 
                        size="md"
                        leftSection={<Lock size={16} />}
                     />
                  </Stack>
                  
                  <Group justify="space-between" mt="md" mb="xl">
                     <Checkbox label="Remember me" size="sm" />
                     <Anchor component="button" size="sm" c="blue">Forgot password?</Anchor>
                  </Group>
                  
                  <Button fullWidth size="md" type="submit" loading={loading} rightSection={<ArrowRight size={18} />}>
                     Sign in
                  </Button>
               </form>

               <Text ta="center" mt="xl" c="dimmed" size="xs">
                  Protected by Enterprise Grade Security. <br/>
                  By logging in, you agree to our <Anchor size="xs">Terms</Anchor> and <Anchor size="xs">Privacy Policy</Anchor>.
               </Text>
            </Box>
         </Box>
         
         {/* Right Side - Visual */}
         <Box 
            visibleFrom="md" 
            style={{ 
               flex: 1, 
               position: 'relative', 
               backgroundColor: 'var(--mantine-color-dark-8)' // Fallback color for dark mode
            }}
         >
             <BackgroundImage
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
                h="100%"
             >
                <Overlay color="#000" opacity={0.6} zIndex={1} />
                <Center h="100%" style={{ position: 'relative', zIndex: 2 }}>
                   <Stack align="center" gap="md" p="xl" style={{ maxWidth: 500, textAlign: 'center' }}>
                      <Text c="white" fw={800} style={{ fontSize: '3rem', lineHeight: 1.1 }}>
                         Empowering Education
                      </Text>
                      <Text c="gray.3" size="lg">
                         Manage institutions, guide students, and track scholarships with our AI-powered infrastructure for Sri Lanka.
                      </Text>
                   </Stack>
                </Center>
             </BackgroundImage>
         </Box>
      </Box>
   );
};

export default Login;