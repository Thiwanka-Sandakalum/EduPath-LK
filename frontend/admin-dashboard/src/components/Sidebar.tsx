import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  School,
  BookOpen,
  GraduationCap,
  Users,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { NavLink, Text, Group, Button, Stack, Divider, Box, useMantineColorScheme } from '@mantine/core';
import { useUser } from '@clerk/clerk-react';
import { useAuth, UserButton } from '@clerk/clerk-react';

interface SidebarProps {
  closeMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeMobile }) => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Institutions', icon: School, path: '/admin/institutions' },
    { name: 'Courses', icon: BookOpen, path: '/admin/courses' },
    { name: 'Scholarships', icon: GraduationCap, path: '/admin/scholarships' },
    { name: 'Students', icon: Users, path: '/admin/students' },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  return (
    <Stack justify="space-between" h="100%">
      <Box pt="sm">
        <Stack gap={4}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                label={<Text size="sm" fw={isActive ? 600 : 400}>{item.name}</Text>}
                leftSection={<item.icon size={20} />}
                active={isActive}
                variant="light"
                color="blue"
                onClick={() => {
                  navigate(item.path);
                  closeMobile();
                }}
                style={{ borderRadius: '8px' }}
              />
            );
          })}
        </Stack>
      </Box>

      <Box>
        <Divider mb="sm" />
        <Box w="100%" p="xs">
          <Group>
            <UserButton />
          </Group>
        </Box>
        <Button
          fullWidth
          mt="xs"
          variant="subtle"
          color="red"
          leftSection={<LogOut size={18} />}
          onClick={handleLogout}
          styles={(theme) => ({
            root: {
              justifyContent: 'flex-start',
              borderRadius: theme.radius.sm,
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(250, 82, 82, 0.15)' : theme.colors.red[0],
              },
            },
          })}
        >
          Sign Out
        </Button>
      </Box>
    </Stack>
  );
};

export default Sidebar;