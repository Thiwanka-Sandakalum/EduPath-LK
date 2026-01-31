import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  School,
  BookOpen,
  GraduationCap,
  Users,
  Bot,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { NavLink, Text, Group, UnstyledButton, Avatar, Stack, ThemeIcon, Divider, Box, Tooltip } from '@mantine/core';
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

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Institutions', icon: School, path: '/admin/institutions' },
    { name: 'Courses', icon: BookOpen, path: '/admin/courses' },
    { name: 'Scholarships', icon: GraduationCap, path: '/admin/scholarships' },
    { name: 'Students', icon: Users, path: '/admin/students' },
    { name: 'AI Advisor', icon: Bot, path: '/admin/ai-advisor' },
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
        <UnstyledButton
          w="100%"
          mt="xs"
          p="xs"
          onClick={handleLogout}
          style={(theme) => ({
            borderRadius: theme.radius.sm,
            color: theme.colors.red[6],
            transition: 'background-color 0.2s',
            '&:hover': { backgroundColor: theme.colors.red[0] },
            '[data-mantine-color-scheme="dark"] &:hover': { backgroundColor: 'rgba(250, 82, 82, 0.15)' }
          })}
        >
          <Group>
            <LogOut size={18} />
            <Text size="sm" fw={500}>Sign Out</Text>
          </Group>
        </UnstyledButton>
      </Box>
    </Stack>
  );
};

export default Sidebar;